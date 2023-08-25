import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import * as React from 'react';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [cameraPermission, setCameraPermission] = React.useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = React.useState(false);
  const [speechIndex, setSpeechIndex] = React.useState(0);
  const [isButtonsDisabled, setIsButtonsDisabled] = React.useState(false);
  const [hasPlayedFisrtTime, setHasPlayedFirstTime] = React.useState(false);

  const firstText= '어플의 사용법을 알려드리겠습니다. 어플의 첫 실행 화면은 카메라 화면입니다. 휴대폰을 사용자가 가려고하는 방향으로 비추면 어플이 장애물과의 거리를 인식하여 음성으로 알려줍니다. 화면 중앙 하단에는 카메라 촬영버튼이 있습니다. 이 버튼은 식품을 촬영하는 버튼으로 과자, 라면을 카메라로 촬영하면 상품을 인식하여 어떤 상품인지 알려줍니다. 화면 우측 상단에는 도움말 버튼이 있습니다. 어플의 사용법을 듣고싶으시다면 우측 상단의 버튼을 눌러주세요. 어플 사용법 설명이 다 끝났습니다. 어플의 사용법을 듣고싶으시다면 다시 우측 상단의 도움말 버튼을 눌러주세요.';

  const helpTexts = [
    '도움말 버튼을 누르셨습니다. 다음 설명을 듣고싶으시면 화면을 터치해주세요.',
    '어플의 첫 실행 화면은 카메라 화면입니다.',
    '휴대폰을 사용자가 가려고하는 방향으로 비추면 어플이 장애물과의 거리를 인식하여 음성으로 알려줍니다.',
    '화면 중앙 하단에는 카메라 촬영버튼이 있습니다. 이 버튼은 식품을 촬영하는 버튼으로 과자, 라면을 카메라로 촬영하면 상품을 인식하여 어떤 상품인지 알려줍니다.',
    '화면 우측 상단에는 도움말 버튼이 있습니다. 어플의 사용법을 다시 듣고싶으시다면 우측 상단의 버튼을 눌러주세요.',
    '어플 사용법 설명이 다 끝났습니다. 화면을 한번 더 터치하시면 기존 어플 화면으로 돌아갑니다.'
  ];

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
      firstSound();
    })();
  }, []);

  async function firstSound() {
    if (!hasPlayedFisrtTime){
      try {
        console.log('first TTS');
        await Speech.speak(firstText);
        setHasPlayedFirstTime(true);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function helpSound() {
    setIsOverlayVisible(true);
    setIsButtonsDisabled(true);
    try {
      await Speech.stop(); // Stop any ongoing speech before starting a new one
      await Speech.speak(helpTexts[speechIndex]);
      setSpeechIndex(speechIndex + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsButtonsDisabled(false);
    }
  }

  const handleOverlayPress = async () => {
    if (isOverlayVisible) {
      if (speechIndex < helpTexts.length) {
        await Speech.stop(); // Stop any ongoing speech before proceeding
        helpSound();
      } else {
        setIsOverlayVisible(false);
        setSpeechIndex(0);
        setIsButtonsDisabled(false);
      }
    }
  };

  const handleCameraCapture = async () => {
    if (!cameraPermission || isButtonsDisabled) {
      console.log('Camera permission not granted or buttons are disabled.');
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
          <TouchableOpacity style={styles.helpButton} onPress={helpSound} disabled={isButtonsDisabled}>
            <MaterialIcons name="help" size={24} color="white" />
          </TouchableOpacity>
          {isOverlayVisible && (
            <TouchableWithoutFeedback onPress={handleOverlayPress}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
          )}
          <Camera style={styles.camera} ref={cameraRef} />
          <TouchableOpacity
            style={[styles.circularButton]} 
            onPress={handleCameraCapture}
            disabled={isButtonsDisabled}>
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
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1,
  },
});