// UTM Manager - Google SSO 認證

class AuthManager {
  constructor() {
    this.user = null;
    this.isLoggedIn = false;
    this.clientId = ''; // 需要設定Google OAuth Client ID
  }

  // 初始化Google登入
  async initGoogleAuth() {
    this.clientId = Storage.get('google_client_id') || '';
    
    if (!this.clientId) {
      console.log('未設定Google Client ID');
      return false;
    }

    try {
      // 載入Google Identity Services
      await this.loadGoogleScript();
      
      // 初始化Google登入（符合OAuth 2.0政策）
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true
      });

      // 檢查是否已登入
      this.checkExistingLogin();
      return true;
    } catch (error) {
      console.error('Google登入初始化失敗:', error);
      return false;
    }
  }

  // 載入Google Script
  loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 處理登入回應
  handleCredentialResponse(response) {
    try {
      // 解析JWT token
      const payload = this.parseJWT(response.credential);
      
      this.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };
      
      this.isLoggedIn = true;
      
      // 儲存登入狀態
      Storage.set('user_info', this.user);
      Storage.set('login_time', Date.now());
      
      console.log('登入成功:', this.user);
      this.onLoginSuccess();
      
    } catch (error) {
      console.error('登入處理失敗:', error);
    }
  }

  // 解析JWT Token
  parseJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  // 檢查現有登入狀態
  checkExistingLogin() {
    const userInfo = Storage.get('user_info');
    const loginTime = Storage.get('login_time');
    
    // 檢查登入是否過期（7天）
    if (userInfo && loginTime && (Date.now() - loginTime < 7 * 24 * 60 * 60 * 1000)) {
      this.user = userInfo;
      this.isLoggedIn = true;
      this.onLoginSuccess();
    }
  }

  // 顯示登入按鈕
  showLoginButton(containerId) {
    if (!this.clientId) {
      document.getElementById(containerId).innerHTML = `
        <div class="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-800 mb-2">需要設定Google OAuth</p>
          <button onclick="authManager.setupGoogleOAuth()" class="btn-secondary text-sm">設定登入</button>
        </div>
      `;
      return;
    }

    // 使用符合政策的登入按鈕設定
    google.accounts.id.renderButton(
      document.getElementById(containerId),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        locale: 'zh_TW',
        type: 'standard',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250
      }
    );
  }

  // 登出
  logout() {
    this.user = null;
    this.isLoggedIn = false;
    Storage.remove('user_info');
    Storage.remove('login_time');
    
    // 清除個人化資料
    this.clearPersonalData();
    
    // 重新載入頁面
    window.location.reload();
  }

  // 清除個人化資料
  clearPersonalData() {
    Storage.remove('user_templates');
    Storage.remove('utm_records');
    Storage.remove('short_urls');
  }

  // 取得使用者專屬的儲存key
  getUserKey(key) {
    if (!this.isLoggedIn || !this.user) {
      return key; // 未登入時使用原始key
    }
    return `${this.user.id}_${key}`;
  }

  // 設定Google OAuth
  setupGoogleOAuth() {
    const message = 
      '請輸入Google OAuth Client ID：\n\n' +
      '⚠️ 重要提醒：\n' +
      '• 確保你的應用已通過Google驗證\n' +
      '• 或在Google Cloud Console中將應用設為「測試」模式\n' +
      '• 並將使用者加入測試使用者清單\n\n' +
      '取得方式：\n' +
      '1. 前往 https://console.cloud.google.com\n' +
      '2. 建立專案並啟用Google+ API\n' +
      '3. 建立OAuth 2.0用戶端ID\n' +
      '4. 設定OAuth同意畫面為「測試」模式\n' +
      '5. 複製Client ID';
    
    const clientId = prompt(message);
    
    if (clientId && clientId.trim()) {
      Storage.set('google_client_id', clientId.trim());
      alert('Google Client ID已設定，請重新整理頁面');
      window.location.reload();
    }
  }

  // 登入成功回調
  onLoginSuccess() {
    // 更新UI顯示
    this.updateUserUI();
    
    // 載入個人化資料
    this.loadPersonalData();
  }

  // 更新使用者UI
  updateUserUI() {
    const userInfoElements = document.querySelectorAll('.user-info');
    userInfoElements.forEach(el => {
      if (this.isLoggedIn) {
        el.innerHTML = `
          <div class="flex items-center gap-2">
            <img src="${this.user.picture}" alt="頭像" class="w-6 h-6 rounded-full">
            <span class="text-sm">${this.user.name}</span>
            <button onclick="authManager.logout()" class="text-xs text-gray-500 hover:text-gray-700">登出</button>
          </div>
        `;
      } else {
        el.innerHTML = '<div id="google-signin-button"></div>';
        this.showLoginButton('google-signin-button');
      }
    });
  }

  // 載入個人化資料
  loadPersonalData() {
    // 這裡可以從雲端載入使用者的個人化設定
    console.log('載入個人化資料:', this.user.email);
  }
}

// 覆寫Storage類別以支援個人化
const OriginalStorage = window.Storage;
window.Storage = {
  get: (key) => {
    const userKey = window.authManager ? window.authManager.getUserKey(key) : key;
    return OriginalStorage.get(userKey);
  },
  
  set: (key, value) => {
    const userKey = window.authManager ? window.authManager.getUserKey(key) : key;
    return OriginalStorage.set(userKey, value);
  },
  
  remove: (key) => {
    const userKey = window.authManager ? window.authManager.getUserKey(key) : key;
    return OriginalStorage.remove(userKey);
  }
};

// 全域認證管理器
window.authManager = new AuthManager();