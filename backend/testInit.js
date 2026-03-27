// 测试数据库初始化脚本
const { initDatabase } = require('./initDatabase.js');

async function test() {
  try {
    await initDatabase();
    console.log('\n🎉 测试完成！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  }
}

test();