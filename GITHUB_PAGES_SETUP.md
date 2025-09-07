# GitHub Pages 部署指南

## 🚀 快速部署步驟

### 1. 建立 GitHub Repository
```bash
# 1. 在 GitHub 建立新的 repository
# Repository 名稱：utm-tools（或你喜歡的名稱）
# 設為 Public（GitHub Pages 免費版需要）

# 2. 在本地初始化 Git
cd utm-tools
git init
git add .
git commit -m "Initial commit: UTM Manager v1.0"

# 3. 連接到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/utm-tools.git
git branch -M main
git push -u origin main
```

### 2. 啟用 GitHub Pages
1. 前往你的 GitHub repository
2. 點擊 **Settings** 標籤
3. 在左側選單找到 **Pages**
4. 在 **Source** 選擇 **Deploy from a branch**
5. 選擇 **main** branch 和 **/ (root)** folder
6. 點擊 **Save**

### 3. 等待部署完成
- GitHub 會自動部署（通常需要 1-5 分鐘）
- 部署完成後會顯示網址：`https://YOUR_USERNAME.github.io/utm-tools`

## ✅ 部署後檢查清單

### 必須測試的功能
- [ ] 網站可以正常開啟
- [ ] UTM 產生器功能正常
- [ ] 歷史記錄頁面正常
- [ ] 範本頁面正常
- [ ] 所有 CSS 和 JS 檔案載入正常

### 需要設定的功能
- [ ] Google Apps Script 同步（使用者自行設定）
- [ ] AI 助手 API Key（使用者自行設定）
- [ ] 縮網址功能測試

## 🔧 常見問題解決

### Q: 網站顯示 404 錯誤
**解決方法**：
1. 確認 repository 是 Public
2. 確認 Pages 設定選擇了正確的 branch
3. 等待 5-10 分鐘讓部署完成

### Q: CSS 樣式沒有載入
**解決方法**：
1. 檢查 Tailwind CSS CDN 連結
2. 確認 `shared/styles.css` 路徑正確
3. 檢查瀏覽器開發者工具的錯誤訊息

### Q: JavaScript 功能不正常
**解決方法**：
1. 檢查 `shared/` 目錄下的 JS 檔案路徑
2. 確認所有 script 標籤正確
3. 檢查瀏覽器 Console 的錯誤訊息

## 🔄 更新部署

每次更新程式碼後：
```bash
git add .
git commit -m "更新說明"
git push origin main
```

GitHub Pages 會自動重新部署（1-5分鐘）。

## 🌐 自訂網域（可選）

如果你有自己的網域：

1. 在 repository 根目錄建立 `CNAME` 檔案
2. 檔案內容填入你的網域：`utm.yourcompany.com`
3. 在你的 DNS 設定中加入 CNAME 記錄：
   ```
   utm.yourcompany.com CNAME YOUR_USERNAME.github.io
   ```

## 📊 使用統計

GitHub Pages 提供基本的流量統計：
- 前往 repository 的 **Insights** > **Traffic**
- 可以看到訪問量和熱門頁面

## 🔒 安全設定

GitHub Pages 自動提供：
- ✅ HTTPS 加密
- ✅ DDoS 保護
- ✅ 全球 CDN

## 💡 進階設定

### 自動部署 Action（可選）
建立 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 📞 需要協助？

如果遇到問題：
1. 檢查 GitHub Pages 的官方文件
2. 在 repository 建立 Issue
3. 檢查瀏覽器開發者工具的錯誤訊息