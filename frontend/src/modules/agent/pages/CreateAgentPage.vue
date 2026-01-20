<template>
  <div class="create-agent-container">
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <div class="content-wrapper">
      <div class="create-agent-card">
        <div class="card-header">
          <div class="header-icon">✨</div>
          <h1>创建智能体</h1>
          <p>定制你的专属 AI 助手，开启智能对话新时代</p>
        </div>

        <form @submit.prevent="handleCreateAgent" class="agent-form">
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">📝</div>
              <div class="section-title-group">
                <h2 class="section-title">基本信息</h2>
                <p class="section-subtitle">设置智能体的基本信息</p>
              </div>
            </div>

            <div class="form-group">
              <label for="name">
                <span class="label-text">智能体名称</span>
                <span class="label-required">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="例如：编程助手、写作顾问"
                  required
                  :disabled="isLoading"
                  maxlength="50"
                  class="form-input"
                />
                <div class="input-icon">🏷️</div>
              </div>
              <div class="char-count">
                <span :class="{ 'count-warning': form.name.length >= 45 }">{{ form.name.length }}</span>
                <span class="count-separator">/</span>
                <span class="count-max">50</span>
              </div>
            </div>

            <div class="form-group">
              <label for="description">
                <span class="label-text">描述</span>
              </label>
              <div class="textarea-wrapper">
                <textarea
                  id="description"
                  v-model="form.description"
                  placeholder="简要描述你的智能体的功能和特点"
                  :disabled="isLoading"
                  maxlength="500"
                  rows="3"
                  class="form-textarea"
                ></textarea>
                <div class="char-count">
                  <span :class="{ 'count-warning': form.description.length >= 450 }">{{ form.description.length }}</span>
                  <span class="count-separator">/</span>
                  <span class="count-max">500</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>
                <span class="label-text">头像</span>
              </label>
              <div class="avatar-section">
                <div class="avatar-type-selector">
                  <label class="type-option" :class="{ active: avatarType === 'emoji' }">
                    <input type="radio" v-model="avatarType" value="emoji" />
                    <span class="type-icon">😊</span>
                    <span class="type-text">Emoji</span>
                  </label>
                  <label class="type-option" :class="{ active: avatarType === 'url' }">
                    <input type="radio" v-model="avatarType" value="url" />
                    <span class="type-icon">🖼️</span>
                    <span class="type-text">图片链接</span>
                  </label>
                </div>
                
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
                
                <div v-if="avatarType === 'url'" class="url-input-wrapper">
                  <div class="input-wrapper">
                    <input
                      id="avatar"
                      v-model="form.avatar"
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      :disabled="isLoading"
                      class="form-input"
                    />
                    <div class="input-icon">🔗</div>
                  </div>
                </div>
                
                <div v-if="form.avatar" class="avatar-preview-container">
                  <div class="avatar-preview-label">预览</div>
                  <div class="avatar-preview">
                    <img v-if="avatarType === 'url'" :src="form.avatar" :alt="form.name" />
                    <div v-else class="emoji-preview">{{ form.avatar }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">⚙️</div>
              <div class="section-title-group">
                <h2 class="section-title">配置信息</h2>
                <p class="section-subtitle">设置智能体的核心配置</p>
              </div>
            </div>

            <div class="form-group">
              <label for="model">
                <span class="label-text">AI 模型</span>
                <span class="label-required">*</span>
              </label>
              <div class="select-wrapper">
                <select v-model="form.model" id="model" :disabled="isLoading" class="form-select">
                  <option value="deepseek">DeepSeek - 智能对话</option>
                  <option value="qwen">通义千问 - 阿里云</option>
                </select>
                <div class="select-icon">🤖</div>
              </div>
            </div>

            <div class="form-group">
              <label for="personality">
                <span class="label-text">人设</span>
              </label>
              <div class="textarea-wrapper">
                <textarea
                  id="personality"
                  v-model="form.personality"
                  placeholder="描述你的智能体的性格、说话风格等，例如：你是一个友善的编程助手，喜欢用简单的例子解释复杂的概念"
                  :disabled="isLoading"
                  maxlength="1000"
                  rows="4"
                  class="form-textarea"
                ></textarea>
                <div class="char-count">
                  <span :class="{ 'count-warning': form.personality.length >= 900 }">{{ form.personality.length }}</span>
                  <span class="count-separator">/</span>
                  <span class="count-max">1000</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="initialMemory">
                <span class="label-text">初始记忆</span>
              </label>
              <div class="textarea-wrapper">
                <textarea
                  id="initialMemory"
                  v-model="form.initialMemory"
                  placeholder="智能体的初始背景信息或记忆，例如：你是一个专业的 Python 开发者，有 5 年的经验"
                  :disabled="isLoading"
                  maxlength="500"
                  rows="3"
                  class="form-textarea"
                ></textarea>
                <div class="char-count">
                  <span :class="{ 'count-warning': form.initialMemory.length >= 450 }">{{ form.initialMemory.length }}</span>
                  <span class="count-separator">/</span>
                  <span class="count-max">500</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">🔊</div>
              <div class="section-title-group">
                <h2 class="section-title">语音配置</h2>
                <p class="section-subtitle">定制智能体的语音风格</p>
              </div>
            </div>

            <div class="form-group">
              <label for="voice">
                <span class="label-text">音色</span>
              </label>
              <div class="voice-selector">
                <div class="select-wrapper">
                  <select v-model="form.voice" id="voice" :disabled="isLoading" class="form-select">
                    <option value="xiaoxian">小仙 - 亲切女声</option>
                    <option value="xiaoyun">小云 - 标准女声</option>
                    <option value="xiaogang">小刚 - 标准男声</option>
                    <option value="ruoxi">若兮 - 温柔女声</option>
                    <option value="siqi">思琪 - 温柔女声</option>
                    <option value="zhitian">知甜 - 甜美女声</option>
                    <option value="xiaomei">小美 - 清新女声</option>
                    <option value="aining">艾宁 - 知性女声</option>
                    <option value="aiqi">艾琪 - 温暖女声</option>
                    <option value="aijia">艾佳 - 自然女声</option>
                    <option value="aida">艾达 - 成熟女声</option>
                    <option value="ninger">宁儿 - 青春女声</option>
                    <option value="ruilin">瑞琳 - 优雅女声</option>
                    <option value="siyue">思悦 - 活泼女声</option>
                    <option value="aixia">艾夏 - 清脆女声</option>
                    <option value="yina">伊娜 - 磁性女声</option>
                    <option value="sijia">思佳 - 温柔女声</option>
                    <option value="xiaobei">小北 - 可爱女声</option>
                    <option value="aitong">艾彤 - 甜美女声</option>
                    <option value="aiyu">艾雨 - 清新女声</option>
                  </select>
                  <div class="select-icon">🎙️</div>
                </div>
                <button 
                  type="button" 
                  @click="previewVoice" 
                  :disabled="isLoading || isPreviewingVoice"
                  class="preview-btn"
                >
                  <span v-if="isPreviewingVoice" class="preview-icon">🔊</span>
                  <span v-else class="preview-icon">▶️</span>
                  <span>{{ isPreviewingVoice ? '试听中...' : '试听' }}</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="speechRate">
                <span class="label-text">语速</span>
              </label>
              <div class="slider-wrapper">
                <div class="slider-labels">
                  <span>慢</span>
                  <span>快</span>
                </div>
                <div class="slider-container">
                  <input
                    id="speechRate"
                    v-model.number="form.speechRate"
                    type="range"
                    min="50"
                    max="400"
                    step="10"
                    :disabled="isLoading"
                    class="form-slider"
                  />
                  <div class="slider-track"></div>
                  <div class="slider-fill" :style="{ width: ((form.speechRate - 50) / 350 * 100) + '%' }"></div>
                  <div class="slider-thumb" :style="{ left: ((form.speechRate - 50) / 350 * 100) + '%' }"></div>
                </div>
                <div class="slider-value">
                  <span class="value-number">{{ form.speechRate }}</span>
                  <span class="value-unit">字/分钟</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ error }}</div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="btn-icon">⏳</span>
              <span v-else class="btn-icon">✨</span>
              <span>{{ isLoading ? '创建中...' : '创建智能体' }}</span>
            </button>
            <router-link to="/agent/my-agents" class="cancel-btn">
              <span class="btn-icon">✕</span>
              <span>取消</span>
            </router-link>
          </div>
        </form>
      </div>
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
  avatar: '🤖',
  model: 'deepseek',
  personality: '',
  initialMemory: '',
  voice: 'xiaoxian',
  speechRate: 150
})

const avatarType = ref('emoji')
const emojiOptions = [
  '🤖', '👨‍💻', '👩‍💻', '🧠', '💡', '⚡', '🔥', '✨', 
  '🎯', '🚀', '💎', '🌟', '🎨', '📚', '🔬', '🎵',
  '🐱', '🐶', '🦊', '🐼', '🦄', '🐸', '🦋', '🌸',
  '😊', '😎', '🤓', '😇', '🥳', '🤗', '😋', '🤔'
]

const isLoading = ref(false)
const isPreviewingVoice = ref(false)
const error = ref(null)

const selectEmoji = (emoji) => {
  form.value.avatar = emoji
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
        text: `你好，我是${form.value.voice}，很高兴为你服务！`,
        voice: form.value.voice,
        speechRate: form.value.speechRate
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

const handleCreateAgent = async () => {
  try {
    error.value = null
    isLoading.value = true

    if (!form.value.name.trim()) {
      throw new Error('智能体名称不能为空');
    }

    const agent = await createAgent(form.value, token.value)
    
    console.log('✅ 智能体创建成功:', agent.name)
    
    router.push('/agent/my-agents')
  } catch (err) {
    error.value = err.message
    console.error('❌ 创建智能体失败:', err.message)
    
    // 检查是否为登录失效错误
    if (err.message.includes('登录已失效')) {
      // 重定向到登录页面
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.create-agent-container {
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

.create-agent-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.create-agent-card::before {
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

.agent-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.section-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.section-title-group {
  flex: 1;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.25rem;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #333;
}

.label-text {
  flex: 1;
}

.label-required {
  color: #f565656;
  font-weight: 700;
}

.input-wrapper,
.select-wrapper,
.textarea-wrapper {
  position: relative;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #fafafa;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-icon,
.select-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  pointer-events: none;
  color: #999;
}

.form-textarea {
  padding-right: 1rem;
  resize: vertical;
  min-height: 100px;
}

.char-count {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: #999;
  margin-top: 0.25rem;
}

.count-warning {
  color: #f565656;
  font-weight: 600;
}

.count-separator {
  color: #ccc;
}

.count-max {
  color: #ccc;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avatar-type-selector {
  display: flex;
  gap: 1rem;
}

.type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #666;
  position: relative;
  overflow: hidden;
}

.type-option::before {
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

.type-option:hover {
  border-color: #667eea;
  color: #667eea;
}

.type-option.active {
  border-color: #667eea;
  color: white;
}

.type-option.active::before {
  opacity: 1;
}

.type-option input[type="radio"] {
  display: none;
}

.type-icon,
.type-text {
  position: relative;
  z-index: 1;
}

.type-icon {
  font-size: 1.5rem;
}

.emoji-selector {
  margin-top: 0.5rem;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.75rem;
}

.emoji-option {
  width: 50px;
  height: 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-option:hover {
  border-color: #667eea;
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.emoji-option.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.url-input-wrapper {
  margin-top: 0.5rem;
}

.avatar-preview-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.avatar-preview-label {
  font-size: 0.875rem;
  color: #999;
  font-weight: 500;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border: 3px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  transform: scale(1.05) rotate(3deg);
  border-color: #667eea;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.emoji-preview {
  font-size: 3rem;
}

.voice-selector {
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

.voice-selector .select-wrapper {
  flex: 1;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.preview-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
}

.preview-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-icon {
  font-size: 1.125rem;
}

.slider-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #999;
  font-weight: 500;
}

.slider-container {
  position: relative;
  height: 8px;
  margin: 0.5rem 0;
}

.form-slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 2;
  position: relative;
}

.form-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: all 0.2s ease;
}

.form-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.form-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: all 0.2s ease;
}

.form-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  z-index: 0;
}

.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 8px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  z-index: 1;
  transition: width 0.1s ease;
}

.slider-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  z-index: 3;
  pointer-events: none;
  transition: left 0.1s ease;
}

.slider-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  align-self: flex-start;
}

.value-number {
  font-size: 1.25rem;
}

.value-unit {
  font-size: 0.875rem;
  opacity: 0.9;
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
}

.error-icon {
  font-size: 1.5rem;
}

.error-text {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 1.0625rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f0f0f0;
  color: #333;
}

.cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.25rem;
}

@media (max-width: 1024px) {
  .content-wrapper {
    padding: 1.5rem;
  }

  .create-agent-card {
    padding: 2rem;
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .create-agent-card {
    padding: 1.5rem;
  }

  .card-header h1 {
    font-size: 2rem;
  }

  .header-icon {
    font-size: 3rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .section-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .voice-selector {
    flex-direction: column;
  }

  .emoji-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .circle-1,
  .circle-2,
  .circle-3 {
    display: none;
  }
}
</style>
