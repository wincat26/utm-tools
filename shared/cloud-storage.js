// UTM Manager - 雲端儲存功能

class CloudStorage {
  constructor() {
    this.apiUrl = '';
    this.userId = this.getUserId();
    this.isEnabled = false;
  }

  // 取得或生成使用者ID
  getUserId() {
    let userId = localStorage.getItem('utm_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('utm_user_id', userId);
    }
    return userId;
  }

  // 設定雲端儲存API
  setApiUrl(url) {
    this.apiUrl = url;
    this.isEnabled = !!url;
    localStorage.setItem('cloud_storage_url', url);
  }

  // 檢查雲端儲存設定
  checkConfig() {
    this.apiUrl = localStorage.getItem('cloud_storage_url') || '';
    this.isEnabled = !!this.apiUrl;
    return this.isEnabled;
  }

  // 同步設定到雲端
  async syncSettings() {
    if (!this.checkConfig()) return false;

    try {
      const settings = {
        action: 'saveSettings',
        userId: this.userId,
        aiKey: Storage.get('gemini_api_key') || '',
        syncUrl: Storage.get('sync_api_url') || '',
        templates: JSON.stringify(Storage.get('user_templates') || [])
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: new URLSearchParams(settings)
      });

      const result = await response.json();
      return result.result === 'success';
    } catch (error) {
      console.error('同步設定失敗:', error);
      return false;
    }
  }

  // 從雲端載入設定
  async loadSettings() {
    if (!this.checkConfig()) return false;

    try {
      const params = new URLSearchParams({
        action: 'loadSettings',
        userId: this.userId
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: params
      });

      const result = await response.json();
      
      if (result.result === 'success' && result.data) {
        // 載入設定到本地
        if (result.data.aiKey) {
          Storage.set('gemini_api_key', result.data.aiKey);
        }
        if (result.data.syncUrl) {
          Storage.set('sync_api_url', result.data.syncUrl);
        }
        if (result.data.templates) {
          const templates = JSON.parse(result.data.templates);
          Storage.set('user_templates', templates);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('載入設定失敗:', error);
      return false;
    }
  }

  // 同步UTM記錄到雲端
  async syncRecord(record) {
    if (!this.checkConfig()) return false;

    try {
      const data = {
        action: 'saveRecord',
        userId: this.userId,
        ...record
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: new URLSearchParams(data)
      });

      const result = await response.json();
      return result.result === 'success';
    } catch (error) {
      console.error('同步記錄失敗:', error);
      return false;
    }
  }

  // 從雲端載入UTM記錄
  async loadRecords() {
    if (!this.checkConfig()) return [];

    try {
      const params = new URLSearchParams({
        action: 'loadRecords',
        userId: this.userId
      });

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: params
      });

      const result = await response.json();
      
      if (result.result === 'success' && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('載入記錄失敗:', error);
      return [];
    }
  }

  // 自動同步（在背景執行）
  async autoSync() {
    if (!this.isEnabled) return;

    try {
      // 同步設定
      await this.syncSettings();
      
      // 同步最近的記錄
      const recentRecords = Storage.get('utm_records') || [];
      const lastSyncTime = localStorage.getItem('last_sync_time') || '0';
      
      for (const record of recentRecords) {
        if (new Date(record.timestamp).getTime() > parseInt(lastSyncTime)) {
          await this.syncRecord(record);
        }
      }
      
      localStorage.setItem('last_sync_time', Date.now().toString());
    } catch (error) {
      console.error('自動同步失敗:', error);
    }
  }

  // 完整同步（雙向）
  async fullSync() {
    if (!this.checkConfig()) {
      throw new Error('請先設定雲端儲存');
    }

    try {
      // 1. 上傳本地設定
      await this.syncSettings();
      
      // 2. 下載雲端設定（如果雲端更新）
      await this.loadSettings();
      
      // 3. 同步記錄
      const localRecords = Storage.get('utm_records') || [];
      const cloudRecords = await this.loadRecords();
      
      // 合併記錄（去重）
      const allRecords = [...localRecords];
      const localTimestamps = new Set(localRecords.map(r => r.timestamp));
      
      for (const cloudRecord of cloudRecords) {
        if (!localTimestamps.has(cloudRecord.timestamp)) {
          allRecords.push(cloudRecord);
        }
      }
      
      // 排序並儲存
      allRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      Storage.set('utm_records', allRecords);
      
      return {
        success: true,
        localCount: localRecords.length,
        cloudCount: cloudRecords.length,
        totalCount: allRecords.length
      };
    } catch (error) {
      throw new Error(`完整同步失敗: ${error.message}`);
    }
  }
}

// 全域雲端儲存實例
window.cloudStorage = new CloudStorage();