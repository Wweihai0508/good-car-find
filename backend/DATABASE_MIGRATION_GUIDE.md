# 数据库迁移和管理指南

## 目录结构

```
backend/
├── database/
│   ├── init_utf8.sql              # 初始化SQL（包含所有表）
│   ├── backups/                  # 数据库备份目录
│   │   ├── used_car_showroom_complete_2026-02-04.sql
│   │   └── used_car_showroom_schema_2026-02-04.sql
│   └── ...
├── migrations/                   # 迁移文件目录
│   ├── 001_create_initial_tables.sql
│   ├── 002_add_test_drives.sql
│   ├── 003_add_favorites.sql
│   ├── 004_add_vin_to_cars.sql
│   ├── .executed                 # 记录已执行的迁移
│   └── ...
├── migrate.js                    # 迁移执行脚本
└── backup-database.js            # 数据库备份脚本
```

---

## 使用场景

### 场景1：日常开发 - 添加新功能

**步骤1：创建迁移文件**

```bash
# 在 backend/migrations/ 目录下创建新的迁移文件
# 例如：migrations/005_add_car_reviews.sql
```

**migrations/005_add_car_reviews.sql**
```sql
USE used_car_showroom;

-- 添加车辆评价表
CREATE TABLE IF NOT EXISTS car_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_car_id (car_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**步骤2：执行迁移**

```bash
cd backend
node migrate.js
```

**输出示例：**
```
=================================
🚀 开始执行数据库迁移
=================================

📋 发现 1 个待执行的迁移
📋 总共 5 个迁移文件

📝 执行迁移: 005_add_car_reviews.sql
✅ 迁移成功: 005_add_car_reviews.sql

=================================
✅ 所有迁移执行完成！
=================================
```

---

### 场景2：日常开发 - 修改表结构

**步骤1：创建迁移文件**

**migrations/006_add_car_tags.sql**
```sql
USE used_car_showroom;

-- 为cars表添加标签字段
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS tags VARCHAR(255) COMMENT '车辆标签，多个标签用逗号分隔';
```

**步骤2：执行迁移**

```bash
cd backend
node migrate.js
```

---

### 场景3：换电脑 - 使用迁移（推荐）

**步骤1：复制整个项目**

```bash
# 复制整个项目到新电脑
# 包括 backend/migrations/ 目录
```

**步骤2：在新电脑执行迁移**

```bash
cd backend
node migrate.js
```

**输出示例：**
```
=================================
🚀 开始执行数据库迁移
=================================

📋 发现 5 个待执行的迁移
📋 总共 5 个迁移文件

📝 执行迁移: 001_create_initial_tables.sql
✅ 迁移成功: 001_create_initial_tables.sql

📝 执行迁移: 002_add_test_drives.sql
✅ 迁移成功: 002_add_test_drives.sql

📝 执行迁移: 003_add_favorites.sql
✅ 迁移成功: 003_add_favorites.sql

📝 执行迁移: 004_add_vin_to_cars.sql
✅ 迁移成功: 004_add_vin_to_cars.sql

📝 执行迁移: 005_add_car_reviews.sql
✅ 迁移成功: 005_add_car_reviews.sql

=================================
✅ 所有迁移执行完成！
=================================
```

---

### 场景4：换电脑 - 使用完整SQL（快速）

**步骤1：在旧电脑备份数据库**

```bash
cd backend
node backup-database.js
```

**输出示例：**
```
=================================
📦 开始备份数据库
=================================

📝 导出完整数据库（包含数据）...
✅ 完整备份已保存: D:\AI_tool\Good_Car_find\backend\database\backups\used_car_showroom_complete_2026-02-04.sql

📝 导出数据库结构（不包含数据）...
✅ 结构备份已保存: D:\AI_tool\Good_Car_find\backend\database\backups\used_car_showroom_schema_2026-02-04.sql

=================================
✅ 数据库备份完成！
=================================

📋 备份文件:
  1. 完整备份: D:\AI_tool\Good_Car_find\backend\database\backups\used_car_showroom_complete_2026-02-04.sql
  2. 结构备份: D:\AI_tool\Good_Car_find\backend\database\backups\used_car_showroom_schema_2026-02-04.sql

💡 换电脑时使用方法:
  方法1（推荐）: 复制整个migrations目录，执行 node migrate.js
  方法2（快速）: 在新电脑执行以下命令:
    mysql -u root -phrsoft < "D:\AI_tool\Good_Car_find\backend\database\backups\used_car_showroom_complete_2026-02-04.sql"
```

**步骤2：复制备份文件到新电脑**

```bash
# 复制备份文件到新电脑
backend/database/backups/used_car_showroom_complete_2026-02-04.sql
```

**步骤3：在新电脑导入数据库**

```bash
mysql -u root -phrsoft < backend/database/backups/used_car_showroom_complete_2026-02-04.sql
```

---

## 迁移工具命令

### 查看迁移状态

```bash
cd backend
node migrate.js status
```

**输出示例：**
```
=================================
📊 迁移状态
=================================

📁 迁移目录: D:\AI_tool\Good_Car_find\backend\migrations
✅ 已执行: 5 个
⏳ 待执行: 0 个

✅ 所有迁移都已执行
=================================
```

### 重置迁移记录（谨慎使用）

```bash
cd backend
node migrate.js reset
```

**输出示例：**
```
⚠️  重置迁移记录（这不会删除数据库，只是清除执行记录）
✅ 迁移记录已清除
```

**注意：** 这个命令会清除`.executed`文件，下次执行`node migrate.js`时会重新执行所有迁移。

### 查看帮助

```bash
cd backend
node migrate.js help
```

---

## 迁移文件命名规范

### 格式

```
[序号]_[描述].sql
```

### 示例

```
001_create_initial_tables.sql      # 创建初始表
002_add_test_drives.sql          # 添加试驾表
003_add_favorites.sql            # 添加收藏表
004_add_vin_to_cars.sql         # 为cars表添加VIN字段
005_add_car_reviews.sql          # 添加车辆评价表
006_add_car_tags.sql            # 为cars表添加标签字段
```

### 命名建议

1. **序号使用3位数字**：001, 002, 003...
2. **描述使用英文**：add_*, create_*, modify_*
3. **描述要清晰**：一眼就能看出这个迁移做了什么
4. **一个迁移文件只做一件事**：不要在一个文件里混合多个不相关的修改

---

## 迁移文件最佳实践

### 1. 使用 IF NOT EXISTS

```sql
-- 好的做法
CREATE TABLE IF NOT EXISTS favorites (...);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vin VARCHAR(17);

-- 不好的做法（重复执行会报错）
CREATE TABLE favorites (...);
ALTER TABLE cars ADD COLUMN vin VARCHAR(17);
```

### 2. 添加注释

```sql
CREATE TABLE IF NOT EXISTS car_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL COMMENT '车辆ID',
    user_id INT NOT NULL COMMENT '用户ID',
    rating INT NOT NULL COMMENT '评分（1-5）',
    comment TEXT COMMENT '评价内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT '车辆评价表';
```

### 3. 使用外键约束

```sql
CREATE TABLE IF NOT EXISTS car_reviews (
    ...
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    ...
);
```

**外键选项说明：**
- `ON DELETE CASCADE`：删除主表记录时，自动删除从表相关记录
- `ON DELETE SET NULL`：删除主表记录时，从表相关记录设为NULL
- `ON DELETE RESTRICT`：删除主表记录时，如果从表有相关记录则不允许删除

### 4. 添加索引

```sql
CREATE TABLE IF NOT EXISTS car_reviews (
    ...
    INDEX idx_car_id (car_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);
```

---

## 常见问题

### Q1：迁移执行失败怎么办？

**A：** 查看错误信息，修复SQL语法错误，然后：

```bash
# 方法1：重置迁移记录，重新执行
node migrate.js reset
node migrate.js

# 方法2：手动执行失败的迁移
mysql -u root -phrsoft < migrations/005_add_car_reviews.sql
```

### Q2：如何回滚迁移？

**A：** 创建对应的down迁移文件

**migrations/005_down_remove_car_reviews.sql**
```sql
USE used_car_showroom;

-- 删除车辆评价表
DROP TABLE IF EXISTS car_reviews;
```

执行回滚：
```bash
mysql -u root -phrsoft < migrations/005_down_remove_car_reviews.sql
```

### Q3：如何查看数据库结构？

**A：** 使用DESCRIBE命令

```bash
mysql -u root -phrsoft -e "DESCRIBE used_car_showroom.cars;"
```

或者使用图形化工具：
- MySQL Workbench
- Navicat
- DBeaver

### Q4：迁移文件和完整SQL文件有什么区别？

**A：** 

| 特性 | 迁移文件 | 完整SQL文件 |
|------|----------|-------------|
| 可追溯历史 | ✅ 是 | ❌ 否 |
| 支持回滚 | ✅ 是 | ❌ 否 |
| 团队协作 | ✅ 是 | ❌ 否 |
| 执行速度 | ⏳ 慢（逐个执行） | ⚡ 快（一次性导入） |
| 适用场景 | 日常开发 | 快速部署、换电脑 |

**推荐：**
- 日常开发：使用迁移文件
- 换电脑：两种方式都可以
  - 迁移文件：更安全，可追溯
  - 完整SQL：更快速

---

## 总结

### 日常开发流程

```
1. 需要修改数据库结构
   ↓
2. 创建新的迁移文件（migrations/006_xxx.sql）
   ↓
3. 执行迁移（node migrate.js）
   ↓
4. 验证修改是否正确
```

### 换电脑流程

**方式1：使用迁移（推荐）**
```
1. 复制整个项目到新电脑
   ↓
2. 执行迁移（node migrate.js）
   ↓
3. 完成
```

**方式2：使用完整SQL（快速）**
```
1. 在旧电脑备份数据库（node backup-database.js）
   ↓
2. 复制备份文件到新电脑
   ↓
3. 导入数据库（mysql -u root -phrsoft < backup.sql）
   ↓
4. 完成
```

---

## 快速参考

### 执行迁移
```bash
cd backend
node migrate.js
```

### 查看状态
```bash
cd backend
node migrate.js status
```

### 备份数据库
```bash
cd backend
node backup-database.js
```

### 导入完整SQL
```bash
mysql -u root -phrsoft < database/init_utf8.sql
```
