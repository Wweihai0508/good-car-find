const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'hrsoft',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
  port: process.env.MYSQLPORT || 3306,
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
};

console.log('📦 数据库连接配置:');
console.log('  - 主机:', dbConfig.host);
console.log('  - 用户名:', dbConfig.user);
console.log('  - 密码:', dbConfig.password ? '****' : '未设置');
console.log('  - 数据库:', dbConfig.database);
console.log('  - 端口:', dbConfig.port);

const pool = mysql.createPool(dbConfig);

const testConnection = async (retries = 3) => {
  console.log('🔍 开始检查数据库连接...');
  console.log('📋 环境变量检查:');
  console.log('  - MYSQLHOST:', process.env.MYSQLHOST ? '✓' : '✗');
  console.log('  - MYSQLUSER:', process.env.MYSQLUSER ? '✓' : '✗');
  console.log('  - MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '✓' : '✗');
  console.log('  - MYSQLDATABASE:', process.env.MYSQLDATABASE ? '✓' : '✗');
  console.log('  - MYSQLPORT:', process.env.MYSQLPORT ? '✓' : '✗');
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`\n🔄 尝试连接数据库 (${i + 1}/${retries})...`);
      const connection = await pool.getConnection();
      console.log('✅ 数据库连接成功');
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ 数据库连接失败 (尝试 ${i + 1}/${retries}):`, error.message);
      console.error('📝 错误详情:', error.code, error.sqlMessage);
      if (i < retries - 1) {
        console.log('⏳ 3秒后重试...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('❌ 数据库连接失败，请检查MySQL服务状态和配置');
        console.error('💡 建议检查:');
        console.error('  1. MySQL数据库服务是否正在运行');
        console.error('  2. Private Network是否已启用');
        console.error('  3. 环境变量值是否正确');
        console.error('  4. 数据库服务是否已重启');
        process.exit(1);
      }
    }
  }
};

module.exports = { pool, testConnection };
