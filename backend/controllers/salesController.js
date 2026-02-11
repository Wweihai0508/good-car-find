const { pool } = require('../config/database');

class SalesController {
  static async getSales(req, res) {
    try {
      const { page = 1, pageSize = 20, dateStart, dateEnd } = req.query;
      const offset = (page - 1) * pageSize;
      const params = [];
      let whereClause = '';

      const conditions = [];
      
      if (dateStart) {
        conditions.push('s.sale_date >= ?');
        params.push(dateStart);
      }
      
      if (dateEnd) {
        conditions.push('s.sale_date <= ?');
        params.push(dateEnd + ' 23:59:59');
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      const [rows] = await pool.execute(
        `SELECT s.*, c.brand, c.model, c.year, c.price,
                (SELECT url FROM car_images WHERE car_id = c.id LIMIT 1) AS image,
                cu.name AS customer_name, cu.phone AS customer_phone
         FROM sales s
         JOIN cars c ON s.car_id = c.id
         LEFT JOIN customers cu ON s.customer_id = cu.id
         ${whereClause}
         ORDER BY s.sale_date DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), parseInt(offset)]
      );

      const [countResult] = await pool.execute(
        `SELECT COUNT(*) AS total FROM sales s ${whereClause}`,
        params
      );

      const sales = rows.map(sale => ({
        ...sale,
        image: sale.image
      }));

      res.json({
        list: sales,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      console.error('获取销售记录失败:', error);
      res.status(500).json({ error: '获取销售记录失败' });
    }
  }

  static async addSale(req, res) {
    try {
      const { carId, customerName, customerPhone, salePrice, saleDate, notes } = req.body;

      let customerId = null;
      
      const [existingCustomer] = await pool.execute(
        'SELECT id FROM customers WHERE phone = ?',
        [customerPhone]
      );

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
      } else {
        const [customerResult] = await pool.execute(
          'INSERT INTO customers (name, phone) VALUES (?, ?)',
          [customerName, customerPhone]
        );
        customerId = customerResult.insertId;
      }

      const [result] = await pool.execute(
        `INSERT INTO sales (car_id, customer_id, sale_price, sale_date, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [carId, customerId, salePrice, saleDate || new Date(), notes]
      );

      await pool.execute(
        'UPDATE cars SET status = "sold" WHERE id = ?',
        [carId]
      );

      res.status(201).json({
        id: result.insertId,
        message: '销售记录添加成功'
      });
    } catch (error) {
      console.error('添加销售记录失败:', error);
      res.status(500).json({ error: '添加销售记录失败' });
    }
  }

  static async updateSale(req, res) {
    try {
      const { id } = req.params;
      const { customerName, customerPhone, salePrice, saleDate, notes } = req.body;

      let customerId = null;
      
      const [existingCustomer] = await pool.execute(
        'SELECT id FROM customers WHERE phone = ?',
        [customerPhone]
      );

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
      } else {
        const [customerResult] = await pool.execute(
          'INSERT INTO customers (name, phone) VALUES (?, ?)',
          [customerName, customerPhone]
        );
        customerId = customerResult.insertId;
      }

      const [result] = await pool.execute(
        `UPDATE sales SET customer_id = ?, sale_price = ?, sale_date = ?, notes = ?
         WHERE id = ?`,
        [customerId, salePrice, saleDate, notes, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '销售记录不存在' });
      }

      res.json({ message: '销售记录更新成功' });
    } catch (error) {
      console.error('更新销售记录失败:', error);
      res.status(500).json({ error: '更新销售记录失败' });
    }
  }

  static async deleteSale(req, res) {
    try {
      const { id } = req.params;

      const [sale] = await pool.execute(
        'SELECT car_id FROM sales WHERE id = ?',
        [id]
      );

      if (sale.length === 0) {
        return res.status(404).json({ error: '销售记录不存在' });
      }

      await pool.execute('DELETE FROM sales WHERE id = ?', [id]);
      
      await pool.execute(
        'UPDATE cars SET status = "available" WHERE id = ?',
        [sale[0].car_id]
      );

      res.json({ message: '销售记录删除成功' });
    } catch (error) {
      console.error('删除销售记录失败:', error);
      res.status(500).json({ error: '删除销售记录失败' });
    }
  }
}

module.exports = SalesController;
