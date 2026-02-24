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

    console.log('📄 读取数据库初始化脚本...');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📋 解析SQL语句...');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 共解析出 ${statements.length} 条SQL语句`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`🔄 执行SQL语句 ${i + 1}/${statements.length}...`);
        await pool.query(statement);
        console.log(`✅ SQL语句 ${i + 1} 执行成功`);
        successCount++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  SQL语句 ${i + 1} 跳过（表已存在）`);
          successCount++;
        } else {
          console.error(`❌ SQL语句 ${i + 1} 执行失败:`, error.message);
          errorCount++;
        }
      }
    }

    console.log(`📊 数据库初始化执行结果: 成功 ${successCount} 条, 失败 ${errorCount} 条`);
    
    if (errorCount > 0) {
      console.error('❌ 数据库初始化过程中出现错误，请检查日志');
    } else {
      console.log('✅ 数据库初始化完成');
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
};

module.exports = { initDatabase };