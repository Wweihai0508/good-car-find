const { pool } = require('../config/database');

class RecommendationController {
  static async getRecommendations(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const offset = (page - 1) * pageSize;

      const [rows] = await pool.query(
        `SELECT r.*, c.brand, c.model, c.year, c.mileage, c.price,
                (SELECT url FROM car_images WHERE car_id = c.id LIMIT 1) AS image
         FROM recommendations r
         JOIN cars c ON r.car_id = c.id
         ORDER BY r.priority ASC, r.created_at DESC
         LIMIT ? OFFSET ?`,
        [parseInt(pageSize), parseInt(offset)]
      );

      const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM recommendations');

      const recommendations = rows.map(item => ({
        id: item.id,
        carId: item.car_id,
        carBrand: item.brand,
        carModel: item.model,
        year: item.year,
        mileage: item.mileage,
        price: item.price,
        priority: item.priority || 1,
        status: item.status || 'active',
        images: item.image ? [item.image] : [],
        createdAt: item.created_at
      }));

      res.json({
        list: recommendations,
        total: countRows[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      console.error('获取推荐车辆失败:', error);
      res.status(500).json({ error: '获取推荐车辆失败' });
    }
  }

  static async addRecommendation(req, res) {
    try {
      const { carId, priority = 1, status = 'active' } = req.body;

      const [existing] = await pool.execute(
        'SELECT id FROM recommendations WHERE car_id = ?',
        [carId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: '该车辆已在推荐列表中' });
      }

      const [result] = await pool.execute(
        'INSERT INTO recommendations (car_id, priority, status) VALUES (?, ?, ?)',
        [carId, priority, status]
      );

      res.status(201).json({
        id: result.insertId,
        message: '添加推荐成功'
      });
    } catch (error) {
      console.error('添加推荐失败:', error);
      res.status(500).json({ error: '添加推荐失败' });
    }
  }

  static async updateRecommendation(req, res) {
    try {
      const { id } = req.params;
      const { carId, priority, status } = req.body;

      const [result] = await pool.execute(
        'UPDATE recommendations SET car_id = ?, priority = ?, status = ? WHERE id = ?',
        [carId, priority, status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '推荐记录不存在' });
      }

      res.json({ message: '更新推荐成功' });
    } catch (error) {
      console.error('更新推荐失败:', error);
      res.status(500).json({ error: '更新推荐失败' });
    }
  }

  static async deleteRecommendation(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM recommendations WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '推荐记录不存在' });
      }

      res.json({ message: '取消推荐成功' });
    } catch (error) {
      console.error('删除推荐失败:', error);
      res.status(500).json({ error: '删除推荐失败' });
    }
  }

  static async getPopularCars(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, 
                (SELECT url FROM car_images WHERE car_id = c.id LIMIT 1) AS image,
                COALESCE(r.id IS NOT NULL, false) AS is_recommended
         FROM cars c
         LEFT JOIN recommendations r ON c.id = r.car_id
         WHERE c.status = 'available'
         ORDER BY c.views DESC, c.created_at DESC
         LIMIT 8`
      );

      const cars = rows.map(car => ({
        ...car,
        images: car.image ? [car.image] : [],
        isRecommended: !!car.is_recommended
      }));

      res.json(cars);
    } catch (error) {
      console.error('获取热门车辆失败:', error);
      res.status(500).json({ error: '获取热门车辆失败' });
    }
  }
}

module.exports = RecommendationController;
