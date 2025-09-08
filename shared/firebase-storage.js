// UTM Manager - Firebase 雲端儲存

class FirebaseStorage {
  constructor() {
    this.db = null;
    this.auth = null;
    this.user = null;
    this.isInitialized = false;
  }

  // 初始化 Firebase
  async initialize() {
    if (this.isInitialized) return true;

    try {
      // Firebase 配置（需要用戶設定）
      const config = this.getFirebaseConfig();
      if (!config) {
        console.log('Firebase 未設定');
        return false;
      }

      // 初始化 Firebase
      if (!window.firebase) {
        throw new Error('Firebase SDK 未載入');
      }

      firebase.initializeApp(config);
      this.db = firebase.firestore();
      this.auth = firebase.auth();

      // 監聽登入狀態
      this.auth.onAuthStateChanged((user) => {
        this.user = user;
        if (user) {
          console.log('Firebase 用戶已登入:', user.email);
        }
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Firebase 初始化失敗:', error);
      return false;
    }
  }

  // 取得 Firebase 配置
  getFirebaseConfig() {
    const config = localStorage.getItem('firebase_config');
    return config ? JSON.parse(config) : null;
  }

  // 設定 Firebase 配置
  setFirebaseConfig(config) {
    localStorage.setItem('firebase_config', JSON.stringify(config));
    this.isInitialized = false; // 重新初始化
  }

  // 匿名登入
  async signInAnonymously() {
    if (!this.auth) return false;

    try {
      const result = await this.auth.signInAnonymously();
      this.user = result.user;
      return true;
    } catch (error) {
      console.error('匿名登入失敗:', error);
      return false;
    }
  }

  // Google 登入
  async signInWithGoogle() {
    if (!this.auth) return false;

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.auth.signInWithPopup(provider);
      this.user = result.user;
      return true;
    } catch (error) {
      console.error('Google 登入失敗:', error);
      return false;
    }
  }

  // 登出
  async signOut() {
    if (!this.auth) return;
    
    try {
      await this.auth.signOut();
      this.user = null;
    } catch (error) {
      console.error('登出失敗:', error);
    }
  }

  // 取得用戶ID
  getUserId() {
    if (this.user) {
      return this.user.uid;
    }
    
    // 如果未登入，使用本地ID
    let localId = localStorage.getItem('utm_local_id');
    if (!localId) {
      localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('utm_local_id', localId);
    }
    return localId;
  }

  // 儲存用戶設定
  async saveSettings(settings) {
    if (!this.db) return false;

    try {
      const userId = this.getUserId();
      await this.db.collection('users').doc(userId).set({
        settings: settings,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('儲存設定失敗:', error);
      return false;
    }
  }

  // 載入用戶設定
  async loadSettings() {
    if (!this.db) return null;

    try {
      const userId = this.getUserId();
      const doc = await this.db.collection('users').doc(userId).get();
      
      if (doc.exists) {
        return doc.data().settings || null;
      }
      return null;
    } catch (error) {
      console.error('載入設定失敗:', error);
      return null;
    }
  }

  // 儲存 UTM 記錄
  async saveRecord(record) {
    if (!this.db) return false;

    try {
      const userId = this.getUserId();
      await this.db.collection('utm_records').add({
        userId: userId,
        ...record,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('儲存記錄失敗:', error);
      return false;
    }
  }

  // 載入 UTM 記錄
  async loadRecords(limit = 100) {
    if (!this.db) return [];

    try {
      const userId = this.getUserId();
      const snapshot = await this.db.collection('utm_records')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const records = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp || data.createdAt?.toDate()?.toISOString()
        });
      });

      return records;
    } catch (error) {
      console.error('載入記錄失敗:', error);
      return [];
    }
  }

  // 刪除記錄
  async deleteRecord(recordId) {
    if (!this.db) return false;

    try {
      await this.db.collection('utm_records').doc(recordId).delete();
      return true;
    } catch (error) {
      console.error('刪除記錄失敗:', error);
      return false;
    }
  }

  // 完整同步
  async fullSync() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.db) {
      throw new Error('Firebase 未初始化');
    }

    try {
      // 1. 同步設定
      const localSettings = {
        aiKey: Storage.get('gemini_api_key') || '',
        syncUrl: Storage.get('sync_api_url') || '',
        templates: Storage.get('user_templates') || []
      };

      await this.saveSettings(localSettings);

      // 2. 載入雲端設定
      const cloudSettings = await this.loadSettings();
      if (cloudSettings) {
        if (cloudSettings.aiKey) Storage.set('gemini_api_key', cloudSettings.aiKey);
        if (cloudSettings.syncUrl) Storage.set('sync_api_url', cloudSettings.syncUrl);
        if (cloudSettings.templates) Storage.set('user_templates', cloudSettings.templates);
      }

      // 3. 同步記錄
      const localRecords = Storage.get('utm_records') || [];
      const cloudRecords = await this.loadRecords();

      // 上傳本地記錄到雲端
      for (const record of localRecords) {
        const exists = cloudRecords.some(cr => cr.timestamp === record.timestamp);
        if (!exists) {
          await this.saveRecord(record);
        }
      }

      // 合併雲端記錄到本地
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
      throw new Error(`Firebase 同步失敗: ${error.message}`);
    }
  }

  // 即時監聽記錄變化
  listenToRecords(callback) {
    if (!this.db) return null;

    const userId = this.getUserId();
    return this.db.collection('utm_records')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const records = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          records.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp || data.createdAt?.toDate()?.toISOString()
          });
        });
        callback(records);
      });
  }
}

// 全域 Firebase 儲存實例
window.firebaseStorage = new FirebaseStorage();