const { pool } = require('./config/database');

async function createPopularCarsTable() {
  try {
    console.log('开始创建 popular_cars 表...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS popular_cars (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        car_id INT NOT NULL COMMENT '车辆ID',
        priority INT DEFAULT 1 COMMENT '优先级，数字越小越靠前',
        status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态：active-激活，inactive-未激活',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        UNIQUE KEY uk_car_id (car_id) COMMENT '车辆ID唯一索引',
        INDEX idx_priority (priority) COMMENT '优先级索引',
        INDEX idx_status (status) COMMENT '状态索引',
        FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='热门车辆表';
    `;

    await pool.execute(createTableSQL);
    console.log('✅ popular_cars 表创建成功');

    console.log('检查表结构...');
    const [rows] = await pool.execute('DESCRIBE popular_cars');
    console.log('表结构:', rows);

  } catch (error) {
    console.error('❌ 创建 popular_cars 表失败:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

createPopularCarsTable()
  .then(() => {
    console.log('脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
