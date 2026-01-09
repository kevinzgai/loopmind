<template>
  <div class="home-container">
    <!-- 顶部 Banner -->
    <div class="banner-section">
      <div class="banner-content">
        <div class="banner-text">
          <h1 class="banner-title">AI Agent 平台</h1>
          <p class="banner-subtitle">全面开源</p>
          <p class="banner-description">
            创建属于你的 AI 助手，定制人设、记忆和音色，与全球用户分享你的创意
          </p>
          <router-link v-if="isAuthenticated" to="/agent/create" class="banner-btn">
            ✨ 创建智能体
          </router-link>
          <router-link v-else to="/register" class="banner-btn">
            ✨ 立即开始
          </router-link>
        </div>
        <div class="banner-image">
          <div class="banner-illustration">🤖</div>
        </div>
      </div>
    </div>

    <!-- 快速入口 -->
    <div v-if="isAuthenticated" class="quick-access">
      <router-link to="/agent/my-agents" class="quick-card">
        <div class="quick-icon">📋</div>
        <div class="quick-text">
          <div class="quick-title">我的智能体</div>
          <div class="quick-desc">管理你创建的智能体</div>
        </div>
      </router-link>
      <router-link to="/agent/create" class="quick-card">
        <div class="quick-icon">➕</div>
        <div class="quick-text">
          <div class="quick-title">创建新智能体</div>
          <div class="quick-desc">定制你的专属 AI 助手</div>
        </div>
      </router-link>
      <router-link to="/chat" class="quick-card">
        <div class="quick-icon">💬</div>
        <div class="quick-text">
          <div class="quick-title">AI 对话</div>
          <div class="quick-desc">与 AI 进行实时对话</div>
        </div>
      </router-link>
    </div>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="category-header">
        <h2>智能体广场</h2>
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            :class="{ active: selectedCategory === cat }"
            class="category-tab"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </div>

    <!-- 智能体网格 -->
    <div class="agents-section">
      <div class="agents-grid">
        <div v-for="agent in displayedAgents" :key="agent.id" class="agent-item">
          <div class="agent-card">
            <div class="agent-header">
              <img v-if="agent.avatar" :src="agent.avatar" :alt="agent.name" class="agent-avatar" />
              <div v-else class="agent-avatar-placeholder">🤖</div>
              <div class="agent-meta">
                <h3 class="agent-name">{{ agent.name }}</h3>
                <p class="agent-creator">by {{ agent.creatorName }}</p>
              </div>
            </div>

            <p v-if="agent.description" class="agent-description">
              {{ agent.description }}
            </p>

            <div class="agent-stats">
              <span class="stat">
                <span class="stat-icon">👥</span>
                {{ agent.userCount }} 人使用
              </span>
              <span class="stat">
                <span class="stat-icon">💬</span>
                {{ agent.usageCount }} 次对话
              </span>
            </div>

            <router-link :to="`/agent/${agent.id}/chat`" class="agent-btn">
              开始对话
            </router-link>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="displayedAgents.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>暂无智能体</p>
      </div>
    </div>

    <!-- 功能介绍 -->
    <div class="features-section">
      <h2>平台特色</h2>
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <h3>自定义人设</h3>
          <p>为你的 AI 助手定制独特的性格和说话风格</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🧠</div>
          <h3>智能记忆</h3>
          <p>自动管理对话记忆，超过 2000 字自动总结</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔊</div>
          <h3>语音交互</h3>
          <p>支持语音输入和输出，多种音色可选</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🌍</div>
          <h3>全球分享</h3>
          <p>发布你的智能体到广场，与全球用户分享</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { isAuthenticated } from '@/modules/auth/stores/authStore.js'
import { getPublishedAgents } from '@/modules/agent/services/agentService.js'

const agents = ref([])
const selectedCategory = ref('全部')
const categories = ref(['全部', '编程', '写作', '生活', '教育', '娱乐'])

const displayedAgents = computed(() => {
  if (selectedCategory.value === '全部') {
    return agents.value
  }
  return agents.value.filter(agent => agent.category === selectedCategory.value)
})

const loadAgents = async () => {
  try {
    const result = await getPublishedAgents(1, 12)
    agents.value = result.agents
  } catch (error) {
    console.error('❌ 加载智能体失败:', error.message)
  }
}

onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Banner 区域 */
.banner-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.banner-text h1 {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 0.5rem;
}

.banner-subtitle {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 1rem;
  opacity: 0.9;
}

.banner-description {
  font-size: 16px;
  margin: 0 0 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.banner-btn {
  display: inline-block;
  padding: 12px 30px;
  background: white;
  color: #667eea;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.banner-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.banner-illustration {
  font-size: 120px;
  text-align: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 快速入口 */
.quick-access {
  max-width: 1200px;
  margin: -2rem auto 3rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.quick-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.quick-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.quick-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.quick-text {
  flex: 1;
}

.quick-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.quick-desc {
  font-size: 14px;
  color: #999;
}

/* 分类导航 */
.category-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.category-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.category-tabs {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.category-tab {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.category-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.category-tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 智能体网格 */
.agents-section {
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.agent-item {
  height: 100%;
}

.agent-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.agent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.agent-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.agent-avatar,
.agent-avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: #f0f0f0;
  flex-shrink: 0;
}

.agent-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.agent-creator {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}

.agent-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.agent-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 12px;
  color: #999;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}

.agent-btn {
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  text-align: center;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.agent-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}

/* 功能介绍 */
.features-section {
  background: white;
  padding: 3rem 2rem;
  margin-top: 3rem;
}

.features-section h2 {
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 2rem;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-item {
  text-align: center;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 1rem;
}

.feature-item h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 0.5rem;
}

.feature-item p {
  font-size: 14px;
  color: #999;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .banner-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .banner-text h1 {
    font-size: 32px;
  }

  .banner-subtitle {
    font-size: 18px;
  }

  .banner-illustration {
    font-size: 80px;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .agents-grid {
    grid-template-columns: 1fr;
  }

  .quick-access {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-banner {
  position: fixed;
  top: 60px;
  right: 20px;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.auth-banner p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.auth-link {
  padding: 6px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.login-link {
  background: #f0f0f0;
  color: #333;
}

.login-link:hover {
  background: #e0e0e0;
}

.register-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.register-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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

.agent-card::before {
  background: linear-gradient(90deg, #fa709a, #fee140);
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
  .auth-banner {
    position: static;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

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
