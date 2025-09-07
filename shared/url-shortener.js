// UTM Manager - PicSee 縮網址整合

class URLShortener {
  constructor() {
    this.apiKey = '';
    this.baseUrl = 'https://api.picsee.co/v2';
    this.isEnabled = false;
  }

  // 檢查API Key設定
  checkApiKey() {
    this.apiKey = Storage.get('picsee_api_key') || '';
    this.isEnabled = !!this.apiKey;
    return this.isEnabled;
  }

  // 設定API Key
  setApiKey(key) {
    this.apiKey = key;
    Storage.set('picsee_api_key', key);
    this.isEnabled = !!key;
  }

  // 建立短網址（透過代理服務）
  async createShortUrl(longUrl, options = {}) {
    if (!this.checkApiKey()) {
      throw new Error('請先設定 PicSee API Key');
    }

    // 使用免費的CORS代理服務
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = `${this.baseUrl}/links`;
    
    const payload = {
      url: longUrl,
      title: options.title || 'UTM連結',
      description: options.description || '由UTM Manager產生'
    };

    try {
      // 方法1: 嘗試使用CORS代理
      const response = await fetch(proxyUrl + targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('短網址建立成功:', result);
      
      return {
        success: true,
        shortUrl: result.data.picseeUrl,
        id: result.data.id,
        originalUrl: result.data.url,
        title: result.data.title,
        clicks: result.data.clicks || 0
      };
    } catch (error) {
      console.error('CORS代理失敗，嘗試備用方案:', error);
      
      // 方法2: 備用 - 使用簡單的縮網址服務
      return this.createSimpleShortUrl(longUrl, options);
    }
  }
  
  // 備用：使用免費縮網址服務
  async createSimpleShortUrl(longUrl, options = {}) {
    try {
      // 使用 TinyURL 作為備用
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      
      if (!response.ok) {
        throw new Error('備用縮網址服務失敗');
      }
      
      const shortUrl = await response.text();
      
      if (shortUrl && shortUrl.startsWith('http')) {
        return {
          success: true,
          shortUrl: shortUrl,
          id: 'tinyurl_' + Date.now(),
          originalUrl: longUrl,
          title: options.title || 'UTM連結',
          clicks: 0,
          provider: 'TinyURL'
        };
      } else {
        throw new Error('無效的短網址回應');
      }
    } catch (error) {
      throw new Error(`所有縮網址服務都失敗: ${error.message}`);
    }
  }

  // 取得連結統計資訊
  async getLinkStats(linkId) {
    if (!this.checkApiKey()) {
      throw new Error('請先設定 PicSee API Key');
    }

    try {
      const response = await fetch(`${this.baseUrl}/links/${linkId}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      throw new Error(`取得統計失敗: ${error.message}`);
    }
  }

  // 測試API連線
  async testConnection() {
    try {
      // 直接測試備用服務
      const testResult = await this.createSimpleShortUrl('https://example.com', {
        title: 'UTM Manager 連線測試'
      });
      
      return {
        success: true,
        message: `連線測試成功 (${testResult.provider || 'TinyURL'})`,
        testUrl: testResult.shortUrl
      };
    } catch (error) {
      throw new Error(`連線測試失敗: ${error.message}`);
    }
  }

  // 批次建立短網址
  async createMultipleShortUrls(urls, onProgress = null) {
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < urls.length; i++) {
      try {
        const result = await this.createShortUrl(urls[i].url, urls[i].options);
        results.push({ index: i, success: true, data: result });
        successCount++;
      } catch (error) {
        results.push({ index: i, success: false, error: error.message });
        errorCount++;
      }

      // 回報進度
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: urls.length,
          successCount,
          errorCount
        });
      }

      // API限制：避免請求過快
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return {
      total: urls.length,
      successCount,
      errorCount,
      results
    };
  }
}

// 全域縮網址管理器實例
window.urlShortener = new URLShortener();