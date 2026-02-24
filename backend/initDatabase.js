const { pool } = require('./config/database');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const initDatabase = async () => {
  try {
    console.log('🔧 开始初始化数据库...');

    // 首先创建 railway 数据库（如果不存在）
    try {
      console.log('🔄 创建 railway 数据库（如果不存在）...');
      // 先使用默认数据库连接（不指定数据库名）
      const defaultPool = mysql.createPool({
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'hrsoft',
        port: process.env.MYSQLPORT || 3306,
      });
      
      await defaultPool.query('CREATE DATABASE IF NOT EXISTS railway');
      await defaultPool.end();
      console.log('✅ railway 数据库创建成功');
    } catch (error) {
      console.log('⚠️ 创建数据库时出错:', error.message);
      console.log('ℹ️ 继续尝试连接到现有数据库...');
    }

    // 确保使用 railway 数据库
    try {
      console.log('🔄 选择 railway 数据库...');
      await pool.query('USE railway');
      console.log('✅ 成功选择 railway 数据库');
    } catch (error) {
      console.error('❌ 选择数据库失败:', error.message);
      throw error;
    }

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

    // 直接执行创建cars表的SQL语句，确保表被创建
    try {
      console.log('🔄 直接执行创建cars表的SQL语句...');
      const createCarsTableSQL = `
        CREATE TABLE IF NOT EXISTS cars (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '车辆ID',
          brand VARCHAR(100) NOT NULL COMMENT '品牌',
          model VARCHAR(100) NOT NULL COMMENT '型号',
          year INT NOT NULL COMMENT '年份',
          mileage INT COMMENT '里程（公里）',
          price DECIMAL(10, 2) NOT NULL COMMENT '价格',
          color VARCHAR(50) COMMENT '颜色',
          fuel_type ENUM('汽油', '柴油', '电动', '混合动力') COMMENT '燃料类型',
          transmission ENUM('手动', '自动', '双离合', 'CVT') COMMENT '变速箱类型',
          engine VARCHAR(100) COMMENT '发动机',
          description TEXT COMMENT '车辆描述',
          status ENUM('available', 'sold', 'reserved') DEFAULT 'available' COMMENT '状态：available-在售，sold-已售，reserved-已预订',
          vin VARCHAR(17) COMMENT '车辆识别码',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_brand (brand),
          INDEX idx_model (model),
          INDEX idx_year (year),
          INDEX idx_price (price),
          INDEX idx_status (status),
          INDEX idx_vin (vin)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆表'
      `;
      await pool.query(createCarsTableSQL);
      console.log('✅ 成功创建cars表');
    } catch (error) {
      console.error('❌ 创建cars表失败:', error.message);
    }

    // 检查railway数据库中的表
    try {
      console.log('🔄 检查railway数据库中的表...');
      const result = await pool.query('SHOW TABLES');
      console.log('✅ 数据库中的表:', result[0].map(row => Object.values(row)[0]).join(', '));
    } catch (error) {
      console.error('❌ 检查数据库表失败:', error.message);
    }

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

    // 再次检查railway数据库中的表
    try {
      console.log('🔄 再次检查railway数据库中的表...');
      const result = await pool.query('SHOW TABLES');
      console.log('✅ 数据库中的表:', result[0].map(row => Object.values(row)[0]).join(', '));
    } catch (error) {
      console.error('❌ 检查数据库表失败:', error.message);
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