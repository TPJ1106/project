const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // 로그 레벨 (info, error, debug 등)
  format: winston.format.json(), // JSON 형식 로그
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // 에러 로그 파일
    new winston.transports.File({ filename: 'combined.log' }) // 모든 로그 파일
  ]
});

module.exports = logger;