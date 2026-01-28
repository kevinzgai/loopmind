<template>
  <div class="agent-form-page">
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="content-wrapper">
      <div class="agent-card">
        <div class="card-header">
          <div class="header-icon">✨</div>
          <h1>{{ isEditMode ? '编辑智能体' : '创建智能体' }}</h1>
          <p>{{ isEditMode ? '优化你的专属 AI 助手，让它更懂你' : '定制你的专属 AI 助手，开启智能对话新时代' }}</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-text">{{ error }}</div>
        </div>

        <AgentForm
          v-else
          v-model="form"
          :initial-data="initialAgentData"
          :is-edit-mode="isEditMode"
          :is-published="isPublished"
          :is-submitting="isSubmitting"
          :is-unpublishing="isUnpublishing"
          :current-provider="defaultProvider"
          @submit="handleSubmit"
          @cancel="handleCancel"
          @unpublish="handleUnpublish"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { token } from '@/stores/authStore.js'
import { getAgent, createAgent, updateAgent, unpublishAgent } from '@/services/agentService.js'
import AgentForm from '@/components/agent/AgentForm.vue'
import apiService from '@/services/apiService.js'

const route = useRoute()
const router = useRouter()
const agentId = route.params.agentId

const isEditMode = computed(() => !!agentId)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isUnpublishing = ref(false)
const error = ref(null)

const initialAgentData = ref(null)
const defaultProvider = ref('deepseek')

const form = reactive({
  name: '',
  description: '',
  avatar: '🤖',
  model: 'deepseek',
  personality: '',
  initialMemory: '',
  voice: 'xiaoxian',
  speechRate: 150,
  knowledgeBaseId: null
})

const isPublished = computed(() => {
  const published = initialAgentData.value?.isPublished || false
  console.log('Is Published:', published, 'Initial Data:', initialAgentData.value)
  return published
})

const loadAgent = async () => {
  if (!isEditMode.value) return

  try {
    isLoading.value = true
    error.value = null

    const data = await getAgent(agentId)
    const result = data.agent || data
    initialAgentData.value = result

    // 回显数据
    form.name = result.name
    form.description = result.description || ''
    form.avatar = result.avatar || '🤖'
    // 优先使用保存的模型配置，如果没有则使用系统默认
    form.model = result.model || defaultProvider.value || 'deepseek'
    form.personality = result.personality || ''
    form.initialMemory = result.initialMemory || ''
    form.voice = result.voice || 'xiaoxian'
    form.speechRate = result.speechRate || 150
    // 如果后端 populate 了 knowledgeBaseId，它是一个对象；否则是 ID 字符串
    if (result.knowledgeBaseId && typeof result.knowledgeBaseId === 'object') {
      // 优先取 id (字符串)，如果没有则取 _id 并转字符串
      form.knowledgeBaseId = result.knowledgeBaseId.id || (result.knowledgeBaseId._id ? result.knowledgeBaseId._id.toString() : null)
    } else {
      form.knowledgeBaseId = result.knowledgeBaseId || null
    }

  } catch (err) {
    error.value = err.message
    console.error('❌ 加载智能体失败:', err.message)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = null

    if (isEditMode.value) {
      const updateData = {
        name: form.name,
        description: form.description,
        avatar: form.avatar,
        knowledgeBaseId: form.knowledgeBaseId
      }

      // 如果未发布，才允许更新核心配置
      if (!isPublished.value) {
        Object.assign(updateData, {
          model: form.model,
          personality: form.personality,
          initialMemory: form.initialMemory,
          voice: form.voice,
          speechRate: form.speechRate
        })
      }

      await updateAgent(agentId, updateData, token.value)
      console.log('✅ 智能体更新成功')
    } else {
      await createAgent({
        name: form.name,
        description: form.description,
        avatar: form.avatar,
        model: form.model,
        personality: form.personality,
        initialMemory: form.initialMemory,
        voice: form.voice,
        speechRate: form.speechRate,
        knowledgeBaseId: form.knowledgeBaseId
      }, token.value)
      console.log('✅ 智能体创建成功')
    }

    router.push('/agent/my-agents')
  } catch (err) {
    error.value = err.message
    console.error(`❌ ${isEditMode.value ? '更新' : '创建'}智能体失败:`, err.message)
    
    if (err.message.includes('登录已失效')) {
      router.push('/login')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleUnpublish = async () => {
  if (!confirm('确定要下架这个智能体吗？下架后将从广场中移除。')) {
    return
  }

  try {
    isUnpublishing.value = true
    error.value = null

    const updatedAgent = await unpublishAgent(agentId, token.value)
    const result = updatedAgent.agent || updatedAgent
    initialAgentData.value = result
    
    console.log('✅ 智能体下架成功')
  } catch (err) {
    error.value = err.message
    console.error('❌ 下架智能体失败:', err.message)
    
    if (err.message.includes('登录已失效')) {
      router.push('/login')
    }
  } finally {
    isUnpublishing.value = false
  }
}

const handleCancel = () => {
  router.push('/agent/my-agents')
}

onMounted(() => {
  ;(async () => {
    try {
      const resp = await apiService.get('/chat/providers')
      defaultProvider.value = resp.data.defaultProvider || 'deepseek'
      form.model = defaultProvider.value
    } catch (e) {
      defaultProvider.value = 'deepseek'
    } finally {
      loadAgent()
    }
  })()
})
</script>

<style scoped>
.agent-form-page {
  min-height: calc(100vh - 60px);
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
  opacity: 0.4;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: -150px;
  right: -150px;
  animation: float 20s ease-in-out infinite;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  bottom: -100px;
  left: -100px;
  animation: float 25s ease-in-out infinite reverse;
}

.circle-3 {
  width: 300px;
  height: 300px;
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
  padding: 2rem;
}

.agent-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.agent-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.card-header {
  text-align: center;
  margin-bottom: 3rem;
}

.header-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.card-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #667eea;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #fca5a5;
  border-radius: 12px;
  color: #991b1b;
  font-size: 0.9375rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 1.5rem;
}

.error-text {
  flex: 1;
}

@media (max-width: 1024px) {
  .content-wrapper {
    padding: 1.5rem;
  }

  .agent-card {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .agent-card {
    padding: 1.5rem;
  }

  .card-header h1 {
    font-size: 2rem;
  }

  .header-icon {
    font-size: 3rem;
  }

  .circle-1,
  .circle-2,
  .circle-3 {
    display: none;
  }
}
</style>
