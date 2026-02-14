@echo off
chcp 65001 >nul

echo 🎭 角色对话模拟器
echo ==================
echo.

REM 检查 Node.js 版本
echo 检查 Node.js 版本...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js，请先安装 Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set node_version=%%i
echo ✅ Node.js 版本: %node_version%

REM 检查 npm 版本
echo 检查 npm 版本...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到 npm
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set npm_version=%%i
echo ✅ npm 版本: %npm_version%

echo.

REM 检查依赖是否已安装
if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
)

REM 启动开发服务器
echo 🚀 启动开发服务器...
echo    访问地址: http://localhost:5173
echo    按 Ctrl+C 停止服务器
echo.

npm run dev

pause

