// UTM Manager - 預設設定管理

class DefaultConfig {
  constructor() {
    this.defaults = {
      // Google Apps Script URL
      sync_api_url: 'https://script.google.com/macros/s/AKfycbxmXzmwyGQhnnR2k3XsYIfSYV-601e8keq9qftoG8mi9hZnEIIOpqMPYY1RO5x6B33p-g/exec',
      
      // Gemini AI API Key
      gemini_api_key: 'AIzaSyBVep_ohPIfsljmqljiNrL8EN03J3PMSMw'
    };
  }

  // 初始化預設設定
  initialize() {
    Object.entries(this.defaults).forEach(([key, value]) => {
      if (!Storage.get(key)) {
        Storage.set(key, value);
        console.log(`已設定預設值: ${key}`);
      }
    });
  }

  // 重置為預設值
  resetToDefaults() {
    Object.entries(this.defaults).forEach(([key, value]) => {
      Storage.set(key, value);
    });
    console.log('已重置為預設設定');
  }

  // 清除預設設定（用於登入後）
  clearDefaults() {
    Object.keys(this.defaults).forEach(key => {
      Storage.remove(key);
    });
    console.log('已清除預設設定');
  }

  // 檢查是否使用預設設定
  isUsingDefaults() {
    return Object.entries(this.defaults).every(([key, value]) => {
      return Storage.get(key) === value;
    });
  }

  // 取得預設值
  getDefault(key) {
    return this.defaults[key];
  }
}

// 全域預設設定管理器
window.defaultConfig = new DefaultConfig();