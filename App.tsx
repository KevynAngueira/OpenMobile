// App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { requestPermissions } from './src/utils/PermissionsHelper';
import { LeafAnnotationsProvider } from './src/Annotations/context/LeafAnnotationsContext';
import { PlantAnnotationsProvider } from './src/Annotations/context/PlantAnnotationsContext';
import { SyncProvider } from './src/Sync/context/SyncContext';

import Annotations from './src/Annotations/screen/Annotations';
import VideoGallery from './src/VideoGallery/components/VideoGallery';
import CameraScreen from './src/SnapMedia/components/CameraScreen';

import { ping } from './src/native/OpenCVBridge';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <PlantAnnotationsProvider>
      <LeafAnnotationsProvider>
        <SyncProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Annotations">
              <Stack.Screen name="Annotations" component={Annotations} />
              <Stack.Screen name="VideoGallery" component={VideoGallery} />
              <Stack.Screen name="CameraScreen" component={CameraScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SyncProvider>
      </LeafAnnotationsProvider>
    </PlantAnnotationsProvider>
  );
};

export default App;

