<template>
  <div class="page-container">
    <div class="page-header">
      <router-link to="/" class="back-button">
        ← 返回首页
      </router-link>
      <h1 class="page-title">🔊 文字转语音测试</h1>
    </div>

    <div class="page-content">
      <TtsTestDemo />
    </div>
  </div>
</template>

<script setup>
import TtsTestDemo from '@/components/TtsTestDemo.vue'
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  padding: 2rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #4a5568;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.page-content {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
