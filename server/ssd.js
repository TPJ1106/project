const cocoSsd = require('@tensorflow-models/coco-ssd');

//이미지를 로드하고 예측 수행
async function makePredictions(imageData) {
  try {
    //이미지 로드
    const image = await loadImage(imageData);
    
    //모델 로드
    const model = await cocoSsd.load();
    
    //예측 수행
    const predictions = await model.detect(image);
    return predictions;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  makePredictions,
};