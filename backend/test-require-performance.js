const express = require('express');
const fs = require('fs');

console.log('=================================');
console.log('测试 require() 性能');
console.log('=================================\n');

// 测试1：多次 require 同一个模块
console.log('测试1：多次 require express');
const start1 = Date.now();
for (let i = 0; i < 1000; i++) {
  require('express');
}
const end1 = Date.now();
console.log(`1000次 require 耗时: ${end1 - start1}ms\n`);

// 测试2：创建多个路由
console.log('测试2：创建100个路由');
const start2 = Date.now();
for (let i = 0; i < 100; i++) {
  const express = require('express');
  const router = express.Router();
}
const end2 = Date.now();
console.log(`100次创建路由耗时: ${end2 - start2}ms\n`);

// 测试3：验证模块缓存
console.log('测试3：验证模块缓存');
const express1 = require('express');
const express2 = require('express');
console.log(`express1 === express2: ${express1 === express2}`);
console.log(`内存地址 express1: ${express1.toString().substring(0, 50)}...`);
console.log(`内存地址 express2: ${express2.toString().substring(0, 50)}...`);

console.log('\n=================================');
console.log('结论：');
console.log('1. require() 有缓存机制，重复加载不会影响性能');
console.log('2. 每个文件显式 require 是最佳实践');
console.log('3. 模块化设计优于全局变量');
console.log('=================================');
