<template>
  <form @submit.prevent="handleSubmit" class="agent-form">
    <!-- 一键生成工具 -->
    <div class="form-section generate-section" v-if="!isPublished && !isEditMode">
      <div class="section-header">
        <div class="section-icon">✨</div>
        <div class="section-title-group">
          <h2 class="section-title">一键生成</h2>
          <p class="section-subtitle">输入简单的描述，AI 帮你自动生成所有配置</p>
        </div>
      </div>

      <div class="generate-wrapper">
        <textarea
          v-model="generatePrompt"
          placeholder="例如：我想要一个严厉的数学老师，喜欢出难题考验学生..."
          class="form-textarea generate-input"
          rows="2"
          :disabled="isGenerating"
        ></textarea>
        <button 
          type="button" 
          @click="handleAutoGenerate" 
          class="generate-btn"
          :disabled="isGenerating || !generatePrompt.trim()"
        >
          <span v-if="isGenerating" class="btn-icon spin">🔄</span>
          <span v-else class="btn-icon">⚡</span>
          <span>{{ isGenerating ? '生成中...' : '自动生成配置' }}</span>
        </button>
      </div>
    </div>

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
            :disabled="isSubmitting"
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
            :disabled="isSubmitting"
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
        <label for="category">
          <span class="label-text">分类</span>
          <span class="label-required">*</span>
        </label>
        <div class="select-wrapper">
          <select v-model="form.category" id="category" :disabled="isSubmitting" class="form-select" required>
            <option value="" disabled>请选择分类</option>
            <option v-for="cat in AGENT_CATEGORIES" :key="cat.value" :value="cat.value">
              {{ cat.icon }} {{ cat.label }}
            </option>
          </select>
          <div class="select-icon">📁</div>
        </div>
        <div class="helper-text">选择最适合你的智能体的分类</div>
      </div>

      <div class="form-group">
        <label for="knowledgeBase">
          <span class="label-text">知识库</span>
        </label>
        <div class="select-wrapper">
          <select v-model="form.knowledgeBaseId" id="knowledgeBase" :disabled="isSubmitting" class="form-select">
            <option :value="null">无知识库</option>
            <option v-for="kb in knowledgeBases" :key="kb.id" :value="kb.id">
              📚 {{ kb.name }} ({{ kb.documentCount }} 篇文档)
            </option>
          </select>
          <div class="select-icon">📖</div>
        </div>
        <div class="helper-text">关联知识库后，智能体将能够基于文档内容回答问题</div>
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
                :disabled="isSubmitting"
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

    <!-- 发布状态管理 (仅编辑模式显示) -->
    <div class="form-section" v-if="isEditMode && initialData">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <div class="section-title-group">
          <h2 class="section-title">发布状态</h2>
          <p class="section-subtitle">管理智能体的发布和下架</p>
        </div>
      </div>
      
      <div class="status-card" :class="{ 'status-published': isPublished, 'status-draft': !isPublished }">
        <div class="status-icon">{{ isPublished ? '✅' : '📝' }}</div>
        <div class="status-content">
          <h3>{{ isPublished ? '已发布' : '草稿' }}</h3>
          <p>{{ isPublished ? '已发布的智能体不能修改核心配置' : '草稿状态下可以修改所有配置' }}</p>
        </div>
      </div>

      <!-- 下架按钮 -->
      <div v-if="isPublished" class="unpublish-wrapper">
        <div class="unpublish-alert">
          <span class="alert-icon">💡</span>
          <span class="alert-text">如需修改核心配置（模型、人设、语音等），请先下架智能体</span>
        </div>
        <button 
          type="button"
          @click="$emit('unpublish')" 
          class="unpublish-btn"
          :disabled="isUnpublishing"
        >
          <span class="btn-icon">⬇️</span>
          <span>{{ isUnpublishing ? '下架中...' : '下架智能体' }}</span>
        </button>
      </div>
    </div>

    <!-- 核心配置 (未发布或创建模式下显示) -->
    <div class="form-section" v-if="!isPublished">
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
        <div class="model-selection-container">
          <div class="select-wrapper">
            <select v-model="form.model" id="model" :disabled="isSubmitting" class="form-select">
              <option value="" disabled>请选择模型</option>
              <optgroup label="DeepSeek">
                <option v-for="m in deepseekModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </optgroup>
              <optgroup label="通义千问">
                <option v-for="m in qwenModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </optgroup>
              <optgroup label="火山引擎 (豆包)">
                <option v-for="m in doubaoModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </optgroup>
              <optgroup label="智谱GLM">
                <option v-for="m in glmModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </optgroup>
              <optgroup label="Kimi (Moonshot)">
                <option v-for="m in moonshotModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </optgroup>
              <optgroup label="ModelScope">
                <option v-for="m in modelscopeModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </optgroup>
              <optgroup label="MiniMax">
                <option v-for="m in minimaxModels" :key="m.value" :value="m.value">{{ m.label }}</option>
              </optgroup>
              <optgroup label="其他">
                <option value="ollama">Ollama (Local)</option>
              </optgroup>
            </select>
            <div class="select-icon">🤖</div>
          </div>
          <div class="custom-model-input">
            <input 
              type="text" 
              v-model="form.model" 
              placeholder="或输入自定义模型ID" 
              class="form-input"
              :disabled="isSubmitting"
            />
          </div>
        </div>
        <div class="helper-text">可从列表选择推荐模型，或直接输入模型 ID</div>
      </div>

      <div class="form-group">
        <label for="personality">
          <span class="label-text">人设</span>
        </label>
        <div class="textarea-wrapper">
          <textarea
            id="personality"
            v-model="form.personality"
            placeholder="描述你的智能体的性格、说话风格等"
            :disabled="isSubmitting"
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
            placeholder="智能体的初始背景信息或记忆"
            :disabled="isSubmitting"
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

    <!-- 语音配置 (未发布或创建模式下显示) -->
    <div class="form-section" v-if="!isPublished">
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
            <select v-model="form.voice" id="voice" :disabled="isSubmitting" class="form-select">
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
            :disabled="isSubmitting || isPreviewingVoice"
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
              :disabled="isSubmitting"
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

    <div class="form-actions">
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="btn-icon">⏳</span>
        <span v-else class="btn-icon">💾</span>
        <span>{{ isSubmitting ? '保存中...' : (isEditMode ? '保存修改' : '创建智能体') }}</span>
      </button>
      <button type="button" @click="$emit('cancel')" class="cancel-btn">
        <span class="btn-icon">✕</span>
        <span>取消</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import { generateAgentConfig } from '@/services/agentService.js'
import { getKnowledgeBases } from '@/services/knowledgeService.js'
import { AGENT_CATEGORIES } from '@/constants/agent.js'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  initialData: {
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  isUnpublishing: {
    type: Boolean,
    default: false
  },
  currentProvider: {
    type: String,
    default: 'deepseek'
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'unpublish'])

const knowledgeBases = ref([])

const form = reactive({ 
  category: '生活',
  knowledgeBaseId: null,
  ...props.modelValue 
})

onMounted(async () => {
  try {
    const res = await getKnowledgeBases()
    knowledgeBases.value = res.kbs
  } catch (error) {
    console.error('获取知识库列表失败:', error)
  }
})
const avatarType = ref('emoji')
const isPreviewingVoice = ref(false)

// 一键生成相关
const generatePrompt = ref('')
const isGenerating = ref(false)

const handleAutoGenerate = async () => {
  if (!generatePrompt.value.trim()) return
  
  try {
    isGenerating.value = true
    const { config } = await generateAgentConfig(generatePrompt.value)
    
    // Auto fill form
    if (config.name) form.name = config.name
    if (config.description) form.description = config.description
    if (config.category) form.category = config.category
    if (config.personality) form.personality = config.personality
    if (config.initialMemory) form.initialMemory = config.initialMemory
    if (config.avatar) {
      form.avatar = config.avatar
      avatarType.value = 'emoji'
    }
    if (config.voice) form.voice = config.voice
    
  } catch (err) {
    console.error('Auto generation failed:', err)
    // 简单的错误提示，实际项目中可以使用 Toast
    alert('生成失败: ' + (err.message || '未知错误'))
  } finally {
    isGenerating.value = false
  }
}

const deepseekModels = [
  { label: 'DeepSeek-V3 (deepseek-chat)', value: 'deepseek-chat' },
  { label: 'DeepSeek-R1 (deepseek-reasoner)', value: 'deepseek-reasoner' }
]

const qwenModels = [
  { label: 'Qwen-Turbo', value: 'qwen-turbo' },
  { label: 'Qwen-Plus', value: 'qwen-plus' },
  { label: 'Qwen-Max', value: 'qwen-max' },
  { label: 'Qwen-Long', value: 'qwen-long' }
]

const doubaoModels = [
  { label: 'Doubao-Pro-4k', value: 'doubao-pro-4k' },
  { label: 'Doubao-Pro-32k', value: 'doubao-pro-32k' },
  { label: 'Doubao-Pro-128k', value: 'doubao-pro-128k' },
  { label: 'Doubao-Lite-4k', value: 'doubao-lite-4k' },
  { label: 'Doubao-Lite-32k', value: 'doubao-lite-32k' },
  { label: 'Doubao-Lite-128k', value: 'doubao-lite-128k' },
  { label: 'Doubao-Seed-1-8', value: 'doubao-seed-1-8-251228' }
]

const glmModels = [
  { label: 'GLM-4-Flash', value: 'glm-4-flash' },
  { label: 'GLM-4-Plus', value: 'glm-4-plus' },
  { label: 'GLM-4-Air', value: 'glm-4-air' },
  { label: 'GLM-4', value: 'glm-4' }
]

const moonshotModels = [
  { label: 'Moonshot-v1-8k', value: 'moonshot-v1-8k' },
  { label: 'Moonshot-v1-32k', value: 'moonshot-v1-32k' },
  { label: 'Moonshot-v1-128k', value: 'moonshot-v1-128k' }
]

const modelscopeModels = [
  { label: 'Qwen 2.5 72B Instruct', value: 'Qwen/Qwen2.5-72B-Instruct' },
  { label: 'Qwen 2.5 7B Instruct', value: 'Qwen/Qwen2.5-7B-Instruct' },
  { label: 'Qwen 2.5 Coder 32B Instruct', value: 'Qwen/Qwen2.5-Coder-32B-Instruct' },
  { label: 'DeepSeek R1 Distill Qwen 32B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B' }
]

const minimaxModels = [
  { label: 'Abab 6.5s Chat', value: 'abab6.5s-chat' },
  { label: 'Abab 6.5 Chat', value: 'abab6.5-chat' },
  { label: 'Abab 6.5g Chat', value: 'abab6.5g-chat' }
]

const emojiOptions = [
  '🤖', '👨‍💻', '👩‍💻', '🧠', '💡', '⚡', '🔥', '✨', 
  '🎯', '🚀', '💎', '🌟', '🎨', '📚', '🔬', '🎵',
  '🐱', '🐶', '🦊', '🐼', '🦄', '🐸', '🦋', '🌸',
  '😊', '😎', '🤓', '😇', '🥳', '🤗', '😋', '🤔'
]

// 监听 props.modelValue 变化（外部数据加载完成时）
watch(() => props.modelValue, (newVal) => {
  Object.assign(form, newVal)
  
  if (newVal.avatar) {
    if (newVal.avatar.startsWith('http') || newVal.avatar.startsWith('data:')) {
      avatarType.value = 'url'
    } else {
      avatarType.value = 'emoji'
    }
  }
}, { deep: true })

// 与系统配置保持一致：当系统 provider 变化且当前未设置模型时，同步到表单
watch(() => props.currentProvider, (p) => {
  if (!form.model && p) {
    form.model = p
  }
})

// 监听 form 变化，通知父组件
watch(form, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const selectEmoji = (emoji) => {
  form.avatar = emoji
}

const handleSubmit = () => {
  emit('submit')
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
</script>

<style scoped>
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
  color: #f56565;
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

.helper-text {
  font-size: 0.8125rem;
  color: #777;
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
  color: #f56565;
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
  background: transparent;
  cursor: pointer;
  border: none;
  box-shadow: none;
}

.form-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  border: none;
  box-shadow: none;
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
  transition: left 0.1s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.form-slider:hover ~ .slider-thumb,
.form-slider:active ~ .slider-thumb {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
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

/* 状态卡片样式 */
.status-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.status-published {
  background: #f0fff4;
  border: 1px solid #c6f6d5;
}

.status-draft {
  background: #fffaf0;
  border: 1px solid #feebc8;
}

.status-icon {
  font-size: 2.5rem;
}

.status-content h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  color: #2d3748;
}

.status-published .status-content h3 {
  color: #2f855a;
}

.status-draft .status-content h3 {
  color: #c05621;
}

.status-content p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

.unpublish-wrapper {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
  padding: 1.5rem;
}

.unpublish-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #c53030;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.unpublish-btn {
  width: 100%;
  padding: 12px;
  background: white;
  color: #c53030;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.unpublish-btn:hover:not(:disabled) {
  background: #c53030;
  color: white;
}

.unpublish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
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
}

.model-selection-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.custom-model-input {
  position: relative;
}

/* 一键生成样式 */
.generate-section {
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f3ff 100%);
  border: 2px solid #e0e7ff;
  border-radius: 16px;
  padding: 1.5rem !important;
}

.generate-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.generate-input {
  min-height: 80px;
  border-color: #c3dafe;
  background: white;
}

.generate-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.generate-btn {
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
