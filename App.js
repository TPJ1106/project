import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native';
import * as React from 'react';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const [cameraPermission, setCameraPermission] = React.useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = React.useState(false);
  const [speechIndex, setSpeechIndex] = React.useState(0);
  const [isButtonsDisabled, setIsButtonsDisabled] = React.useState(false);
  const [hasPlayedFirstTime, setHasPlayedFirstTime] = React.useState(false);
  const [speechText, setSpeechText] = React.useState(''); // speechText 추가
  
    const firstTextLines = [
      '어플의 사용법을 알려드리겠습니다. 다음 설명을 듣고싶으시면 화면을 터치해주세요.',
      '어플의 첫 실행 화면은 카메라 화면입니다.',
      '휴대폰을 사용자가 가려고하는 방향으로 비추면 어플이 장애물과의 거리를 인식하여 음성으로 알려줍니다.',
      '화면 중앙 하단에는 카메라 촬영버튼이 있습니다. 이 버튼은 식품을 촬영하는 버튼으로 과자, 라면을 카메라로 촬영하면 상품을 인식하여 어떤 상품인지 알려줍니다.',
      '화면 우측 상단에는 도움말 버튼이 있습니다. 어플의 사용법을 듣고싶으시면 우측 상단의 버튼을 눌러주세요.',
      '어플 사용법 설명이 다 끝났습니다. 어플의 사용법을 듣고싶으시다면 다시 우측 상단의 도움말 버튼을 눌러주세요.',
      '카메라 화면으로 돌아갑니다.'
    ];
  
    const helpTexts = [
      '도움말 버튼을 누르셨습니다. 다음 설명을 듣고싶으시면 화면을 터치해주세요.',
      '어플의 첫 실행 화면은 카메라 화면입니다.',
      '휴대폰을 사용자가 가려고하는 방향으로 비추면 어플이 장애물과의 거리를 인식하여 음성으로 알려줍니다.',
      '화면 중앙 하단에는 카메라 촬영버튼이 있습니다. 이 버튼은 식품을 촬영하는 버튼으로 과자, 라면을 카메라로 촬영하면 상품을 인식하여 어떤 상품인지 알려줍니다.',
      '화면 우측 상단에는 도움말 버튼이 있습니다. 어플의 사용법을 다시 듣고싶으시면 우측 상단의 버튼을 눌러주세요.',
      '어플 사용법 설명이 다 끝났습니다. 화면을 한번 더 터치하시면 기존 어플 화면으로 돌아갑니다.'
    ];
  
    const speakTextAndDisplayOverlay = async (text) => {
      setIsButtonsDisabled(true);
  
      try {
        await Speech.stop();
        setSpeechText(text);
        await Speech.speak(text);
      } catch (error) {
        console.error(error);
      } finally {
        setIsButtonsDisabled(false);
      }
      setIsOverlayVisible(true);
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

    const handleOverlayPress = async () => {
      if (isOverlayVisible) {
        if (!hasPlayedFirstTime) {
          setHasPlayedFirstTime(true);
          setSpeechIndex(speechIndex + 1); // speechIndex 증가시켜 다음 문장으로 이동
          return;
        }
    
        if (speechIndex < firstTextLines.length - 1) {
          const textToSpeak = firstTextLines[speechIndex + 1];
          setSpeechText(textToSpeak); // 텍스트 업데이트
        
          try {
            await Speech.stop();
            await Speech.speak(textToSpeak);
          } catch (error) {
            console.error(error);
          }
        
          setIsOverlayVisible(true); // 오버레이 표시
        
          if (textToSpeak.includes('카메라 화면으로 돌아갑니다.')) {
            setTimeout(() => setIsOverlayVisible(false), 3000); // 3초 후에 오버레이 숨기기
          }
          
          setSpeechIndex(speechIndex + 1);
        } else {
          setIsOverlayVisible(false);
          setSpeechIndex(0);
        }
      }
    };

    React.useEffect(() => {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');
    
        if (!hasPlayedFirstTime) {
          setIsOverlayVisible(true);
          setIsButtonsDisabled(true);
          try {
            await Speech.stop();
            await Speech.speak(firstTextLines[0]);
            speakTextAndDisplayOverlay(firstTextLines[0]); // 이 부분 추가
          } catch (error) {
            console.error(error);
          } finally {
            setIsButtonsDisabled(false);
            setHasPlayedFirstTime(true);
          }
        }
      })();
    }, [hasPlayedFirstTime]);

  const speakHelpTextAndDisplayOverlay = async (index) => {
    setIsButtonsDisabled(true);

    try {
      await Speech.stop();
      await Speech.speak(helpTexts[index]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsButtonsDisabled(false);
    }

    setIsOverlayVisible(true);
    setSpeechText(helpTexts[index]); // speechText 업데이트
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      {cameraPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : cameraPermission === false ? (
        <Text>Camera permission denied. Please grant the permission.</Text>
      ) : (
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.cameraContainer}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => {
                setIsOverlayVisible(true);
                speakHelpTextAndDisplayOverlay(0);
              }}
              disabled={isButtonsDisabled}
            >
              <MaterialIcons name="help" size={40} color="skyblue" />
            </TouchableOpacity>
            {isOverlayVisible && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>{speechText}</Text>
              </View>
            )}
            <Camera style={styles.camera} ref={cameraRef} />
            <TouchableOpacity
              style={[styles.circularButton]}
              onPress={handleCameraCapture}
              disabled={isButtonsDisabled}
            >
              <MaterialIcons name="photo-camera" size={48} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
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
    backgroundColor: 'yellow',
    padding: 5,
    borderRadius: 30,
    zIndex: 2,
  },
  circularButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'blue',
    padding: 20,
    borderRadius: 100,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});