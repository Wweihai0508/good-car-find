const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    console.log('🔧 开始初始化数据库...');

    const sqlPath = path.join(__dirname, 'database', 'init.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.log('⚠️  数据库初始化脚本不存在，跳过');
      return;
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log('⚠️  执行SQL时出错:', error.message);
        }
      }
    }

    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
};

module.exports = { initDatabase };