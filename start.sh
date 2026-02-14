#!/bin/bash

# 角色对话模拟器启动脚本

echo "🎭 角色对话模拟器"
echo "=================="
echo ""

# 检查 Node.js 版本
echo "检查 Node.js 版本..."
node_version=$(node -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js 版本: $node_version"
else
    echo "❌ 未找到 Node.js，请先安装 Node.js"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

# 检查 npm 版本
echo "检查 npm 版本..."
npm_version=$(npm -v 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ npm 版本: $npm_version"
else
    echo "❌ 未找到 npm"
    exit 1
fi

echo ""

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ 依赖安装完成"
    else
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo ""
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo "   访问地址: http://localhost:5173"
echo "   按 Ctrl+C 停止服务器"
echo ""

npm run dev

