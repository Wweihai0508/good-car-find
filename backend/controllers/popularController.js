const { pool } = require('../config/database');

class PopularController {
  static async getPopularCars(req, res) {
    try {
      const { page = 1, pageSize = 10 } = req.query;
      const offset = (page - 1) * pageSize;

      const [rows] = await pool.query(
        `SELECT p.*, c.brand, c.model, c.year, c.mileage, c.price,
                (SELECT url FROM car_images WHERE car_id = c.id LIMIT 1) AS image
         FROM popular_cars p
         JOIN cars c ON p.car_id = c.id
         ORDER BY p.priority ASC, p.created_at DESC
         LIMIT ? OFFSET ?`,
        [parseInt(pageSize), parseInt(offset)]
      );

      const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM popular_cars');

      const popularCars = rows.map(item => ({
        id: item.id,
        carId: item.car_id,
        carBrand: item.brand,
        carModel: item.model,
        year: item.year,
        mileage: item.mileage,
        price: item.price,
        priority: item.priority,
        status: item.status,
        images: item.image ? [item.image] : [],
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      res.json({
        list: popularCars,
        total: countRows[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      console.error('获取热门车辆失败:', error);
      res.status(500).json({ error: '获取热门车辆失败' });
    }
  }

  static async addPopularCar(req, res) {
    try {
      const { carId, priority = 1, status = 'active' } = req.body;

      const [existing] = await pool.execute(
        'SELECT id FROM popular_cars WHERE car_id = ?',
        [carId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: '该车辆已在热门列表中' });
      }

      const [result] = await pool.execute(
        'INSERT INTO popular_cars (car_id, priority, status) VALUES (?, ?, ?)',
        [carId, priority, status]
      );

      res.status(201).json({
        id: result.insertId,
        message: '添加热门成功'
      });
    } catch (error) {
      console.error('添加热门失败:', error);
      res.status(500).json({ error: '添加热门失败' });
    }
  }

  static async updatePopularCar(req, res) {
    try {
      const { id } = req.params;
      const { carId, priority, status } = req.body;

      const [result] = await pool.execute(
        'UPDATE popular_cars SET car_id = ?, priority = ?, status = ? WHERE id = ?',
        [carId, priority, status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '热门记录不存在' });
      }

      res.json({ message: '更新热门成功' });
    } catch (error) {
      console.error('更新热门失败:', error);
      res.status(500).json({ error: '更新热门失败' });
    }
  }

  static async deletePopularCar(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM popular_cars WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '热门记录不存在' });
      }

      res.json({ message: '删除热门成功' });
    } catch (error) {
      console.error('删除热门失败:', error);
      res.status(500).json({ error: '删除热门失败' });
    }
  }
}

module.exports = PopularController;
