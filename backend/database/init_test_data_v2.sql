-- 初始化测试数据和图片（基于实际表结构）
SET NAMES utf8mb4;
USE railway;

-- 添加本店车辆（带图片）
INSERT INTO cars (brand, model, year, mileage, fuel_type, transmission, engine, color, price, description, status) VALUES
('奔驰', 'C级', 2020, 52000, '汽油', '自动', '1.5T', '红色', 32.50, '奔驰C级 2020款 C 260 L 运动版，车况良好，无事故，定期保养', 'available'),
('宝马', '3系', 2019, 78000, '汽油', '自动', '2.0T', '黑色', 28.80, '宝马3系 2019款 325Li M运动套装，车况精品，个人一手车，全程4S店保养', 'available'),
('奥迪', 'A4L', 2021, 31000, '汽油', '自动', '2.0T', '白色', 27.90, '奥迪A4L 2021款 40 TFSI 时尚动感型，准新车，车况极佳，无任何事故', 'available'),
('大众', '迈腾', 2020, 65000, '汽油', '自动', '1.8T', '银色', 17.50, '大众迈腾 2020款 330TSI DSG 领先型，车况良好，家用车，保养到位', 'available'),
('丰田', '凯美瑞', 2021, 28000, '混合动力', '自动', '2.5', '黑色', 20.80, '丰田凯美瑞 2021款 2.5S 锋尚版，混合动力，省油环保，车况优秀', 'available'),
('本田', '雅阁', 2020, 42000, '汽油', '自动', '1.5T', '深灰色', 19.20, '本田雅阁 2020款 260TURBO 豪华动力版，车况良好，动力充沛', 'available'),
('日产', '天籁', 2019, 83000, '汽油', '自动', '2.0T', '蓝色', 14.80, '日产天籁 2019款 2.0T XL Upper 智享版，车况良好，大沙发舒适', 'available'),
('别克', '君越', 2020, 35000, '汽油', '自动', '1.5T', '橙色', 16.80, '别克君越 2020款 652T 豪华型，大空间，配置高，性价比高', 'available'),
('雪佛兰', '迈锐宝XL', 2021, 19000, '汽油', '自动', '1.5T', '绿色', 14.20, '雪佛兰迈锐宝XL 2021款 535T 自动锐动版，准新车，配置高，价格优', 'available'),
('福特', '蒙迪欧', 2020, 58000, '汽油', '自动', '1.5T', '粉红色', 13.50, '福特蒙迪欧 2020款 EcoBoost 180 时尚型，车况良好，动力充足', 'available');

-- 获取新插入的车辆ID范围
SET @new_car_start = (SELECT id FROM cars ORDER BY id DESC LIMIT 1 OFFSET 9);
SET @new_car_end = (SELECT id FROM cars ORDER BY id DESC LIMIT 1);

-- 为新添加的车辆添加图片
INSERT INTO car_images (car_id, url, sort_order) VALUES
-- 奔驰C级
(@new_car_start + 0, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Mercedes Benz C Class 2020 luxury sedan white exterior&size=800x600', 1),
(@new_car_start + 0, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Mercedes Benz C Class 2020 interior leather seats&size=800x600', 2),
-- 宝马3系
(@new_car_start + 1, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=BMW 3 Series 2019 sports sedan black exterior&size=800x600', 1),
(@new_car_start + 1, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=BMW 3 Series 2019 interior dashboard&size=800x600', 2),
-- 奥迪A4L
(@new_car_start + 2, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Audi A4L 2021 sedan white exterior&size=800x600', 1),
(@new_car_start + 2, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Audi A4L 2021 interior premium&size=800x600', 2),
-- 大众迈腾
(@new_car_start + 3, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Volkswagen Passat 2020 sedan silver exterior&size=800x600', 1),
(@new_car_start + 3, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Volkswagen Passat 2020 interior comfortable&size=800x600', 2),
-- 丰田凯美瑞
(@new_car_start + 4, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Toyota Camry 2021 hybrid sedan black exterior&size=800x600', 1),
(@new_car_start + 4, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Toyota Camry 2021 interior modern&size=800x600', 2),
-- 本田雅阁
(@new_car_start + 5, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Honda Accord 2020 sedan gray exterior&size=800x600', 1),
(@new_car_start + 5, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Honda Accord 2020 interior sport&size=800x600', 2),
-- 日产天籁
(@new_car_start + 6, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Nissan Altima 2019 comfortable sedan blue exterior&size=800x600', 1),
(@new_car_start + 6, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Nissan Altima 2019 interior comfortable&size=800x600', 2),
-- 别克君越
(@new_car_start + 7, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Buick LaCrosse 2020 sedan orange exterior&size=800x600', 1),
(@new_car_start + 7, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Buick LaCrosse 2020 interior luxury&size=800x600', 2),
-- 雪佛兰迈锐宝XL
(@new_car_start + 8, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Chevrolet Malibu XL 2021 sedan green exterior&size=800x600', 1),
(@new_car_start + 8, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Chevrolet Malibu XL 2021 interior modern&size=800x600', 2),
-- 福特蒙迪欧
(@new_car_start + 9, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Ford Mondeo 2020 sedan pink exterior&size=800x600', 1),
(@new_car_start + 9, 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Ford Mondeo 2020 interior modern&size=800x600', 2);

-- 添加推荐车辆
INSERT IGNORE INTO recommendations (car_id) VALUES
(@new_car_start + 0),
(@new_car_start + 1),
(@new_car_start + 2),
(@new_car_start + 4);

-- 更新热门车辆浏览次数
UPDATE popular_cars SET views = 150 WHERE car_id = @new_car_start + 0;
UPDATE popular_cars SET views = 120 WHERE car_id = @new_car_start + 1;
UPDATE popular_cars SET views = 100 WHERE car_id = @new_car_start + 2;

-- 显示统计信息
SELECT '初始化完成！' as message;
SELECT COUNT(*) as total_cars FROM cars WHERE id >= @new_car_start;
SELECT COUNT(*) as cars_with_images FROM car_images WHERE car_id >= @new_car_start;
SELECT COUNT(*) as recommended_cars FROM recommendations WHERE car_id >= @new_car_start;
SELECT brand, model, year, price FROM cars WHERE id >= @new_car_start ORDER BY price DESC;
