const { pool } = require('../config/database');

class StatisticsController {
  static async getOverview(req, res) {
    try {
      const [availableCars] = await pool.execute(
        'SELECT COUNT(*) AS count FROM cars WHERE status = "available"'
      );

      const [soldCars] = await pool.execute(
        'SELECT COUNT(*) AS count FROM cars WHERE status = "sold"'
      );

      const [monthSales] = await pool.execute(
        `SELECT SUM(sale_price) AS total_amount, COUNT(*) AS total_count
         FROM sales
         WHERE DATE_FORMAT(sale_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')`
      );

      const [totalRevenue] = await pool.execute(
        `SELECT SUM(sale_price) AS total
         FROM sales`
      );

      const [profitData] = await pool.execute(
        `SELECT SUM(c.price - c.acquisition_price) AS total_profit
         FROM cars c
         JOIN sales s ON c.id = s.car_id`
      );

      const statistics = {
        totalCars: availableCars[0].count + soldCars[0].count,
        availableCars: availableCars[0].count,
        soldCars: soldCars[0].count,
        monthSalesAmount: monthSales[0].total_amount || 0,
        monthSalesCount: monthSales[0].total_count || 0,
        totalRevenue: totalRevenue[0].total || 0,
        totalProfit: profitData[0].total_profit || 0,
        avgProfitPerCar: (profitData[0].total_profit || 0) / (soldCars[0].count || 1)
      };

      res.json(statistics);
    } catch (error) {
      console.error('获取统计概览失败:', error);
      res.status(500).json({ error: '获取统计概览失败' });
    }
  }

  static async getSalesTrend(req, res) {
    try {
      const { months = 6 } = req.query;

      const [rows] = await pool.execute(
        `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month,
                SUM(sale_price) AS total_amount,
                COUNT(*) AS count
         FROM sales
         WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
         ORDER BY month`,
        [months]
      );

      const trend = rows.map(row => ({
        month: row.month,
        amount: row.total_amount || 0,
        count: row.count || 0
      }));

      res.json(trend);
    } catch (error) {
      console.error('获取销售趋势失败:', error);
      res.status(500).json({ error: '获取销售趋势失败' });
    }
  }

  static async getBrandDistribution(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT brand,
                COUNT(*) AS total,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
                SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) AS sold
         FROM cars
         GROUP BY brand
         HAVING COUNT(*) > 0
         ORDER BY total DESC`
      );

      const distribution = rows.map(row => ({
        brand: row.brand,
        total: row.total,
        available: row.available || 0,
        sold: row.sold || 0
      }));

      res.json(distribution);
    } catch (error) {
      console.error('获取品牌分布失败:', error);
      res.status(500).json({ error: '获取品牌分布失败' });
    }
  }

  static async getPriceRangeDistribution(req, res) {
    try {
      const ranges = [
        { min: 0, max: 10, label: '0-10万' },
        { min: 10, max: 20, label: '10-20万' },
        { min: 20, max: 30, label: '20-30万' },
        { min: 30, max: 50, label: '30-50万' },
        { min: 50, max: 100, label: '50-100万' },
        { min: 100, max: 1000, label: '100万以上' }
      ];

      const distribution = [];

      for (const range of ranges) {
        const [count] = await pool.execute(
          `SELECT COUNT(*) AS count
           FROM cars
           WHERE price >= ? AND price < ? AND status = 'available'`,
          [range.min, range.max]
        );

        distribution.push({
          label: range.label,
          count: count[0].count || 0,
          min: range.min,
          max: range.max
        });
      }

      res.json(distribution);
    } catch (error) {
      console.error('获取价格分布失败:', error);
      res.status(500).json({ error: '获取价格分布失败' });
    }
  }
}

module.exports = StatisticsController;
