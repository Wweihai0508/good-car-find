@echo off
chcp 65001 >nul
echo ========================================
echo 智能车行系统 - 数据库升级脚本
echo ========================================
echo.
echo 正在升级数据库结构，请稍候...
echo.

:: 检查MySQL服务
sc query MySQL80 2>nul | find "RUNNING" >nul
if errorlevel 1 (
    echo ❌ MySQL服务未运行，请先启动MySQL服务
    pause
    exit /b 1
)

echo ✅ MySQL服务运行正常
echo.

:: 运行数据库升级脚本
cd backend
mysql -u root -p < database/enhanced_schema_v2.sql

if errorlevel 1 (
    echo ❌ 数据库升级失败，请检查MySQL密码是否正确
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 数据库升级完成！
echo ========================================
echo.
echo 📝 新增功能：
echo   - 智能推荐系统
echo   - 快速录入功能
echo   - 周边车行车辆管理
echo   - 客户需求记录
echo.
echo 🚀 下一步：
echo   1. 启动后端：cd backend ^&^& npm run dev
echo   2. 启动前端：cd frontend ^&^& npm run dev
echo   3. 访问系统：http://localhost:5173
echo.
echo 📖 查看详细使用指南：
echo   SMART_CAR_SYSTEM_GUIDE.md
echo.
pause
