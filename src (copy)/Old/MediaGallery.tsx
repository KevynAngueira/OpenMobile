// MediaGallery.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
} from 'react-native';
import Video from 'react-native-video';
import { getImagesFromSnapmedia, getVideosFromSnapmedia } from '../native/MediaStoreBridge';
import { requestPermissions } from '../utils/PermissionsHelper';
import { sendMedia } from '../utils/MediaUploader';
import { FLASK_URL } from '../constants/Config';

const MediaGallery = () => {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    try {
      getImagesFromSnapmedia(
        (imagesArray: string[]) => setImages(imagesArray),
        (error: any) => console.error('Error fetching images:', error)
      );

      getVideosFromSnapmedia(
        (videosArray: string[]) => setVideos(videosArray),
        (error: any) => console.error('Error fetching videos:', error)
      );

      setLoading(false);
    } catch (error) {
      console.error('Error fetching media:', error);
      setLoading(false);
    }
  };

  const handleSendMedia = async (type: 'image' | 'video') => {
    const mediaList = type === 'image' ? images : videos;
    const endpoint = `${FLASK_URL}/${type}/send`;
    await sendMedia(type, mediaList, endpoint);
  };

  useEffect(() => {
    const setup = async () => {
      const permissionsGranted = await requestPermissions();
      if (permissionsGranted) {
        await fetchMedia();
      } else {
        setLoading(false);
      }
    };
    setup();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Test Server"
          onPress={() =>
            fetch(`${FLASK_URL}/test`)
              .then((res) => res.json())
              .then((data) => console.log(data))
              .catch((err) => console.error(err))
          }
        />
        <Button title="Send Images" onPress={() => handleSendMedia('image')} />
        <Button title="Send Videos" onPress={() => handleSendMedia('video')} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Images</Text>
        <ScrollView contentContainerStyle={styles.mediaContainer}>
          {images.length > 0 ? (
            images.map((image) => (
              <Image
                key={image.split('/').pop()}
                source={{ uri: 'file://' + image }}
                style={styles.mediaItem}
              />
            ))
          ) : (
            <Text>No images found</Text>
          )}
        </ScrollView>

        <Text style={styles.header}>Videos</Text>
        <ScrollView contentContainerStyle={styles.mediaContainer}>
          {videos.length > 0 ? (
            videos.map((video) => (
              <View key={video.split('/').pop()} style={styles.videoContainer}>
                <Video
                  source={{ uri: 'file://' + video }}
                  style={styles.videoItem}
                  controls
                  resizeMode="contain"
                />
              </View>
            ))
          ) : (
            <Text>No videos found</Text>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mediaItem: {
    margin: 5,
    width: 200,
    height: 200,
  },
  videoContainer: {
    marginBottom: 20,
  },
  videoItem: {
    margin: 5,
    width: 300,
    height: 200,
  },
});

export default MediaGallery;

