# 🔐 安全性設定指南

## 問題說明
GitHub 偵測到 API Key 被暴露在程式碼中，這是安全風險。

## 🚀 解決方案

### 方案1：GitHub Secrets（推薦）

#### 1. 設定 GitHub Secrets
1. 前往你的 GitHub repository
2. 點擊 **Settings** > **Secrets and variables** > **Actions**
3. 點擊 **New repository secret**
4. 新增以下 Secrets：

```
Name: GEMINI_API_KEY
Value: AIzaSyBVep_ohPIfsljmqljiNrL8EN03J3PMSMw

Name: GOOGLE_APPS_SCRIPT_URL  
Value: https://script.google.com/macros/s/AKfycbxmXzmwyGQhnnR2k3XsYIfSYV-601e8keq9qftoG8mi9hZnEIIOpqMPYY1RO5x6B33p-g/exec
```

#### 2. 啟用 GitHub Actions
- GitHub Actions 會自動生成安全配置檔案
- 部署時將 Secrets 注入到配置中
- 原始碼中不會包含敏感資料

### 方案2：用戶手動設定

#### 優點：
- ✅ 完全安全，沒有暴露風險
- ✅ 每個用戶使用自己的 API Key
- ✅ 符合最佳安全實踐

#### 缺點：
- ❌ 用戶需要手動設定
- ❌ 首次使用較複雜

### 方案3：環境變數加密

#### 使用簡單加密：
```javascript
// 加密後的配置（示例）
const ENCRYPTED_CONFIG = {
  key: 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=',
  url: 'U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y='
};
```

## 🎯 建議實作順序

### 立即行動：
1. **設定 GitHub Secrets**（5分鐘）
2. **推送程式碼**，GitHub Actions 自動處理
3. **測試功能**是否正常

### 長期規劃：
1. **實作用戶登入系統**
2. **每個用戶使用自己的 API Key**
3. **完全移除預設配置**

## 🔧 技術實作

### 安全載入器已整合：
- `shared/secure-loader.js` - 安全配置管理
- `.github/workflows/deploy.yml` - 自動部署
- 自動偵測安全配置或本地設定

### 使用方式：
```javascript
// 載入配置
await secureLoader.loadConfig();

// 取得 API Key
const apiKey = secureLoader.getGeminiKey();

// 取得 Script URL  
const scriptUrl = secureLoader.getScriptUrl();
```

## ⚠️ 安全提醒

1. **永遠不要**將 API Key 直接寫在程式碼中
2. **使用環境變數**或 **GitHub Secrets**
3. **定期輪換** API Key
4. **監控使用量**，防止濫用

## 🚀 快速修復

執行以下步驟立即修復：

1. **設定 GitHub Secrets**
2. **推送程式碼**
3. **等待 GitHub Actions 部署**
4. **測試網站功能**

修復完成後，GitHub 將不再顯示安全警告。