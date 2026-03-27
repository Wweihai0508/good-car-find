const express = require('express');
const router = express.Router();
const CarController = require('../controllers/carController');
const EnhancedCarController = require('../controllers/enhancedCarController');
const multer = require('multer');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!require('fs').existsSync(uploadPath)) {
      require('fs').mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `car-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 基础路由
router.get('/', CarController.getCars);
router.get('/:id', CarController.getCarById);
router.post('/', CarController.addCar);
router.put('/:id', CarController.updateCar);
router.delete('/:id', CarController.deleteCar);

// 图片上传
router.post('/upload', upload.array('images', 10), CarController.uploadImage);

// AI识别
router.post('/ai/recognize', CarController.aiRecognizeImage);

// ===== 增强功能路由 =====

// 智能推荐
router.get('/smart/recommend', EnhancedCarController.smartRecommend);

// 快速录入（手机端）
router.post('/quick-entry', EnhancedCarController.quickEntry);

// 按距离获取车辆
router.get('/distance/list', EnhancedCarController.getCarsByDistance);

// 记录客户需求
router.post('/requirements', EnhancedCarController.recordCustomerRequirement);

// 车行统计
router.get('/dealership/stats', EnhancedCarController.getDealershipStats);

module.exports = router;
