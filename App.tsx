// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { requestPermissions } from './src/utils/PermissionsHelper';
import { AnnotationsProvider } from './src/Annotations/context/AnnotationsContext';
import { SyncProvider } from './src/Sync/context/SyncContext';

import Annotations from './src/Annotations/components/Annotations';
import VideoGallery from './src/VideoGallery/components/VideoGallery';
import CameraScreen from './src/SnapMedia/components/CameraScreen';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <AnnotationsProvider>
      <SyncProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Annotations">
            <Stack.Screen name="Annotations" component={Annotations} />
            <Stack.Screen name="VideoGallery" component={VideoGallery} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SyncProvider>
    </AnnotationsProvider>
  );
};

export default App;

