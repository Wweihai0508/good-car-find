@echo off
chcp 65001 >nul
echo ========================================
echo 初始化测试数据和图片
echo ========================================
echo.

:: 运行初始化脚本
cd backend
mysql -u root -phrsoft railway < database/init_test_data_final.sql

if errorlevel 1 (
    echo ❌ 初始化失败，请检查MySQL密码
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 测试数据初始化完成！
echo ========================================
echo.
echo 📊 添加的数据：
echo   - 10辆本店车辆（奔驰、宝马、奥迪、大众、丰田、本田、日产、别克、雪佛兰、福特）
echo   - 每辆车2张图片（外观+内饰）
echo   - 推荐车辆设置
echo   - 热门车辆设置
echo.
echo 🚀 现在可以访问：
echo   - 首页：http://localhost:5173
echo   - 车辆列表：http://localhost:5173/cars
echo   - 智能推荐：http://localhost:5173/smart-recommend
echo.
pause
