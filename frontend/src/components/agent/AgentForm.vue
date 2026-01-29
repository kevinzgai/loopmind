<template>
  <form @submit.prevent="handleSubmit" class="w-full space-y-8">
    <!-- 一键生成工具 - 保留原始功能与核心样式 -->
    <div class="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-6 md:p-8 mb-8" v-if="!isPublished">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">✨</div>
        <div>
          <h3 class="text-xl font-bold text-indigo-900">一键生成智能体配置</h3>
          <p class="text-sm text-indigo-700/70">只需描述你想要的智能体，AI 将自动为你填充所有配置项</p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <textarea v-model="generatePrompt" placeholder="例如：我想要一个严厉的数学老师，喜欢出难题考验学生，说话风格幽默且严谨..."
            class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] text-gray-700 shadow-inner"
            :disabled="isGenerating"></textarea>
        </div>
        <div class="flex items-center">
          <button type="button" @click="handleAutoGenerate"
            class="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
            :disabled="isGenerating || !generatePrompt.trim()">
            <span v-if="isGenerating" class="animate-spin text-xl">🔄</span>
            <span v-else class="text-xl">⚡</span>
            <span>{{ isGenerating ? '正在施法...' : '立即生成' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-8">
      <!-- 基本信息卡片 -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">📝</div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">基本信息</h3>
            <p class="text-sm text-gray-500">设置智能体的展示名称和基础分类</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label for="name" class="text-sm font-semibold text-gray-700 flex items-center gap-1">
                智能体名称 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input id="name" v-model="form.name" type="text" placeholder="给智能体起个响亮的名字" required
                  :disabled="isSubmitting" maxlength="50"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {{ form.name.length }}/50
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="category" class="text-sm font-semibold text-gray-700">分类 <span
                  class="text-red-500">*</span></label>
              <select v-model="form.category" id="category" :disabled="isSubmitting"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                required>
                <option value="" disabled>请选择分类</option>
                <option v-for="cat in AGENT_CATEGORIES" :key="cat.value" :value="cat.value">
                  {{ cat.icon }} {{ cat.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description" class="text-sm font-semibold text-gray-700">简短描述</label>
            <textarea id="description" v-model="form.description" placeholder="用一句话介绍你的智能体" :disabled="isSubmitting"
              maxlength="500" rows="2"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"></textarea>
          </div>

          <div class="form-group">
            <label for="knowledgeBase" class="text-sm font-semibold text-gray-700">关联知识库</label>
            <select v-model="form.knowledgeBaseId" id="knowledgeBase" :disabled="isSubmitting"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer">
              <option :value="null">🧠 纯模型对话（无知识库）</option>
              <option v-for="kb in knowledgeBases" :key="kb.id" :value="kb.id">
                📚 {{ kb.name }} ({{ kb.documentCount }} 篇文档)
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 大脑配置卡片 -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8" v-if="!isPublished">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">⚙️</div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">大脑配置</h3>
            <p class="text-sm text-gray-500">定义智能体的性格、思维方式与所使用的模型</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="form-group">
            <label for="model" class="text-sm font-semibold text-gray-700 flex items-center gap-1">
              AI 模型 <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select v-model="form.model" id="model" :disabled="isSubmitting"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                <option value="" disabled>选择推荐模型</option>
                <optgroup label="DeepSeek (官方)">
                  <option v-for="m in deepseekModels" :key="m.value" :value="m.value">{{ m.label }}</option>
                </optgroup>
                <optgroup label="SiliconFlow (推荐)">
                  <option v-for="m in siliconflowModels" :key="m.value" :value="m.value">{{ m.label }}</option>
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
                <optgroup label="ModelScope (魔搭)">
                  <option v-for="m in modelscopeModels" :key="m.value" :value="m.value">{{ m.label }}</option>
                </optgroup>
                <optgroup label="MiniMax">
                  <option v-for="m in minimaxModels" :key="m.value" :value="m.value">{{ m.label }}</option>
                </optgroup>
                <option value="ollama">Ollama (Local)</option>
              </select>
              <input type="text" v-model="form.model" placeholder="或输入自定义模型 ID"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                :disabled="isSubmitting" />
            </div>
          </div>

          <div class="form-group">
            <label for="personality" class="text-sm font-semibold text-gray-700 flex items-center gap-1">
              人设与指令 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <textarea id="personality" v-model="form.personality"
                placeholder="详细描述智能体的性格、说话风格、专业领域等。例如：你是一个幽默的编程导师..." :disabled="isSubmitting" maxlength="1000" rows="6"
                required
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"></textarea>
              <div
                class="absolute right-3 bottom-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                {{ form.personality.length }}/1000
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="initialMemory" class="text-sm font-semibold text-gray-700">长期记忆 / 背景设定</label>
            <textarea id="initialMemory" v-model="form.initialMemory" placeholder="赋予智能体一些预设的记忆 or 背景信息"
              :disabled="isSubmitting" maxlength="500" rows="3"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"></textarea>
          </div>
        </div>
      </div>

      <!-- 视觉与语音卡片 (并排) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- 头像设置卡片 -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-xl">🖼️</div>
            <h3 class="text-lg font-bold text-gray-900">视觉外观</h3>
          </div>

          <div class="flex flex-col items-center">
            <!-- 预览区 -->
            <div class="relative group mb-8">
              <div
                class="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <img v-if="avatarType === 'url' && form.avatar" :src="form.avatar" class="w-full h-full object-cover" />
                <span v-else class="text-6xl">{{ form.avatar || '🤖' }}</span>
              </div>
              <div
                class="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-xl"
                title="必填项">
                ⭐</div>
            </div>

            <!-- 切换器 -->
            <div class="flex p-1 bg-gray-100 rounded-2xl w-full mb-6">
              <button type="button" @click="avatarType = 'emoji'"
                class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                :class="avatarType === 'emoji' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'">
                Emoji <span class="text-red-500">*</span>
              </button>
              <button type="button" @click="avatarType = 'url'"
                class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                :class="avatarType === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'">
                图片链接 <span class="text-red-500">*</span>
              </button>
            </div>

            <!-- 选择器内容 -->
            <div v-if="avatarType === 'emoji'" class="w-full">
              <div class="grid grid-cols-6 gap-2">
                <button v-for="emoji in emojiOptions" :key="emoji" type="button" @click="selectEmoji(emoji)"
                  class="aspect-square flex items-center justify-center text-xl rounded-xl border-2 transition-all hover:scale-110 active:scale-95"
                  :class="form.avatar === emoji ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'">
                  {{ emoji }}
                </button>
              </div>
            </div>

            <div v-else class="w-full">
              <input v-model="form.avatar" type="url" placeholder="输入头像图片 URL..."
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm" />
            </div>
          </div>
        </div>

        <!-- 语音设置卡片 -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8" v-if="!isPublished">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">🔊</div>
            <h3 class="text-lg font-bold text-gray-900">语音配置</h3>
          </div>

          <div class="space-y-6">
            <div class="form-group">
              <label class="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-1">
                选择音色 <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <select v-model="form.voice"
                    class="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer text-sm">
                    <option value="">跟随系统默认</option>
                    <optgroup v-for="cat in voiceCategories" :key="cat.category" :label="cat.category">
                      <option v-for="voice in cat.voices" :key="voice.id" :value="voice.id">
                        {{ voice.name }} ({{ voice.type }})
                      </option>
                    </optgroup>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
                <button type="button" @click="previewVoice" :disabled="isSubmitting || isPreviewingVoice"
                  class="px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50">
                  <span v-if="isPreviewingVoice" class="animate-pulse">🔊</span>
                  <span v-else>▶️</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <div class="flex justify-between items-center mb-4">
                <label class="text-sm font-semibold text-gray-700">语速调节</label>
                <span class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold">{{ form.speechRate }}
                  字/分</span>
              </div>
              <div class="px-2">
                <input type="range" v-model.number="form.speechRate" min="50" max="400" step="10"
                  class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                <div class="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
                  <span>龟速</span>
                  <span>正常</span>
                  <span>极速</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态卡片 (仅编辑模式) -->
      <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8" v-if="isEditMode && initialData">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">📊</div>
          <h3 class="text-lg font-bold text-gray-900">发布状态</h3>
        </div>

        <div class="p-4 rounded-2xl mb-6"
          :class="isPublished ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'">
          <div class="flex items-start gap-3">
            <div class="text-2xl">{{ isPublished ? '✅' : '📝' }}</div>
            <div>
              <h4 class="font-bold text-sm" :class="isPublished ? 'text-green-700' : 'text-orange-700'">{{ isPublished
                ? '已上线' : '草稿状态' }}</h4>
              <p class="text-xs mt-1" :class="isPublished ? 'text-green-600' : 'text-orange-600'">
                {{ isPublished ? '智能体当前对外可见，核心配置已锁定。' : '当前仅您可见，可自由修改所有配置。' }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="isPublished" class="space-y-3">
          <p class="text-[11px] text-gray-400 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
            💡 提示：如需修改模型、人设等核心参数，请先执行下架操作。
          </p>
          <button type="button" @click="$emit('unpublish')"
            class="w-full py-3 border border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            :disabled="isUnpublishing">
            {{ isUnpublishing ? '正在下架...' : '下架智能体' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="flex flex-col md:flex-row justify-end gap-4 pt-8 border-t border-gray-100">
      <button type="button" @click="$emit('cancel')"
        class="px-8 py-4 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-lg">
        取消
      </button>
      <button type="submit"
        class="px-12 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl shadow-indigo-100 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all text-lg disabled:opacity-50"
        :disabled="isSubmitting">
        <span v-if="isSubmitting" class="animate-spin mr-2">🔄</span>
        <span>{{ isSubmitting ? '正在保存...' : (isEditMode ? '保存修改' : '立即创建智能体') }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import { voiceCategories } from '@/data/voices.js'
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
    if (config.model) form.model = config.model
    if (config.speechRate) form.speechRate = config.speechRate

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

const siliconflowModels = [
  { label: 'DeepSeek-V3', value: 'deepseek-ai/DeepSeek-V3' },
  { label: 'DeepSeek-R1', value: 'deepseek-ai/DeepSeek-R1' },
  { label: 'Qwen 2.5 72B', value: 'Qwen/Qwen2.5-72B-Instruct' },
  { label: 'Qwen 2.5 7B', value: 'Qwen/Qwen2.5-7B-Instruct' },
  { label: 'GLM-4-9B', value: 'THUDM/glm-4-9b-chat' }
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
  { label: 'Doubao-Lite-128k', value: 'doubao-lite-128k' }
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
  { label: 'Qwen-7B-Chat', value: 'qwen-7b-chat' },
  { label: 'Qwen-14B-Chat', value: 'qwen-14b-chat' },
  { label: 'ChatGLM3-6B', value: 'chatglm3-6b' }
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

.form-slider:hover~.slider-thumb,
.form-slider:active~.slider-thumb {
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
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
