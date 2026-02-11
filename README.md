# 🚗 二手车展厅系统

一个现代化的二手车展厅管理系统，包含前台展示和后台管理功能。

## ✨ 功能特性

### 前台功能
- 🏠 首页展示热门车型和推荐车型
- 🚗 车辆列表浏览和搜索
- 📋 车辆详情查看
- 📞 联系咨询功能

### 后台管理
- 👤 用户管理和权限控制
- 🚙 车辆管理（增删改查）
- 📸 车辆图片上传和管理
- ⭐ 推荐管理
- 🔥 热门管理
- 💰 销售管理
- 📊 数据统计

## 🛠️ 技术栈

### 前端
- Vue 3
- Vite
- Vue Router
- Element Plus
- Axios

### 后端
- Node.js
- Express
- MySQL
- Multer（文件上传）
- Sharp（图片处理）

## 📦 快速开始

### 本地开发

#### 1. 克隆项目
```bash
git clone https://github.com/你的用户名/good-car-find.git
cd good-car-find
```

#### 2. 安装依赖

**后端：**
```bash
cd backend
npm install
```

**前端：**
```bash
cd frontend
npm install
```

#### 3. 配置数据库

**创建数据库：**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE used_car_showroom DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**导入数据：**
```bash
cd backend
mysql -u root -p used_car_showroom < database/init.sql
```

#### 4. 配置环境变量

**后端配置：**
```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=used_car_showroom
```

**前端配置：**
```bash
cd frontend
cp .env.example .env
```

#### 5. 启动服务

**启动后端：**
```bash
cd backend
npm run dev
```

**启动前端：**
```bash
cd frontend
npm run dev
```

#### 6. 访问应用

- 前台：http://localhost:5173
- 后台：http://localhost:5173/admin
- API：http://localhost:3000/api

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

---

## 🚀 云平台部署

### 免费部署（推荐）

使用 Vercel + Railway 免费部署到公网：

详细步骤请查看：
- [快速部署指南](./QUICK_START.md) - 5分钟快速上线
- [完整部署指南](./DEPLOYMENT_GUIDE.md) - 详细部署说明

### 部署平台

| 平台 | 用途 | 免费额度 |
|------|------|----------|
| [Vercel](https://vercel.com) | 前端部署 | 100GB带宽/月 |
| [Railway](https://railway.app) | 后端+数据库 | $5/月 |
| [Render](https://render.com) | 全栈部署 | 750小时/月 |
| [Supabase](https://supabase.com) | 数据库 | 500MB |

---

## 📁 项目结构

```
good-car-find/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── router/          # 路由配置
│   │   ├── utils/           # 工具函数
│   │   └── views/           # 页面
│   ├── package.json
│   └── vite.config.js
├── backend/                  # 后端项目
│   ├── config/              # 配置文件
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中间件
│   ├── routes/              # 路由
│   ├── database/            # 数据库脚本
│   ├── uploads/             # 上传文件
│   ├── server.js            # 服务器入口
│   └── package.json
├── .gitignore
├── DEPLOYMENT_GUIDE.md      # 完整部署指南
└── QUICK_START.md           # 快速部署指南
```

---

## 🔧 API 文档

### 健康检查
```
GET /api/health
```

### 车辆管理
```
GET    /api/cars          # 获取车辆列表
GET    /api/cars/:id      # 获取车辆详情
POST   /api/cars          # 添加车辆
PUT    /api/cars/:id      # 更新车辆
DELETE /api/cars/:id      # 删除车辆
POST   /api/cars/upload   # 上传图片
```

### 推荐管理
```
GET    /api/recommendations       # 获取推荐列表
POST   /api/recommendations       # 添加推荐
PUT    /api/recommendations/:id   # 更新推荐
DELETE /api/recommendations/:id   # 删除推荐
```

### 热门管理
```
GET    /api/popular       # 获取热门列表
POST   /api/popular       # 添加热门
PUT    /api/popular/:id   # 更新热门
DELETE /api/popular/:id   # 删除热门
```

### 销售管理
```
GET    /api/sales         # 获取销售记录
POST   /api/sales         # 添加销售记录
PUT    /api/sales/:id     # 更新销售记录
DELETE /api/sales/:id     # 删除销售记录
```

### 统计数据
```
GET /api/statistics/overview           # 获取概览数据
GET /api/statistics/sales-trend         # 获取销售趋势
GET /api/statistics/brand-distribution  # 获取品牌分布
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 📞 联系方式

如有问题，请提交 Issue 或联系开发者。

---

## 🙏 致谢

感谢所有开源项目的贡献者！

---

## 📖 相关文档

- [数据库迁移指南](./backend/DATABASE_MIGRATION_GUIDE.md)
- [快速部署指南](./QUICK_START.md)
- [完整部署指南](./DEPLOYMENT_GUIDE.md)
