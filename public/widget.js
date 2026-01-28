(function() {
  // 获取脚本参数
  const script = document.currentScript;
  const agentId = script.getAttribute('data-agent-id');
  const baseUrl = new URL(script.src).origin;

  if (!agentId) {
    console.error('Chart AI Widget: data-agent-id is required');
    return;
  }

  // 创建样式
  const style = document.createElement('style');
  style.textContent = `
    .chart-ai-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .chart-ai-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .chart-ai-widget-button:hover {
      transform: scale(1.1);
    }
    .chart-ai-widget-button svg {
      width: 30px;
      height: 30px;
      fill: white;
    }
    .chart-ai-widget-iframe-container {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      display: none;
      transform-origin: bottom right;
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 0;
      transform: scale(0.9);
    }
    .chart-ai-widget-iframe-container.active {
      display: block;
      opacity: 1;
      transform: scale(1);
    }
    @media (max-width: 480px) {
      .chart-ai-widget-iframe-container {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
      }
    }
  `;
  document.head.appendChild(style);

  // 创建容器
  const container = document.createElement('div');
  container.className = 'chart-ai-widget-container';

  // 创建按钮
  const button = document.createElement('div');
  button.className = 'chart-ai-widget-button';
  button.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.03 21.5a.5.5 0 00.616.616L7 20.662C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.474 0-2.866-.394-4.06-1.08a.5.5 0 00-.45-.027l-3.328 1.11 1.11-3.328a.5.5 0 00-.027-.45C4.394 14.866 4 13.474 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
    </svg>
  `;

  // 创建 Iframe 容器
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'chart-ai-widget-iframe-container';
  
  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/agent/${agentId}/widget`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  
  iframeContainer.appendChild(iframe);
  container.appendChild(iframeContainer);
  container.appendChild(button);
  document.body.appendChild(container);

  // 交互逻辑
  let isOpen = false;
  button.onclick = function() {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.display = 'block';
      setTimeout(() => {
        iframeContainer.classList.add('active');
      }, 10);
      button.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      `;
    } else {
      iframeContainer.classList.remove('active');
      setTimeout(() => {
        iframeContainer.style.display = 'none';
      }, 300);
      button.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.03 21.5a.5.5 0 00.616.616L7 20.662C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.474 0-2.866-.394-4.06-1.08a.5.5 0 00-.45-.027l-3.328 1.11 1.11-3.328a.5.5 0 00-.027-.45C4.394 14.866 4 13.474 4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
        </svg>
      `;
    }
  };
})();
