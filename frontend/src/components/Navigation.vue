<template>
  <nav class="navigation">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        🤖 AI Chat
      </router-link>

      <div class="nav-links">
        <router-link to="/chat" class="nav-link">
          💬 对话
        </router-link>
        <router-link to="/audio-test" class="nav-link">
          🎤 录音
        </router-link>
        <router-link to="/seed-asr-test" class="nav-link">
          🤖 识别
        </router-link>
        <router-link to="/tts-test" class="nav-link">
          🔊 语音
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navigation {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-logo:hover {
  color: #764ba2;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  padding: 0.5rem 1rem;
  color: #4a5568;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f7fafc;
  color: #2d3748;
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
