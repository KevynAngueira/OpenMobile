import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import RNFS from 'react-native-fs';
import { VideoCapture } from '../types/VideoCaptureTypes';
import { loadVideoCaptures, saveVideoCaptures } from './VideoCaptureStorage';
import { runVideoValidations } from './VideoValidationWorker';
import { NativeModules } from 'react-native';

interface VideoCaptureContextType {
  videoCaptures: VideoCapture[];
  addVideoCapture: (videoPath: string) => Promise<void>;
  updateVideoCapture: (id: string, updates: Partial<VideoCapture>) => void;
  removeVideoCapture: (id: string) => void;
  resetAllVideoCaptures: () => Promise<void>;
  reconcileDirectory: () => Promise<void>;
}

const { UtilsModule } = NativeModules;

const VideoCaptureContext =
  createContext<VideoCaptureContextType | undefined>(undefined);

const VIDEOS_DIR = `${RNFS.ExternalDirectoryPath}/snapmedia/videos`;

export const useVideoCapture = (): VideoCaptureContextType => {
  const context = useContext(VideoCaptureContext);
  if (!context) {
    throw new Error('useVideoCapture must be used within VideoCaptureProvider');
  }
  return context;
};

export const VideoCaptureProvider: React.FC = ({ children }) => {
  /** ------------------------------------
   * React state
   * ----------------------------------- */
  const [videoCaptures, setVideoCaptures] = useState<VideoCapture[]>([]);

  /** ------------------------------------
   * Refs (queue + latest state)
   * ----------------------------------- */
  const videoCapturesRef = useRef<VideoCapture[]>([]);
  const validationQueueRef = useRef<string[]>([]);
  const runningValidationRef = useRef(false);
  const enqueuedRef = useRef<Set<string>>(new Set());

  /** Keep ref in sync with state */
  useEffect(() => {
    videoCapturesRef.current = videoCaptures;
  }, [videoCaptures]);

  /** ------------------------------------
   * Startup
   * ----------------------------------- */
  useEffect(() => {
    const init = async () => {
      try {
        // Load previously saved captures
        const stored = await loadVideoCaptures();
        if (stored && Array.isArray(stored)) {
          setVideoCaptures(stored);
        }
  
        // Then reconcile directory (add any new files)
        await reconcileDirectory();
      } catch (err) {
        console.error('Failed to initialize video captures:', err);
      }
    };
  
    init();
  }, []);
  

  useEffect(() => {
    saveVideoCaptures(videoCaptures);
  }, [videoCaptures]);

  /** ------------------------------------
   * CRUD
   * ----------------------------------- */
  const addVideoCapture = async (videoPath: string) => {
    const id = videoPath.split('/').pop();
    if (!id) return;

    setVideoCaptures(prev => {
      if (prev.some(v => v.id === id)) return prev;

      return [
        ...prev,
        {
          id,
          videoPath,
          createdAt: Date.now(),
          toolValidation: 'pending',
          leafValidation: 'pending',
        },
      ];
    });
  };

  const updateVideoCapture = (
    id: string,
    updates: Partial<VideoCapture>
  ) => {
    setVideoCaptures(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const removeVideoCapture = (id: string) => {
    setVideoCaptures(prev => prev.filter(v => v.id !== id));
  };

  const resetAllVideoCaptures = async () => {
    // 1) Clear React state
    setVideoCaptures([]);
  
    // 2) Clear validation queue state
    validationQueueRef.current = [];
    enqueuedRef.current.clear();
    runningValidationRef.current = false;
  
    // 3) Clear persisted storage
    await saveVideoCaptures([]);

    console.log('[VideoCapture] All captures reset');

    await reconcileDirectory();
  };
  

  /** ------------------------------------
   * HELPER FUNCTIONS
   * ----------------------------------- */

  const fetchVideoLocation = async (
    videoPath: string
  ): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve, reject) => {
      UtilsModule.getVideoLocation(
        videoPath,
        (result: { latitude: number; longitude: number } | null) => resolve(result),
        (err: string) => {
          console.warn('Failed to get video location:', err);
          resolve(null); // resolve null instead of rejecting
        }
      );
    });
  };
  
  /** ------------------------------------
   * VALIDATION SCHEDULER
   * ----------------------------------- */

  /**
   * Enqueue any pending validations AFTER state commits
   */
  useEffect(() => {
    for (const video of videoCaptures) {
      const needsValidation =
        video.toolValidation === 'pending' ||
        video.leafValidation === 'pending';

      if (!needsValidation) continue;
      if (enqueuedRef.current.has(video.id)) continue;

      enqueuedRef.current.add(video.id);
      validationQueueRef.current.push(video.id);
    }

    processValidationQueue();
  }, [videoCaptures]);

  /**
   * Single-concurrency worker
   */
  const processValidationQueue = async () => {
    if (runningValidationRef.current) return;
    if (validationQueueRef.current.length === 0) return;

    runningValidationRef.current = true;
    const id = validationQueueRef.current.shift()!;
    enqueuedRef.current.delete(id);

    const video = videoCapturesRef.current.find(v => v.id === id);
    if (!video) {
      runningValidationRef.current = false;
      processValidationQueue();
      return;
    }

    const needsValidation =
      video.toolValidation === 'pending' ||
      video.leafValidation === 'pending';

    if (!needsValidation) return;

    try {
      const validated = await runVideoValidations(video);
      setVideoCaptures(prev =>
        prev.map(v => (v.id === validated.id ? validated : v))
      );
    } catch (err) {
      console.error('Video validation failed:', err);
    } finally {
      runningValidationRef.current = false;
      processValidationQueue();
    }
  };

  /** ------------------------------------
   * Directory reconciliation
   * ----------------------------------- */
  const reconcileDirectory = useCallback(async () => {
    try {
      const files = await RNFS.readDir(VIDEOS_DIR);
      const videoPaths = files
        .filter(f => f.isFile() && f.name.endsWith('.mp4'))
        .map(f => f.path);
  
      setVideoCaptures(prev => {
        const existingByPath = new Map(prev.map(v => [v.videoPath, v]));
  
        const next: VideoCapture[] = [];
  
        let newCount = 0;
        let pendingCount = 0;
  
        for (const path of videoPaths) {
          const existing = existingByPath.get(path);
          let capture: VideoCapture;
  
          if (existing) {
            capture = existing;
          } else {
            capture = {
              id: path.split('/').pop()!,
              videoPath: path,
              createdAt: Date.now(),
              toolValidation: 'pending',
              leafValidation: 'pending',
            };
            newCount++;
          }
  
          if (capture.toolValidation === 'pending' || capture.leafValidation === 'pending') {
            pendingCount++;
          }
  
          next.push(capture);
        }
  
        // Summary counts
        const toolPass = next.filter(v => v.toolValidation === 'pass').length;
        const toolFail = next.filter(v => v.toolValidation === 'fail').length;
        const leafPass = next.filter(v => v.leafValidation === 'pass').length;
        const leafFail = next.filter(v => v.leafValidation === 'fail').length;
  
        // Structured logging
        console.log(`[VideoCapture] Loaded ${next.length} videos: ${newCount} new, ${pendingCount} pending`);
        console.log(`[VideoCapture] Tool Validation → Pass: ${toolPass}, Fail: ${toolFail}`);
        console.log(`[VideoCapture] Leaf Validation → Pass: ${leafPass}, Fail: ${leafFail}`);
  
        return next;
      });
    } catch (err) {
      console.error('Failed to reconcile directory:', err);
    }
  }, []);
  

  /** ------------------------------------
   * Provider
   * ----------------------------------- */
  return (
    <VideoCaptureContext.Provider
      value={{
        videoCaptures,
        addVideoCapture,
        updateVideoCapture,
        removeVideoCapture,
        resetAllVideoCaptures,
        reconcileDirectory,
      }}
    >
      {children}
    </VideoCaptureContext.Provider>
  );
};
