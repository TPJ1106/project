import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  const cameraRef = useRef(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [serverResponse, setServerResponse] = useState(''); // 서버 응답을 저장하는 상태 변수
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isButtonsDisabled, setIsButtonsDisabled] = useState(false);
  const [hasPlayedFirstTime, setHasPlayedFirstTime] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const serverAddress = 'http://localhost:3000';

  const firstTextLines = [
    // 어플 첫 실행 시 음성 가이드 메시지
    '어플의 사용법을 알려드리겠습니다.\n다음 설명을 듣고싶으시면 화면을 터치해주세요.',
    '어플의 첫 실행 화면은 카메라 화면입니다.',
    '휴대폰을 사용자가 가려고 하는 방향으로 비추면 어플이 장애물과의 거리를 인식하여 음성으로 알려줍니다.',
    '화면 중앙 하단에는 카메라 촬영 버튼이 있습니다.\n이 버튼은 식품을 촬영하는 버튼으로, 과자나 라면을 카메라로 촬영하면 어떤 상품인지 알려줍니다.',
    '식품을 촬영하면 촬영한 식품을 인식하여 어떤 식품인지 텍스트와 음성으로 알려준 뒤 3초 후에 이전 화면으로 돌아갑니다.',
    '화면 우측 상단에는 도움말 버튼이 있습니다. 어플의 사용법을 듣고싶으시면 우측 상단의 버튼을 눌러주세요.',
    '어플 사용법 설명이 다 끝났습니다.\n어플의 사용법을 다시 듣고싶으시다면 우측 상단의 도움말 버튼을 눌러주세요.',
    '카메라 화면으로 돌아갑니다.'
  ];

  const helpTexts = [
    // 도움말 메시지
    '도움말 버튼을 누르셨습니다.\n다음 설명을 듣고싶으시면 화면을 터치해주세요.',
    '어플의 첫 실행 화면은 카메라 화면입니다.',
    '휴대폰을 사용자가 가려고 하는 방향으로 비추면 어플이 장애물과의 거리를 인식하여 음성으로 알려줍니다.',
    '화면 중앙 하단에는 카메라 촬영 버튼이 있습니다.\n이 버튼은 식품을 촬영하는 버튼으로, 과자나 라면을 카메라로 촬영하면 어떤 상품인지 알려줍니다.',
    '식품을 촬영하면 촬영한 식품을 인식하여 어떤 식품인지 텍스트와 음성으로 알려준 뒤 3초 후에 이전 화면으로 돌아갑니다.',
    '화면 우측 상단에는 도움말 버튼이 있습니다. 어플의 사용법을 듣고싶으시면 우측 상단의 버튼을 눌러주세요.',
    '어플 사용법 설명이 다 끝났습니다.\n어플의 사용법을 다시 듣고싶으시다면 다시 우측 상단의 도움말 버튼을 눌러주세요.',
    '카메라 화면으로 돌아갑니다.'
  ];

  // 어플 첫 실행 시 음성 재생
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

  const handleOverlayPress = async () => {
    if (isOverlayVisible) {
      if (!hasPlayedFirstTime) {
        setHasPlayedFirstTime(true);
        setSpeechIndex(speechIndex + 1);
        return;
      }

      if (speechIndex < firstTextLines.length - 1) {
        const textToSpeak = firstTextLines[speechIndex + 1];
        setSpeechText(textToSpeak);
      
        try {
          await Speech.stop();
          await Speech.speak(textToSpeak);
        } catch (error) {
          console.error(error);
        }
      
        setIsOverlayVisible(true);
      
        if (textToSpeak.includes('카메라 화면으로 돌아갑니다.')) {
          setTimeout(() => setIsOverlayVisible(false), 3000);
        }
        
        setSpeechIndex(speechIndex + 1);
      } else {
        setIsOverlayVisible(false);
        setSpeechIndex(0);
      }
    }
  };

  const speakHelpTextAndDisplayOverlay = async index => {
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
    setSpeechText(helpTexts[index]);
  };

  const handleHelpButtonPress = async () => {
    if (!isOverlayVisible) {
      setIsOverlayVisible(true);
      setSpeechIndex(0);
      speakHelpTextAndDisplayOverlay(0);
    }
  };

  // 서버 응답 팝업 열기
  const openServerResponsePopup = () => {
    if (serverResponse) {
      playPopupMessage(); // 팝업 텍스트를 음성으로 재생
    }
  };

  const playPopupMessage = async () => {
    try {
      await Speech.stop(); // 현재 음성 재생 중인 경우 중지
      await Speech.speak(serverResponse); // 팝업에 표시된 텍스트를 음성으로 재생
    } catch (error) {
      console.error('음성 재생 오류:', error);
    }
  
    // 3초 후에 팝업을 자동으로 닫습니다.
    setTimeout(() => {
      setServerResponse(''); // 서버 응답을 초기화하여 팝업 내용을 지웁니다.
      setIsOverlayVisible(false); // 팝업을 닫습니다.
    }, 3000); // 3초 후에 실행
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');

      if (!hasPlayedFirstTime) {
        setIsOverlayVisible(true);
        setIsButtonsDisabled(true);
        try {
          await Speech.stop();
          speakTextAndDisplayOverlay(firstTextLines[0]);
        } catch (error) {
          console.error(error);
        } finally {
          setIsButtonsDisabled(false);
          setHasPlayedFirstTime(true);
        }
      }
    })();
  }, [hasPlayedFirstTime]);

  //서버
  useEffect(() => {
    openServerResponsePopup();
  }, [serverResponse]);

  // 서버로 이미지 업로드
  const uploadImageToServer = async () => {
    if (!cameraPermission || isButtonsDisabled) {
      console.log('카메라 액세스 권한이 필요하거나 버튼이 비활성화되었습니다.');
      return;
    }

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      // 서버 응답 및 오류 처리
      fetch(`${serverAddress}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log('서버에서 받은 결과:', data.predictions);
        const { fileName } = data.predictions;
        setServerResponse(`사진 파일 이름: ${fileName}`);
    
        // 서버 응답을 받으면 팝업 창을 띄웁니다.
        setIsOverlayVisible(true);
      })
      .catch(error => {
        console.error('이미지 업로드 오류:', error);

        // 이미지 업로드 오류 메시지를 서버 응답 팝업과 동일한 방식으로 표시
        setServerResponse('식품을 인식할 수 없습니다.\n다시 촬영해주세요.');
        setIsOverlayVisible(true);
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      {cameraPermission === null ? (
        <Text>카메라 액세스 권한 요청 중...</Text>
      ) : cameraPermission === false ? (
        <Text>카메라 액세스 권한이 거부되었습니다. 권한을 부여해 주세요.</Text>
      ) : (
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.cameraContainer}>
            {/* 도움말 버튼 */}
            <TouchableOpacity
              style={styles.helpButton}
              onPress={handleHelpButtonPress}
              disabled={isButtonsDisabled}
            >
              <MaterialIcons name="help" size={70} color="#AE7FFF" />
            </TouchableOpacity>
            {isOverlayVisible && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>{speechText}</Text>
              </View>
            )}
  
            {/* 서버 응답 팝업 */}
            {serverResponse !== '' && (
              <View style={styles.serverResponsePopup}>
                <Text style={styles.serverResponseText}>{serverResponse}</Text>
              </View>
            )}
  
            <Camera style={styles.camera} ref={cameraRef} />
  
            {/* 카메라 버튼 */}
            <TouchableOpacity
              style={[styles.circularButton]}
              onPress={uploadImageToServer}
              disabled={isButtonsDisabled}
            >
              <MaterialIcons name="photo-camera" size={70} color="white" />
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
    padding: 15,
    borderRadius: 30,
    zIndex: 2,
  },
  circularButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    paddingVertical: 20,
    paddingHorizontal: 130,
    backgroundColor: 'blue',
    padding: 45,
    borderRadius: 30,
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

  // 서버 응답 팝업
  serverResponsePopup: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    zIndex: 4,
    elevation: 5, // Android에서 그림자 효과 주기
  },
  serverResponseText: {
    fontSize: 20,
    textAlign: 'center',
  },
});