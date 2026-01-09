(function() {
    'use strict';
  
    const TARGET_CONTAINER_CLASS = 'flex flex-row gap-2 py-2';
    const BUTTON_CLASS_LIST = [
      'px-5', 'py-1', 'rounded', 'bg-buttonPrimary',
      'text-white', 'font-medium',
      'hover\\:bg-opacity-70', 'active\\:bg-opacity-80'
    ];
    const BUTTON_SELECTOR = 'button.' + BUTTON_CLASS_LIST.join('.');
  
    const LOG_STORAGE_KEY = 'mezonAutoClickLogs';
    const ENABLED_KEY = 'mezonAutoClickEnabled';
  
    const processedContainers = new WeakSet();

    let enabled = true;
    let observing = false;
  
    // Get question info, sender, and timestamp from UI
    function getMetaFromContainer(container) {
      // Root div of message (pl-[72px] ...)
      const root = container.closest('div[class*="pl-[72px]"]');
      if (!root) return {};

      // Question: [EXCEL] ..., [JAVA] ...
      const questionSpan = root.querySelector('span.font-semibold.text-theme-message');
      const questionText = questionSpan?.innerText?.trim() || null;

      // Sender: KOMU
      const authorDiv = root.querySelector('div.username');
      const author = authorDiv?.innerText?.trim() || null;

      // Timestamp displayed after name: 24/11/2025, 14:01
      const timeDiv = root.querySelector('div.pl-1.text-theme-primary');
      const questionTimeText = timeDiv?.innerText?.trim() || null;

      return { questionText, author, questionTimeText };
    }

    function appendLog(entry) {
      chrome.storage.local.get(LOG_STORAGE_KEY, data => {
        const logs = data[LOG_STORAGE_KEY] || [];
        logs.push(entry);
        chrome.storage.local.set({ [LOG_STORAGE_KEY]: logs }, () => {
          console.log('[MEZON AUTO CLICK LOG]', entry);
        });
      });
    }
  
    function clickButtonRandomlyFrom(containers) {
      if (!enabled) return;

      const unprocessed = containers.filter(el => !processedContainers.has(el));
      if (unprocessed.length === 0) return;

      const randomContainer = unprocessed[Math.floor(Math.random() * unprocessed.length)];
      const button = randomContainer.querySelector(BUTTON_SELECTOR);
      if (!button) return;

      processedContainers.add(randomContainer);

      const { questionText, author, questionTimeText } = getMetaFromContainer(randomContainer);
      const answerText = button.innerText.trim();
      const clickedAt = new Date().toISOString();

      const delay = 5000 + Math.random() * 1000; // 5–6s
      setTimeout(() => {
        if (!enabled) return; // Skip if disabled mid-way

        button.click();
        console.log('[MEZON AUTO CLICK] Clicked:', answerText, 'Question:', questionText);

        appendLog({
          clickedAt,
          url: window.location.href,
          question: questionText,
          answer: answerText,
          author,
          questionTimeText
        });
      }, delay);
    }
  
    const observer = new MutationObserver((mutations) => {
      if (!enabled) return;
      let newContainers = [];

      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;

          // Node is the button row
          if (
            node.classList?.contains('flex') &&
            node.classList.contains('flex-row') &&
            node.classList.contains('gap-2') &&
            node.classList.contains('py-2')
          ) {
            newContainers.push(node);
          }

          // Find nested nodes (backup)
          const nested = node.querySelectorAll?.(
            '.' + TARGET_CONTAINER_CLASS.split(' ').join('.')
          );
          if (nested?.length) newContainers.push(...nested);
        });
      }

      if (newContainers.length > 0) {
        clickButtonRandomlyFrom(newContainers);
      }
    });
  
    function startObserver() {
      if (observing) return;
      if (!document.body) {
        setTimeout(startObserver, 500);
        return;
      }
  
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
  
      observing = true;
      console.log('[MEZON AUTO CLICK] Observer started');
    }
  
    function stopObserver() {
      if (!observing) return;
      observer.disconnect();
      observing = false;
      console.log('[MEZON AUTO CLICK] Observer stopped');
    }
  
    // Receive messages from popup to toggle on/off + get status
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg?.type === 'SET_ENABLED') {
        enabled = !!msg.enabled;
        chrome.storage.local.set({ [ENABLED_KEY]: enabled }, () => {
          if (enabled) startObserver();
          else stopObserver();
          sendResponse({ enabled });
        });
        return true; // async
      }
  
      if (msg?.type === 'GET_ENABLED') {
        sendResponse({ enabled });
        return true;
      }
  
      if (msg?.type === 'GET_LOGS') {
        chrome.storage.local.get(LOG_STORAGE_KEY, data => {
          sendResponse({ logs: data[LOG_STORAGE_KEY] || [] });
        });
        return true;
      }
  
      if (msg?.type === 'CLEAR_LOGS') {
        chrome.storage.local.set({ [LOG_STORAGE_KEY]: [] }, () => {
          sendResponse({ ok: true });
        });
        return true;
      }
  
      return false;
    });
  
    // Initialize: read enabled state from storage
    chrome.storage.local.get(ENABLED_KEY, data => {
      enabled = data[ENABLED_KEY];
      if (enabled === undefined) {
        enabled = true; // Default on
        chrome.storage.local.set({ [ENABLED_KEY]: true });
      }
      console.log('[MEZON AUTO CLICK] Enabled =', enabled);
      if (enabled) startObserver();
    });
  })();
  