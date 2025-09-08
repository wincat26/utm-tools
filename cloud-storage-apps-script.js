// Google Apps Script - 雲端資料儲存
// 將此程式碼加入你的 Google Apps Script 專案

function doPost(e) {
  try {
    const action = e.parameter.action;
    const userId = e.parameter.userId || 'anonymous';
    
    switch(action) {
      case 'saveSettings':
        return saveUserSettings(userId, e.parameter);
      case 'loadSettings':
        return loadUserSettings(userId);
      case 'saveRecord':
        return saveUtmRecord(userId, e.parameter);
      case 'loadRecords':
        return loadUtmRecords(userId);
      default:
        return jsonOut({ result: 'error', error: 'unknown_action' });
    }
  } catch (err) {
    return jsonOut({ result: 'error', error: String(err) });
  }
}

// 儲存使用者設定
function saveUserSettings(userId, data) {
  const sheet = getOrCreateSheet('user_settings');
  
  // 查找現有記錄
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === userId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  const settingsData = {
    aiKey: data.aiKey || '',
    syncUrl: data.syncUrl || '',
    templates: data.templates || '[]',
    lastUpdated: new Date().toISOString()
  };
  
  if (rowIndex > 0) {
    // 更新現有記錄
    sheet.getRange(rowIndex, 2, 1, 4).setValues([[
      settingsData.aiKey,
      settingsData.syncUrl, 
      settingsData.templates,
      settingsData.lastUpdated
    ]]);
  } else {
    // 新增記錄
    sheet.appendRow([
      userId,
      settingsData.aiKey,
      settingsData.syncUrl,
      settingsData.templates,
      settingsData.lastUpdated
    ]);
  }
  
  return jsonOut({ result: 'success' });
}

// 載入使用者設定
function loadUserSettings(userId) {
  const sheet = getOrCreateSheet('user_settings');
  const values = sheet.getDataRange().getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === userId) {
      return jsonOut({
        result: 'success',
        data: {
          aiKey: values[i][1] || '',
          syncUrl: values[i][2] || '',
          templates: values[i][3] || '[]',
          lastUpdated: values[i][4]
        }
      });
    }
  }
  
  return jsonOut({ result: 'success', data: null });
}

// 儲存UTM記錄
function saveUtmRecord(userId, data) {
  const sheet = getOrCreateSheet('utm_records');
  
  sheet.appendRow([
    userId,
    data.timestamp || new Date().toISOString(),
    data.websiteUrl || '',
    data.finalUrl || '',
    data.utmSource || '',
    data.utmMedium || '',
    data.utmCampaign || '',
    data.utmTerm || '',
    data.utmContent || '',
    data.shortUrl || ''
  ]);
  
  return jsonOut({ result: 'success' });
}

// 載入UTM記錄
function loadUtmRecords(userId) {
  const sheet = getOrCreateSheet('utm_records');
  const values = sheet.getDataRange().getValues();
  const records = [];
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === userId) {
      records.push({
        timestamp: values[i][1],
        websiteUrl: values[i][2],
        finalUrl: values[i][3],
        utmSource: values[i][4],
        utmMedium: values[i][5],
        utmCampaign: values[i][6],
        utmTerm: values[i][7],
        utmContent: values[i][8],
        shortUrl: values[i][9]
      });
    }
  }
  
  return jsonOut({
    result: 'success',
    data: records.reverse() // 最新的在前面
  });
}

// 取得或建立工作表
function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // 設定標題列
    if (sheetName === 'user_settings') {
      sheet.getRange(1, 1, 1, 5).setValues([[
        'userId', 'aiKey', 'syncUrl', 'templates', 'lastUpdated'
      ]]);
    } else if (sheetName === 'utm_records') {
      sheet.getRange(1, 1, 1, 10).setValues([[
        'userId', 'timestamp', 'websiteUrl', 'finalUrl', 
        'utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent', 'shortUrl'
      ]]);
    }
  }
  
  return sheet;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}