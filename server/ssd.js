const cocoSsd = require('@tensorflow-models/coco-ssd');

// 이미지를 로드하고 예측 수행
async function makePredictions(imageData) {
  try {
    const image = await loadImage(imageData);
    const model = await cocoSsd.load();
    const predictions = await model.detect(image);
    return predictions;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  makePredictions,
};