// UTM Manager - Google Sheets 同步功能

class SyncManager {
  constructor() {
    this.apiUrl = '';
    this.isConfigured = false;
  }

  // 檢查同步設定
  checkConfig() {
    this.apiUrl = Storage.get('sync_api_url') || '';
    this.isConfigured = !!this.apiUrl;
    return this.isConfigured;
  }

  // 設定同步API URL
  setApiUrl(url) {
    this.apiUrl = url;
    Storage.set('sync_api_url', url);
    this.isConfigured = !!url;
  }

  // 同步單筆記錄到Google Sheet
  async syncRecord(record) {
    if (!this.checkConfig()) {
      throw new Error('請先設定 Google Apps Script URL');
    }

    // 使用表單提交方式（配合新的Apps Script）
    return this.syncWithForm(record);
  }

  // 使用表單提交（配合Apps Script的e.parameter）
  syncWithForm(record) {
    return new Promise((resolve, reject) => {
      // 使用URLSearchParams建立表單資料
      const formData = new URLSearchParams();
      formData.append('timestamp', record.timestamp || new Date().toISOString());
      formData.append('executedBy', 'UTM Manager');
      formData.append('websiteUrl', record.websiteUrl || '');
      formData.append('fullUtmLink', record.finalUrl || '');
      formData.append('utmSource', record.utmSource || '');
      formData.append('utmMedium', record.utmMedium || '');
      formData.append('utmCampaign', record.utmCampaign || '');
      formData.append('utmTerm', record.utmTerm || '');
      formData.append('utmContent', record.utmContent || '');
      formData.append('shortUrl', record.shortUrl || ''); // 新增短網址欄位

      console.log('準備提交資料:', Object.fromEntries(formData));

      // 使用fetch提交表單資料
      fetch(this.apiUrl, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        console.log('提交回應:', response.status, response.statusText);
        if (response.ok) {
          return response.json();
        }
        throw new Error(`HTTP ${response.status}`);
      })
      .then(result => {
        console.log('API回應:', result);
        if (result.result === 'success') {
          resolve({ success: true });
        } else {
          reject(new Error(result.error || '同步失敗'));
        }
      })
      .catch(error => {
        console.error('同步錯誤:', error);
        // 即使fetch失敗，也可能已經成功寫入
        resolve({ success: true, warning: '無法確認結果，請檢查Google Sheet' });
      });
    });
  }

  // 批次同步多筆記錄
  async syncMultipleRecords(records, onProgress = null) {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < records.length; i++) {
      try {
        await this.syncRecord(records[i]);
        results.push({ index: i, success: true });
        successCount++;
      } catch (error) {
        results.push({ index: i, success: false, error: error.message });
        errorCount++;
      }

      // 回報進度
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: records.length,
          successCount,
          errorCount
        });
      }

      // 避免API限制，每次請求間隔100ms
      if (i < records.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return {
      total: records.length,
      successCount,
      errorCount,
      results
    };
  }

  // 測試連線
  async testConnection() {
    if (!this.checkConfig()) {
      throw new Error('請先設定 Google Apps Script URL');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET'
      });
      
      const text = await response.text();
      if (text.includes('UTM link builder')) {
        return { success: true, message: '連線正常' };
      } else {
        throw new Error('API回應異常');
      }
    } catch (error) {
      throw new Error(`連線測試失敗: ${error.message}`);
    }
  }
}

// 全域同步管理器實例
window.syncManager = new SyncManager();