// UTM Manager - 預設設定管理

class DefaultConfig {
  constructor() {
    console.warn('DefaultConfig 已棄用，請使用 SecureLoader');
    this.defaults = {
      // 敢感資料已移除，請使用 GitHub Secrets 或手動設定
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