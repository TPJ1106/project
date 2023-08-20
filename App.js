import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as React from 'react';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [cameraPermission, setCameraPermission] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  async function helpSound() {
    try {
      console.log('Playing TTS');
      await Speech.speak('Help');
    } catch (error) {
      console.error(error);
    }
  }

  const handleCameraCapture = async () => {
    if (!cameraPermission) {
      console.log('Camera permission not granted.');
      return;
    }

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log('Captured photo:', photo);
    }
  };

  const cameraRef = React.useRef(null);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      {cameraPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : cameraPermission === false ? (
        <Text>Camera permission denied. Please grant the permission.</Text>
      ) : (
        <View style={styles.cameraContainer}>
          <TouchableOpacity style={styles.helpButton} onPress={helpSound}>
            <MaterialIcons name="help" size={24} color="white" />
          </TouchableOpacity>
          <Camera style={styles.camera} ref={cameraRef} />
          <TouchableOpacity style={styles.circularButton} onPress={handleCameraCapture}>
            <MaterialIcons name="photo-camera" size={48} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
  },
  helpButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 30,
    zIndex: 2,
  },
  circularButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'yellow',
    padding: 20,
    borderRadius: 100,
    zIndex: 2,
  },
});