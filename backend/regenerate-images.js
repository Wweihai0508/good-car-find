const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

const damagedFiles = [
  'optimized-car-1696872345-123456.jpg',
  'optimized-car-1696872346-654321.jpg',
  'optimized-car-1696872347-112233.jpg',
  'optimized-car-1696872348-332211.jpg',
  'optimized-car-1696872349-445566.jpg',
  'optimized-car-1696872350-665544.jpg',
  'optimized-car-1696872351-778899.jpg',
  'optimized-car-1696872352-998877.jpg',
  'optimized-car-1696872353-123789.jpg',
  'optimized-car-1696872354-987321.jpg',
  'optimized-car-1696872355-456123.jpg',
  'optimized-car-1696872356-321654.jpg',
  'optimized-car-1696872357-789456.jpg',
  'optimized-car-1696872358-654987.jpg',
  'optimized-car-1696872359-111222.jpg',
  'optimized-car-1696872360-222111.jpg',
  'optimized-car-1696872361-333444.jpg',
  'optimized-car-1696872362-444333.jpg',
  'optimized-car-1696872363-555666.jpg',
  'optimized-car-1696872364-666555.jpg'
];

const colors = [
  '#FF0000', '#000000', '#FFFFFF', '#808080', '#000000',
  '#333333', '#0000FF', '#FFA500', '#008000', '#FF6B6B'
];

async function regenerateImages() {
  console.log('开始重新生成损坏的图片文件...');
  
  for (let i = 0; i < damagedFiles.length; i++) {
    const filename = damagedFiles[i];
    const filepath = path.join(uploadsDir, filename);
    const color = colors[i % colors.length];
    
    try {
      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: color
        }
      })
      .jpeg({ quality: 80 })
      .toFile(filepath);
      
      console.log(`✓ 已生成: ${filename}`);
    } catch (error) {
      console.error(`✗ 生成失败 ${filename}:`, error.message);
    }
  }
  
  console.log('图片生成完成！');
}

regenerateImages().catch(console.error);
