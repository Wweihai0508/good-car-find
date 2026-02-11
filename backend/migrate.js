const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const migrationsDir = path.join(__dirname, 'migrations');
const executedMigrationsFile = path.join(migrationsDir, '.executed');

function getExecutedMigrations() {
  if (fs.existsSync(executedMigrationsFile)) {
    const content = fs.readFileSync(executedMigrationsFile, 'utf8');
    return new Set(content.split('\n').filter(line => line.trim()));
  }
  return new Set();
}

function saveExecutedMigration(filename) {
  const executed = getExecutedMigrations();
  executed.add(filename);
  fs.writeFileSync(executedMigrationsFile, Array.from(executed).join('\n'));
}

function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    return [];
  }
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.startsWith('.'))
    .sort();
}

async function executeMigration(filename) {
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📝 执行迁移: ${filename}`);
  
  try {
    execSync(`mysql -u root -phrsoft used_car_showroom < "${filePath}"`, {
      stdio: 'inherit'
    });
    
    saveExecutedMigration(filename);
    console.log(`✅ 迁移成功: ${filename}`);
  } catch (error) {
    console.error(`❌ 迁移失败: ${filename}`, error.message);
    throw error;
  }
}

async function runMigrations() {
  console.log('=================================');
  console.log('🚀 开始执行数据库迁移');
  console.log('=================================\n');
  
  const executed = getExecutedMigrations();
  const migrationFiles = getMigrationFiles();
  
  const pendingMigrations = migrationFiles.filter(file => !executed.has(file));
  
  if (pendingMigrations.length === 0) {
    console.log('✅ 所有迁移都已执行，无需更新');
    console.log(`已执行的迁移: ${migrationFiles.length} 个`);
    return;
  }
  
  console.log(`📋 发现 ${pendingMigrations.length} 个待执行的迁移`);
  console.log(`📋 总共 ${migrationFiles.length} 个迁移文件\n`);
  
  for (const file of pendingMigrations) {
    await executeMigration(file);
  }
  
  console.log('\n=================================');
  console.log('✅ 所有迁移执行完成！');
  console.log('=================================\n');
}

async function resetMigrations() {
  console.log('⚠️  重置迁移记录（这不会删除数据库，只是清除执行记录）');
  
  if (fs.existsSync(executedMigrationsFile)) {
    fs.unlinkSync(executedMigrationsFile);
    console.log('✅ 迁移记录已清除');
  } else {
    console.log('ℹ️  没有找到迁移记录文件');
  }
}

async function showStatus() {
  console.log('=================================');
  console.log('📊 迁移状态');
  console.log('=================================\n');
  
  const executed = getExecutedMigrations();
  const migrationFiles = getMigrationFiles();
  const pendingMigrations = migrationFiles.filter(file => !executed.has(file));
  
  console.log(`📁 迁移目录: ${migrationsDir}`);
  console.log(`✅ 已执行: ${executed.size} 个`);
  console.log(`⏳ 待执行: ${pendingMigrations.length} 个`);
  
  if (pendingMigrations.length > 0) {
    console.log('\n⏳ 待执行的迁移:');
    pendingMigrations.forEach(file => console.log(`  - ${file}`));
  } else {
    console.log('\n✅ 所有迁移都已执行');
  }
  
  console.log('\n=================================\n');
}

const command = process.argv[2];

switch (command) {
  case 'reset':
    resetMigrations();
    break;
  case 'status':
    showStatus();
    break;
  case 'help':
    console.log(`
数据库迁移工具

使用方法:
  node migrate.js [命令]

命令:
  (无)       执行所有待执行的迁移（默认）
  run        执行所有待执行的迁移
  status      查看迁移状态
  reset       重置迁移记录（谨慎使用）
  help        显示帮助信息

示例:
  node migrate.js              # 执行待执行的迁移
  node migrate.js status        # 查看迁移状态
  node migrate.js reset         # 重置迁移记录
    `);
    break;
  default:
    runMigrations();
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});
