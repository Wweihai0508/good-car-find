const { pool } = require('../config/database');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class EnhancedCarController {
  // 智能推荐 - 根据客户需求推荐车辆
  static async smartRecommend(req, res) {
    try {
      const {
        phone,
        brand,
        minPrice,
        maxPrice,
        minYear,
        maxYear,
        vehicleType,
        fuelType,
        transmission,
        maxMileage
      } = req.query;

      // 记录客户浏览
      if (phone) {
        await pool.query(
          `INSERT INTO customer_browsing
           (customer_phone, filter_brands, filter_price_min, filter_price_max, filter_years)
           VALUES (?, ?, ?, ?, ?)`,
          [phone, brand || '', minPrice || 0, maxPrice || 9999999, minYear || '']
        );
      }

      const params = [];
      const conditions = [];
      let whereClause = '';

      // 基本条件
      conditions.push('c.status = "available"');

      // 价格范围
      if (minPrice) {
        conditions.push('c.price >= ?');
        params.push(parseFloat(minPrice));
      }
      if (maxPrice) {
        conditions.push('c.price <= ?');
        params.push(parseFloat(maxPrice));
      }

      // 年份范围
      if (minYear) {
        conditions.push('CAST(c.year AS UNSIGNED) >= ?');
        params.push(parseInt(minYear));
      }
      if (maxYear) {
        conditions.push('CAST(c.year AS UNSIGNED) <= ?');
        params.push(parseInt(maxYear));
      }

      // 品牌筛选（支持多个品牌）
      if (brand) {
        const brands = brand.split(',').map(b => b.trim());
        const brandPlaceholders = brands.map(() => '?').join(',');
        conditions.push(`c.brand IN (${brandPlaceholders})`);
        params.push(...brands);
      }

      // 车型筛选
      if (vehicleType) {
        conditions.push('c.vehicle_category = ?');
        params.push(vehicleType);
      }

      // 燃油类型
      if (fuelType) {
        conditions.push('c.fuel_type = ?');
        params.push(fuelType);
      }

      // 变速箱
      if (transmission) {
        conditions.push('c.transmission = ?');
        params.push(transmission);
      }

      // 最大里程
      if (maxMileage) {
        conditions.push('c.mileage <= ?');
        params.push(parseFloat(maxMileage));
      }

      whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

      const [rows] = await pool.query(
        `SELECT c.*,
                (SELECT GROUP_CONCAT(url SEPARATOR ',') FROM car_images WHERE car_id = c.id) AS images,
                CASE
                  WHEN c.source_type = 'self' THEN '本店'
                  ELSE c.dealership_name
                END AS location_name,
                CASE
                  WHEN c.source_type = 'self' THEN '本店现车'
                  ELSE CONCAT(c.distance_from_shop DIV 1000, '公里外')
                END AS distance_text,
                COALESCE(r.id IS NOT NULL, false) AS is_recommended
         FROM cars c
         LEFT JOIN recommendations r ON c.id = r.car_id
         ${whereClause}
         ORDER BY
           CASE
             WHEN c.source_type = 'self' THEN 0
             ELSE c.distance_from_shop
           END ASC,
           c.created_at DESC
         LIMIT 20`,
        params
      );

      const cars = rows.map(car => ({
        ...car,
        images: car.images ? car.images.split(',') : [],
        isRecommended: !!car.is_recommended,
        price_display: parseFloat(car.price).toLocaleString() + '万',
        isDealershipCar: car.source_type === 'other'
      }));

      // 按距离和来源分组
      const ownCars = cars.filter(car => car.source_type === 'self');
      const nearbyCars = cars.filter(car => car.source_type === 'other')
        .sort((a, b) => a.distance_from_shop - b.distance_from_shop);

      res.json({
        total: cars.length,
        ownCars,
        nearbyCars,
        all: cars
      });
    } catch (error) {
      console.error('智能推荐失败:', error);
      res.status(500).json({ error: '智能推荐失败', detail: error.message });
    }
  }

  // 快速录入 - 手机端专用
  static async quickEntry(req, res) {
    try {
      const {
        dealershipName,
        brand,
        model,
        year,
        price,
        mileage,
        phone,
        contactPerson,
        address,
        notes,
        images
      } = req.body;

      if (!dealershipName || !brand || !model || !year || !price || !phone) {
        return res.status(400).json({ error: '请填写必填信息' });
      }

      // 插入快速录入表
      const [entryResult] = await pool.query(
        `INSERT INTO quick_entries
         (dealership_name, brand, model, year, price, mileage, phone_number,
          contact_person, address, notes, image_urls, entry_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dealershipName, brand, model, year, parseFloat(price),
          parseFloat(mileage) || 0, phone, contactPerson || '',
          address || '', notes || '',
          Array.isArray(images) ? images.join(',') : '', 'pending'
        ]
      );

      // 创建正式车辆记录
      const [carResult] = await pool.query(
        `INSERT INTO cars
         (brand, model, year, mileage, price, source_type, dealership_name,
          dealership_phone, contact_person, dealership_address, location_description, status)
         VALUES (?, ?, ?, ?, ?, 'other', ?, ?, ?, ?, ?, 'available')`,
        [brand, model, year, parseFloat(mileage) || 0, parseFloat(price),
         dealershipName, phone, contactPerson || '', address || '', notes || '']
      );

      const carId = carResult.insertId;

      // 插入图片
      if (images && Array.isArray(images) && images.length > 0) {
        const imageValues = images.map(img => [carId, img]);
        await pool.query(
          'INSERT INTO car_images (car_id, url) VALUES ?',
          [imageValues]
        );
      }

      // 更新快速录入状态
      await pool.query(
        'UPDATE quick_entries SET car_id = ?, entry_status = "completed" WHERE id = ?',
        [carId, entryResult.insertId]
      );

      res.status(201).json({
        id: carId,
        message: '快速录入成功'
      });
    } catch (error) {
      console.error('快速录入失败:', error);
      res.status(500).json({ error: '快速录入失败', detail: error.message });
    }
  }

  // 获取按距离分组的车辆列表
  static async getCarsByDistance(req, res) {
    try {
      const { radius = 5000 } = req.query; // 默认5公里半径

      const [rows] = await pool.query(
        `SELECT c.*,
                (SELECT GROUP_CONCAT(url SEPARATOR ',') FROM car_images WHERE car_id = c.id) AS images,
                CASE
                  WHEN c.source_type = 'self' THEN '本店'
                  ELSE c.dealership_name
                END AS location_name,
                COALESCE(r.id IS NOT NULL, false) AS is_recommended
         FROM cars c
         LEFT JOIN recommendations r ON c.id = r.car_id
         WHERE c.status = 'available'
           AND (c.source_type = 'self' OR c.distance_from_shop <= ?)
         ORDER BY
           CASE
             WHEN c.source_type = 'self' THEN 0
             ELSE c.distance_from_shop
           END ASC,
           c.created_at DESC
         LIMIT 50`,
        [parseInt(radius)]
      );

      // 按来源分组
      const grouped = {
        own: [],
        nearby: {}
      };

      rows.forEach(car => {
        const carData = {
          ...car,
          images: car.images ? car.images.split(',') : [],
          isRecommended: !!car.is_recommended,
          price_display: parseFloat(car.price).toLocaleString() + '万'
        };

        if (car.source_type === 'self') {
          grouped.own.push(carData);
        } else {
          const location = car.dealership_name || '未知车行';
          if (!grouped.nearby[location]) {
            grouped.nearby[location] = {
              name: location,
              address: car.dealership_address,
              phone: car.dealership_phone,
              distance: car.distance_from_shop,
              cars: []
            };
          }
          grouped.nearby[location].cars.push(carData);
        }
      });

      res.json({
        total: rows.length,
        ownCount: grouped.own.length,
        grouped
      });
    } catch (error) {
      console.error('获取车辆列表失败:', error);
      res.status(500).json({ error: '获取车辆列表失败' });
    }
  }

  // 记录客户需求
  static async recordCustomerRequirement(req, res) {
    try {
      const {
        customerPhone,
        customerName,
        brandPreference,
        priceMin,
        priceMax,
        yearMin,
        yearMax,
        vehicleType,
        fuelType,
        transmission,
        mileageMax,
        colorPreference,
        notes
      } = req.body;

      if (!customerPhone) {
        return res.status(400).json({ error: '请填写客户电话' });
      }

      await pool.query(
        `INSERT INTO customer_requirements
         (customer_phone, customer_name, brand_preference, price_min, price_max,
          year_min, year_max, vehicle_type, fuel_type, transmission, mileage_max,
          color_preference, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          customerPhone, customerName || '', brandPreference || '',
          parseFloat(priceMin) || 0, parseFloat(priceMax) || 9999999,
          parseInt(yearMin) || 0, parseInt(yearMax) || 9999,
          vehicleType || '', fuelType || '', transmission || '',
          parseFloat(mileageMax) || 999, colorPreference || '', notes || ''
        ]
      );

      // 查找匹配的车辆
      const [matchingCars] = await pool.query(
        `SELECT c.*,
                (SELECT GROUP_CONCAT(url SEPARATOR ',') FROM car_images WHERE car_id = c.id) AS images
         FROM cars c
         WHERE c.status = 'available'
           AND c.price >= ?
           AND c.price <= ?
           AND CAST(c.year AS UNSIGNED) >= ?
           AND CAST(c.year AS UNSIGNED) <= ?
         LIMIT 10`,
        [parseFloat(priceMin) || 0, parseFloat(priceMax) || 9999999,
         parseInt(yearMin) || 0, parseInt(yearMax) || 9999]
      );

      res.status(201).json({
        message: '需求记录成功',
        matchingCars: matchingCars.map(car => ({
          ...car,
          images: car.images ? car.images.split(',') : []
        }))
      });
    } catch (error) {
      console.error('记录客户需求失败:', error);
      res.status(500).json({ error: '记录客户需求失败' });
    }
  }

  // 获取车行统计信息
  static async getDealershipStats(req, res) {
    try {
      const [stats] = await pool.query(`
        SELECT
          COUNT(*) as total_cars,
          COUNT(CASE WHEN source_type = 'self' THEN 1 END) as own_cars,
          COUNT(CASE WHEN source_type = 'other' THEN 1 END) as other_cars,
          COUNT(DISTINCT dealership_name) as dealership_count,
          SUM(CASE WHEN source_type = 'other' THEN distance_from_shop ELSE 0 END) /
            NULLIF(COUNT(CASE WHEN source_type = 'other' THEN 1 END), 0) as avg_distance
        FROM cars
        WHERE status = 'available'
      `);

      // 按车行统计
      const [byDealership] = await pool.query(`
        SELECT
          CASE WHEN source_type = 'self' THEN '本店' ELSE dealership_name END as name,
          COUNT(*) as car_count,
          MIN(distance_from_shop) as min_distance,
          MAX(price) as max_price,
          MIN(price) as min_price
        FROM cars
        WHERE status = 'available'
        GROUP BY source_type, dealership_name
        ORDER BY car_count DESC
      `);

      res.json({
        overview: stats[0],
        byDealership
      });
    } catch (error) {
      console.error('获取车行统计失败:', error);
      res.status(500).json({ error: '获取车行统计失败' });
    }
  }
}

module.exports = EnhancedCarController;
