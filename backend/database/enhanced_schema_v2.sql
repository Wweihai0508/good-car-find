-- 增强版数据库schema - 车行中介系统
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT=utf8mb4;
SET CHARACTER_SET_RESULTS=utf8mb4;

USE used_car_showroom;

-- 修改车辆表，添加中介相关字段
ALTER TABLE cars
ADD COLUMN source_type ENUM('self', 'other') DEFAULT 'self' COMMENT '来源类型：self-自营车，other-其他车行',
ADD COLUMN dealership_name VARCHAR(100) DEFAULT NULL COMMENT '车行名称（其他车行的车）',
ADD COLUMN dealership_address VARCHAR(255) DEFAULT NULL COMMENT '车行地址',
ADD COLUMN dealership_phone VARCHAR(20) DEFAULT NULL COMMENT '车行联系电话',
ADD COLUMN contact_person VARCHAR(50) DEFAULT NULL COMMENT '联系人',
ADD COLUMN distance_from_shop INT DEFAULT 0 COMMENT '距离本店距离（米）',
ADD COLUMN location_description TEXT DEFAULT NULL COMMENT '位置描述（如：XX路XX号，近地铁）',
ADD COLUMN location_notes TEXT DEFAULT NULL COMMENT '位置备注（如何前往等）',
ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '佣金比例（%）',
ADD INDEX idx_source_type (source_type),
ADD INDEX idx_dealership_name (dealership_name);

-- 修改车辆表，添加更多筛选字段
ALTER TABLE cars
ADD COLUMN price_range_category VARCHAR(20) DEFAULT NULL COMMENT '价格区间分类（10万以下/10-20万/20-30万/30万以上）',
ADD COLUMN vehicle_category VARCHAR(20) DEFAULT NULL COMMENT '车型分类（轿车/SUV/MPV/跑车/皮卡）',
ADD INDEX idx_price_range (price_range_category),
ADD INDEX idx_vehicle_category (vehicle_category);

-- 浏览记录表（用于智能推荐）
CREATE TABLE IF NOT EXISTS customer_browsing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_phone VARCHAR(20) COMMENT '客户电话',
    car_id INT NOT NULL COMMENT '浏览的车辆ID',
    view_duration INT DEFAULT 0 COMMENT '浏览时长（秒）',
    filter_brands VARCHAR(255) COMMENT '客户筛选过的品牌',
    filter_price_min DECIMAL(10,2) COMMENT '价格筛选最小值',
    filter_price_max DECIMAL(10,2) COMMENT '价格筛选最大值',
    filter_years VARCHAR(100) COMMENT '年份筛选',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_phone (customer_phone),
    INDEX idx_car_id (car_id),
    INDEX idx_created (created_at),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户浏览记录表';

-- 客户需求记录表（用于精准推荐）
CREATE TABLE IF NOT EXISTS customer_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_phone VARCHAR(20) NOT NULL COMMENT '客户电话',
    customer_name VARCHAR(50) COMMENT '客户姓名',
    brand_preference VARCHAR(255) COMMENT '品牌偏好（多个用逗号分隔）',
    price_min DECIMAL(10,2) COMMENT '最低价格',
    price_max DECIMAL(10,2) COMMENT '最高价格',
    year_min INT COMMENT '最早年份',
    year_max INT COMMENT '最晚年份',
    vehicle_type VARCHAR(50) COMMENT '车型偏好（轿车/SUV/MPV等）',
    fuel_type VARCHAR(50) COMMENT '燃油类型偏好',
    transmission VARCHAR(50) COMMENT '变速箱偏好',
    mileage_max DECIMAL(5,1) COMMENT '最大里程',
    color_preference VARCHAR(100) COMMENT '颜色偏好',
    notes TEXT COMMENT '其他需求备注',
    status ENUM('active', 'matched', 'closed') DEFAULT 'active' COMMENT '状态：active-活跃，matched-已匹配，closed-已关闭',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_phone (customer_phone),
    INDEX idx_status (status),
    INDEX idx_price_range (price_min, price_max)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户需求记录表';

-- 快速录入临时表（手机端快速录入使用）
CREATE TABLE IF NOT EXISTS quick_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT COMMENT '关联的车辆ID（创建成功后填入）',
    dealership_name VARCHAR(100) NOT NULL COMMENT '车行名称',
    brand VARCHAR(50) NOT NULL COMMENT '品牌',
    model VARCHAR(100) NOT NULL COMMENT '型号',
    year VARCHAR(4) NOT NULL COMMENT '年份',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    mileage DECIMAL(5,1) COMMENT '里程',
    phone_number VARCHAR(20) NOT NULL COMMENT '联系电话',
    contact_person VARCHAR(50) COMMENT '联系人',
    address VARCHAR(255) COMMENT '地址',
    image_urls TEXT COMMENT '图片URL（多个用逗号分隔）',
    notes TEXT COMMENT '备注',
    entry_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT '录入状态：pending-待处理，completed-已完成，failed-失败',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (entry_status),
    INDEX idx_dealership (dealership_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='快速录入临时表';

-- 更新车辆表的触发器 - 自动计算价格区间
DELIMITER //
CREATE TRIGGER update_price_range_category
BEFORE INSERT ON cars
FOR EACH ROW
BEGIN
    SET NEW.price_range_category = CASE
        WHEN NEW.price < 100000 THEN '10万以下'
        WHEN NEW.price < 200000 THEN '10-20万'
        WHEN NEW.price < 300000 THEN '20-30万'
        ELSE '30万以上'
    END;
END//

CREATE TRIGGER update_price_range_category_on_update
BEFORE UPDATE ON cars
FOR EACH ROW
BEGIN
    SET NEW.price_range_category = CASE
        WHEN NEW.price < 100000 THEN '10万以下'
        WHEN NEW.price < 200000 THEN '10-20万'
        WHEN NEW.price < 300000 THEN '20-30万'
        ELSE '30万以上'
    END;
END//
DELIMITER ;

-- 插入示例其他车行的车辆数据
UPDATE cars SET
    source_type = 'other',
    dealership_name = '诚信车行',
    dealership_address = '海淀区中关村大街1号',
    dealership_phone = '13900139001',
    contact_person = '李总',
    distance_from_shop = 5200,
    location_description = '中关村海龙大厦旁边，近地铁10号线',
    commission_rate = 3.00
WHERE id IN (2, 5);

UPDATE cars SET
    source_type = 'other',
    dealership_name = '顺达汽贸',
    dealership_address = '丰台区南三环西路123号',
    dealership_phone = '13700137001',
    contact_person = '王经理',
    distance_from_shop = 3800,
    location_description = '南三环草桥地铁站北出口步行500米',
    commission_rate = 2.50
WHERE id IN (4, 8);

UPDATE cars SET
    source_type = 'other',
    dealership_name = '豪车汇',
    dealership_address = '东城区王府井大街88号',
    dealership_phone = '13600136001',
    contact_person = '陈总',
    distance_from_shop = 6500,
    location_description = '王府井步行街东口，近地铁1号线',
    commission_rate = 4.00
WHERE id IN (3, 9, 10);

-- 更新所有车辆的价格区间
UPDATE cars SET
    price_range_category = CASE
        WHEN price < 100000 THEN '10万以下'
        WHEN price < 200000 THEN '10-20万'
        WHEN price < 300000 THEN '20-30万'
        ELSE '30万以上'
    END;

-- 添加车型分类
UPDATE cars SET vehicle_category = '轿车' WHERE id IN (1,2,3,4,5,6,7,8);
UPDATE cars SET vehicle_category = 'SUV' WHERE id IN (9,10);
