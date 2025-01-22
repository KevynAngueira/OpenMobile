// App.tsx
import React, { useEffect } from 'react';

import { requestPermissions } from './src/utils/PermissionsHelper';

//import MediaGallery from './src/MediaGallery/components/MediaGallery';
import Annotations from './src/Annotations/components/Annotations';
//import CameraScreen from './src/SnapMedia/components/CameraScreen';

const App = () => {

  useEffect(() => {
    requestPermissions();
  }, []);

  //return <CameraScreen />;
  return <Annotations />;

};

export default App;

