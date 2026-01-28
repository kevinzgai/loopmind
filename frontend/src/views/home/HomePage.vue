<template>
  <div class="home-container">
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="content-wrapper">
      <div class="banner-section">
        <div class="banner-content">
          <div class="banner-left">
            <div class="badge-container">
              <span class="badge">🚀 全新升级</span>
            </div>
            <h1 class="banner-title">
              <span class="gradient-text">AI Agent</span>
              <br>
              <span class="highlight-text">智能平台</span>
            </h1>
            <p class="banner-subtitle">全面开源 · 无限可能</p>
            <p class="banner-description">
              创建属于你的 AI 助手，定制人设、记忆和音色，与全球用户分享你的创意
            </p>
            <div class="banner-actions">
              <router-link v-if="isAuthenticated" to="/agent/create" class="btn btn-primary">
                <span class="btn-icon">✨</span>
                创建智能体
              </router-link>
              <router-link v-else to="/register" class="btn btn-primary">
                <span class="btn-icon">🚀</span>
                立即开始
              </router-link>
              <router-link to="/agent/marketplace" class="btn btn-secondary">
                <span class="btn-icon">🔍</span>
                探索广场
              </router-link>
            </div>
            <div class="banner-stats">
              <div class="stat-item">
                <div class="stat-number">10K+</div>
                <div class="stat-label">智能体</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-number">50K+</div>
                <div class="stat-label">用户</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-number">1M+</div>
                <div class="stat-label">对话</div>
              </div>
            </div>
          </div>
          <div class="banner-right">
            <div class="hero-illustration">
              <div class="floating-element element-1">🤖</div>
              <div class="floating-element element-2">💡</div>
              <div class="floating-element element-3">🎨</div>
              <div class="floating-element element-4">🚀</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isAuthenticated" class="quick-access-section">
        <div class="quick-access-grid">
          <router-link to="/agent/my-agents" class="quick-card">
            <div class="quick-card-bg"></div>
            <div class="quick-card-content">
              <div class="quick-icon-wrapper">
                <span class="quick-icon">📋</span>
              </div>
              <div class="quick-text">
                <div class="quick-title">我的智能体</div>
                <div class="quick-desc">管理你创建的智能体</div>
              </div>
              <div class="quick-arrow">→</div>
            </div>
          </router-link>
          <router-link to="/agent/create" class="quick-card">
            <div class="quick-card-bg"></div>
            <div class="quick-card-content">
              <div class="quick-icon-wrapper">
                <span class="quick-icon">➕</span>
              </div>
              <div class="quick-text">
                <div class="quick-title">创建新智能体</div>
                <div class="quick-desc">定制你的专属 AI 助手</div>
              </div>
              <div class="quick-arrow">→</div>
            </div>
          </router-link>
          <router-link to="/chat" class="quick-card">
            <div class="quick-card-bg"></div>
            <div class="quick-card-content">
              <div class="quick-icon-wrapper">
                <span class="quick-icon">💬</span>
              </div>
              <div class="quick-text">
                <div class="quick-title">AI 对话</div>
                <div class="quick-desc">与 AI 进行实时对话</div>
              </div>
              <div class="quick-arrow">→</div>
            </div>
          </router-link>
        </div>
      </div>

      <div class="category-section">
        <div class="category-header">
          <div class="category-title">
            <h2>智能体广场</h2>
            <p class="category-subtitle">发现和探索优秀的 AI 智能体</p>
          </div>
          <div class="category-tabs">
            <button
              @click="handleCategoryChange('全部')"
              :class="{ active: selectedCategory === '全部' }"
              class="category-tab"
            >
              <span class="tab-icon">🌐</span>
              <span class="tab-text">全部</span>
            </button>
            <button
              v-for="cat in AGENT_CATEGORIES"
              :key="cat.value"
              @click="handleCategoryChange(cat.value)"
              :class="{ active: selectedCategory === cat.value }"
              class="category-tab"
            >
              <span class="tab-icon">{{ cat.icon }}</span>
              <span class="tab-text">{{ cat.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="agents-section">
        <div v-if="isLoadingAgents" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else class="agents-grid">
          <div v-for="agent in displayedAgents" :key="agent.id" class="agent-item">
            <div class="agent-card">
              <div class="agent-card-bg"></div>
              <div class="agent-card-content">
                <div class="agent-header">
                  <div class="agent-avatar-container">
                    <img v-if="agent.avatar && (agent.avatar.startsWith('http') || agent.avatar.startsWith('data:'))" 
                         :src="agent.avatar" :alt="agent.name" class="agent-avatar" />
                    <div v-else class="agent-avatar-placeholder">{{ agent.avatar || '🤖' }}</div>
                    <div class="agent-status online"></div>
                  </div>
                  <div class="agent-meta">
                    <h3 class="agent-name">{{ agent.name }}</h3>
                    <p class="agent-creator">by {{ agent.creatorName }}</p>
                  </div>
                </div>

                <p v-if="agent.description" class="agent-description">
                  {{ agent.description }}
                </p>

                <div class="agent-stats">
                  <div class="stat">
                    <span class="stat-icon">👥</span>
                    <span class="stat-value">{{ agent.userCount }}</span>
                    <span class="stat-label">使用</span>
                  </div>
                  <div class="stat">
                    <span class="stat-icon">💬</span>
                    <span class="stat-value">{{ agent.usageCount }}</span>
                    <span class="stat-label">对话</span>
                  </div>
                </div>

                <router-link :to="`/agent/${agent.id}/chat`" class="agent-btn">
                  <span>开始对话</span>
                  <span class="btn-arrow">→</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div v-if="displayedAgents.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-text">暂无智能体</p>
          <p class="empty-subtext">切换其他分类或稍后再试</p>
        </div>
      </div>

      <div class="features-section">
        <div class="features-header">
          <h2>平台特色</h2>
          <p class="features-subtitle">强大的功能，极致的体验</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <span class="feature-icon">🎨</span>
            </div>
            <h3 class="feature-title">自定义人设</h3>
            <p class="feature-description">为你的 AI 助手定制独特的性格和说话风格</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <span class="feature-icon">🧠</span>
            </div>
            <h3 class="feature-title">智能记忆</h3>
            <p class="feature-description">自动管理对话记忆，超过 2000 字自动总结</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <span class="feature-icon">🔊</span>
            </div>
            <h3 class="feature-title">语音交互</h3>
            <p class="feature-description">支持语音输入和输出，多种音色可选</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper">
              <span class="feature-icon">🌍</span>
            </div>
            <h3 class="feature-title">全球分享</h3>
            <p class="feature-description">发布你的智能体到广场，与全球用户分享</p>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">准备好开始了吗？</h2>
          <p class="cta-description">立即创建你的第一个 AI 智能体，开启智能对话新时代</p>
          <router-link v-if="isAuthenticated" to="/agent/create" class="cta-btn">
            <span>✨ 立即创建</span>
          </router-link>
          <router-link v-else to="/register" class="cta-btn">
            <span>🚀 免费注册</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { isAuthenticated, isAdmin } from '@/stores/authStore.js'
import { getPublishedAgents } from '@/services/agentService.js'
import { AGENT_CATEGORIES } from '@/constants/agent.js'

const agents = ref([])
const selectedCategory = ref('全部')
const isLoadingAgents = ref(false)

const displayedAgents = computed(() => agents.value)

const loadAgents = async () => {
  try {
    isLoadingAgents.value = true
    const result = await getPublishedAgents(1, 12, selectedCategory.value)
    agents.value = result.agents
  } catch (error) {
    console.error('❌ 加载智能体失败:', error.message)
  } finally {
    isLoadingAgents.value = false
  }
}

const handleCategoryChange = (cat) => {
  if (selectedCategory.value === cat) return
  selectedCategory.value = cat
  loadAgents()
}

onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
  overflow-x: hidden;
}

.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.circle-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -200px;
  right: -200px;
  animation: float 20s ease-in-out infinite;
}

.circle-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -150px;
  left: -150px;
  animation: float 25s ease-in-out infinite reverse;
}

.circle-3 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 30s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -20px) scale(1.05);
  }
  50% {
    transform: translate(-10px, 20px) scale(0.95);
  }
  75% {
    transform: translate(-20px, -10px) scale(1.02);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
}

.banner-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  backdrop-filter: blur(20px);
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;
}

.banner-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.banner-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
}

.banner-left {
  position: relative;
  z-index: 2;
}

.badge-container {
  margin-bottom: 1.5rem;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.banner-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 1rem;
  line-height: 1.1;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.highlight-text {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.banner-subtitle {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 0.05em;
}

.banner-description {
  font-size: 1.125rem;
  margin: 0 0 2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  max-width: 600px;
}

.banner-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
}

.btn-icon {
  font-size: 1.25rem;
}

.banner-stats {
  display: flex;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.banner-right {
  position: relative;
  z-index: 2;
}

.hero-illustration {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-element {
  position: absolute;
  font-size: 6rem;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
  animation: floatElement 6s ease-in-out infinite;
}

.element-1 {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.element-2 {
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.element-3 {
  bottom: 20%;
  left: 30%;
  animation-delay: 2s;
}

.element-4 {
  top: 30%;
  right: 30%;
  animation-delay: 3s;
}

@keyframes floatElement {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(20px) rotate(-5deg);
  }
}

.quick-access-section {
  max-width: 1400px;
  margin: -3rem auto 4rem;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.quick-card {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.quick-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.quick-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.quick-card:hover .quick-card-bg {
  opacity: 0.05;
}

.quick-card-content {
  position: relative;
  padding: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.quick-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.quick-card:hover .quick-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.quick-icon {
  font-size: 2rem;
}

.quick-text {
  flex: 1;
}

.quick-title {
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
  font-size: 1.125rem;
}

.quick-desc {
  font-size: 0.875rem;
  color: #666;
}

.quick-arrow {
  font-size: 1.5rem;
  color: #667eea;
  transition: all 0.3s ease;
}

.quick-card:hover .quick-arrow {
  transform: translateX(5px);
  color: #764ba2;
}

.category-section {
  max-width: 1400px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.category-title h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.category-tabs {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #666;
  position: relative;
  overflow: hidden;
}

.tab-icon {
  font-size: 1.2rem;
  position: relative;
  z-index: 1;
}

.tab-text {
  position: relative;
  z-index: 1;
}

.category-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.category-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.category-tab.active {
  border-color: #667eea;
  color: white;
}

.category-tab.active::before {
  opacity: 1;
}

.category-tab span {
  position: relative;
  z-index: 1;
}

.agents-section {
  max-width: 1400px;
  margin: 0 auto 4rem;
  padding: 0 2rem;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.agent-item {
  height: 100%;
}

.agent-card {
  position: relative;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  cursor: pointer;
}

.agent-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
}

.agent-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.agent-card:hover .agent-card-bg {
  opacity: 0.03;
}

.agent-card-content {
  position: relative;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.agent-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.agent-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.agent-avatar,
.agent-avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.agent-card:hover .agent-avatar,
.agent-card:hover .agent-avatar-placeholder {
  transform: scale(1.1) rotate(3deg);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.agent-status {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.agent-status.online {
  background: #4ade80;
}

.agent-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.agent-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
}

.agent-creator {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}

.agent-description {
  font-size: 0.9375rem;
  color: #666;
  margin: 0 0 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  flex: 1;
}

.agent-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.25rem;
}

.stat-value {
  font-weight: 700;
  color: #1a1a2e;
}

.stat-label {
  font-size: 0.8125rem;
  color: #999;
}

.agent-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.agent-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.agent-btn:hover .btn-arrow {
  transform: translateX(5px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #667eea;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #666;
}

.empty-subtext {
  font-size: 0.9375rem;
  margin: 0;
}

.features-section {
  background: white;
  padding: 5rem 2rem;
  margin-top: 4rem;
}

.features-header {
  text-align: center;
  margin-bottom: 4rem;
}

.features-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-subtitle {
  font-size: 1.125rem;
  color: #666;
  margin: 0;
}

.features-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2.5rem;
  background: #f8f9fa;
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.feature-icon {
  font-size: 2.5rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.75rem;
}

.feature-description {
  font-size: 0.9375rem;
  color: #666;
  line-height: 1.7;
  margin: 0;
}

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 5rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2rem;
  line-height: 1.7;
}

.cta-btn {
  display: inline-block;
  padding: 1.25rem 3rem;
  background: white;
  color: #667eea;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
  transition: left 0.5s ease;
}

.cta-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.cta-btn:hover::before {
  left: 100%;
}

@media (max-width: 1024px) {
  .banner-content {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }

  .banner-title {
    font-size: 3rem;
  }

  .banner-actions {
    justify-content: center;
  }

  .banner-stats {
    justify-content: center;
  }

  .banner-right {
    display: none;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .agents-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .banner-section {
    padding: 3rem 1.5rem;
  }

  .banner-title {
    font-size: 2.5rem;
  }

  .banner-subtitle {
    font-size: 1.25rem;
  }

  .banner-description {
    font-size: 1rem;
  }

  .banner-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .banner-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-divider {
    display: none;
  }

  .quick-access-grid {
    grid-template-columns: 1fr;
  }

  .category-header h2 {
    font-size: 2rem;
  }

  .agents-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-description {
    font-size: 1rem;
  }

  .cta-btn {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .circle-1,
  .circle-2,
  .circle-3 {
    display: none;
  }
}
</style>
