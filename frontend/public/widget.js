(function() {
  // 1. 获取配置信息
  const scriptTag = document.currentScript;
  const agentId = scriptTag.getAttribute('data-agent-id');
  const baseUrl = new URL(scriptTag.src).origin;
  
  if (!agentId) {
    console.error('Chart AI Widget: data-agent-id is required');
    return;
  }

  // 2. 创建样式
  const style = document.createElement('style');
  style.textContent = `
    .chart-ai-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: sans-serif;
    }
    .chart-ai-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .chart-ai-bubble:hover {
      transform: scale(1.1);
    }
    .chart-ai-bubble svg {
      width: 30px;
      height: 30px;
      fill: white;
    }
    .chart-ai-iframe-container {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 120px);
      max-width: calc(100vw - 40px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      overflow: hidden;
      display: none;
      flex-direction: column;
      transform-origin: bottom right;
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 0;
      transform: scale(0.8);
    }
    .chart-ai-iframe-container.open {
      display: flex;
      opacity: 1;
      transform: scale(1);
    }
    .chart-ai-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `;
  document.head.appendChild(style);

  // 3. 创建 DOM
  const container = document.createElement('div');
  container.className = 'chart-ai-widget-container';
  
  const bubble = document.createElement('div');
  bubble.className = 'chart-ai-bubble';
  bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;
  
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'chart-ai-iframe-container';
  
  const iframe = document.createElement('iframe');
  iframe.className = 'chart-ai-iframe';
  iframe.src = `${baseUrl}/agent/${agentId}/widget`;
  
  iframeContainer.appendChild(iframe);
  container.appendChild(iframeContainer);
  container.appendChild(bubble);
  document.body.appendChild(container);

  // 4. 事件绑定
  let isOpen = false;
  bubble.onclick = function() {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.display = 'flex';
      setTimeout(() => iframeContainer.classList.add('open'), 10);
    } else {
      iframeContainer.classList.remove('open');
      setTimeout(() => iframeContainer.style.display = 'none', 300);
    }
  };
})();
