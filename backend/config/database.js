const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'hrsoft',
  database: process.env.DB_NAME || 'used_car_showroom',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  namedPlaceholders: true,
  dateStrings: false,
  connectTimeout: 10000
});

const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ 数据库连接成功');
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ 数据库连接失败 (尝试 ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        console.log('⏳ 3秒后重试...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('❌ 数据库连接失败，请检查MySQL服务状态和配置');
        process.exit(1);
      }
    }
  }
};

module.exports = { pool, testConnection };
