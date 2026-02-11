# 🚀 二手车展厅系统 - 免费云平台部署指南

本指南将帮助你使用免费云平台将项目部署到公网，让所有人都能访问。

---

## 📋 目录

- [方案选择](#方案选择)
- [方案一：Vercel + Railway（推荐）](#方案一vercel---railway推荐)
- [方案二：Render + Supabase](#方案二render--supabase)
- [常见问题](#常见问题)
- [维护指南](#维护指南)

---

## 🎯 方案选择

### 方案对比

| 特性 | Vercel + Railway | Render + Supabase |
|------|------------------|-------------------|
| **前端** | Vercel | Render |
| **后端** | Railway | Render |
| **数据库** | Railway MySQL | Supabase PostgreSQL |
| **免费额度** | 100GB带宽/月 | 750小时/月 |
| **域名** | *.vercel.app | *.onrender.com |
| **HTTPS** | ✅ 自动 | ✅ 自动 |
| **部署难度** | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### 推荐方案

**新手推荐：Vercel + Railway**
- 部署简单，界面友好
- 免费额度充足
- 自动HTTPS
- 适合快速上线

---

## 方案一：Vercel + Railway（推荐）

### 准备工作

1. **注册账号**
   - [Vercel](https://vercel.com) - 用于部署前端
   - [Railway](https://railway.app) - 用于部署后端和数据库
   - [GitHub](https://github.com) - 用于代码托管

2. **准备代码仓库**
   ```bash
   # 初始化Git仓库
   cd d:\AI_tool\Good_Car_find
   git init
   git add .
   git commit -m "Initial commit"
   
   # 推送到GitHub
   git remote add origin https://github.com/你的用户名/good-car-find.git
   git branch -M main
   git push -u origin main
   ```

---

### 第一步：部署后端到Railway

#### 1. 创建Railway项目

1. 访问 [railway.app](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的GitHub仓库
4. Railway会自动检测到Node.js项目

#### 2. 配置环境变量

在Railway项目的 "Variables" 标签页添加以下环境变量：

```env
PORT=3000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=production
```

#### 3. 创建MySQL数据库

1. 在Railway项目中点击 "New Service" → "Database" → "MySQL"
2. Railway会自动创建一个MySQL数据库
3. 数据库创建后，点击数据库服务，查看连接信息

#### 4. 更新数据库连接配置

Railway会自动提供以下环境变量：
- `MYSQLHOST` - 数据库主机
- `MYSQLUSER` - 数据库用户名
- `MYSQLPASSWORD` - 数据库密码
- `MYSQLDATABASE` - 数据库名称
- `MYSQLPORT` - 数据库端口（通常是3306）

修改 `backend/config/database.js`：

```javascript
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'used_car_showroom',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
```

#### 5. 初始化数据库

在Railway项目中，点击 "New Service" → "CLI" 打开终端，执行：

```bash
mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD < database/init.sql
```

或者在本地执行（需要Railway数据库连接信息）：

```bash
mysql -h <Railway提供的host> -u <Railway提供的user> -p<password> < database/init.sql
```

#### 6. 部署

Railway会自动部署，等待几分钟后，后端服务就会运行。

获取后端URL：
- 在Railway项目页面，点击后端服务
- 在 "Networking" 标签页可以看到生成的URL
- 格式类似：`https://your-project-name.up.railway.app`

---

### 第二步：部署前端到Vercel

#### 1. 安装Vercel CLI（可选）

```bash
npm install -g vercel
```

#### 2. 修改前端配置

创建 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://your-project-name.up.railway.app/api
```

将 `your-project-name.up.railway.app` 替换为你的Railway后端URL。

#### 3. 部署到Vercel

**方法A：通过Vercel CLI（推荐）**

```bash
cd frontend
vercel login
vercel
```

按照提示操作：
1. 选择 "Link to existing project" 或创建新项目
2. 确认项目设置
3. 部署完成

**方法B：通过Vercel网站**

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New" → "Project"
3. 导入你的GitHub仓库
4. 在 "Environment Variables" 中添加：
   - `VITE_API_BASE_URL` = `https://your-project-name.up.railway.app/api`
5. 点击 "Deploy"

#### 4. 配置域名（可选）

1. 在Vercel项目页面，点击 "Settings" → "Domains"
2. 添加你的自定义域名
3. 按照提示配置DNS记录

---

### 第三步：验证部署

1. **访问前端**
   - 打开浏览器访问你的Vercel URL
   - 格式：`https://your-project-name.vercel.app`

2. **测试API**
   - 访问：`https://your-project-name.up.railway.app/api/health`
   - 应该返回：`{"status":"ok","message":"二手车展厅系统 API 运行正常",...}`

3. **测试功能**
   - 浏览车辆列表
   - 查看车辆详情
   - 测试搜索功能

---

## 方案二：Render + Supabase

### 准备工作

1. **注册账号**
   - [Render](https://render.com) - 用于部署前端和后端
   - [Supabase](https://supabase.com) - 用于数据库
   - [GitHub](https://github.com) - 用于代码托管

---

### 第一步：创建Supabase数据库

#### 1. 创建项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `good-car-find`
   - Database Password: 设置一个强密码
   - Region: 选择离你最近的区域
4. 点击 "Create new project"

#### 2. 获取数据库连接信息

项目创建后，在 "Settings" → "Database" 可以看到连接信息：
- Host
- Database name
- Username
- Password
- Port

#### 3. 执行初始化SQL

在Supabase的 "SQL Editor" 中，执行 `backend/database/init.sql` 的内容。

---

### 第二步：部署后端到Render

#### 1. 创建Web Service

1. 访问 [render.com](https://render.com)
2. 点击 "New" → "Web Service"
3. 连接你的GitHub仓库
4. 配置构建和启动：
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Working Directory: `backend`

#### 2. 配置环境变量

在Render项目的 "Environment" 标签页添加：

```env
PORT=3000
NODE_ENV=production
DB_HOST=<Supabase Host>
DB_USER=<Supabase Username>
DB_PASSWORD=<Supabase Password>
DB_NAME=<Supabase Database Name>
DB_PORT=5432
```

#### 3. 部署

点击 "Create Web Service"，Render会自动部署。

获取后端URL：
- 在Render项目页面可以看到生成的URL
- 格式类似：`https://your-project-name.onrender.com`

---

### 第三步：部署前端到Render

#### 1. 创建Static Site

1. 在Render点击 "New" → "Static Site"
2. 连接你的GitHub仓库
3. 配置构建：
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

#### 2. 配置环境变量

添加：
```env
VITE_API_BASE_URL=https://your-project-name.onrender.com/api
```

#### 3. 部署

点击 "Create Static Site"，等待部署完成。

---

## 常见问题

### Q1: 部署后API请求失败？

**A:** 检查以下几点：

1. **前端API地址是否正确**
   - 确保 `VITE_API_BASE_URL` 指向正确的后端URL
   - URL格式：`https://your-backend-url/api`

2. **后端CORS配置**
   - 确保后端已启用CORS
   - 检查 `backend/server.js` 中是否有 `app.use(cors())`

3. **数据库连接**
   - 检查数据库连接信息是否正确
   - 确保数据库服务正在运行

### Q2: 数据库连接失败？

**A:** 

**Railway:**
- 检查环境变量是否正确配置
- 确保数据库服务正在运行
- 查看Railway日志获取详细错误信息

**Supabase:**
- 检查连接信息是否正确
- 确保密码没有特殊字符问题
- 在Supabase控制台测试连接

### Q3: 图片上传失败？

**A:** 

Railway和Render的文件系统是临时的，重启后文件会丢失。解决方案：

1. **使用云存储服务**（推荐）
   - AWS S3
   - 阿里云OSS
   - 腾讯云COS

2. **使用base64编码**
   - 将图片转为base64存储在数据库
   - 适合小图片，不适合大图片

### Q4: 免费额度用完了怎么办？

**A:**

**Railway:**
- 免费额度：$5/月
- 超出后需要升级付费计划
- 或考虑迁移到其他平台

**Render:**
- 免费额度：750小时/月
- 超出后服务会暂停
- 下个月1号会自动恢复

**Vercel:**
- 免费额度：100GB带宽/月
- 超出后需要升级付费计划

### Q5: 如何查看日志？

**Railway:**
- 在项目页面点击服务
- 查看 "Logs" 标签页

**Render:**
- 在项目页面点击 "Logs" 标签页

**Vercel:**
- 在项目页面点击 "Deployments"
- 选择部署，查看日志

---

## 维护指南

### 更新代码

1. **提交代码到GitHub**
   ```bash
   git add .
   git commit -m "Update code"
   git push
   ```

2. **自动部署**
   - Railway和Render会自动检测到代码更新
   - 自动重新部署

3. **手动触发部署**
   - Railway: 在项目页面点击 "Redeploy"
   - Render: 在项目页面点击 "Manual Deploy"

### 备份数据库

**Railway MySQL:**
```bash
# 导出数据
mysqldump -h <host> -u <user> -p<password> <database> > backup.sql

# 导入数据
mysql -h <host> -u <user> -p<password> <database> < backup.sql
```

**Supabase:**
- 在控制台点击 "Database" → "Backups"
- 可以创建手动备份或恢复

### 监控性能

**Railway:**
- 在项目页面查看 "Metrics"
- 可以查看CPU、内存、网络使用情况

**Render:**
- 在项目页面查看 "Metrics"
- 可以查看CPU、内存、请求次数

### 自定义域名

**Vercel:**
1. 在项目设置中添加域名
2. 配置DNS记录：
   - A记录：指向 `76.76.21.21`
   - CNAME记录：指向 `cname.vercel-dns.com`

**Render:**
1. 在项目设置中添加域名
2. 配置DNS记录：
   - CNAME记录：指向 `your-project-name.onrender.com`

---

## 📞 获取帮助

如果遇到问题，可以：

1. **查看官方文档**
   - [Vercel文档](https://vercel.com/docs)
   - [Railway文档](https://docs.railway.app)
   - [Render文档](https://render.com/docs)
   - [Supabase文档](https://supabase.com/docs)

2. **查看项目日志**
   - 在云平台控制台查看详细错误信息

3. **检查环境变量**
   - 确保所有必需的环境变量都已配置

4. **本地测试**
   - 先在本地确保项目正常运行
   - 再部署到云平台

---

## 🎉 完成

恭喜！你的二手车展厅系统已经成功部署到公网，所有人都可以访问了！

**访问地址：**
- 前端：`https://your-project-name.vercel.app`
- 后端：`https://your-project-name.up.railway.app`

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

记得首次登录后修改密码！
