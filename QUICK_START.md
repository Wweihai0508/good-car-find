# 🚀 快速部署指南 - 5分钟上线

## 📦 准备工作

### 1. 注册账号（免费）
- [GitHub](https://github.com) - 代码托管
- [Vercel](https://vercel.com) - 前端部署
- [Railway](https://railway.app) - 后端+数据库

### 2. 推送代码到GitHub

```bash
cd d:\AI_tool\Good_Car_find
git init
git add .
git commit -m "Initial commit"

# 如果还没有GitHub仓库，先在GitHub上创建一个
git remote add origin https://github.com/你的用户名/good-car-find.git
git branch -M main
git push -u origin main
```

---

## 🎯 部署步骤

### 第一步：部署后端到Railway（2分钟）

1. **打开 Railway**
   - 访问 https://railway.app
   - 用GitHub账号登录

2. **创建项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的 `good-car-find` 仓库

3. **添加数据库**
   - 在项目中点击 "New Service"
   - 选择 "Database" → "MySQL"
   - 等待数据库创建完成

4. **配置后端服务**
   - 点击你的后端服务（自动检测到的Node.js项目）
   - 点击 "Settings" → "Variables"
   - 添加环境变量：
     ```
     PORT=3000
     NODE_ENV=production
     ```
   - Railway会自动配置数据库连接

5. **初始化数据库**
   - 点击数据库服务
   - 点击 "Connect" → "CLI"
   - 在终端中执行：
     ```bash
     mysql < database/init.sql
     ```

6. **获取后端URL**
   - 点击后端服务
   - 在 "Networking" 标签页查看URL
   - 格式类似：`https://xxx.up.railway.app`

### 第二步：部署前端到Vercel（2分钟）

1. **打开 Vercel**
   - 访问 https://vercel.com
   - 用GitHub账号登录

2. **创建项目**
   - 点击 "Add New" → "Project"
   - 选择你的 `good-car-find` 仓库

3. **配置环境变量**
   - 在 "Environment Variables" 中添加：
     ```
     VITE_API_BASE_URL=https://你的后端URL/api
     ```
   - 例如：`VITE_API_BASE_URL=https://xxx.up.railway.app/api`

4. **部署**
   - 点击 "Deploy"
   - 等待1-2分钟

5. **获取前端URL**
   - 部署完成后会显示URL
   - 格式类似：`https://xxx.vercel.app`

### 第三步：测试（1分钟）

1. **访问前端**
   - 打开浏览器访问你的Vercel URL
   - 应该能看到二手车展厅首页

2. **测试API**
   - 访问：`https://你的后端URL/api/health`
   - 应该返回：`{"status":"ok","message":"二手车展厅系统 API 运行正常"}`

3. **登录后台**
   - 点击首页的"管理后台"
   - 用户名：`admin`
   - 密码：`admin123`

---

## ✅ 完成！

你的项目已经成功部署到公网，所有人都可以访问了！

**访问地址：**
- 前端：`https://xxx.vercel.app`
- 后端：`https://xxx.up.railway.app`

---

## 📝 更新代码

当代码更新后，只需推送到GitHub，Vercel和Railway会自动重新部署：

```bash
git add .
git commit -m "Update"
git push
```

---

## ⚠️ 注意事项

1. **免费额度**
   - Railway: $5/月
   - Vercel: 100GB带宽/月
   - 超出后需要升级或等待下个月

2. **图片上传**
   - 免费平台的文件系统是临时的
   - 建议使用云存储服务（如阿里云OSS）

3. **数据库**
   - Railway的MySQL数据库会自动备份
   - 建议定期导出数据备份

---

## 🆘 遇到问题？

### 前端无法访问后端
- 检查 `VITE_API_BASE_URL` 是否正确
- 确保后端URL包含 `/api` 后缀

### 数据库连接失败
- 检查Railway数据库是否正在运行
- 查看Railway日志获取详细错误

### 部署失败
- 查看部署日志
- 确保代码在本地可以正常运行

---

## 📚 详细文档

查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 了解更多详细信息。
