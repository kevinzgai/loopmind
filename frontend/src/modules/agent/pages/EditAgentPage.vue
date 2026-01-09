<template>
  <div class="edit-agent-container">
    <div class="edit-header">
      <router-link to="/agent/my-agents" class="back-btn">
        ← 返回
      </router-link>
      <h1>编辑智能体</h1>
      <div></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      加载中...
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 编辑表单 -->
    <div v-else class="edit-form-container">
      <form @submit.prevent="handleSubmit" class="edit-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h2>基本信息</h2>

          <div class="form-group">
            <label for="name">智能体名称 *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="输入智能体名称"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">描述</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="输入智能体描述"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="avatar">头像 URL</label>
            <input
              id="avatar"
              v-model="form.avatar"
              type="url"
              placeholder="输入头像 URL"
            />
            <div v-if="form.avatar" class="avatar-preview">
              <img :src="form.avatar" :alt="form.name" />
            </div>
          </div>
        </div>

        <!-- 配置信息 -->
        <div class="form-section" v-if="agent && !agent.isPublished">
          <h2>配置信息</h2>

          <div class="form-group">
            <label for="model">AI 模型 *</label>
            <select id="model" v-model="form.model" required>
              <option value="deepseek">DeepSeek</option>
              <option value="qwen">通义千问</option>
            </select>
          </div>

          <div class="form-group">
            <label for="personality">人设</label>
            <textarea
              id="personality"
              v-model="form.personality"
              placeholder="描述智能体的人设和性格"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="initialMemory">初始记忆</label>
            <textarea
              id="initialMemory"
              v-model="form.initialMemory"
              placeholder="输入智能体的初始记忆信息"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="voice">语音</label>
            <select id="voice" v-model="form.voice">
              <option value="xiaoxian">小仙</option>
              <option value="xiaogang">小刚</option>
              <option value="xiaohui">小慧</option>
            </select>
          </div>

          <div class="form-group">
            <label for="speechRate">语速</label>
            <input
              id="speechRate"
              v-model.number="form.speechRate"
              type="number"
              min="50"
              max="200"
              placeholder="输入语速（50-200）"
            />
          </div>
        </div>

        <!-- 发布状态 -->
        <div class="form-section" v-if="agent">
          <h2>发布状态</h2>
          <div class="status-info">
            <p v-if="agent.isPublished" class="published-status">
              ✅ 已发布 - 已发布的智能体不能修改核心配置
            </p>
            <p v-else class="draft-status">
              📝 草稿 - 可以修改所有配置
            </p>
          </div>
          
          <!-- 下架按钮 -->
          <div v-if="agent.isPublished" class="unpublish-section">
            <p class="unpublish-tip">
              💡 如需修改核心配置，请先下架智能体
            </p>
            <button 
              @click="handleUnpublish" 
              class="unpublish-btn"
              :disabled="isUnpublishing"
            >
              {{ isUnpublishing ? '下架中...' : '下架智能体' }}
            </button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
          <router-link to="/agent/my-agents" class="cancel-btn">
            取消
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { token } from '@/modules/auth/stores/authStore.js'
import { getAgent, updateAgent, unpublishAgent } from '../services/agentService.js'

const route = useRoute()
const agentId = route.params.agentId

const agent = ref(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isUnpublishing = ref(false)
const error = ref(null)

const form = reactive({
  name: '',
  description: '',
  avatar: '',
  model: 'deepseek',
  personality: '',
  initialMemory: '',
  voice: 'xiaoxian',
  speechRate: 150
})

const loadAgent = async () => {
  try {
    isLoading.value = true
    error.value = null

    const result = await getAgent(agentId)
    agent.value = result

    // 填充表单
    form.name = result.name
    form.description = result.description || ''
    form.avatar = result.avatar || ''
    form.model = result.model || 'deepseek'
    form.personality = result.personality || ''
    form.initialMemory = result.initialMemory || ''
    form.voice = result.voice || 'xiaoxian'
    form.speechRate = result.speechRate || 150
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

    await updateAgent(agentId, {
      name: form.name,
      description: form.description,
      avatar: form.avatar,
      model: form.model,
      personality: form.personality,
      initialMemory: form.initialMemory,
      voice: form.voice,
      speechRate: form.speechRate
    }, token.value)

    console.log('✅ 智能体更新成功')
    // 返回列表页面
    window.location.href = '/agent/my-agents'
  } catch (err) {
    error.value = err.message
    console.error('❌ 更新智能体失败:', err.message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadAgent()
})
</script>

<style scoped>
.edit-agent-container {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: 2rem;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.back-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.edit-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.loading,
.error-message {
  text-align: center;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
}

.edit-form-container {
  max-width: 800px;
  margin: 0 auto;
}

.edit-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h2 {
  font-size: 18px;
  color: #333;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.avatar-preview {
  margin-top: 1rem;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #ddd;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-info {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
}

.published-status {
  color: #48bb78;
  margin: 0;
}

.draft-status {
  color: #ed8936;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
}

.submit-btn {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  flex: 1;
  padding: 12px 24px;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #f0f0f0;
}

@media (max-width: 768px) {
  .edit-agent-container {
    padding: 1rem;
  }

  .edit-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .edit-form {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
