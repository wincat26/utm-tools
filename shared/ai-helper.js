// UTM Manager - AI 智慧助手

class AIHelper {
  constructor() {
    this.apiKey = ''; // 用戶需要設定
    this.isEnabled = false;
  }

  // 檢查API Key是否設定
  checkApiKey() {
    this.apiKey = Storage.get('gemini_api_key') || '';
    this.isEnabled = !!this.apiKey;
    return this.isEnabled;
  }

  // 設定API Key
  setApiKey(key) {
    this.apiKey = key;
    Storage.set('gemini_api_key', key);
    this.isEnabled = !!key;
  }

  // 智能填寫UTM參數
  async generateUTM(prompt, websiteUrl = '') {
    if (!this.checkApiKey()) {
      throw new Error('請先設定 Gemini API Key');
    }

    const systemPrompt = `你是UTM參數專家。根據用戶描述，生成標準的UTM參數。

規則：
- 所有參數使用小寫英文、數字、底線
- utm_source: 流量來源 (google, facebook, instagram, newsletter等)
- utm_medium: 媒介類型 (cpc, paid_social, email, social等)  
- utm_campaign: 活動名稱 (具體描述活動)
- utm_term: 關鍵字或細分 (可選)
- utm_content: 素材或位置 (可選)

只回傳JSON格式，不要其他文字：
{"utm_source":"","utm_medium":"","utm_campaign":"","utm_term":"","utm_content":""}`;

    const userPrompt = `網站：${websiteUrl}\n需求：${prompt}`;

    try {
      const response = await this.callGeminiAPI(systemPrompt, userPrompt);
      return this.parseUTMResponse(response);
    } catch (error) {
      throw new Error(`AI生成失敗: ${error.message}`);
    }
  }

  // 基本問答
  async askQuestion(question, context = {}) {
    if (!this.checkApiKey()) {
      throw new Error('請先設定 Gemini API Key');
    }

    const systemPrompt = `你是UTM連結產生器的助手。幫助用戶解決UTM相關問題。

回答要求：
- 簡潔明確，最多3個步驟
- 提供具體的參數建議
- 如果是錯誤，說明可能原因和解決方法
- 用繁體中文回答

當前狀況：
- 網站網址：${context.websiteUrl || '未填寫'}
- UTM參數：${JSON.stringify(context.utmParams || {})}
- 錯誤訊息：${context.error || '無'}`;

    try {
      const response = await this.callGeminiAPI(systemPrompt, question);
      return response;
    } catch (error) {
      throw new Error(`AI回答失敗: ${error.message}`);
    }
  }

  // 錯誤診斷
  diagnoseError(websiteUrl, utmParams, errorMessage) {
    const issues = [];

    // 網址格式檢查
    if (!websiteUrl) {
      issues.push({
        type: 'error',
        message: '請填寫網站網址',
        solution: '輸入完整的網址，例如：https://example.com'
      });
    } else if (!websiteUrl.match(/^https?:\/\/.+/)) {
      issues.push({
        type: 'warning', 
        message: '網址格式可能不正確',
        solution: '確保網址以 http:// 或 https:// 開頭'
      });
    }

    // UTM參數檢查
    if (!utmParams.utm_campaign) {
      issues.push({
        type: 'error',
        message: '活動名稱 (utm_campaign) 為必填',
        solution: '填寫活動名稱，例如：summer_sale_2024'
      });
    }

    // 參數格式檢查
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value && (value.includes(' ') || /[^a-zA-Z0-9_-]/.test(value))) {
        issues.push({
          type: 'warning',
          message: `${key} 包含特殊字元或空格`,
          solution: '建議使用英文、數字、底線或連字號'
        });
      }
    });

    // 常見組合檢查
    if (utmParams.utm_source === 'google' && utmParams.utm_medium !== 'cpc') {
      issues.push({
        type: 'info',
        message: 'Google 廣告通常使用 medium=cpc',
        solution: '考慮將 utm_medium 改為 cpc'
      });
    }

    return issues;
  }

  // 呼叫 Gemini API
  async callGeminiAPI(systemPrompt, userPrompt) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API錯誤: ${response.status}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('API回應格式錯誤');
    }

    return text;
  }

  // 解析UTM回應
  parseUTMResponse(response) {
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('回應中沒有找到JSON格式');
      }
      
      const utmData = JSON.parse(jsonMatch[0]);
      
      // 驗證必要欄位
      if (!utmData.utm_source || !utmData.utm_medium) {
        throw new Error('AI回應缺少必要參數');
      }
      
      return utmData;
    } catch (error) {
      throw new Error(`解析AI回應失敗: ${error.message}`);
    }
  }
}

// 全域AI助手實例
window.aiHelper = new AIHelper();