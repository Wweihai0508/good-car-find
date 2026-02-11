# package.json 创建示例

## 1. 初始化项目

```bash
mkdir my-backend
cd my-backend
npm init -y
```

## 2. 手动编辑 package.json

```json
{
  "name": "my-backend",
  "version": "1.0.0",
  "description": "我的后端项目",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "keywords": ["backend", "api"],
  "author": "",
  "license": "MIT"
}
```

## 3. 安装依赖

```bash
# 生产依赖
npm install express cors mysql2 dotenv

# 开发依赖
npm install -D nodemon
```

## 4. 最终的 package.json

```json
{
  "name": "my-backend",
  "version": "1.0.0",
  "description": "我的后端项目",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mysql2": "^3.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["backend", "api"],
  "author": "",
  "license": "MIT"
}
```

## 5. 使用

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```
