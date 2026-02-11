const { pool } = require('../config/database');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class CarController {
  static async getCars(req, res) {
    try {
      const { 
        page = 1, 
        pageSize = 12, 
        search, 
        brand, 
        year, 
        minPrice, 
        maxPrice, 
        status,
        sort = 'created_at',
        order = 'desc'
      } = req.query;

      // ========== 核心修复1：严格校验分页参数，确保是有效整数 ==========
      // 强制转换为整数，设置默认值，避免NaN/undefined
      const validPage = Number.isInteger(parseInt(page)) && parseInt(page) >= 1 ? parseInt(page) : 1;
      const validPageSize = Number.isInteger(parseInt(pageSize)) && parseInt(pageSize) >= 1 && parseInt(pageSize) <= 100 ? parseInt(pageSize) : 12;
      const offset = (validPage - 1) * validPageSize;
      const validOffset = Math.max(0, parseInt(offset)); // 确保offset非负

      const params = [];
      let whereClause = '';
      const conditions = [];

      // ========== 核心修复2：给所有参数添加类型校验 ==========
      if (search) {
        conditions.push('(c.brand LIKE ? OR c.model LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      if (brand) {
        conditions.push('c.brand = ?');
        params.push(brand);
      }

      if (year) {
        conditions.push('c.year = ?');
        params.push(parseInt(year)); // 确保year是整数
      }

      if (minPrice !== undefined && minPrice !== '') {
        conditions.push('c.price >= ?');
        params.push(parseFloat(minPrice)); // 价格转浮点数
      }

      if (maxPrice !== undefined && maxPrice !== '') {
        conditions.push('c.price <= ?');
        params.push(parseFloat(maxPrice)); // 价格转浮点数
      }

      if (status) {
        conditions.push('c.status = ?');
        params.push(status);
      }
 
      whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

      // ========== 核心修复3：校验排序字段，防止SQL注入 ==========
      const validSort = ['created_at', 'views', 'price', 'year'].includes(sort) ? sort : 'created_at';
      const validOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toLowerCase() : 'desc';
      const orderClause = `ORDER BY ${validSort} ${validOrder}`;

      // ========== 核心修复4：确保参数数组是纯数字/字符串，长度匹配 ==========
      const queryParams = [...params, validPageSize, validOffset];
      console.log('执行SQL的参数：', queryParams); // 调试用，可删除


      const [rows] = await pool.query(
        `SELECT c.*, 
                (SELECT GROUP_CONCAT(url SEPARATOR ',') FROM car_images WHERE car_id = c.id) AS images,
                COALESCE(r.id IS NOT NULL, false) AS is_recommended,
                COALESCE(p.id IS NOT NULL, false) AS is_popular
         FROM cars c
         LEFT JOIN recommendations r ON c.id = r.car_id
         LEFT JOIN popular_cars p ON c.id = p.car_id
         ${whereClause}
         GROUP BY c.id
         ${orderClause}
         LIMIT ? OFFSET ?`,
        queryParams // 使用校验后的参数数组
      );

      // 修复count查询的参数传递
      const [countResult] = await pool.query(
        `SELECT COUNT(DISTINCT c.id) AS total FROM cars c LEFT JOIN recommendations r ON c.id = r.car_id LEFT JOIN popular_cars p ON c.id = p.car_id${whereClause}`,
        params // 只传where条件的参数，不含分页参数
      );

      const cars = rows.map(car => ({
        ...car,
        images: car.images ? car.images.split(',') : [],
        isRecommended: !!car.is_recommended,
        isPopular: !!car.is_popular
      }));

      res.json({
        list: cars,
        total: countResult[0].total,
        page: validPage,
        pageSize: validPageSize
      });
    } catch (error) {
      console.error('获取车辆列表失败:', error);
      // 返回详细错误信息，方便调试（生产环境可移除）
      res.status(500).json({ 
        error: '获取车辆列表失败',
        detail: error.message,
        sql: error.sql
      });
    }
  }

  static async getCarById(req, res) {
    try {
      const { id } = req.params;
      
      // 校验id是有效整数
      const validId = Number.isInteger(parseInt(id)) ? parseInt(id) : 0;
      if (validId === 0) {
        return res.status(400).json({ error: '无效的车辆ID' });
      }
      
      const [rows] = await pool.query(
        `SELECT c.*, 
                (SELECT GROUP_CONCAT(url SEPARATOR ',') FROM car_images WHERE car_id = c.id) AS images,
                COALESCE(r.id IS NOT NULL, false) AS is_recommended
         FROM cars c
         LEFT JOIN recommendations r ON c.id = r.car_id
         WHERE c.id = ?`,
        [validId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: '车辆不存在' });
      }

      const car = rows[0];
      res.json({
        ...car,
        images: car.images ? car.images.split(',') : [],
        isRecommended: !!car.is_recommended
      });
    } catch (error) {
      console.error('获取车辆详情失败:', error);
      res.status(500).json({ error: '获取车辆详情失败' });
    }
  }

  static async addCar(req, res) {
    try {
      const { 
        brand, model, year, mileage, fuelType, transmission, 
        displacement, color, price, acquisitionPrice, originalPrice,
        description, condition, carCondition, maintenanceRecord, images
      } = req.body;

      // 直接使用简单的 SQL 语句，确保列名正确
      const [result] = await pool.query(
        'INSERT INTO cars (brand, model, year, mileage, fuel_type, transmission, displacement, color, price, acquisition_price, original_price, description, car_condition, maintenance_record, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          brand, model, parseInt(year) || 0, parseFloat(mileage) || 0, fuelType, transmission,
          parseFloat(displacement) || 0, color, parseFloat(price) || 0, parseFloat(acquisitionPrice) || 0, parseFloat(originalPrice) || 0,
          description || '', (carCondition || condition) || '', maintenanceRecord || '', 'available'
        ]
      );

      const carId = result.insertId;

      if (images && Array.isArray(images) && images.length > 0) {
        const imageValues = images.map(img => [carId, img]);
        await pool.query(
          'INSERT INTO car_images (car_id, url) VALUES ?',
          [imageValues]
        );
      }

      res.status(201).json({
        id: carId,
        message: '车辆添加成功'
      });
    } catch (error) {
      console.error('添加车辆失败:', error);
      res.status(500).json({ error: '添加车辆失败' });
    }
  }

  static async updateCar(req, res) {
    try {
      const { id } = req.params;
      const { 
        brand, model, year, mileage, fuelType, transmission, 
        displacement, color, price, acquisitionPrice, originalPrice,
        description, condition, maintenanceRecord, images, status
      } = req.body;

      // 校验id有效性
      const validId = Number.isInteger(parseInt(id)) ? parseInt(id) : 0;
      if (validId === 0) {
        return res.status(400).json({ error: '无效的车辆ID' });
      }

      const [result] = await pool.query(
        `UPDATE cars SET brand = ?, model = ?, year = ?, mileage = ?, fuel_type = ?, transmission = ?,
                          displacement = ?, color = ?, price = ?, acquisition_price = ?, original_price = ?,
                          description = ?, \`condition\` = ?, maintenance_record = ?, status = ?
         WHERE id = ?`,
        [
          brand, model, parseInt(year) || 0, parseFloat(mileage) || 0, fuelType, transmission,
          parseFloat(displacement) || 0, color, parseFloat(price) || 0, parseFloat(acquisitionPrice) || 0, parseFloat(originalPrice) || 0,
          description || '', condition || '', maintenanceRecord || '', status || 'available', validId
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '车辆不存在' });
      }

      if (images !== undefined) {
        await pool.query('DELETE FROM car_images WHERE car_id = ?', [validId]);
        
        if (Array.isArray(images) && images.length > 0) {
          const imageValues = images.map(img => [validId, img]);
          await pool.query(
            'INSERT INTO car_images (car_id, url) VALUES ?',
            [imageValues]
          );
        }
      }

      res.json({ message: '车辆更新成功' });
    } catch (error) {
      console.error('更新车辆失败:', error);
      res.status(500).json({ error: '更新车辆失败' });
    }
  }

  static async deleteCar(req, res) {
    try {
      const { id } = req.params;
      // 校验id有效性
      const validId = Number.isInteger(parseInt(id)) ? parseInt(id) : 0;
      if (validId === 0) {
        return res.status(400).json({ error: '无效的车辆ID' });
      }

      await pool.query('DELETE FROM car_images WHERE car_id = ?', [validId]);
      await pool.query('DELETE FROM recommendations WHERE car_id = ?', [validId]);
      
      const [result] = await pool.query('DELETE FROM cars WHERE id = ?', [validId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '车辆不存在' });
      }

      res.json({ message: '车辆删除成功' });
    } catch (error) {
      console.error('删除车辆失败:', error);
      res.status(500).json({ error: '删除车辆失败' });
    }
  }

  static async uploadImage(req, res) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: '请选择要上传的文件' });
      }

      const imageUrls = [];
      
      for (const file of req.files) {
        // 确保上传目录存在
        if (!fs.existsSync(process.env.UPLOAD_PATH)) {
          fs.mkdirSync(process.env.UPLOAD_PATH, { recursive: true });
        }
        
        const optimizedPath = path.join(process.env.UPLOAD_PATH, `optimized-${file.filename}`);
        
        await sharp(file.path)
          .resize(800, 600, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(optimizedPath);

        // 异步删除原文件，避免阻塞
        fs.unlink(file.path, (err) => {
          if (err) console.error('删除原图片失败:', err);
        });

        const imageUrl = `/uploads/optimized-${file.filename}`;
        imageUrls.push(imageUrl);
      }

      res.json({ urls: imageUrls });
    } catch (error) {
      console.error('图片上传失败:', error);
      res.status(500).json({ error: '图片上传失败' });
    }
  }

  static async aiRecognizeImage(req, res) {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({ error: '请提供有效的图片URL' });
      }

      const mockResults = [
        {
          brand: '奔驰',
          model: 'C级',
          year: '2020',
          fuelType: '汽油',
          transmission: '自动',
          displacement: 2.0,
          color: '#000000'
        },
        {
          brand: '宝马',
          model: '3系',
          year: '2019',
          fuelType: '汽油',
          transmission: '自动',
          displacement: 2.0,
          color: '#FFFFFF'
        },
        {
          brand: '奥迪',
          model: 'A4L',
          year: '2021',
          fuelType: '汽油',
          transmission: '自动',
          displacement: 2.0,
          color: '#333333'
        },
        {
          brand: '大众',
          model: '迈腾',
          year: '2020',
          fuelType: '汽油',
          transmission: '自动',
          displacement: 1.8,
          color: '#666666'
        },
        {
          brand: '丰田',
          model: '凯美瑞',
          year: '2021',
          fuelType: '汽油',
          transmission: '自动',
          displacement: 2.5,
          color: '#999999'
        },
        {
          brand: '本田',
          model: '雅阁',
          year: '2020',
          fuelType: '汽油',
          transmission: '自动',
          displacement: 1.5,
          color: '#FF0000'
        },
        {
          brand: '日产',
          model: '轩逸',
          year: '2019',
          fuelType: '汽油',
          transmission: '自动',
          displacement: 1.6,
          color: '#0000FF'
        },
        {
          brand: '特斯拉',
          model: 'Model 3',
          year: '2021',
          fuelType: '纯电动',
          transmission: '自动',
          displacement: 0,
          color: '#00FF00'
        }
      ];

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];

      res.json(randomResult);
    } catch (error) {
      console.error('AI识别失败:', error);
      res.status(500).json({ error: 'AI识别失败' });
    }
  }
}

module.exports = CarController;