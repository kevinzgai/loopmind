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
            <label for="avatar">头像</label>
            <div class="avatar-options">
              <div class="avatar-type-selector">
                <label class="radio-option">
                  <input type="radio" v-model="avatarType" value="emoji" />
                  <span>Emoji</span>
                </label>
                <label class="radio-option">
                  <input type="radio" v-model="avatarType" value="url" />
                  <span>图片链接</span>
                </label>
              </div>
              
              <!-- Emoji 选择器 -->
              <div v-if="avatarType === 'emoji'" class="emoji-selector">
                <div class="emoji-grid">
                  <button
                    v-for="emoji in emojiOptions"
                    :key="emoji"
                    type="button"
                    @click="selectEmoji(emoji)"
                    :class="{ selected: form.avatar === emoji }"
                    class="emoji-option"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
              
              <!-- URL 输入 -->
              <div v-if="avatarType === 'url'">
                <input
                  id="avatar"
                  v-model="form.avatar"
                  type="url"
                  placeholder="输入头像 URL"
                />
              </div>
            </div>
            
            <!-- 头像预览 -->
            <div v-if="form.avatar" class="avatar-preview">
              <img v-if="avatarType === 'url'" :src="form.avatar" :alt="form.name" />
              <div v-else class="emoji-preview">{{ form.avatar }}</div>
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
            <div class="voice-selector">
              <select id="voice" v-model="form.voice">
                <option value="xiaoxian">小仙（亲切女声）</option>
                <option value="xiaoyun">小云（标准女声）</option>
                <option value="xiaogang">小刚（标准男声）</option>
                <option value="ruoxi">若兮（温柔女声）</option>
                <option value="siqi">思琪（温柔女声）</option>
                <option value="zhitian">知甜（甜美女声）</option>
                <option value="xiaomei">小美（清新女声）</option>
                <option value="aining">艾宁（知性女声）</option>
                <option value="aiqi">艾琪（温暖女声）</option>
                <option value="aijia">艾佳（自然女声）</option>
                <option value="aida">艾达（成熟女声）</option>
                <option value="ninger">宁儿（青春女声）</option>
                <option value="ruilin">瑞琳（优雅女声）</option>
                <option value="siyue">思悦（活泼女声）</option>
                <option value="aixia">艾夏（清脆女声）</option>
                <option value="yina">伊娜（磁性女声）</option>
                <option value="sijia">思佳（温柔女声）</option>
                <option value="xiaobei">小北（可爱女声）</option>
                <option value="aitong">艾彤（甜美女声）</option>
                <option value="aiyu">艾雨（清新女声）</option>
              </select>
              <button 
                type="button" 
                @click="previewVoice" 
                :disabled="isSubmitting || isPreviewingVoice"
                class="preview-btn"
              >
                {{ isPreviewingVoice ? '试听中...' : '🔊 试听' }}
              </button>
            </div>
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
const isPreviewingVoice = ref(false)
const error = ref(null)

const avatarType = ref('emoji')
const emojiOptions = [
  '🤖', '👨‍💻', '👩‍💻', '🧠', '💡', '⚡', '🔥', '✨', 
  '🎯', '🚀', '💎', '🌟', '🎨', '📚', '🔬', '🎵',
  '🐱', '🐶', '🦊', '🐼', '🦄', '🐸', '🦋', '🌸',
  '😊', '😎', '🤓', '😇', '🥳', '🤗', '😋', '🤔'
]

const form = reactive({
  name: '',
  description: '',
  avatar: '🤖',
  model: 'deepseek',
  personality: '',
  initialMemory: '',
  voice: 'xiaoxian',
  speechRate: 150
})

const selectEmoji = (emoji) => {
  form.avatar = emoji
}

const previewVoice = async () => {
  try {
    isPreviewingVoice.value = true
    
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: `你好，我是${form.voice}，很高兴为你服务！`,
        voice: form.voice,
        speechRate: form.speechRate
      })
    })
    
    if (!response.ok) {
      throw new Error('试听失败')
    }
    
    const blob = await response.blob()
    const audioUrl = URL.createObjectURL(blob)
    const audio = new Audio(audioUrl)
    
    audio.onended = () => {
      isPreviewingVoice.value = false
      URL.revokeObjectURL(audioUrl)
    }
    
    audio.onerror = () => {
      isPreviewingVoice.value = false
      URL.revokeObjectURL(audioUrl)
    }
    
    await audio.play()
  } catch (err) {
    console.error('❌ 试听失败:', err.message)
    isPreviewingVoice.value = false
  }
}

const loadAgent = async () => {
  try {
    isLoading.value = true
    error.value = null

    const result = await getAgent(agentId)
    agent.value = result

    // 填充表单
    form.name = result.name
    form.description = result.description || ''
    form.avatar = result.avatar || '🤖'
    form.model = result.model || 'deepseek'
    form.personality = result.personality || ''
    form.initialMemory = result.initialMemory || ''
    form.voice = result.voice || 'xiaoxian'
    form.speechRate = result.speechRate || 150

    // 判断头像类型
    if (result.avatar && (result.avatar.startsWith('http') || result.avatar.startsWith('data:'))) {
      avatarType.value = 'url'
    } else {
      avatarType.value = 'emoji'
      if (!result.avatar) {
        form.avatar = '🤖'
      }
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

const handleUnpublish = async () => {
  if (!confirm('确定要下架这个智能体吗？下架后将从广场中移除。')) {
    return
  }

  try {
    isUnpublishing.value = true
    error.value = null

    const updatedAgent = await unpublishAgent(agentId, token.value)
    agent.value = updatedAgent

    console.log('✅ 智能体下架成功')
  } catch (err) {
    error.value = err.message
    console.error('❌ 下架智能体失败:', err.message)
  } finally {
    isUnpublishing.value = false
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

.avatar-options {
  margin-top: 0.5rem;
}

.avatar-type-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 14px;
}

.radio-option input[type="radio"] {
  margin: 0;
}

.emoji-selector {
  margin-bottom: 1rem;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
  max-width: 400px;
}

.emoji-option {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-option:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.emoji-option.selected {
  border-color: #667eea;
  background: #f0f4ff;
  transform: scale(1.1);
}

.emoji-preview {
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.voice-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.voice-selector select {
  flex: 1;
}

.preview-btn {
  padding: 8px 16px;
  background: #e8f5e8;
  color: #2f855a;
  border: 1px solid #c6f6d5;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.preview-btn:hover:not(:disabled) {
  background: #c6f6d5;
  border-color: #9ae6b4;
}

.preview-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.unpublish-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
}

.unpublish-tip {
  margin: 0 0 1rem;
  color: #856404;
  font-size: 14px;
}

.unpublish-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.unpublish-btn:hover:not(:disabled) {
  background: #c82333;
}

.unpublish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
