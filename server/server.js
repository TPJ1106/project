const express = require('express');
const cors = require('cors'); // cors 패키지 불러오기
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const { hostname } = require('os');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS 설정
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 도메인에서 접근을 허용 (*), 필요에 따라 특정 도메인을 명시할 수 있습니다.
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let isCapturing = false;

// 이미지 촬영 및 처리 엔드포인트
app.post('/captureAndProcess', upload.single('image'), async (req, res) => {
  if (isCapturing) {
    return res.status(400).json({ message: '이미 촬영 중입니다.' });
  }

  try {
    isCapturing = true;

    // 타임스탬프를 사용하여 이미지 파일 이름 생성
    const timestamp = Date.now();
    const fileName = `./Tests2/input2/${timestamp}.jpg`;

    // 이미지 데이터를 파일로 저장
    fs.writeFileSync(fileName, req.file.buffer);

    // distance.py 실행 및 .txt 파일 생성
    const distanceCommand = `python3 ./distance.py ${fileName}`;
    exec(distanceCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error('distance.py 실행 오류:', error);
        isCapturing = false;
        return res.status(500).json({ message: '거리 인식 중 오류 발생' });
      }

      const distanceResultFilePath = `./Tests2/output2/${timestamp}_distance.txt`;

      // 텍스트 파일의 내용을 읽음
      const result_text = fs.readFileSync(distanceResultFilePath, 'utf-8');

      // 결과 파일 삭제
      fs.unlinkSync(distanceResultFilePath);

      isCapturing = false;

      // 여기에서 클라이언트로 결과 전송
      res.json({ distanceResultText: result_text });
    });
  } catch (error) {
    console.error('캡처 및 처리 오류:', error);
    isCapturing = false;
    res.status(500).json({ message: '캡처 및 처리 중 오류 발생' });
  }
});

// 카메라 버튼으로 촬영한 이미지 저장 엔드포인트
app.post('/saveCameraImage', upload.single('image'), async (req, res) => {
  try {
    const path = require('path');

    // 이미지를 저장할 디렉토리 설정
    const uploadDirectory = path.join(__dirname, 'Tests', 'input');

    // 이미지 파일 이름 생성
    const timestamp = Date.now();
    const fileName = `${timestamp}.jpg`;

    // 전체 파일 경로 생성
    const filePath = path.join(uploadDirectory, fileName);

    // 이미지를 filePath에 저장
    fs.writeFileSync(filePath, req.file.buffer);

    // 이미지 데이터를 파일로 저장
    fs.writeFileSync(fileName, req.file.buffer, (error) => {
      if (error) {
        console.error('파일 저장 중 오류 발생: ', error);
        res.status(500).json({ message: '이미지 저장 중 오류 발생' });
      } else {
        console.log('파일이 성공적으로 저장되었습니다.');

        // testFrom3.py 실행
        const testFrom3Command = `python3 ./testFrom3.py ${fileName}`;
        exec(testFrom3Command, async (error, stdout, stderr) => {
          if (error) {
            console.error('testFrom3.py 실행 오류:', error);
            return res.status(500).json({ message: 'testFrom3.py 실행 중 오류 발생' });
          }

          const testResultFileName = `${timestamp}_test.txt`;
          const testResultFilePath = `./Tests/output/${testResultFileName}`;

          // 텍스트 파일의 내용을 읽음
          const result_text = fs.readFileSync(testResultFilePath, 'utf-8');

          // 결과 파일 삭제
          fs.unlinkSync(testResultFilePath);

          // 여기에서 클라이언트로 결과 전송
          res.json({ testResultText: result_text });
        });
      }
    });
  } catch (error) {
    console.error('이미지 저장 및 처리 오류:', error);
    res.status(500).json({ message: '이미지 저장 및 처리 중 오류 발생' });
  }
});

app.get('/', (req, res) => {
  try {
    // 비즈니스 로직 수행

    // 클라이언트에 응답
    res.json({ message: '데이터를 성공적으로 가져옴' });
  } catch (error) {
    // 에러 핸들링

    // 에러 응답
    res.status(500).json({ error: '서버 오류' });
  }
});

app.listen(port, hostname, () => {
  console.log(`서버가 포트 ${hostname}:${port}에서 실행 중입니다.`);
});
