const { pool } = require('./config/database');

async function updateRecommendationsTable() {
  try {
    console.log('开始更新 recommendations 表...');

    const alterTableSQL = `
      ALTER TABLE recommendations
      ADD COLUMN priority INT DEFAULT 1 COMMENT '优先级，数字越小越靠前',
      ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态：active-激活，inactive-未激活',
      ADD INDEX idx_priority (priority),
      ADD INDEX idx_status (status);
    `;

    await pool.execute(alterTableSQL);
    console.log('✅ recommendations 表更新成功');

    console.log('检查表结构...');
    const [rows] = await pool.execute('DESCRIBE recommendations');
    console.log('表结构:', rows);

  } catch (error) {
    console.error('❌ 更新 recommendations 表失败:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

updateRecommendationsTable()
  .then(() => {
    console.log('脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
