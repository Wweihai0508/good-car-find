@echo off
echo ========================================
echo MySQL Complete Reset Tool v2
echo ========================================
echo.

echo [Step 1] Stopping MySQL service...
net stop MySQL80
timeout /t 2 /nobreak > nul

echo [Step 2] Backing up existing data...
set "backupDir=D:\Mysql\project_file\data_backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%"
if not exist "%backupDir%" (
    mkdir "%backupDir%"
    echo Backup directory created: %backupDir%
)

set "dataDir=D:\Mysql\project_file\data"

echo [Step 3] Moving databases to backup...
if exist "%dataDir%\used_car_showroom" (
    move /Y "%dataDir%\used_car_showroom" "%backupDir%\"
    echo Moved used_car_showroom database.
)

echo [Step 4] Removing all MySQL system files...
rd /S /Q "%dataDir%\#innodb_redo" 2>nul
rd /S /Q "%dataDir%\#innodb_temp" 2>nul
del /F /Q "%dataDir%\*.*" 2>nul
del /F /Q "%dataDir%\auto.cnf" 2>nul
del /F /Q "%dataDir%\*.log" 2>nul
del /F /Q "%dataDir%\*.err" 2>nul
echo All system files removed.

echo [Step 5] Re-initializing MySQL data directory...
D:\Mysql\project_file\bin\mysqld.exe --defaults-file="D:\Mysql\project_data\my.ini" --initialize-insecure --console
echo.

echo [Step 6] Starting MySQL service...
net start MySQL80
echo.

echo [Step 7] Waiting for MySQL to start...
timeout /t 5 /nobreak > nul

echo [Step 8] Checking MySQL port...
mysql -u root -phrsoft -e "SHOW VARIABLES LIKE 'port';"
echo.

echo [Step 9] Restoring databases...
if exist "%backupDir%\used_car_showroom" (
    xcopy /E /I /Y "%backupDir%\used_car_showroom\*" "%dataDir%\used_car_showroom\"
    echo Restored used_car_showroom database.
)

echo ========================================
echo Reset completed!
echo ========================================
echo.
echo If port shows 3306, you can now start backend service:
echo cd D:\AI_tool\Good_Car_find\backend
echo npm start
echo.
pause
