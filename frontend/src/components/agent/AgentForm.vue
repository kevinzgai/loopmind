<template>
  <form @submit.prevent="handleSubmit" class="w-full space-y-6">
    <!-- 一键生成工具 -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6" v-if="!isPublished">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
          <Sparkles class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">智能配置生成</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">描述您的需求，AI 将自动填写配置</p>
        </div>
      </div>

      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <textarea v-model="generatePrompt" placeholder="例如：我想要一个严厉的数学老师，喜欢出难题考验学生，说话风格幽默且严谨..."
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all min-h-[80px] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            :disabled="isGenerating"></textarea>
        </div>
        <div class="flex items-center">
          <button type="button" @click="handleAutoGenerate"
            class="w-full md:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 min-w-[120px]"
            :disabled="isGenerating || !generatePrompt.trim()">
            <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
            <Sparkles v-else class="w-4 h-4" />
            <span>{{ isGenerating ? '生成中...' : '一键生成' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧主要配置 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 基本信息卡片 -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText class="w-4 h-4" />
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">基本信息</h3>
          </div>

          <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="form-group">
                <label for="name" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  智能体名称 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input id="name" v-model="form.name" type="text" placeholder="给智能体起个名字" required
                    :disabled="isSubmitting" maxlength="50"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400" />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {{ form.name.length }}/50
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="category" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  分类 <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select v-model="form.category" id="category" :disabled="isSubmitting"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100"
                    required>
                    <option value="" disabled>请选择分类</option>
                    <option v-for="cat in AGENT_CATEGORIES" :key="cat.value" :value="cat.value">
                      {{ cat.icon }} {{ cat.label }}
                    </option>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="description" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">简短描述</label>
              <textarea id="description" v-model="form.description" placeholder="用一句话介绍你的智能体" :disabled="isSubmitting"
                maxlength="500" rows="2"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"></textarea>
            </div>

            <div class="form-group">
              <label for="knowledgeBase" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">关联知识库</label>
              <div class="relative">
                <select v-model="form.knowledgeBaseId" id="knowledgeBase" :disabled="isSubmitting"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100">
                  <option :value="null">🧠 纯模型对话（无知识库）</option>
                  <option v-for="kb in knowledgeBases" :key="kb.id" :value="kb.id">
                    📚 {{ kb.name }} ({{ kb.documentCount }} 篇文档)
                  </option>
                </select>
                <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <!-- 大脑配置卡片 -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6" v-if="!isPublished">
          <div class="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <BrainCircuit class="w-4 h-4" />
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">核心设定</h3>
          </div>

          <div class="space-y-5">
            <div class="form-group">
              <label for="model" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                AI 模型 <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="relative">
                  <select v-model="form.model" id="model" :disabled="isSubmitting"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100">
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
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input type="text" v-model="form.model" placeholder="或输入自定义模型 ID"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  :disabled="isSubmitting" />
              </div>
            </div>

            <div class="form-group">
              <label for="personality" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                人设与指令 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <textarea id="personality" v-model="form.personality"
                  placeholder="详细描述智能体的性格、说话风格、专业领域等。例如：你是一个幽默的编程导师..." :disabled="isSubmitting" maxlength="1000" rows="8"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono resize-y"></textarea>
                <div
                  class="absolute right-3 bottom-3 text-xs text-slate-400 bg-white/80 dark:bg-slate-800/80 px-2 py-1 rounded-md backdrop-blur-sm">
                  {{ form.personality.length }}/1000
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="initialMemory" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">长期记忆 / 背景设定</label>
              <textarea id="initialMemory" v-model="form.initialMemory" placeholder="赋予智能体一些预设的记忆 or 背景信息"
                :disabled="isSubmitting" maxlength="500" rows="3"
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧侧边栏 -->
      <div class="space-y-6">
        <!-- 头像设置卡片 -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div class="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Image class="w-4 h-4" />
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">形象设定</h3>
          </div>

          <div class="flex flex-col items-center">
            <!-- 预览区 -->
            <div class="relative group mb-6">
              <div
                class="w-28 h-28 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                <img v-if="avatarType === 'url' && form.avatar" :src="form.avatar" class="w-full h-full object-cover" />
                <span v-else class="text-5xl">{{ form.avatar || '🤖' }}</span>
              </div>
            </div>

            <!-- 切换器 -->
            <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full mb-4">
              <button type="button" @click="avatarType = 'emoji'"
                class="flex-1 py-1.5 rounded-md text-sm font-medium transition-all"
                :class="avatarType === 'emoji' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'">
                Emoji
              </button>
              <button type="button" @click="avatarType = 'url'"
                class="flex-1 py-1.5 rounded-md text-sm font-medium transition-all"
                :class="avatarType === 'url' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'">
                图片链接
              </button>
            </div>

            <!-- 选择器内容 -->
            <div v-if="avatarType === 'emoji'" class="w-full">
              <div class="grid grid-cols-5 gap-2">
                <button v-for="emoji in emojiOptions" :key="emoji" type="button" @click="selectEmoji(emoji)"
                  class="aspect-square flex items-center justify-center text-xl rounded-lg border transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                  :class="form.avatar === emoji ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-transparent'">
                  {{ emoji }}
                </button>
              </div>
            </div>

            <div v-else class="w-full">
              <input v-model="form.avatar" type="url" placeholder="输入头像图片 URL..."
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400" />
            </div>
          </div>
        </div>

        <!-- 语音设置卡片 -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6" v-if="!isPublished">
          <div class="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <Volume2 class="w-4 h-4" />
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">语音配置</h3>
          </div>

          <div class="space-y-5">
            <div class="form-group">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                选择音色 <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <select v-model="form.voice"
                    class="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100">
                    <option value="">跟随系统默认</option>
                    <optgroup v-for="cat in voiceCategories" :key="cat.category" :label="cat.category">
                      <option v-for="voice in cat.voices" :key="voice.id" :value="voice.id">
                        {{ voice.name }} ({{ voice.type }})
                      </option>
                    </optgroup>
                  </select>
                  <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <button type="button" @click="previewVoice" :disabled="isSubmitting || isPreviewingVoice"
                  class="px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all flex items-center justify-center disabled:opacity-50 border border-slate-200 dark:border-slate-700">
                  <Volume2 v-if="!isPreviewingVoice" class="w-4 h-4" />
                  <Loader2 v-else class="w-4 h-4 animate-spin" />
                </button>
              </div>
            </div>

            <div class="form-group">
              <div class="flex justify-between items-center mb-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">语速调节</label>
                <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-mono">{{ form.speechRate }}</span>
              </div>
              <div class="px-1">
                <input type="range" v-model.number="form.speechRate" min="50" max="400" step="10"
                  class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600" />
                <div class="flex justify-between mt-1 text-[10px] text-slate-400">
                  <span>龟速</span>
                  <span>正常</span>
                  <span>极速</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 状态卡片 (仅编辑模式) -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6" v-if="isEditMode && initialData">
          <div class="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Activity class="w-4 h-4" />
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">发布状态</h3>
          </div>

          <div class="p-4 rounded-xl mb-4"
            :class="isPublished ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20' : 'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20'">
            <div class="flex items-start gap-3">
              <CheckCircle2 v-if="isPublished" class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <AlertCircle v-else class="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
              <div>
                <h4 class="font-bold text-sm" :class="isPublished ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'">{{ isPublished
                  ? '已上线' : '草稿状态' }}</h4>
                <p class="text-xs mt-1" :class="isPublished ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'">
                  {{ isPublished ? '智能体当前对外可见，核心配置已锁定。' : '当前仅您可见，可自由修改所有配置。' }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="isPublished" class="space-y-3">
            <p class="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              💡 提示：如需修改模型、人设等核心参数，请先执行下架操作。
            </p>
            <button type="button" @click="$emit('unpublish')"
              class="w-full py-2.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
              :disabled="isUnpublishing">
              {{ isUnpublishing ? '正在下架...' : '下架智能体' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
      <button type="button" @click="$emit('cancel')"
        class="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">
        取消
      </button>
      <button type="submit"
        class="px-8 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm hover:shadow transition-all text-sm disabled:opacity-50 flex items-center gap-2"
        :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
        <span>{{ isSubmitting ? '正在保存...' : (isEditMode ? '保存修改' : '立即创建') }}</span>
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
import { 
  Sparkles, 
  Loader2, 
  FileText, 
  BrainCircuit, 
  Image, 
  Volume2, 
  ChevronDown, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-vue-next'

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
    const response = await generateAgentConfig(generatePrompt.value)
    console.log('Generate response:', response)
    const { config } = response

    if (!config) {
      throw new Error('未获取到有效配置')
    }

    // Auto fill form
    if (config.name) form.name = config.name
    if (config.description) form.description = config.description
    if (config.category) form.category = config.category
    if (config.personality) form.personality = config.personality
    if (config.initialMemory) form.initialMemory = config.initialMemory
    if (config.avatar) {
      form.avatar = config.avatar
      // 检测是否为 URL
      if (config.avatar.startsWith('http') || config.avatar.startsWith('data:')) {
        avatarType.value = 'url'
      } else {
        avatarType.value = 'emoji'
      }
    }
    if (config.voice) form.voice = config.voice
    
    // 注意：后端 Prompt 没有生成 model 和 speechRate，所以我们不覆盖它们，保持默认或用户选择

  } catch (err) {
    console.error('Auto generation failed:', err)
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
/* Custom Scrollbar for Textarea */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.8);
}
</style>