#!/bin/bash

# 测试图片上传功能

# 创建一个测试图片文件
echo "创建测试图片文件..."
convert -size 100x100 xc:black test_image.jpg

# 上传图片到服务器
echo "\n上传图片到服务器..."
curl -X POST "http://localhost:3000/api/cars/upload" -F "images=@test_image.jpg"

# 清理测试文件
echo "\n清理测试文件..."
rm test_image.jpg
