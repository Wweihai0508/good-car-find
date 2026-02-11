# 🚗 二手车展厅管理系统 - 快速开始指南

## 📋 系统要求

- **Node.js** >= 16.0.0
- **MySQL** >= 5.7
- **Git**

## 🚀 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd Good_Car_find
```

### 2. 数据库配置

#### 2.1 创建数据库

```bash
mysql -u root -p

# 在MySQL命令行中执行
source database/init.sql;
```

或者直接执行 SQL 脚本：

```bash
mysql -u root -p < database/init.sql
```

#### 2.2 配置数据库连接

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
NODE_ENV=development

# MySQL 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=used_car_showroom

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# AI API 配置（可选）
AI_API_KEY=your_ai_api_key
AI_API_URL=https://api.openai.com/v1/chat/completions

# 上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif
```

### 3. 安装依赖

#### 3.1 后端依赖

```bash
cd backend
npm install
```

#### 3.2 前端依赖

```bash
cd frontend
npm install
```

### 4. 启动服务

#### 4.1 启动后端服务

```bash
cd backend
npm run dev
```

后端服务将在 `http://localhost:3000` 启动

#### 4.2 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

## 📊 数据库说明

### 主要表结构

1. **cars** - 车辆基本信息表
2. **car_images** - 车辆图片表
3. **recommendations** - 推荐车辆表
4. **customers** - 客户信息表
5. **sales** - 销售记录表
6. **users** - 用户管理表

### 默认管理员账户

```
用户名: admin
密码: admin123
```

## 🎯 核心功能说明

### 🏠 前台功能

1. **首页轮播** - 展示推荐车辆
2. **车辆列表** - 查看所有车辆
3. **筛选功能** - 按品牌、年份、价格筛选
4. **车辆详情** - 查看车辆详细信息

### 🔧 后台管理

1. **车辆管理** - 添加、编辑、删除车辆信息
2. **图片上传** - 支持批量上传车辆图片
3. **AI识别** - 智能识别车辆品牌型号
4. **推荐管理** - 设置首页推荐车辆
5. **销售记录** - 记录销售信息
6. **数据统计** - 销售统计、库存分析

## 📝 API 接口说明

### 基础 URL

```
http://localhost:3000/api
```

### 主要接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/cars` | GET | 获取车辆列表 |
| `/cars/:id` | GET | 获取车辆详情 |
| `/cars` | POST | 添加车辆 |
| `/cars/:id` | PUT | 更新车辆 |
| `/cars/:id` | DELETE | 删除车辆 |
| `/upload` | POST | 上传图片 |
| `/ai/recognize` | POST | AI图片识别 |
| `/recommendations` | GET | 获取推荐列表 |
| `/recommendations` | POST | 添加推荐 |
| `/sales` | GET | 获取销售记录 |
| `/sales` | POST | 添加销售 |
| `/statistics/overview` | GET | 获取统计概览 |

## 🔧 开发说明

### 前端技术栈

- **Vue 3** - 渐进式前端框架
- **Element Plus** - UI组件库
- **Vite** - 构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

### 后端技术栈

- **Express** - Web 应用框架
- **MySQL** - 关系型数据库
- **Multer** - 文件上传
- **Sharp** - 图片处理
- **JWT** - 身份验证

## 🚀 生产部署

### 1. 前端构建

```bash
cd frontend
npm run build
```

构建产物将在 `frontend/dist` 目录

### 2. 后端部署

```bash
cd backend
npm install --production
npm start
```

### 3. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias /path/to/backend/uploads;
    }
}
```

### 4. 使用 PM2 管理进程

```bash
npm install -g pm2

cd backend
pm2 start server.js --name used-car-backend

# 查看日志
pm2 logs used-car-backend

# 重启服务
pm2 restart used-car-backend

# 停止服务
pm2 stop used-car-backend
```

## 📞 常见问题

### 1. 数据库连接失败

- 检查 MySQL 服务是否启动
- 确认 `.env` 文件中的数据库配置正确
- 确认数据库用户权限

### 2. 图片上传失败

- 检查 `uploads` 目录是否存在且有写入权限
- 确认文件大小不超过限制

### 3. 前端无法连接后端

- 确认后端服务正常运行
- 检查防火墙设置
- 确认 API 地址配置正确

### 4. 端口冲突

修改 `.env` 文件中的 `PORT` 配置，或使用不同的端口号

## 🛠 开发建议

1. **代码规范** - 使用 ESLint 检查代码质量
2. **数据库备份** - 定期备份数据库
3. **日志记录** - 开启详细日志便于调试
4. **性能优化** - 对图片进行压缩处理
5. **安全防护** - 实现 SQL 注入防护

## 📈 后续功能建议

- [ ] 用户注册登录系统
- [ ] 微信小程序版本
- [ ] 车辆视频展示
- [ ] 在线预约看车
- [ ] 车辆估值系统
- [ ] 车辆检测报告
- [ ] 销售数据分析
- [ ] 库存预警功能
- [ ] 批量导入导出
- [ ] 多语言支持

---

**祝您的二手车生意兴隆！** 🚗💨

如有问题，请查看项目文档或提交 Issue。
