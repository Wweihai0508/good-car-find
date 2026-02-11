const { pool } = require('./config/database');

const carImages = {
  11: [
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop'
  ],
  12: [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'
  ],
  13: [
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
  ],
  14: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'
  ],
  15: [
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop'
  ],
  16: [
    'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&h=600&fit=crop'
  ],
  17: [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&h=600&fit=crop'
  ],
  18: [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
  ],
  19: [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop'
  ],
  20: [
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop'
  ],
  21: [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop'
  ]
};

async function updateImages() {
  try {
    console.log('开始更新图片URL...');

    for (const [carId, urls] of Object.entries(carImages)) {
      await pool.query('DELETE FROM car_images WHERE car_id = ?', [carId]);

      for (let i = 0; i < urls.length; i++) {
        await pool.query(
          'INSERT INTO car_images (car_id, url, sort_order) VALUES (?, ?, ?)',
          [carId, urls[i], i + 1]
        );
      }

      console.log(`✓ 已更新车辆 ${carId} 的图片`);
    }

    console.log('所有图片URL更新完成！');
  } catch (error) {
    console.error('更新图片失败:', error);
  } finally {
    process.exit();
  }
}

updateImages();
