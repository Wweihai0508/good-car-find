@echo off
chcp 65001 >nul
echo ========================================
echo 前端问题诊断
echo ========================================
echo.

echo 正在检查SmartRecommend.vue文件...
findstr /N /C:"terminal" /C:"exec" /C:"spawn" /C:"child_process" frontend\src\views\SmartRecommend.vue >nul
if errorlevel 0 (
    echo ⚠️  发现可疑代码：SmartRecommend.vue中包含终端相关关键词
    echo.
    echo 可能原因：
    echo   1. 调试代码未清理
    echo   2. 意外的代码执行
    echo.
    echo 建议检查：frontend\src\views\SmartRecommend.vue
) else (
    echo ✅ SmartRecommend.vue中未发现终端相关代码
)

echo.
echo 正在检查package.json...
findstr /C:"terminal" /C:"exec" frontend\package.json >nul
if errorlevel 0 (
    echo ⚠️  package.json中发现可疑脚本
    echo 建议检查前端启动脚本
) else (
    echo ✅ package.json正常
)

echo.
echo 正在检查vite配置...
if exist frontend\vite.config.js (
    findstr /C:"terminal" /C:"exec" frontend\vite.config.js >nul
    if errorlevel 0 (
        echo ⚠️  vite.config.js中发现可疑配置
    ) else (
        echo ✅ vite.config.js正常
    )
)

echo.
echo ========================================
echo 诊断完成
echo ========================================
echo.
echo 建议的排查步骤：
echo 1. 检查浏览器控制台（F12）中的JavaScript错误
echo 2. 在SmartRecommend.vue中搜索"handleSearch"方法
echo 3. 确认按钮点击事件只调用正常的API和路由方法
echo 4. 禁用VSCode的自动终端功能：
echo    File ^> Preferences ^> Settings ^> 搜索 "terminal"
echo.
pause
