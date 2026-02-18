// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { requestPermissions } from './src/utils/PermissionsHelper';
import { LeafAnnotationsProvider } from './src/Annotations/context/LeafAnnotationsContext';
import { PlantAnnotationsProvider } from './src/Annotations/context/PlantAnnotationsContext';
import { FieldAnnotationsProvider } from './src/Annotations/context/FieldAnnotationsContext';
import { SyncProvider } from './src/Sync/context/SyncContext';
import { ManifestSyncProvider } from './src/Sync/context/ManifestSyncContext';
import { VideoCaptureProvider } from './src/VideoCapture/Index';

import Annotations from './src/Annotations/screen/Annotations';
import VideoGallery from './src/VideoGallery/components/VideoGallery';
import CameraScreen from './src/SnapMedia/components/CameraScreen';
import DevPanel from './src/DevConsole/screen/DevPanel';

import { canUseDevFlags } from './src/DevConsole/configs/DevFlagsConfig';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <FieldAnnotationsProvider>
      <PlantAnnotationsProvider>
        <LeafAnnotationsProvider>
          <SyncProvider>
            <ManifestSyncProvider>
              <VideoCaptureProvider>
                <NavigationContainer>

                  <Stack.Navigator initialRouteName="Annotations">
                    <Stack.Screen name="Annotations" component={Annotations} />
                    <Stack.Screen name="VideoGallery" component={VideoGallery} />
                    <Stack.Screen name="CameraScreen" component={CameraScreen} />

                    {canUseDevFlags && (
                      <Stack.Screen
                        name="DevPanel"
                        component={DevPanel}
                        options={{ title: 'Developer Panel' }}
                      />
                    )}
                  
                  </Stack.Navigator>

                </NavigationContainer>
              </VideoCaptureProvider>
              </ManifestSyncProvider>
          </SyncProvider>
        </LeafAnnotationsProvider>
      </PlantAnnotationsProvider>
    </FieldAnnotationsProvider>
  );
};

export default App;

