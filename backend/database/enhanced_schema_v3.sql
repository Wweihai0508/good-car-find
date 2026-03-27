-- 车行共享展示系统增强数据库架构 v3
-- 支持：多车行、位置信息、联系方式、智能推荐

-- 强制设置客户端字符集
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT=utf8mb4;
SET CHARACTER_SET_RESULTS=utf8mb4;

-- 使用数据库
USE used_car_showroom;

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
    INDEX idx_status (status),
    INDEX idx_is_main (is_main_dealer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车行信息表';

-- 2. 修改车辆表，增加车行关联和位置信息
ALTER TABLE cars ADD COLUMN dealership_id INT NULL COMMENT '车行ID' AFTER status;
ALTER TABLE cars ADD COLUMN location_address VARCHAR(255) COMMENT '车辆位置' AFTER car_condition;
ALTER TABLE cars ADD COLUMN contact_person VARCHAR(50) COMMENT '联系人' AFTER location_address;
ALTER TABLE cars ADD COLUMN contact_phone VARCHAR(20) COMMENT '联系电话' AFTER contact_person;
ALTER TABLE cars ADD COLUMN contact_wechat VARCHAR(100) COMMENT '微信' AFTER contact_phone;
ALTER TABLE cars ADD COLUMN latitude DECIMAL(10, 6) COMMENT '纬度' AFTER contact_wechat;
ALTER TABLE cars ADD COLUMN longitude DECIMAL(10, 6) COMMENT '经度' AFTER latitude;
ALTER TABLE cars ADD COLUMN distance_km DECIMAL(8, 2) COMMENT '距离(km)' AFTER longitude;
ALTER TABLE cars ADD COLUMN is_available BOOLEAN DEFAULT TRUE COMMENT '是否可看车' AFTER distance_km;
ALTER TABLE cars ADD COLUMN car_source ENUM('own', 'partner', 'consignment') DEFAULT 'own' COMMENT '车辆来源:own-本车行,partner-合作车行,consignment-寄售';

-- 添加外键关联
ALTER TABLE cars ADD FOREIGN KEY (dealership_id) REFERENCES dealerships(id) ON DELETE SET NULL;

-- 添加索引
ALTER TABLE cars ADD INDEX idx_dealership (dealership_id);
ALTER TABLE cars ADD INDEX idx_location (latitude, longitude);
ALTER TABLE cars ADD INDEX idx_source (car_source);
ALTER TABLE cars ADD INDEX idx_available (is_available);

-- 3. 创建车辆浏览记录表（用于推荐算法）
CREATE TABLE IF NOT EXISTS car_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL COMMENT '车辆ID',
    user_id INT COMMENT '用户ID(匿名用户为NULL)',
    user_session VARCHAR(100) COMMENT '用户会话ID',
    view_duration INT DEFAULT 0 COMMENT '浏览时长(秒)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    INDEX idx_car_id (car_id),
    INDEX idx_user_session (user_session),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆浏览记录表';

-- 4. 创建车辆收藏表
CREATE TABLE IF NOT EXISTS car_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL COMMENT '车辆ID',
    user_id INT COMMENT '用户ID',
    user_session VARCHAR(100) COMMENT '用户会话ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    UNIQUE KEY unique_fav (user_id, car_id),
    INDEX idx_car_id (car_id),
    INDEX idx_user_session (user_session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆收藏表';

-- 5. 创建客户咨询记录表
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

-- 6. 创建带客记录表（佣金管理）
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

-- 7. 创建车辆标签表（用于筛选和推荐）
CREATE TABLE IF NOT EXISTS car_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(30) NOT NULL COMMENT '标签名称',
    tag_type ENUM('brand', 'price_range', 'feature', 'condition', 'other') DEFAULT 'other' COMMENT '标签类型',
    tag_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag_type (tag_type),
    INDEX idx_tag_order (tag_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆标签表';

-- 8. 创建车辆标签关联表
CREATE TABLE IF NOT EXISTS car_tag_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL COMMENT '车辆ID',
    tag_id INT NOT NULL COMMENT '标签ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES car_tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag (car_id, tag_id),
    INDEX idx_car_id (car_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆标签关联表';

-- 9. 创建智能推荐缓存表（提升性能）
CREATE TABLE IF NOT EXISTS recommendation_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_session VARCHAR(100) COMMENT '用户会话ID',
    user_preferences JSON COMMENT '用户偏好',
    recommended_car_ids JSON COMMENT '推荐的车辆ID列表',
    score DECIMAL(5, 2) COMMENT '推荐得分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP COMMENT '过期时间',
    INDEX idx_user_session (user_session),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='智能推荐缓存表';

-- 10. 创建车辆对比表
CREATE TABLE IF NOT EXISTS car_comparisons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_session VARCHAR(100) COMMENT '用户会话ID',
    car_ids JSON NOT NULL COMMENT '对比的车辆ID列表',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_session (user_session),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆对比表';

-- 插入主车行数据（你的车行）
INSERT INTO dealerships (name, contact_person, contact_phone, contact_wechat, address, city, district, latitude, longitude, business_hours, description, commission_rate, is_main_dealer, status, rating)
VALUES
('诚信二手车', '张经理', '138-0000-0001', 'zhang_manager', '某某市某某区某某街123号', '深圳市', '南山区', 22.5431, 114.0579, '09:00-21:00', '诚信经营，品质保证，专业二手车销售服务', 0.00, TRUE, 'active', 4.9);

-- 插入合作车行数据
INSERT INTO dealerships (name, contact_person, contact_phone, contact_wechat, address, city, district, latitude, longitude, business_hours, description, commission_rate, is_main_dealer, status, rating)
VALUES
('顺达车行', '王老板', '139-0000-0002', 'wangboss', '某某市某某区某某路456号', '深圳市', '福田区', 22.5470, 114.0859, '08:30-20:30', '专业二手车销售，车型丰富', 3.00, FALSE, 'active', 4.7),
('金桥车行', '李总', '137-0000-0003', 'li_general', '某某市某某区某某大道789号', '深圳市', '宝安区', 22.5470, 113.8839, '09:00-21:00', '高端二手车，品质第一', 2.50, FALSE, 'active', 4.8),
('安信二手车', '刘经理', '136-0000-0004', 'liu_manager', '某某市某某区某某路101号', '深圳市', '龙岗区', 22.7106, 114.2528, '08:00-22:00', '实惠价格，优质服务', 2.00, FALSE, 'active', 4.6),
('车天下', '陈老板', '135-0000-0005', 'chenboss', '某某市某某区某某路202号', '深圳市', '罗湖区', 22.5431, 114.1310, '09:00-20:00', '量大价优，欢迎合作', 2.50, FALSE, 'active', 4.5);

-- 插入常用标签
INSERT INTO car_tags (tag_name, tag_type, tag_order)
VALUES
-- 品牌标签
('奔驰', 'brand', 1),
('宝马', 'brand', 2),
('奥迪', 'brand', 3),
('大众', 'brand', 4),
('丰田', 'brand', 5),
('本田', 'brand', 6),
-- 价格区间标签
('10万以下', 'price_range', 1),
('10-15万', 'price_range', 2),
('15-20万', 'price_range', 3),
('20-30万', 'price_range', 4),
('30万以上', 'price_range', 5),
-- 特性标签
('省油', 'feature', 1),
('空间大', 'feature', 2),
('动力强', 'feature', 3),
('外观时尚', 'feature', 4),
('配置高', 'feature', 5),
-- 车况标签
('准新车', 'condition', 1),
('精品车', 'condition', 2),
('一手车', 'condition', 3),
('全程4S保养', 'condition', 4),
('无事故', 'condition', 5);

-- 显示创建结果
SELECT '数据库升级完成！' AS status,
       COUNT(*) AS dealership_count
FROM dealerships;
