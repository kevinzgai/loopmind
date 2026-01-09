<template>
  <div class="create-agent-container">
    <div class="create-agent-card">
      <div class="card-header">
        <h1>创建智能体</h1>
        <p>定制你的专属 AI 助手</p>
      </div>

      <form @submit.prevent="handleCreateAgent" class="agent-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h2 class="section-title">基本信息</h2>

          <div class="form-group">
            <label for="name">智能体名称 *</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="例如：编程助手、写作顾问"
              required
              :disabled="isLoading"
              maxlength="50"
            />
            <span class="char-count">{{ form.name.length }}/50</span>
          </div>

          <div class="form-group">
            <label for="description">描述</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="简要描述你的智能体的功能和特点"
              :disabled="isLoading"
              maxlength="500"
              rows="3"
            ></textarea>
            <span class="char-count">{{ form.description.length }}/500</span>
          </div>

          <div class="form-group">
            <label for="avatar">头像 URL</label>
            <input
              id="avatar"
              v-model="form.avatar"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- 配置信息 -->
        <div class="form-section">
          <h2 class="section-title">配置信息</h2>

          <div class="form-group">
            <label for="model">AI 模型 *</label>
            <select v-model="form.model" id="model" :disabled="isLoading">
              <option value="deepseek">DeepSeek</option>
              <option value="qwen">通义千问</option>
            </select>
          </div>

          <div class="form-group">
            <label for="personality">人设</label>
            <textarea
              id="personality"
              v-model="form.personality"
              placeholder="描述你的智能体的性格、说话风格等"
              :disabled="isLoading"
              maxlength="1000"
              rows="4"
            ></textarea>
            <span class="char-count">{{ form.personality.length }}/1000</span>
          </div>

          <div class="form-group">
            <label for="initialMemory">初始记忆</label>
            <textarea
              id="initialMemory"
              v-model="form.initialMemory"
              placeholder="智能体的初始背景信息或记忆"
              :disabled="isLoading"
              maxlength="500"
              rows="3"
            ></textarea>
            <span class="char-count">{{ form.initialMemory.length }}/500</span>
          </div>
        </div>

        <!-- 语音配置 -->
        <div class="form-section">
          <h2 class="section-title">语音配置</h2>

          <div class="form-group">
            <label for="voice">音色</label>
            <select v-model="form.voice" id="voice" :disabled="isLoading">
              <option value="xiaoxian">小贤</option>
              <option value="xiaoyun">小云</option>
              <option value="xiaogang">小刚</option>
              <option value="xiaomei">小美</option>
            </select>
          </div>

          <div class="form-group">
            <label for="speechRate">语速</label>
            <div class="slider-group">
              <input
                id="speechRate"
                v-model.number="form.speechRate"
                type="range"
                min="50"
                max="400"
                step="10"
                :disabled="isLoading"
              />
              <span class="slider-value">{{ form.speechRate }}</span>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- 按钮 -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '创建中...' : '创建智能体' }}
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { token } from '@/modules/auth/stores/authStore.js'
import { createAgent } from '../services/agentService.js'

const router = useRouter()

const form = ref({
  name: '',
  description: '',
  avatar: '',
  model: 'deepseek',
  personality: '',
  initialMemory: '',
  voice: 'xiaoxian',
  speechRate: 150
})

const isLoading = ref(false)
const error = ref(null)

const handleCreateAgent = async () => {
  try {
    error.value = null
    isLoading.value = true

    if (!form.value.name.trim()) {
      throw new Error('智能体名称不能为空');
    }

    const agent = await createAgent(form.value, token.value)
    
    console.log('✅ 智能体创建成功:', agent.name)
    
    // 跳转到我的智能体列表
    router.push('/agent/my-agents')
  } catch (err) {
    error.value = err.message
    console.error('❌ 创建智能体失败:', err.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.create-agent-container {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.create-agent-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.card-header p {
  color: #999;
  font-size: 14px;
}

.agent-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.slider-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-group input[type="range"] {
  flex: 1;
  padding: 0;
  height: 6px;
  cursor: pointer;
}

.slider-value {
  min-width: 50px;
  text-align: right;
  font-weight: 500;
  color: #667eea;
}

.error-message {
  padding: 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  background: #f0f0f0;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .create-agent-container {
    padding: 1rem;
  }

  .create-agent-card {
    padding: 1.5rem;
  }

  .card-header h1 {
    font-size: 24px;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
