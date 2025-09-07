// UTM Manager - 共用工具函數

// 導航功能
function initNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navTabs = document.querySelectorAll('.nav-tab');
  
  navTabs.forEach(tab => {
    const href = tab.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      tab.classList.add('active');
    }
  });
}

// UTM 連結生成
function buildUtmUrl(baseUrl, params) {
  try {
    const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
    
    // 移除現有UTM參數
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      url.searchParams.delete(param);
    });
    
    // 添加新UTM參數
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        url.searchParams.set(key, value.trim());
      }
    });
    
    return url.toString();
  } catch (error) {
    return null;
  }
}

// 複製到剪貼簿
async function copyToClipboard(text) {
  try {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    return true;
  } catch (error) {
    return false;
  }
}

// 顯示狀態訊息
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('statusMessage');
  if (!statusEl) return;
  
  statusEl.textContent = message;
  statusEl.className = `status-message status-${type}`;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status-message';
  }, 3000);
}

// 本地儲存
const Storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
});