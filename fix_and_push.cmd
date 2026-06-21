@echo off
cd /d "D:\SEEK\邻里社区APP"
echo ==========================================
echo  推送所有修复到 GitHub
echo ==========================================
echo.
echo 步骤 1: 修复 .git 目录权限
takeown /F ".git" /R >nul 2>&1
icacls ".git" /reset /T /Q >nul 2>&1
icacls ".git" /grant "Everyone:(OI)(CI)F" /T /Q >nul 2>&1
if %errorlevel% neq 0 (
    echo 权限修复可能需要管理员权限
    echo 请确保已右键 "以管理员身份运行"
    pause
    exit /b 1
)
echo 完成
echo.
echo 步骤 2: 添加修改文件
git add src/pages/login/index.vue
echo 完成
echo.
echo 步骤 3: 提交登录修复
git commit -m "fix: 登录成功后跳转问题 - 添加toast提示并使用hash方式重定向"
echo 完成
echo.
echo 步骤 4: 推送到远程
git push origin master
if %errorlevel% neq 0 (
    echo 推送失败，请检查网络连接或 GitHub 凭证
    pause
    exit /b 1
)
echo 完成
echo.
echo ==========================================
echo  所有操作完成！
echo ==========================================
echo  本次推送内容:
echo  - fix: 登录后显示成功提示并正确跳转
pause
