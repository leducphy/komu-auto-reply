const LOG_STORAGE_KEY = 'mezonAutoClickLogs';

let currentTabId = null;

function setStatusUI(enabled) {
  const toggleBtn = document.getElementById('toggleBtn');

  if (enabled) {
    toggleBtn.innerHTML = '<span>⏸</span><span>Stop</span>';
    toggleBtn.classList.add('running');
  } else {
    toggleBtn.innerHTML = '<span>▶</span><span>Start</span>';
    toggleBtn.classList.remove('running');
  }
}

function renderLogs(logs) {
  const container = document.getElementById('logs');
  const logsCount = document.getElementById('logsCount');
  container.innerHTML = '';

  if (!logs || logs.length === 0) {
    container.innerHTML = '<div class="empty-logs"><div class="empty-logs-icon">📭</div><div class="empty-logs-text">No history yet</div></div>';
    logsCount.textContent = '0';
    return;
  }

  logsCount.textContent = `${logs.length}`;

  // Display newest logs first
  const reversed = [...logs].reverse();

  reversed.forEach((log, idx) => {
    const div = document.createElement('div');
    div.className = 'log-item';

    // Question
    const q = document.createElement('div');
    q.className = 'log-question';
    q.textContent = log.question || '(Unable to retrieve question)';

    // Details
    const info = document.createElement('div');
    info.className = 'log-info';
    
    // Format same as questionTimeText: dd/mm/yyyy, HH:MM
    let clickedDate = '?';
    if (log.clickedAt) {
      const date = new Date(log.clickedAt);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      clickedDate = `${day}/${month}/${year}, ${hours}:${minutes}`;
    }
    
    info.innerHTML = `
      <div class="log-info-row">
        Question sent: <span class="highlight">${log.questionTimeText || '?'}</span>
      </div>
      <div class="log-info-row">
        Answered: <span class="highlight">${clickedDate}</span>
      </div>
    `;

    div.appendChild(q);
    div.appendChild(info);

    container.appendChild(div);
  });
}

function loadLogs() {
  chrome.storage.local.get(LOG_STORAGE_KEY, data => {
    const logs = data[LOG_STORAGE_KEY] || [];
    renderLogs(logs);
  });
}

function askContentScript(message, callback) {
  if (!currentTabId) {
    console.warn('No active Mezon tab found.');
    alert('Please open Mezon tab first!');
    return;
  }
  chrome.tabs.sendMessage(currentTabId, message, response => {
    if (chrome.runtime.lastError) {
      console.warn('Error sendMessage:', chrome.runtime.lastError.message);
      alert('Cannot connect to Mezon page. Please reload the page!');
      return;
    }
    callback && callback(response);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Display version from manifest
  const manifestData = chrome.runtime.getManifest();
  const versionElement = document.getElementById('version');
  if (versionElement && manifestData.version) {
    versionElement.textContent = `v${manifestData.version}`;
  }

  // Get active tab
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];
    if (!tab) {
      console.warn('No tab found');
      return;
    }
    
    currentTabId = tab.id;

    // Ask content script if enabled
    askContentScript({ type: 'GET_ENABLED' }, (res) => {
      if (!res) {
        // If no response, content script may not be loaded yet
        console.warn('No response from content script');
        return;
      }
      setStatusUI(!!res.enabled);
    });
  });

  // Toggle button event
  document.getElementById('toggleBtn').addEventListener('click', () => {
    // Get current state then flip
    askContentScript({ type: 'GET_ENABLED' }, (res) => {
      if (!res) return;
      const newEnabled = !res.enabled;
      askContentScript({ type: 'SET_ENABLED', enabled: newEnabled }, (res2) => {
        if (!res2) return;
        setStatusUI(!!res2.enabled);
      });
    });
  });

  // Reset button (clear logs)
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
      chrome.storage.local.set({ [LOG_STORAGE_KEY]: [] }, () => {
        loadLogs();
      });
    }
  });

  // Refresh log button
  document.getElementById('refreshLogsBtn').addEventListener('click', () => {
    loadLogs();
  });

  // Clear log button
  document.getElementById('clearLogsBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
      chrome.storage.local.set({ [LOG_STORAGE_KEY]: [] }, () => {
        loadLogs();
      });
    }
  });

  // Load logs on first open
  loadLogs();
});
