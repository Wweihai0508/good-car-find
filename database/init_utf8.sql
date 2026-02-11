SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT=utf8mb4;
SET CHARACTER_SET_RESULTS=utf8mb4;

CREATE DATABASE IF NOT EXISTS used_car_showroom 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE used_car_showroom;

CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year VARCHAR(4) NOT NULL,
    mileage DECIMAL(5,1) DEFAULT 0.0,
    fuel_type VARCHAR(20) DEFAULT '汽油',
    transmission VARCHAR(20) DEFAULT '自动',
    displacement DECIMAL(3,1) DEFAULT 0.0,
    color VARCHAR(20) DEFAULT '#000000',
    price DECIMAL(10,2) NOT NULL,
    acquisition_price DECIMAL(10,2) DEFAULT 0.0,
    original_price DECIMAL(10,2) DEFAULT 0.0,
    description TEXT,
    car_condition TEXT,
    maintenance_record TEXT,
    status VARCHAR(20) DEFAULT 'available',
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand (brand),
    INDEX idx_year (year),
    INDEX idx_price (price),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS car_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    INDEX idx_car_id (car_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    UNIQUE KEY unique_car (car_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    UNIQUE KEY unique_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    customer_id INT,
    sale_price DECIMAL(10,2) NOT NULL,
    sale_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_car_id (car_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_sale_date (sale_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    name VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO users (username, password, role, name) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '管理员');

INSERT IGNORE INTO cars (brand, model, year, mileage, fuel_type, transmission, displacement, color, price, acquisition_price, original_price, description, car_condition, maintenance_record, status, views) VALUES
('奔驰', 'C级', '2020', 5.2, '汽油', '自动', 1.5, '#FF0000', 32.50, 28.00, 42.50, '奔驰C级 2020款 C 260 L 运动版', '车况良好，无事故，定期保养', '4S店定期保养，更换机油机滤、空气滤芯等', 'available', 156),
('宝马', '3系', '2019', 7.8, '汽油', '自动', 2.0, '#000000', 28.80, 25.00, 38.90, '宝马3系 2019款 325Li M运动套装', '车况精品，个人一手车，全程4S店保养', '全程4S店记录，车况优秀', 'available', 234),
('奥迪', 'A4L', '2021', 3.1, '汽油', '自动', 2.0, '#FFFFFF', 27.90, 24.00, 35.80, '奥迪A4L 2021款 40 TFSI 时尚动感型', '准新车，车况极佳，无任何事故', '几乎全新，仅日常代步使用', 'available', 189),
('大众', '迈腾', '2020', 6.5, '汽油', '自动', 1.8, '#808080', 17.50, 14.50, 23.90, '大众迈腾 2020款 330TSI DSG 领先型', '车况良好，家用车，保养到位', '定期保养，车况稳定', 'available', 145),
('丰田', '凯美瑞', '2021', 2.8, '混合动力', '自动', 2.5, '#000000', 20.80, 18.00, 25.98, '丰田凯美瑞 2021款 2.5S 锋尚版', '混合动力，省油环保，车况优秀', '混合动力车型，油耗低，动力强', 'available', 167),
('本田', '雅阁', '2020', 4.2, '汽油', '自动', 1.5, '#333333', 19.20, 16.50, 22.98, '本田雅阁 2020款 260TURBO 豪华动力版', '车况良好，动力充沛', '1.5T涡轮增压，动力强劲', 'available', 134),
('日产', '天籁', '2019', 8.3, '汽油', '自动', 2.0, '#0000FF', 14.80, 12.50, 21.58, '日产天籁 2019款 2.0T XL Upper 智享版', '车况良好，大沙发舒适', '大空间，舒适性极佳', 'available', 123),
('别克', '君越', '2020', 3.5, '汽油', '自动', 1.5, '#FFA500', 16.80, 14.50, 22.98, '别克君越 2020款 652T 豪华型', '大空间，配置高，性价比高', '配置丰富，空间宽敞', 'available', 98),
('雪佛兰', '迈锐宝XL', '2021', 1.9, '汽油', '自动', 1.5, '#008000', 14.20, 12.00, 19.49, '雪佛兰迈锐宝XL 2021款 535T 自动锐动版', '准新车，配置高，价格优', '几乎全新，性价比超高', 'available', 112),
('福特', '蒙迪欧', '2020', 5.8, '汽油', '自动', 1.5, '#FF6B6B', 13.50, 11.50, 19.28, '福特蒙迪欧 2020款 EcoBoost 180 时尚型', '车况良好，动力充足', '1.5T涡轮增压，动力强劲', 'available', 87);

INSERT IGNORE INTO car_images (car_id, url, sort_order) VALUES
(1, '/uploads/optimized-car-1696872345-123456.jpg', 1),
(1, '/uploads/optimized-car-1696872346-654321.jpg', 2),
(2, '/uploads/optimized-car-1696872347-112233.jpg', 1),
(2, '/uploads/optimized-car-1696872348-332211.jpg', 2),
(3, '/uploads/optimized-car-1696872349-445566.jpg', 1),
(3, '/uploads/optimized-car-1696872350-665544.jpg', 2),
(4, '/uploads/optimized-car-1696872351-778899.jpg', 1),
(4, '/uploads/optimized-car-1696872352-998877.jpg', 2),
(5, '/uploads/optimized-car-1696872353-123789.jpg', 1),
(5, '/uploads/optimized-car-1696872354-987321.jpg', 2),
(6, '/uploads/optimized-car-1696872355-456123.jpg', 1),
(6, '/uploads/optimized-car-1696872356-321654.jpg', 2),
(7, '/uploads/optimized-car-1696872357-789456.jpg', 1),
(7, '/uploads/optimized-car-1696872358-654987.jpg', 2),
(8, '/uploads/optimized-car-1696872359-111222.jpg', 1),
(8, '/uploads/optimized-car-1696872360-222111.jpg', 2),
(9, '/uploads/optimized-car-1696872361-333444.jpg', 1),
(9, '/uploads/optimized-car-1696872362-444333.jpg', 2),
(10, '/uploads/optimized-car-1696872363-555666.jpg', 1),
(10, '/uploads/optimized-car-1696872364-666555.jpg', 2);

INSERT IGNORE INTO recommendations (car_id) VALUES
(1), (2), (3), (5);
