// 测试API端点
const http = require('http');

// 测试健康检查端点
function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n=== 健康检查端点测试 ===');
      console.log('状态码:', res.statusCode);
      console.log('响应:', data);
    });
  });

  req.on('error', (e) => {
    console.error('健康检查端点测试失败:', e.message);
  });

  req.end();
}

// 测试车辆列表端点
function testCarsEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cars',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n=== 车辆列表端点测试 ===');
      console.log('状态码:', res.statusCode);
      console.log('响应:', data);
    });
  });

  req.on('error', (e) => {
    console.error('车辆列表端点测试失败:', e.message);
  });

  req.end();
}

// 运行测试
console.log('开始测试API端点...');
testHealthCheck();

// 等待1秒后测试车辆列表端点
setTimeout(testCarsEndpoint, 1000);