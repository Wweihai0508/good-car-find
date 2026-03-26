require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { testConnection } = require('./config/database');
const { initDatabase } = require('./initDatabase');
const carRoutes = require('./routes/cars');
const enhancedCarRoutes = require('./routes/enhancedCars');
const recommendationRoutes = require('./routes/recommendations');
const popularRoutes = require('./routes/popular');
const salesRoutes = require('./routes/sales');
const statisticsRoutes = require('./routes/statistics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// 增加请求体大小限制，以支持较大的base64编码图片
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//路由挂载，将不同的路由模块挂载到 /api 路径下
app.use('/api/cars', carRoutes);
app.use('/api/enhanced-cars', enhancedCarRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/popular', popularRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '二手车展厅系统 API 运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message || '未知错误'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在',
    path: req.path
  });
});

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const killPort = async (port) => {
  try {
    if (process.platform === 'win32') {
      await execAsync(`npx kill-port ${port}`);
    } else {
      await execAsync(`lsof -ti:${port} | xargs kill -9`);
    }
    console.log(`✅ 端口 ${port} 已清理`);
  } catch (error) {
    console.log(`⚠️  端口 ${port} 未被占用或清理失败`);
  }
};

const startServer = async () => {
  try {
    await testConnection();
    await initDatabase();

    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🚗 二手车展厅系统 API 服务启动');
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🌐 API 基础路径: http://localhost:${PORT}/api`);
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
