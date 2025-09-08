// UTM Manager - AI 對話系統

// AI 對話系統
function addAIMessage(content, isUser = false, hasActions = false) {
  const messagesContainer = document.getElementById('aiMessages');
  const chatArea = document.getElementById('aiChatArea');
  
  chatArea.classList.remove('hidden');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  
  const messageContent = document.createElement('div');
  messageContent.className = `max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
    isUser 
      ? 'bg-purple-500 text-white' 
      : 'bg-white border border-gray-200 text-gray-800'
  }`;
  
  if (hasActions && !isUser) {
    messageContent.innerHTML = parseAIResponse(content);
  } else {
    messageContent.innerHTML = content.replace(/\n/g, '<br>');
  }
  
  messageDiv.appendChild(messageContent);
  messagesContainer.appendChild(messageDiv);
  
  chatArea.scrollTop = chatArea.scrollHeight;
}

function parseAIResponse(content) {
  const utmRegex = /utm_(source|medium|campaign|term|content)\s*[:：]\s*['"]?([^'"\n,]+)['"]?/gi;
  const matches = [...content.matchAll(utmRegex)];
  
  if (matches.length > 0) {
    let html = content.replace(/\n/g, '<br>');
    
    const utmParams = {};
    matches.forEach(match => {
      const param = match[1].toLowerCase();
      const value = match[2].trim();
      utmParams[`utm_${param}`] = value;
    });
    
    if (Object.keys(utmParams).length > 0) {
      html += `
        <div class="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div class="text-sm font-medium text-purple-900 mb-2">✨ 建議的 UTM 參數</div>
          <div class="space-y-1 text-xs text-purple-700 mb-3">`;
      
      Object.entries(utmParams).forEach(([key, value]) => {
        html += `<div><strong>${key}:</strong> ${value}</div>`;
      });
      
      html += `</div>
          <button onclick="applyAIRecommendation(${JSON.stringify(utmParams).replace(/"/g, '&quot;')})" 
                  class="w-full bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">
            <i class="fas fa-magic mr-1"></i> 套用到表單
          </button>
        </div>`;
    }
    
    return html;
  }
  
  return content.replace(/\n/g, '<br>');
}

function applyAIRecommendation(utmParams) {
  Object.entries(utmParams).forEach(([key, value]) => {
    const element = document.getElementById(key.replace('utm_', 'utm'));
    if (element) {
      element.value = value;
    }
  });
  
  updatePreview();
  showStatus('✨ AI 建議已套用到表單！', 'success');
  
  document.querySelector('.space-y-6').scrollIntoView({ behavior: 'smooth' });
}

async function sendAIMessage() {
  const input = document.getElementById('aiPrompt');
  const message = input.value.trim();
  
  if (!message) return;
  
  addAIMessage(message, true);
  input.value = '';
  
  addAIMessage('<i class="fas fa-spinner fa-spin"></i> 正在思考...');
  
  try {
    const context = {
      websiteUrl: elements.websiteUrl.value.trim(),
      utmParams: {
        utm_source: elements.utmSource.value.trim(),
        utm_medium: elements.utmMedium.value.trim(),
        utm_campaign: elements.utmCampaign.value.trim(),
        utm_term: elements.utmTerm.value.trim(),
        utm_content: elements.utmContent.value.trim()
      }
    };
    
    const response = await aiHelper.askQuestion(message, context);
    
    const messages = document.getElementById('aiMessages');
    messages.removeChild(messages.lastChild);
    
    addAIMessage(response, false, true);
    
  } catch (error) {
    const messages = document.getElementById('aiMessages');
    messages.removeChild(messages.lastChild);
    
    addAIMessage(`❗ 錯誤：${error.message}`, false);
    
    if (error.message.includes('API Key')) {
      showAISettings();
    }
  }
}

async function generateWithAI() {
  const prompt = document.getElementById('aiPrompt').value.trim() || '請為我生成 UTM 參數';
  document.getElementById('aiPrompt').value = prompt;
  await sendAIMessage();
}

async function askAI() {
  const prompt = document.getElementById('aiPrompt').value.trim() || '請給我 UTM 追蹤的建議';
  document.getElementById('aiPrompt').value = prompt;
  await sendAIMessage();
}

function clearAIChat() {
  document.getElementById('aiMessages').innerHTML = '';
  document.getElementById('aiChatArea').classList.add('hidden');
}

// 全域函數
window.addAIMessage = addAIMessage;
window.parseAIResponse = parseAIResponse;
window.applyAIRecommendation = applyAIRecommendation;
window.sendAIMessage = sendAIMessage;
window.generateWithAI = generateWithAI;
window.askAI = askAI;
window.clearAIChat = clearAIChat;