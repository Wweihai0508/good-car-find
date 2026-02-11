const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const databaseName = 'used_car_showroom';
const dbUser = 'root';
const dbPassword = 'hrsoft';
const backupDir = path.join(__dirname, 'database', 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
const backupFile = path.join(backupDir, `${databaseName}_complete_${timestamp}.sql`);
const schemaFile = path.join(backupDir, `${databaseName}_schema_${timestamp}.sql`);

console.log('=================================');
console.log('📦 开始备份数据库');
console.log('=================================\n');

try {
  console.log(`📝 导出完整数据库（包含数据）...`);
  execSync(
    `mysqldump -u ${dbUser} -p${dbPassword} ${databaseName} > "${backupFile}"`,
    { stdio: 'inherit' }
  );
  
  console.log(`✅ 完整备份已保存: ${backupFile}`);
  
  console.log(`\n📝 导出数据库结构（不包含数据）...`);
  execSync(
    `mysqldump -u ${dbUser} -p${dbPassword} --no-data ${databaseName} > "${schemaFile}"`,
    { stdio: 'inherit' }
  );
  
  console.log(`✅ 结构备份已保存: ${schemaFile}`);
  
  console.log('\n=================================');
  console.log('✅ 数据库备份完成！');
  console.log('=================================\n');
  
  console.log('📋 备份文件:');
  console.log(`  1. 完整备份: ${backupFile}`);
  console.log(`  2. 结构备份: ${schemaFile}`);
  
  console.log('\n💡 换电脑时使用方法:');
  console.log('  方法1（推荐）: 复制整个migrations目录，执行 node migrate.js');
  console.log('  方法2（快速）: 在新电脑执行以下命令:');
  console.log(`    mysql -u ${dbUser} -p${dbPassword} < "${backupFile}"`);
  
} catch (error) {
  console.error('\n❌ 备份失败:', error.message);
  process.exit(1);
}
