// UTM Manager - 環境設定檔

const CONFIG = {
  // 環境設定
  ENVIRONMENT: 'production', // 'development' | 'production'
  
  // API 設定
  GOOGLE_SHEETS: {
    // 使用者需要設定自己的 Apps Script URL
    DEFAULT_URL: '',
    STORAGE_KEY: 'sync_api_url'
  },
  
  // AI 設定
  GEMINI: {
    // 使用者需要設定自己的 API Key
    STORAGE_KEY: 'gemini_api_key'
  },
  
  // 縮網址設定
  URL_SHORTENER: {
    SERVICE: 'tinyurl', // 目前使用 TinyURL
    FALLBACK_ENABLED: true
  },
  
  // 資料儲存設定
  STORAGE: {
    MAX_RECORDS: 100,
    MAX_TEMPLATES: 10,
    MAX_SHORT_URLS: 50
  },
  
  // 應用資訊
  APP: {
    NAME: 'UTM Manager',
    VERSION: '1.0.0',
    DESCRIPTION: 'UTM 連結產生與管理工具'
  }
};

// 根據環境調整設定
if (CONFIG.ENVIRONMENT === 'development') {
  // 開發環境特殊設定
  console.log('UTM Manager - 開發模式');
}

// 全域配置
window.UTM_CONFIG = CONFIG;