<template>
  <div class="my-agents-container">
    <div class="agents-header">
      <h1>我的智能体</h1>
      <router-link to="/agent/create" class="create-btn">
        + 创建新智能体
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      加载中...
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 空状态 -->
    <div v-else-if="agents.length === 0" class="empty-state">
      <div class="empty-icon">🤖</div>
      <h2>还没有创建智能体</h2>
      <p>点击下方按钮创建你的第一个智能体</p>
      <router-link to="/agent/create" class="create-btn-large">
        创建智能体
      </router-link>
    </div>

    <!-- 智能体列表 -->
    <div v-else class="agents-grid">
      <div v-for="agent in agents" :key="agent.id" class="agent-card">
        <div class="agent-header">
          <div class="agent-avatar-container">
            <img v-if="agent.avatar && (agent.avatar.startsWith('http') || agent.avatar.startsWith('data:'))" 
                 :src="agent.avatar" :alt="agent.name" class="agent-avatar" />
            <div v-else class="agent-avatar-placeholder">{{ agent.avatar || '🤖' }}</div>
          </div>
          <div class="agent-info">
            <h3 class="agent-name">{{ agent.name }}</h3>
            <p class="agent-model">{{ getModelName(agent.model) }}</p>
          </div>
        </div>

        <p v-if="agent.description" class="agent-description">
          {{ agent.description }}
        </p>

        <div class="agent-stats">
          <div class="stat">
            <span class="stat-label">使用次数</span>
            <span class="stat-value">{{ agent.usageCount }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">用户数</span>
            <span class="stat-value">{{ agent.userCount }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">状态</span>
            <span class="stat-value" :class="{ published: agent.isPublished }">
              {{ agent.isPublished ? '已发布' : '草稿' }}
            </span>
          </div>
        </div>

        <div class="agent-actions">
          <router-link :to="`/agent/${agent.id}/chat`" class="action-btn chat-btn">
            对话
          </router-link>
          <router-link :to="`/agent/${agent.id}/edit`" class="action-btn edit-btn">
            编辑
          </router-link>
          <button
            @click="showEmbedModal(agent)"
            class="action-btn embed-btn"
          >
            嵌入
          </button>
          <button
            v-if="!agent.isPublished"
            @click="handlePublish(agent.id)"
            class="action-btn publish-btn"
            :disabled="publishingId === agent.id"
          >
            {{ publishingId === agent.id ? '发布中...' : '发布' }}
          </button>
          <button
            v-if="agent.isPublished"
            @click="handleUnpublish(agent.id)"
            class="action-btn unpublish-btn"
            :disabled="unpublishingId === agent.id"
          >
            {{ unpublishingId === agent.id ? '下架中...' : '下架' }}
          </button>
          <button
            @click="handleDelete(agent.id)"
            class="action-btn delete-btn"
            :disabled="deletingId === agent.id"
          >
            {{ deletingId === agent.id ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > limit" class="pagination">
      <button
        @click="previousPage"
        :disabled="page === 1"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ page }} / {{ pages }} 页
      </span>
      <button
        @click="nextPage"
        :disabled="page === pages"
        class="page-btn"
      >
        下一页
      </button>
    </div>

    <!-- 嵌入代码弹窗 -->
    <div v-if="showingEmbedModal" class="modal-overlay" @click="showingEmbedModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>获取嵌入代码</h3>
          <button class="close-btn" @click="showingEmbedModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">将以下代码复制并粘贴到您网站的 <code>&lt;body&gt;</code> 标签底部：</p>
          <div class="code-block">
            <pre><code>{{ embedCode }}</code></pre>
            <button class="copy-btn" @click="copyEmbedCode">
              {{ copied ? '已复制!' : '复制代码' }}
            </button>
          </div>
          <div class="preview-note">
            💡 提示：该插件会在页面右下角显示一个聊天气泡。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { token } from '@/stores/authStore.js'
import { getUserAgents, publishAgent, unpublishAgent, deleteAgent } from '@/services/agentService.js'

const router = useRouter()

const agents = ref([])
const isLoading = ref(false)
const error = ref(null)
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const pages = ref(0)
const publishingId = ref(null)
const unpublishingId = ref(null)
const deletingId = ref(null)

// 嵌入代码弹窗相关
const showingEmbedModal = ref(false)
const selectedAgent = ref(null)
const copied = ref(false)

const embedCode = computed(() => {
  if (!selectedAgent.value) return ''
  const baseUrl = window.location.origin
  return `<script src="${baseUrl}/widget.js" data-agent-id="${selectedAgent.value.id}"><\/script>`
})

const showEmbedModal = (agent) => {
  selectedAgent.value = agent
  showingEmbedModal.value = true
  copied.value = false
}

const copyEmbedCode = async () => {
  try {
    await navigator.clipboard.writeText(embedCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const getModelName = (model) => {
  const models = {
    deepseek: 'DeepSeek',
    qwen: '通义千问'
  }
  return models[model] || model
}

const loadAgents = async () => {
  try {
    isLoading.value = true
    error.value = null

    const result = await getUserAgents(page.value, limit.value)
    agents.value = result.agents
    total.value = result.total
    pages.value = result.pages
  } catch (err) {
    error.value = err.message
    console.error('❌ 加载智能体列表失败:', err.message)
    
    // 检查是否为登录失效错误
    if (err.message.includes('登录已失效')) {
      // 重定向到登录页面
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

const handlePublish = async (agentId) => {
  try {
    publishingId.value = agentId
    await publishAgent(agentId, token.value)
    console.log('✅ 智能体发布成功')
    await loadAgents()
  } catch (err) {
    error.value = err.message
    console.error('❌ 发布智能体失败:', err.message)
    
    // 检查是否为登录失效错误
    if (err.message.includes('登录已失效')) {
      // 重定向到登录页面
      router.push('/login')
    }
  } finally {
    publishingId.value = null
  }
}

const handleUnpublish = async (agentId) => {
  if (!confirm('确定要下架这个智能体吗？下架后将从广场中移除。')) {
    return
  }

  try {
    unpublishingId.value = agentId
    await unpublishAgent(agentId, token.value)
    console.log('✅ 智能体下架成功')
    await loadAgents()
  } catch (err) {
    error.value = err.message
    console.error('❌ 下架智能体失败:', err.message)
    
    // 检查是否为登录失效错误
    if (err.message.includes('登录已失效')) {
      // 重定向到登录页面
      router.push('/login')
    }
  } finally {
    unpublishingId.value = null
  }
}

const handleDelete = async (agentId) => {
  if (!confirm('确定要删除这个智能体吗？')) {
    return
  }

  try {
    deletingId.value = agentId
    await deleteAgent(agentId, token.value)
    console.log('✅ 智能体删除成功')
    await loadAgents()
  } catch (err) {
    error.value = err.message
    console.error('❌ 删除智能体失败:', err.message)
    
    // 检查是否为登录失效错误
    if (err.message.includes('登录已失效')) {
      // 重定向到登录页面
      router.push('/login')
    }
  } finally {
    deletingId.value = null
  }
}

const previousPage = () => {
  if (page.value > 1) {
    page.value--
    loadAgents()
  }
}

const nextPage = () => {
  if (page.value < pages.value) {
    page.value++
    loadAgents()
  }
}

onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
.my-agents-container {
  min-height: calc(100vh - 60px);
  @apply bg-background text-foreground;
  padding: 2rem;
}

.agents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.agents-header h1 {
  font-size: 28px;
  @apply text-foreground;
}

.create-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  @apply text-primary-foreground;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px hsla(var(--primary) / 0.4);
}

.loading,
.error-message {
  text-align: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.error-message {
  @apply bg-destructive/10 border-destructive text-destructive;
  border-width: 1px;
  border-radius: 6px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 24px;
  @apply text-foreground;
  margin-bottom: 0.5rem;
}

.empty-state p {
  @apply text-muted-foreground;
  margin-bottom: 2rem;
}

.create-btn-large {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  @apply text-primary-foreground;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.create-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px hsla(var(--primary) / 0.4);
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 2rem;
}

.agent-card {
  @apply bg-card text-card-foreground;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
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
  @apply bg-muted;
  flex-shrink: 0;
}

.agent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  @apply text-foreground;
  margin: 0;
}

.agent-model {
  font-size: 12px;
  @apply text-muted-foreground;
  margin: 4px 0 0;
}

.agent-description {
  font-size: 14px;
  @apply text-muted-foreground;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.agent-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  @apply bg-muted;
  border-radius: 6px;
}

.stat {
  flex: 1;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  @apply text-muted-foreground;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  @apply text-foreground;
}

.stat-value.published {
  @apply text-green-600;
}

.agent-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-btn {
  @apply bg-green-500/10 text-green-600;
}

.chat-btn:hover {
  @apply bg-green-500/20;
}

.edit-btn {
  @apply bg-primary/10 text-primary;
}

.edit-btn:hover {
  @apply bg-primary/20;
}

.embed-btn {
  @apply bg-yellow-500/10 text-yellow-600;
}

.embed-btn:hover {
  @apply bg-yellow-500/20;
}

.publish-btn {
  @apply bg-purple-500/10 text-purple-600;
}

.publish-btn:hover:not(:disabled) {
  @apply bg-purple-500/20;
}

.unpublish-btn {
  @apply bg-destructive/10 text-destructive;
}

.unpublish-btn:hover:not(:disabled) {
  @apply bg-destructive/20;
}

.delete-btn {
  @apply bg-destructive/10 text-destructive;
}

.delete-btn:hover:not(:disabled) {
  @apply bg-destructive/20;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-btn {
  padding: 8px 16px;
  @apply bg-card border-border text-foreground;
  border-width: 1px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  @apply bg-muted;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  @apply text-muted-foreground;
}

@media (max-width: 768px) {
  .my-agents-container {
    padding: 1rem;
  }

  .agents-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .agents-grid {
    grid-template-columns: 1fr;
  }
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  @apply bg-card text-card-foreground;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem;
  @apply border-b border-border;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  @apply text-muted-foreground;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.modal-desc {
  font-size: 14px;
  @apply text-muted-foreground;
  margin-bottom: 1rem;
}

.code-block {
  position: relative;
  @apply bg-slate-900;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.code-block pre {
  margin: 0;
  @apply text-slate-200;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-note {
  font-size: 12px;
  @apply bg-muted text-muted-foreground;
  padding: 8px 12px;
  border-radius: 6px;
  @apply border-l-4 border-primary;
}
</style>
