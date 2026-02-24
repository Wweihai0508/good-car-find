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
    
    // 显示解析出的前几条SQL语句，用于调试
    for (let i = 0; i < Math.min(statements.length, 5); i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 50) + (statement.length > 50 ? '...' : '');
      console.log(`ℹ️  SQL语句 ${i + 1} 预览: ${preview}`);
    }

    // 直接执行创建所有必要表的SQL语句，确保表被创建
    try {
      console.log('🔄 直接执行创建所有必要表的SQL语句...');
      
      // 创建用户表
      const createUsersTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
          username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
          password VARCHAR(255) NOT NULL COMMENT '密码',
          email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
          phone VARCHAR(20) COMMENT '电话',
          role ENUM('admin', 'user') DEFAULT 'user' COMMENT '角色：admin-管理员，user-普通用户',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表'
      `;
      await pool.query(createUsersTableSQL);
      console.log('✅ 成功创建users表');
      
      // 创建车辆表
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
      
      // 创建车辆图片表
      const createCarImagesTableSQL = `
        CREATE TABLE IF NOT EXISTS car_images (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '图片ID',
          car_id INT NOT NULL COMMENT '车辆ID',
          image_url VARCHAR(255) NOT NULL COMMENT '图片URL',
          is_main BOOLEAN DEFAULT FALSE COMMENT '是否为主图',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          INDEX idx_car_id (car_id),
          FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆图片表'
      `;
      await pool.query(createCarImagesTableSQL);
      console.log('✅ 成功创建car_images表');
      
      // 创建订单表
      const createOrdersTableSQL = `
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
          user_id INT NOT NULL COMMENT '用户ID',
          car_id INT NOT NULL COMMENT '车辆ID',
          order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '订单日期',
          status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态：pending-待处理，completed-已完成，cancelled-已取消',
          total_price DECIMAL(10, 2) NOT NULL COMMENT '总价',
          payment_method VARCHAR(50) COMMENT '支付方式',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_user_id (user_id),
          INDEX idx_car_id (car_id),
          INDEX idx_status (status),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表'
      `;
      await pool.query(createOrdersTableSQL);
      console.log('✅ 成功创建orders表');
      
      // 创建收藏表
      const createFavoritesTableSQL = `
        CREATE TABLE IF NOT EXISTS favorites (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
          user_id INT NOT NULL COMMENT '用户ID',
          car_id INT NOT NULL COMMENT '车辆ID',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
          UNIQUE KEY idx_user_car (user_id, car_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表'
      `;
      await pool.query(createFavoritesTableSQL);
      console.log('✅ 成功创建favorites表');
      
      // 创建评价表
      const createReviewsTableSQL = `
        CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '评价ID',
          user_id INT NOT NULL COMMENT '用户ID',
          car_id INT NOT NULL COMMENT '车辆ID',
          rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5) COMMENT '评分：1-5星',
          comment TEXT COMMENT '评价内容',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_user_id (user_id),
          INDEX idx_car_id (car_id),
          INDEX idx_rating (rating),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表'
      `;
      await pool.query(createReviewsTableSQL);
      console.log('✅ 成功创建reviews表');
      
      console.log('✅ 所有必要表创建完成');
    } catch (error) {
      console.error('❌ 创建表失败:', error.message);
    }

    // 检查railway数据库中的表
    try {
      console.log('🔄 检查railway数据库中的表...');
      const result = await pool.query('SHOW TABLES');
      const tables = result[0].map(row => Object.values(row)[0]);
      console.log('✅ 数据库中的表:', tables.join(', '));
      console.log(`✅ 共找到 ${tables.length} 个表`);
    } catch (error) {
      console.error('❌ 检查数据库表失败:', error.message);
    }

    // 执行解析出的SQL语句
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
      const tables = result[0].map(row => Object.values(row)[0]);
      console.log('✅ 数据库中的表:', tables.join(', '));
      console.log(`✅ 共找到 ${tables.length} 个表`);
      
      // 检查cars表是否存在
      if (tables.includes('cars')) {
        console.log('✅ cars表存在！');
        // 检查cars表的结构
        const carStructure = await pool.query('DESCRIBE cars');
        console.log(`✅ cars表结构检查：共 ${carStructure[0].length} 个字段`);
      } else {
        console.error('❌ cars表不存在！');
      }
      
    } catch (error) {
      console.error('❌ 检查数据库表失败:', error.message);
    }
    
    // 插入测试数据
    try {
      console.log('🔄 插入测试数据...');
      const insertTestDataSQL = `
        INSERT IGNORE INTO cars (brand, model, year, mileage, price, color, fuel_type, transmission, engine, description, status) VALUES
        ('丰田', '卡罗拉', 2020, 30000, 120000.00, '白色', '汽油', '自动', '1.2T', '丰田卡罗拉，省油耐用，家用首选', 'available'),
        ('本田', '思域', 2019, 40000, 110000.00, '黑色', '汽油', '自动', '1.5T', '本田思域，运动感强，动力充沛', 'available'),
        ('大众', '帕萨特', 2021, 20000, 150000.00, '银色', '汽油', '自动', '2.0T', '大众帕萨特，商务首选，空间宽敞', 'available')
      `;
      const result = await pool.query(insertTestDataSQL);
      console.log(`✅ 插入测试数据成功，影响行数：${result[0].affectedRows}`);
    } catch (error) {
      console.error('❌ 插入测试数据失败:', error.message);
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