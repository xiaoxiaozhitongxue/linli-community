# 邻里社区APP D1 数据库初始化脚本 (Windows PowerShell)
# 使用方法:
#   1. 本地开发环境: .\database\init.ps1 -Environment local
#   2. 生产环境:     .\database\init.ps1 -Environment production

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("local", "production")]
    [string]$Environment = "local"
)

$DB_NAME = "linli-community-db"
$SCHEMA_FILE = "./database/schema.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  邻里社区APP D1 数据库初始化" -ForegroundColor Cyan
Write-Host "  环境: $Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($Environment -eq "local") {
    Write-Host "[1/2] 执行本地数据库初始化..." -ForegroundColor Yellow
    wrangler d1 execute $DB_NAME --local --file=$SCHEMA_FILE
    
    Write-Host ""
    Write-Host "[2/2] 验证数据库..." -ForegroundColor Yellow
    wrangler d1 info $DB_NAME --local
} else {
    Write-Host "[1/2] 执行生产数据库初始化..." -ForegroundColor Yellow
    wrangler d1 execute $DB_NAME --file=$SCHEMA_FILE
    
    Write-Host ""
    Write-Host "[2/2] 验证数据库..." -ForegroundColor Yellow
    wrangler d1 info $DB_NAME
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  数据库初始化完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
