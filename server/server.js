const express = require('express');
const { loadImage, makePredictions } = require('./ssd'); // SSD 관련 코드 및 함수 가져오기

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/predict', async (req, res) => {
  try {
    const { image } = req.body;

    // 이미지 분류 예측을 수행하는 함수 호출
    const predictions = await makePredictions(image);

    // 예측 결과에서 파일 이름을 추출
    const fileName = predictions[0]?.filename || 'unknown.jpg'; // 예측 결과에서 파일 이름을 추출하거나 기본값으로 'unknown.jpg'를 사용

    // 예측 결과와 사진 파일 이름을 클라이언트에 반환
    res.json({ predictions, fileName });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});