const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 이미지 저장을 위한 Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 디렉토리 생성 함수
const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
};

// 이미지 저장 디렉토리 생성
createDirectoryIfNotExists('./images');

// 이미지 촬영 및 처리
let isCapturing = false;

app.post('/captureAndProcess', upload.single('image'), async (req, res) => {
  if (isCapturing) {
    return res.status(400).json({ message: '이미 촬영 중입니다.' });
  }

  try {
    isCapturing = true;

    // 이미지 파일 이름 생성 (고유한 이름을 생성하도록 수정할 수 있음)
    const timestamp = Date.now();
    const fileName = `./images/${timestamp}.jpg`;

    // 이미지 데이터를 파일로 저장
    fs.writeFileSync(fileName, req.file.buffer);

    // distance.py 실행 및 .txt 파일 생성
    const distanceCommand = `python3 ./ai/distance.py ${fileName}`;
    exec(distanceCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error('distance.py 실행 오류:', error);
        isCapturing = false;
        return res.status(500).json({ message: '거리 인식 중 오류 발생' });
      }

      // food.py 실행 및 .txt 파일 생성
      const foodCommand = `python3 ./ai/food.py ${fileName}`;
      exec(foodCommand, async (foodError, foodStdout, foodStderr) => {
        if (foodError) {
          console.error('food.py 실행 오류:', foodError);
          isCapturing = false;
          return res.status(500).json({ message: '음식 인식 중 오류 발생' });
        }

        // 결과 .txt 파일 읽기
        const distanceResultFileName = `${fileName.split('.')[0]}_distance.txt`;
        const distanceResultFilePath = `./ai/${distanceResultFileName}`;
        const distanceResultText = fs.readFileSync(distanceResultFilePath, 'utf-8');

        const foodResultFileName = `${fileName.split('.')[0]}_food.txt`;
        const foodResultFilePath = `./ai/${foodResultFileName}`;
        const foodResultText = fs.readFileSync(foodResultFilePath, 'utf-8');

        // 결과 .txt 파일 삭제
        fs.unlinkSync(distanceResultFilePath);
        fs.unlinkSync(foodResultFilePath);

        // 클라이언트에 결과 전송
        isCapturing = false;
        res.json({ distanceResultText, foodResultText });
      });
    });
  } catch (error) {
    console.error('캡처 및 처리 오류:', error);
    isCapturing = false;
    res.status(500).json({ message: '캡처 및 처리 중 오류 발생' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});