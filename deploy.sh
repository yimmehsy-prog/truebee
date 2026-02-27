#!/bin/bash

# Truebee 自动化部署脚本
# 适用环境: Ubuntu/CentOS/Debian
# 目标服务器: 47.106.71.210

set -e

APP_NAME="truebee-app"
APP_DIR="/var/www/truebee"
PORT=3000

echo "🚀 开始部署 Truebee 爆款文案生成器..."

# 1. 检查 Node.js 环境
if ! command -v node &> /dev/null; then
    echo "  - 正在安装 Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
else
    echo "  - Node.js 已安装: $(node -v)"
fi

# 2. 检查并安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo "  - 正在安装 PM2..."
    npm install -g pm2 tsx
else
    echo "  - PM2 已安装"
fi

# 3. 创建应用目录 (如果不存在)
if [ ! -d "$APP_DIR" ]; then
    echo "  - 创建目录 $APP_DIR"
    mkdir -p "$APP_DIR"
fi

# 4. 进入目录并同步代码
if [ -d ".git" ]; then
    echo "  - 检测到 Git 仓库，正在拉取最新代码..."
    git pull origin main
else
    echo "  - 正在安装依赖..."
fi
npm install

# 5. 构建前端
echo "  - 正在构建前端资源..."
npm run build

# 6. 检查环境变量
if [ ! -f ".env" ]; then
    echo "⚠️ 未找到 .env 文件，正在创建默认配置..."
    read -p "请输入你的 GEMINI_API_KEY: " api_key
    cat <<EOF > .env
GEMINI_API_KEY=$api_key
JWT_SECRET=$(openssl rand -hex 16)
NODE_ENV=production
PORT=$PORT
EOF
    echo "✅ .env 文件已生成"
fi

# 7. 启动/重启应用
echo "  - 正在通过 PM2 启动应用..."
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME"
else
    pm2 start server.ts --name "$APP_NAME" --interpreter tsx
fi

# 8. 设置开机自启
pm2 save
pm2 startup | tail -n 1 | bash || true

echo "------------------------------------------------"
echo "🎉 部署完成！"
echo "应用名称: $APP_NAME"
echo "访问地址: http://47.106.71.210:$PORT"
echo "查看日志: pm2 logs $APP_NAME"
echo "------------------------------------------------"
