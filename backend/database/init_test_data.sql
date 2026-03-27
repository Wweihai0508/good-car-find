-- 初始化测试数据和图片
SET NAMES utf8mb4;
USE railway;

-- 清理现有数据（可选，如果想要保留现有数据，注释掉下面的DELETE语句）
-- DELETE FROM car_images WHERE car_id > 3;
-- DELETE FROM cars WHERE id > 3;

-- 添加本店车辆（带图片）
INSERT INTO cars (brand, model, year, mileage, fuel_type, transmission, displacement, color, price, acquisition_price, original_price, description, car_condition, maintenance_record, status, source_type) VALUES
('奔驰', 'C级', '2020', '5.2', '汽油', '自动', 1.5, '#FF0000', 32.50, 28.00, 42.50, '奔驰C级 2020款 C 260 L 运动版', '车况良好，无事故，定期保养', '4S店定期保养，更换机油机滤、空气滤芯等', 'available', 'self'),
('宝马', '3系', '2019', '7.8', '汽油', '自动', 2.0, '#000000', 28.80, 25.00, 38.90, '宝马3系 2019款 325Li M运动套装', '车况精品，个人一手车，全程4S店保养', '全程4S店记录，车况优秀', 'available', 'self'),
('奥迪', 'A4L', '2021', '3.1', '汽油', '自动', 2.0, '#FFFFFF', 27.90, 24.00, 35.80, '奥迪A4L 2021款 40 TFSI 时尚动感型', '准新车，车况极佳，无任何事故', '几乎全新，仅日常代步使用', 'available', 'self'),
('大众', '迈腾', '2020', '6.5', '汽油', '自动', 1.8, '#808080', 17.50, 14.50, 23.90, '大众迈腾 2020款 330TSI DSG 领先型', '车况良好，家用车，保养到位', '定期保养，车况稳定', 'available', 'self'),
('丰田', '凯美瑞', '2021', '2.8', '混合动力', '自动', 2.5, '#000000', 20.80, 18.00, 25.98, '丰田凯美瑞 2021款 2.5S 锋尚版', '混合动力，省油环保，车况优秀', '混合动力车型，油耗低，动力强', 'available', 'self'),
('本田', '雅阁', '2020', '4.2', '汽油', '自动', 1.5, '#333333', 19.20, 16.50, 22.98, '本田雅阁 2020款 260TURBO 豪华动力版', '车况良好，动力充沛', '1.5T涡轮增压，动力强劲', 'available', 'self'),
('日产', '天籁', '2019', '8.3', '汽油', '自动', 2.0, '#0000FF', 14.80, 12.50, 21.58, '日产天籁 2019款 2.0T XL Upper 智享版', '车况良好，大沙发舒适', '大空间，舒适性极佳', 'available', 'self'),
('别克', '君越', '2020', '3.5', '汽油', '自动', 1.5, '#FFA500', 16.80, 14.50, 22.98, '别克君越 2020款 652T 豪华型', '大空间，配置高，性价比高', '配置丰富，空间宽敞', 'available', 'self'),
('雪佛兰', '迈锐宝XL', '2021', '1.9', '汽油', '自动', 1.5, '#008000', 14.20, 12.00, 19.49, '雪佛兰迈锐宝XL 2021款 535T 自动锐动版', '准新车，配置高，价格优', '几乎全新，性价比超高', 'available', 'self'),
('福特', '蒙迪欧', '2020', '5.8', '汽油', '自动', 1.5, '#FF6B6B', 13.50, 11.50, 19.28, '福特蒙迪欧 2020款 EcoBoost 180 时尚型', '车况良好，动力充足', '1.5T涡轮增压，动力强劲', 'available', 'self');

-- 添加周边车行车辆
INSERT INTO cars (brand, model, year, mileage, fuel_type, transmission, displacement, color, price, description, car_condition, status, source_type, dealership_name, dealership_address, dealership_phone, contact_person, distance_from_shop, commission_rate) VALUES
('保时捷', 'Macan', '2020', '3.5', '汽油', '自动', 2.0, '#FFD700', 58.00, '保时捷Macan 2020款 2.0T', '车况极品，全程4S店保养', 'available', 'other', '豪车汇', '东城区王府井大街88号', '13600136001', '陈总', 6500, 4.00),
('雷克萨斯', 'ES', '2021', '2.0', '混合动力', '自动', 2.5, '#FFFFFF', 38.00, '雷克萨斯ES 2021款 300h', '准新车，车况优秀', 'available', 'other', '诚信车行', '海淀区中关村大街1号', '13900139001', '李总', 5200, 3.50),
('路虎', '极光', '2019', '6.2', '汽油', '自动', 2.0, '#4B0082', 35.80, '路虎极光 2019款 2.0T', '车况良好，越野性能强', 'available', 'other', '顺达汽贸', '丰台区南三环西路123号', '13700137001', '王经理', 3800, 2.50),
('沃尔沃', 'XC60', '2020', '4.8', '汽油', '自动', 2.0, '#808000', 32.00, '沃尔沃XC60 2020款 T4', '安全配置高，车况优秀', 'available', 'other', '豪车汇', '东城区王府井大街88号', '13600136001', '陈总', 6500, 4.00),
('凯迪拉克', 'XT5', '2021', '3.2', '汽油', '自动', 2.0, '#1E90FF', 29.80, '凯迪拉克XT5 2021款 2.0T', '美式豪华，配置丰富', 'available', 'other', '诚信车行', '海淀区中关村大街1号', '13900139001', '李总', 5200, 3.50);

-- 为新添加的车辆添加图片
INSERT INTO car_images (car_id, url, sort_order) VALUES
-- 奔驰C级
(4, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Mercedes Benz C Class 2020 luxury sedan&size=800x600', 1),
(4, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Mercedes Benz C Class 2020 interior&size=800x600', 2),
-- 宝马3系
(5, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=BMW 3 Series 2019 sports sedan&size=800x600', 1),
(5, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=BMW 3 Series 2019 interior&size=800x600', 2),
-- 奥迪A4L
(6, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Audi A4L 2021 sedan&size=800x600', 1),
(6, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Audi A4L 2021 interior&size=800x600', 2),
-- 大众迈腾
(7, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Volkswagen Passat 2020 sedan&size=800x600', 1),
(7, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Volkswagen Passat 2020 interior&size=800x600', 2),
-- 丰田凯美瑞
(8, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Toyota Camry 2021 hybrid sedan&size=800x600', 1),
(8, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Toyota Camry 2021 interior&size=800x600', 2),
-- 本田雅阁
(9, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Honda Accord 2020 sedan&size=800x600', 1),
(9, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Honda Accord 2020 interior&size=800x600', 2),
-- 日产天籁
(10, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Nissan Altima 2019 comfortable sedan&size=800x600', 1),
(10, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Nissan Altima 2019 interior&size=800x600', 2),
-- 别克君越
(11, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Buick LaCrosse 2020 sedan&size=800x600', 1),
(11, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Buick LaCrosse 2020 interior&size=800x600', 2),
-- 雪佛兰迈锐宝XL
(12, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Chevrolet Malibu XL 2021 sedan&size=800x600', 1),
(12, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Chevrolet Malibu XL 2021 interior&size=800x600', 2),
-- 福特蒙迪欧
(13, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Ford Mondeo 2020 sedan&size=800x600', 1),
(13, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Ford Mondeo 2020 interior&size=800x600', 2),
-- 保时捷Macan
(14, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Porsche Macan 2020 luxury SUV&size=800x600', 1),
(14, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Porsche Macan 2020 interior&size=800x600', 2),
-- 雷克萨斯ES
(15, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Lexus ES 2021 hybrid sedan&size=800x600', 1),
(15, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Lexus ES 2021 interior&size=800x600', 2),
-- 路虎极光
(16, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Land Rover Evoque 2019 SUV&size=800x600', 1),
(16, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Land Rover Evoque 2019 interior&size=800x600', 2),
-- 沃尔沃XC60
(17, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Volvo XC60 2020 SUV&size=800x600', 1),
(17, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Volvo XC60 2020 interior&size=800x600', 2),
-- 凯迪拉克XT5
(18, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Cadillac XT5 2021 SUV&size=800x600', 1),
(18, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Cadillac XT5 2021 interior&size=800x600', 2);

-- 添加推荐车辆
INSERT IGNORE INTO recommendations (car_id) VALUES (4), (5), (6), (8), (14), (15);

-- 更新热门车辆浏览次数
UPDATE popular_cars SET views = 150 WHERE car_id = 4;
UPDATE popular_cars SET views = 120 WHERE car_id = 5;
UPDATE popular_cars SET views = 100 WHERE car_id = 6;

-- 更新车辆价格分类
UPDATE cars SET
    price_range_category = CASE
        WHEN price < 10 THEN '10万以下'
        WHEN price < 20 THEN '10-20万'
        WHEN price < 30 THEN '20-30万'
        ELSE '30万以上'
    END
WHERE price_range_category IS NULL;

-- 更新车型分类
UPDATE cars SET vehicle_category = '轿车' WHERE vehicle_category IS NULL AND brand IN ('奔驰', '宝马', '奥迪', '大众', '丰田', '本田', '日产', '别克', '雪佛兰', '福特', '雷克萨斯', '凯迪拉克', '沃尔沃');
UPDATE cars SET vehicle_category = 'SUV' WHERE vehicle_category IS NULL AND brand IN ('保时捷', '路虎');

-- 显示统计信息
SELECT '初始化完成！' as message;
SELECT COUNT(*) as total_cars FROM cars;
SELECT COUNT(*) as cars_with_images FROM car_images;
SELECT COUNT(*) as recommended_cars FROM recommendations;
SELECT COUNT(*) as popular_cars FROM popular_cars;
