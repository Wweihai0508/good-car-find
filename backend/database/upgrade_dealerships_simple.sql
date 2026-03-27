-- 车行共享展示系统数据库升级脚本
-- 针对现有数据库进行升级

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT=utf8mb4;
SET CHARACTER_SET_RESULTS=utf8mb4;

USE railway;

-- 1. 创建车行表
CREATE TABLE IF NOT EXISTS dealerships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '车行名称',
    contact_person VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    contact_wechat VARCHAR(100) COMMENT '微信',
    address VARCHAR(255) NOT NULL COMMENT '详细地址',
    city VARCHAR(50) COMMENT '城市',
    district VARCHAR(50) COMMENT '区县',
    latitude DECIMAL(10, 6) COMMENT '纬度',
    longitude DECIMAL(10, 6) COMMENT '经度',
    business_hours VARCHAR(100) COMMENT '营业时间',
    description TEXT COMMENT '车行简介',
    commission_rate DECIMAL(5, 2) DEFAULT 0.00 COMMENT '佣金率(%)',
    is_main_dealer BOOLEAN DEFAULT FALSE COMMENT '是否为主车行',
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active' COMMENT '状态',
    rating DECIMAL(2, 1) DEFAULT 5.0 COMMENT '评分(1-5)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_district (district),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车行信息表';

-- 2. 修改cars表添加新字段
ALTER TABLE cars ADD COLUMN dealership_id INT NULL COMMENT '车行ID';
ALTER TABLE cars ADD COLUMN location_address VARCHAR(255) COMMENT '车辆位置';
ALTER TABLE cars ADD COLUMN contact_person VARCHAR(50) COMMENT '联系人';
ALTER TABLE cars ADD COLUMN contact_phone VARCHAR(20) COMMENT '联系电话';
ALTER TABLE cars ADD COLUMN contact_wechat VARCHAR(100) COMMENT '微信';
ALTER TABLE cars ADD COLUMN latitude DECIMAL(10, 6) COMMENT '纬度';
ALTER TABLE cars ADD COLUMN longitude DECIMAL(10, 6) COMMENT '经度';
ALTER TABLE cars ADD COLUMN distance_km DECIMAL(8, 2) COMMENT '距离(km)';
ALTER TABLE cars ADD COLUMN car_source ENUM('own', 'partner', 'consignment') DEFAULT 'own' COMMENT '车辆来源:own-本车行,partner-合作车行,consignment-寄售';

-- 3. 创建客户咨询记录表
CREATE TABLE IF NOT EXISTS customer_inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL COMMENT '车辆ID',
    dealership_id INT COMMENT '车行ID',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    customer_wechat VARCHAR(100) COMMENT '客户微信',
    inquiry_type ENUM('view', 'consult', 'test_drive', 'negotiate') DEFAULT 'consult' COMMENT '咨询类型',
    inquiry_content TEXT COMMENT '咨询内容',
    status ENUM('pending', 'contacted', 'confirmed', 'cancelled') DEFAULT 'pending' COMMENT '状态',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (dealership_id) REFERENCES dealerships(id) ON DELETE SET NULL,
    INDEX idx_car_id (car_id),
    INDEX idx_dealership_id (dealership_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户咨询记录表';

-- 4. 创建带客记录表
CREATE TABLE IF NOT EXISTS customer_referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL COMMENT '车辆ID',
    from_dealership_id INT COMMENT '来源车行ID',
    to_dealership_id INT COMMENT '目标车行ID',
    customer_name VARCHAR(50) NOT NULL COMMENT '客户姓名',
    customer_phone VARCHAR(20) NOT NULL COMMENT '客户电话',
    referral_date DATE NOT NULL COMMENT '带客日期',
    sale_status ENUM('pending', 'sold', 'failed') DEFAULT 'pending' COMMENT '销售状态',
    sale_price DECIMAL(10, 2) COMMENT '成交价',
    commission_amount DECIMAL(10, 2) COMMENT '佣金金额',
    commission_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending' COMMENT '佣金状态',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (from_dealership_id) REFERENCES dealerships(id) ON DELETE SET NULL,
    FOREIGN KEY (to_dealership_id) REFERENCES dealerships(id) ON DELETE SET NULL,
    INDEX idx_car_id (car_id),
    INDEX idx_from_dealership (from_dealership_id),
    INDEX idx_to_dealership (to_dealership_id),
    INDEX idx_sale_status (sale_status),
    INDEX idx_commission_status (commission_status),
    INDEX idx_referral_date (referral_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='带客记录表';

-- 5. 插入主车行数据
INSERT IGNORE INTO dealerships (name, contact_person, contact_phone, contact_wechat, address, city, district, latitude, longitude, business_hours, description, commission_rate, is_main_dealer, status, rating)
VALUES
('诚信二手车', '张经理', '138-0000-0001', 'zhang_manager', '深圳市南山区科技园', '深圳市', '南山区', 22.5431, 114.0579, '09:00-21:00', '诚信经营，品质保证，专业二手车销售服务', 0.00, TRUE, 'active', 4.9);

-- 6. 插入合作车行数据
INSERT IGNORE INTO dealerships (name, contact_person, contact_phone, contact_wechat, address, city, district, latitude, longitude, business_hours, description, commission_rate, is_main_dealer, status, rating)
VALUES
('顺达车行', '王老板', '139-0000-0002', 'wangboss', '深圳市福田区华强北', '深圳市', '福田区', 22.5470, 114.0859, '08:30-20:30', '专业二手车销售，车型丰富', 3.00, FALSE, 'active', 4.7),
('金桥车行', '李总', '137-0000-0003', 'li_general', '深圳市宝安区西乡', '深圳市', '宝安区', 22.5470, 113.8839, '09:00-21:00', '高端二手车，品质第一', 2.50, FALSE, 'active', 4.8),
('安信二手车', '刘经理', '136-0000-0004', 'liu_manager', '深圳市龙岗区坂田', '深圳市', '龙岗区', 22.7106, 114.2528, '08:00-22:00', '实惠价格，优质服务', 2.00, FALSE, 'active', 4.6),
('车天下', '陈老板', '135-0000-0005', 'chenboss', '深圳市罗湖区东门', '深圳市', '罗湖区', 22.5431, 114.1310, '09:00-20:00', '量大价优，欢迎合作', 2.50, FALSE, 'active', 4.5);

-- 显示创建结果
SELECT '数据库升级完成！' AS status,
       (SELECT COUNT(*) FROM dealerships) AS dealership_count;
