# 后台项目创建完整流程

## 第一步：创建项目目录

```bash
mkdir my-backend
cd my-backend
```

## 第二步：初始化 package.json

```bash
npm init -y
```

**此时目录结构：**
```
my-backend/
└── package.json
```

**package.json 内容：**
```json
{
  "name": "my-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## 第三步：安装依赖

```bash
npm install express cors mysql2 dotenv
```

**此时目录结构：**
```
my-backend/
├── node_modules/          # 下载的包
│   ├── express/
│   ├── cors/
│   ├── mysql2/
│   └── dotenv/
├── package.json           # 已更新
└── package-lock.json      # 新生成
```

**package.json 内容（自动更新）：**
```json
{
  "name": "my-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mysql2": "^3.6.0"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

**注意：** `dependencies` 字段是 `npm install` 自动添加的！

## 第四步：创建代码文件

创建 `server.js`：

```javascript
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 第五步：运行项目

```bash
node server.js
```

**输出：**
```
Server running on port 3000
```

---

## 关键点总结

1. **必须先有 package.json**
   - `npm init` 创建
   - 记录项目信息和依赖

2. **然后安装依赖**
   - `npm install` 下载包
   - 自动更新 package.json

3. **最后写代码**
   - 使用 `require()` 引入已安装的包
   - 如果没安装会报错

4. **package.json 的作用**
   - 记录项目需要哪些包
   - 方便其他人安装相同依赖
   - `npm install` 会根据 package.json 安装所有依赖
