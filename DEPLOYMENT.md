# UTM Manager 部署指南

## 🚀 快速部署（推薦：Netlify）

### 1. 準備工作
```bash
# 1. 確保所有檔案都在 git repository 中
git add .
git commit -m "準備部署"
git push origin main
```

### 2. Netlify 部署
1. 前往 [netlify.com](https://netlify.com)
2. 點擊 "New site from Git"
3. 連接你的 GitHub repository
4. 部署設定：
   - Build command: 留空
   - Publish directory: `/`
5. 點擊 "Deploy site"

### 3. 自訂網域（可選）
1. 在 Netlify 控制台點擊 "Domain settings"
2. 點擊 "Add custom domain"
3. 輸入你的網域（如：utm.yourcompany.com）
4. 按照指示設定 DNS

## 📋 部署檢查清單

### 部署前檢查
- [ ] 所有功能在本地測試正常
- [ ] Google Apps Script 已部署並測試
- [ ] 移除所有測試資料和 console.log
- [ ] 確認所有資源路徑正確

### 部署後設定
- [ ] 測試 UTM 產生功能
- [ ] 測試 Google Sheet 同步
- [ ] 測試縮網址功能
- [ ] 測試 AI 助手功能
- [ ] 設定 Google Apps Script CORS（如需要）

## 🔧 環境特定設定

### Google Apps Script 設定
```javascript
// 在你的 Apps Script 中，確保允許新的網域
function doPost(e) {
  // 加入 CORS 標頭（如果需要）
  const response = ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
  
  // 允許你的部署網域
  response.setHeaders({
    'Access-Control-Allow-Origin': 'https://your-app.netlify.app'
  });
  
  return response;
}
```

### 使用者設定指南
部署後，使用者需要設定：

1. **Google Apps Script URL**
   - 在「我的連結」頁面點擊「同步設定」
   - 輸入 Apps Script 的 /exec URL

2. **Gemini API Key**（可選）
   - 在 UTM 產生器點擊 AI 區塊的「設定」
   - 輸入 Gemini API Key

## 🌐 其他部署選項

### GitHub Pages
```bash
# 1. 推送到 GitHub
git push origin main

# 2. 在 GitHub repository 設定中啟用 Pages
# Settings > Pages > Source: Deploy from a branch > main
```

### Vercel
```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 部署
vercel --prod
```

### 自架伺服器
```bash
# 1. 上傳檔案到伺服器
scp -r utm-tools/ user@server:/var/www/html/

# 2. 設定 Nginx/Apache
# 確保支援 SPA 路由和 HTTPS
```

## 🔒 安全考量

### 生產環境建議
1. **啟用 HTTPS**（Netlify/Vercel 自動提供）
2. **設定 CSP 標頭**
3. **定期更新依賴**
4. **監控錯誤日誌**

### 資料隱私
- 所有資料儲存在使用者瀏覽器本地
- Google Sheet 同步需要使用者主動設定
- AI 功能需要使用者提供 API Key

## 📊 監控與維護

### 建議監控項目
- 網站可用性
- Google Apps Script 回應時間
- 使用者錯誤回報
- 功能使用統計

### 更新流程
1. 在開發環境測試新功能
2. 推送到 Git repository
3. 自動部署到生產環境
4. 驗證功能正常運作

## 🆘 常見問題

### Q: Google Sheet 同步失敗
A: 檢查 Apps Script URL 是否正確，確認 CORS 設定

### Q: AI 功能無法使用
A: 確認使用者已設定 Gemini API Key

### Q: 縮網址失敗
A: TinyURL 服務偶爾不穩定，屬正常現象

### Q: 資料遺失
A: 提醒使用者定期匯出資料備份