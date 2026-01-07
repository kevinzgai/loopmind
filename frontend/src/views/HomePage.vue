<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="hero-title">🤖 AI Chat Application</h1>
      <p class="hero-subtitle">智能对话 · 语音识别 · 文字转语音</p>
      <p class="hero-description">
        基于 Vue 3 和 DeepSeek API 的现代化 AI 聊天应用
      </p>
    </div>

    <div class="features-grid">
      <router-link to="/chat" class="feature-card chat-card">
        <div class="feature-icon">💬</div>
        <h2 class="feature-title">AI 对话</h2>
        <p class="feature-description">
          与 AI 进行实时对话，支持流式响应和上下文记忆
        </p>
        <div class="feature-badge">核心功能</div>
      </router-link>

      <router-link to="/audio-test" class="feature-card audio-card">
        <div class="feature-icon">🎤</div>
        <h2 class="feature-title">录音测试</h2>
        <p class="feature-description">
          测试浏览器录音功能，录制并播放音频
        </p>
        <div class="feature-badge">测试工具</div>
      </router-link>

      <router-link to="/asr-test" class="feature-card asr-ali-card">
        <div class="feature-icon">🎙️</div>
        <h2 class="feature-title">语音识别 ASR</h2>
        <p class="feature-description">
          阿里云语音识别，实时转写和文件识别
        </p>
        <div class="feature-badge">阿里云</div>
      </router-link>

      <router-link to="/asr-stream" class="feature-card asr-stream-card">
        <div class="feature-icon">⚡</div>
        <h2 class="feature-title">实时语音识别</h2>
        <p class="feature-description">
          流式语音识别，边说边显示结果，延迟更低
        </p>
        <div class="feature-badge">实时流式</div>
      </router-link>

      <router-link to="/tts-test" class="feature-card tts-card">
        <div class="feature-icon">🔊</div>
        <h2 class="feature-title">文字转语音 TTS</h2>
        <p class="feature-description">
          阿里云 TTS，150+ 种音色，支持语速调节
        </p>
        <div class="feature-badge">阿里云</div>
      </router-link>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h3 class="info-title">✨ 功能特性</h3>
        <ul class="info-list">
          <li>🚀 实时流式 AI 对话</li>
          <li>🎙️ 语音识别（ASR）</li>
          <li>🔊 文字转语音（TTS）</li>
          <li>📝 Markdown 渲染</li>
          <li>💾 对话历史记忆</li>
          <li>🎨 现代化 UI 设计</li>
        </ul>
      </div>

      <div class="info-card">
        <h3 class="info-title">🛠️ 技术栈</h3>
        <ul class="info-list">
          <li>Vue 3 + Vite</li>
          <li>Tailwind CSS</li>
          <li>DeepSeek API</li>
          <li>WebSocket</li>
          <li>Seed-ASR</li>
          <li>OpenAI TTS</li>
        </ul>
      </div>

      <div class="info-card">
        <h3 class="info-title">📚 快速开始</h3>
        <ul class="info-list">
          <li>点击上方卡片进入功能页面</li>
          <li>AI 对话：开始智能对话</li>
          <li>录音测试：测试麦克风</li>
          <li>语音识别：语音转文字</li>
          <li>TTS 测试：文字转语音</li>
        </ul>
      </div>
    </div>

    <footer class="footer">
      <p>© 2026 AI Chat Application. Built with ❤️ using Vue 3</p>
      <p class="footer-links">
        <a href="https://github.com" target="_blank">GitHub</a>
        <span>·</span>
        <a href="/api/health" target="_blank">API Status</a>
        <span>·</span>
        <span>Version 1.1.0</span>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('🏠 Welcome to AI Chat Application!')
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.hero-section {
  text-align: center;
  color: white;
  padding: 3rem 1rem;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  opacity: 0.95;
}

.hero-description {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem;
}

.feature-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.chat-card::before {
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.audio-card::before {
  background: linear-gradient(90deg, #f093fb, #f5576c);
}

.asr-card::before {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

.tts-card::before {
  background: linear-gradient(90deg, #43e97b, #38f9d7);
}

.asr-ali-card::before {
  background: linear-gradient(90deg, #fa709a, #fee140);
}

.asr-stream-card::before {
  background: linear-gradient(90deg, #30cfd0, #330867);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.feature-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.feature-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem;
}

.info-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #2d3748;
}

.info-list {
  list-style: none;
  padding: 0;
}

.info-list li {
  padding: 0.5rem 0;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}

.info-list li:last-child {
  border-bottom: none;
}

.footer {
  text-align: center;
  color: white;
  padding: 2rem 1rem;
  opacity: 0.9;
}

.footer p {
  margin: 0.5rem 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.footer-links a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.footer-links a:hover {
  opacity: 0.8;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .info-section {
    grid-template-columns: 1fr;
  }
}
</style>
