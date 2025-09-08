// UTM Manager - 安全配置載入器

class SecureLoader {
  constructor() {
    this.config = null;
  }

  // 載入安全配置
  async loadConfig() {
    try {
      // 嘗試載入 GitHub Actions 生成的配置
      if (window.SECURE_CONFIG) {
        this.config = window.SECURE_CONFIG;
        return true;
      }

      // 如果沒有安全配置，使用本地設定
      this.config = {
        GEMINI_API_KEY: Storage.get('gemini_api_key') || '',
        GOOGLE_APPS_SCRIPT_URL: Storage.get('sync_api_url') || ''
      };

      return true;
    } catch (error) {
      console.error('載入配置失敗:', error);
      return false;
    }
  }

  // 取得 Gemini API Key
  getGeminiKey() {
    return this.config?.GEMINI_API_KEY || '';
  }

  // 取得 Google Apps Script URL
  getScriptUrl() {
    return this.config?.GOOGLE_APPS_SCRIPT_URL || '';
  }

  // 檢查配置是否完整
  isConfigured() {
    return !!(this.getGeminiKey() && this.getScriptUrl());
  }

  // 初始化預設設定（如果沒有安全配置）
  initializeDefaults() {
    if (!window.SECURE_CONFIG) {
      // 只在沒有安全配置時才初始化本地設定
      if (!Storage.get('gemini_api_key')) {
        console.log('請設定 Gemini API Key');
      }
      if (!Storage.get('sync_api_url')) {
        console.log('請設定 Google Apps Script URL');
      }
    }
  }
}

// 全域安全載入器
window.secureLoader = new SecureLoader();