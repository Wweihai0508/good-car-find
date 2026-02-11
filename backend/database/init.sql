-- 二手车展厅系统 - 数据库初始化脚本
-- 用于在云平台上创建数据库和表结构

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS used_car_showroom 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE used_car_showroom;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  name VARCHAR(100) COMMENT '真实姓名',
  phone VARCHAR(20) COMMENT '手机号',
  email VARCHAR(100) COMMENT '邮箱',
  role ENUM('admin', 'user') DEFAULT 'user' COMMENT '角色：admin-管理员，user-普通用户',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态：active-激活，inactive-未激活',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 车辆表
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆表';

-- 车辆图片表
CREATE TABLE IF NOT EXISTS car_images (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '图片ID',
  car_id INT NOT NULL COMMENT '车辆ID',
  url VARCHAR(500) NOT NULL COMMENT '图片URL',
  is_primary BOOLEAN DEFAULT FALSE COMMENT '是否为主图',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  INDEX idx_car_id (car_id),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆图片表';

-- 推荐车辆表
CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '推荐ID',
  car_id INT NOT NULL COMMENT '车辆ID',
  priority INT DEFAULT 1 COMMENT '优先级，数字越小越靠前',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态：active-激活，inactive-未激活',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_car_id (car_id) COMMENT '车辆ID唯一索引',
  INDEX idx_priority (priority) COMMENT '优先级索引',
  INDEX idx_status (status) COMMENT '状态索引',
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推荐车辆表';

-- 热门车辆表
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

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '客户ID',
  name VARCHAR(100) NOT NULL COMMENT '客户姓名',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  email VARCHAR(100) COMMENT '邮箱',
  address TEXT COMMENT '地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_phone (phone),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- 销售记录表
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '销售ID',
  car_id INT NOT NULL COMMENT '车辆ID',
  customer_id INT NOT NULL COMMENT '客户ID',
  sale_price DECIMAL(10, 2) NOT NULL COMMENT '成交价格',
  sale_date DATE NOT NULL COMMENT '销售日期',
  notes TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_car_id (car_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_sale_date (sale_date),
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售记录表';

-- 试驾预约表
CREATE TABLE IF NOT EXISTS test_drives (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '试驾ID',
  car_id INT NOT NULL COMMENT '车辆ID',
  customer_name VARCHAR(100) NOT NULL COMMENT '客户姓名',
  customer_phone VARCHAR(20) NOT NULL COMMENT '客户手机号',
  appointment_date DATETIME NOT NULL COMMENT '预约时间',
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '状态：pending-待确认，confirmed-已确认，completed-已完成，cancelled-已取消',
  notes TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_car_id (car_id),
  INDEX idx_appointment_date (appointment_date),
  INDEX idx_status (status),
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试驾预约表';

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏ID',
  user_id INT NOT NULL COMMENT '用户ID',
  car_id INT NOT NULL COMMENT '车辆ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_user_car (user_id, car_id) COMMENT '用户-车辆唯一索引',
  INDEX idx_user_id (user_id),
  INDEX idx_car_id (car_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 插入默认管理员账号
INSERT INTO users (username, password, name, role, status) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'admin', 'active')
ON DUPLICATE KEY UPDATE id=id;

SET FOREIGN_KEY_CHECKS = 1;

-- 完成
SELECT '✅ 数据库初始化完成！' AS message;
SELECT '📋 默认管理员账号：admin / admin123' AS admin_info;
