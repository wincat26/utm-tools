#!/bin/bash

# UTM Manager - GitHub Pages 部署腳本

echo "🚀 準備部署 UTM Manager 到 GitHub Pages..."

# 檢查是否在正確的目錄
if [ ! -f "index.html" ]; then
    echo "❌ 錯誤：請在 utm-tools 目錄中執行此腳本"
    exit 1
fi

# 檢查 Git 狀態
if [ ! -d ".git" ]; then
    echo "📝 初始化 Git repository..."
    git init
    git add .
    git commit -m "Initial commit: UTM Manager v1.0"
    echo "✅ Git repository 已初始化"
    echo ""
    echo "📋 下一步："
    echo "1. 在 GitHub 建立新的 repository"
    echo "2. 執行以下命令連接到 GitHub："
    echo "   git remote add origin https://github.com/YOUR_USERNAME/utm-tools.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo "3. 在 GitHub repository 的 Settings > Pages 啟用 GitHub Pages"
else
    echo "📤 推送更新到 GitHub..."
    git add .
    
    # 詢問 commit 訊息
    echo "請輸入更新說明（按 Enter 使用預設訊息）："
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update UTM Manager - $(date '+%Y-%m-%d %H:%M')"
    fi
    
    git commit -m "$commit_message"
    git push origin main
    
    echo "✅ 更新已推送到 GitHub"
    echo "🌐 GitHub Pages 將在 1-5 分鐘內自動部署"
fi

echo ""
echo "🎉 部署準備完成！"
echo "📖 詳細說明請參考 GITHUB_PAGES_SETUP.md"