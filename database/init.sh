#!/bin/bash
# 邻里社区APP D1 数据库初始化脚本 (Unix/macOS)
# 使用方法:
#   1. 本地开发环境: ./database/init.sh local
#   2. 生产环境:     ./database/init.sh production

ENV="${1:-local}"
DB_NAME="linli-community-db"
SCHEMA_FILE="./database/schema.sql"

echo "========================================"
echo "  邻里社区APP D1 数据库初始化"
echo "  环境: $ENV"
echo "========================================"
echo ""

if [ "$ENV" = "local" ]; then
  echo "[1/2] 执行本地数据库初始化..."
  wrangler d1 execute $DB_NAME --local --file=$SCHEMA_FILE
  
  echo ""
  echo "[2/2] 验证数据库..."
  wrangler d1 info $DB_NAME --local
else
  echo "[1/2] 执行生产数据库初始化..."
  wrangler d1 execute $DB_NAME --file=$SCHEMA_FILE
  
  echo ""
  echo "[2/2] 验证数据库..."
  wrangler d1 info $DB_NAME
fi

echo ""
echo "========================================"
echo "  数据库初始化完成!"
echo "========================================"
