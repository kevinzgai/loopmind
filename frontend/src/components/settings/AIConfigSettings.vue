<template>
  <section
    class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">AI 模型配置</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">配置系统默认使用的 AI 服务提供商</p>
      </div>
      <button @click="saveConfig" :disabled="loading"
        class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
        {{ loading ? '保存中...' : '保存配置' }}
      </button>
    </div>

    <div
      class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg text-sm text-blue-700 dark:text-blue-400">
      <span class="font-bold">提示：</span> 标注 <span class="text-red-500 font-bold">*</span>
      的项目为系统初始化及运行必备配置，请务必填写完整。
    </div>

    <div class="space-y-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-slate-900 dark:text-slate-100">默认提供商</h3>
          <button @click="openAddProviderDialog"
            class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus class="w-4 h-4" />
            添加厂商
          </button>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">默认 AI 提供商 <span
              class="text-red-500">*</span></label>
          <select v-model="form.provider"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            <option v-for="provider in providers" :key="provider.id" :value="provider.id">
              {{ provider.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">已配置厂商</h3>
        <div v-if="providers.length === 0"
          class="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Cpu class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p class="text-slate-500 dark:text-slate-400 mb-4">暂无配置的厂商</p>
          <button @click="openAddProviderDialog"
            class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
            添加第一个厂商
          </button>
        </div>
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="provider in providers" :key="provider.id"
            class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
            :class="form.provider === provider.id ? 'border-violet-500 dark:border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'bg-slate-50 dark:bg-slate-800'">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-slate-900 dark:text-slate-100">{{ provider.name }}</h4>
                  <span v-if="form.provider === provider.id"
                    class="px-2 py-0.5 bg-violet-600 text-white text-xs rounded-full">默认</span>
                </div>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">模型: {{ provider.model }}</p>
              </div>
              <div class="flex gap-1">
                <button @click="testProvider(provider.id)" :disabled="testingProviders[provider.id] || !provider.apiKey"
                  class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="provider.apiKey ? '测试连接' : '请先配置 API Key'">
                  <Loader2 v-if="testingProviders[provider.id]" class="w-4 h-4 animate-spin" />
                  <Play v-else class="w-4 h-4" />
                </button>
                <button @click="editProvider(provider)"
                  class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="编辑">
                  <Pencil class="w-4 h-4" />
                </button>
                <button v-if="form.provider !== provider.id" @click="setAsDefault(provider.id)"
                  class="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                  title="设为默认">
                  <Star class="w-4 h-4" />
                </button>
                <button @click="deleteProvider(provider.id)"
                  class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  title="删除">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-16">API Key:</span>
                <div class="flex-1 flex items-center gap-2">
                  <code class="flex-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs font-mono">
                    {{ provider.apiKey ? (showKeys[provider.id] ? provider.apiKey : '••••••••••••') : '未配置' }}
                  </code>
                  <button v-if="provider.apiKey" @click="toggleKeyVisibility(provider.id)"
                    class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Eye v-if="!showKeys[provider.id]" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-16">Base URL:</span>
                <code class="flex-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs font-mono truncate">
                  {{ provider.baseURL || '未配置' }}
                </code>
              </div>
              <div v-if="testResults[provider.id]" class="flex items-center gap-2">
                <span class="text-slate-500 dark:text-slate-400 w-16">测试结果:</span>
                <div class="flex items-center gap-2">
                  <CheckCircle v-if="testResults[provider.id].success" class="w-4 h-4 text-emerald-500" />
                  <XCircle v-else class="w-4 h-4 text-rose-500" />
                  <span
                    :class="testResults[provider.id].success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                    {{ testResults[provider.id].message }}
                  </span>
                  <span class="text-slate-400 text-xs">
                    ({{ testResults[provider.id].timestamp }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>

    <div v-if="showProviderDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ editingProvider ? '编辑厂商' : '添加厂商' }}</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">厂商类型</label>
            <select v-model="providerForm.type" :disabled="editingProvider"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              <option value="">选择预设厂商</option>
              <option v-for="preset in presetProviders" :key="preset.id" :value="preset.id">
                {{ preset.name }}
              </option>
              <option value="custom">自定义厂商</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">厂商名称 <span
                class="text-red-500">*</span></label>
            <input type="text" v-model="providerForm.name"
              :placeholder="providerForm.type && providerForm.type !== 'custom' ? getPresetProvider(providerForm.type)?.name : '请输入厂商名称'"
              :disabled="providerForm.type && providerForm.type !== 'custom'"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">API Key <span
                class="text-red-500">*</span></label>
            <input type="password" v-model="providerForm.apiKey" placeholder="请输入 API Key"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Base URL</label>
            <input type="text" v-model="providerForm.baseURL"
              :placeholder="providerForm.type && providerForm.type !== 'custom' ? getPresetProvider(providerForm.type)?.baseURL : 'https://api.example.com/v1'"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Model <span
                class="text-red-500">*</span></label>
            <select v-model="providerForm.model"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
              <option v-for="model in getAvailableModels()" :key="model.value" :value="model.value">
                {{ model.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button @click="closeProviderDialog"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            取消
          </button>
          <button @click="saveProvider"
            class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
            {{ editingProvider ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">确认删除</h3>
          <p class="text-slate-600 dark:text-slate-400">确定要删除这个厂商配置吗？此操作无法撤销。</p>
        </div>
        <div class="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button @click="showDeleteDialog = false"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            取消
          </button>
          <button @click="confirmDelete"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors">
            删除
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Cpu, Plus, Pencil, Trash2, Star, Eye, EyeOff, Play, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'
import apiService from '@/services/apiService.js'

const emit = defineEmits(['save', 'error'])

const loading = ref(false)
const showKeys = ref({})
const showProviderDialog = ref(false)
const showDeleteDialog = ref(false)
const editingProvider = ref(null)
const deletingProviderId = ref(null)
const testingProviders = ref({})
const testResults = ref({})

const form = ref({
  provider: '',
  providers: []
})

const providerForm = ref({
  type: '',
  name: '',
  apiKey: '',
  baseURL: '',
  model: ''
})

const providers = computed(() => form.value.providers || [])

const presetProviders = [
  {
    id: 'siliconflow', name: '硅基流动', baseURL: 'https://api.siliconflow.cn/v1', models: [
      { label: 'DeepSeek-V3 (deepseek-chat)', value: 'deepseek-chat' },
      { label: 'DeepSeek-R1 (deepseek-reasoner)', value: 'deepseek-reasoner' },
      { label: 'Qwen2.5-7B-Instruct', value: 'Qwen/Qwen2.5-7B-Instruct' },
      { label: 'Qwen2.5-32B-Instruct', value: 'Qwen/Qwen2.5-32B-Instruct' },
      { label: 'Qwen2.5-72B-Instruct', value: 'Qwen/Qwen2.5-72B-Instruct' },
      { label: 'Qwen2.5-Coder-32B-Instruct', value: 'Qwen/Qwen2.5-Coder-32B-Instruct' },
      { label: 'Meta-Llama-3.1-8B-Instruct', value: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
      { label: 'Meta-Llama-3.1-70B-Instruct', value: 'meta-llama/Meta-Llama-3.1-70B-Instruct' },
      { label: '01-ai/Yi-1.5-34B-Chat', value: '01-ai/Yi-1.5-34B-Chat' },
      { label: 'THUDM/glm-4-9b-chat', value: 'THUDM/glm-4-9b-chat' },
      { label: 'internlm/internlm2_5-7b-chat', value: 'internlm/internlm2_5-7b-chat' },
      { label: 'internlm/internlm2_5-20b-chat', value: 'internlm/internlm2_5-20b-chat' }
    ]
  },
  {
    id: 'deepseek', name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', models: [
      { label: 'DeepSeek-V3 (deepseek-chat)', value: 'deepseek-chat' },
      { label: 'DeepSeek-R1 (deepseek-reasoner)', value: 'deepseek-reasoner' }
    ]
  },
  {
    id: 'qwen', name: '通义千问', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: [
      { label: 'Qwen-Turbo', value: 'qwen-turbo' },
      { label: 'Qwen-Plus', value: 'qwen-plus' },
      { label: 'Qwen-Max', value: 'qwen-max' },
      { label: 'Qwen-Long', value: 'qwen-long' }
    ]
  },
  {
    id: 'doubao', name: '火山引擎', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', models: [
      { label: 'Doubao-Pro-32K', value: 'doubao-pro-32k' },
      { label: 'Doubao-Pro-128K', value: 'doubao-pro-128k' }
    ]
  },
  {
    id: 'glm', name: '智谱GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', models: [
      { label: 'GLM-4-Flash', value: 'glm-4-flash' },
      { label: 'GLM-4-Plus', value: 'glm-4-plus' }
    ]
  },
  {
    id: 'moonshot', name: 'Kimi (Moonshot)', baseURL: 'https://api.moonshot.cn/v1', models: [
      { label: 'Moonshot V1 8K', value: 'moonshot-v1-8k' },
      { label: 'Moonshot V1 32K', value: 'moonshot-v1-32k' },
      { label: 'Moonshot V1 128K', value: 'moonshot-v1-128k' }
    ]
  },
  {
    id: 'modelscope', name: 'ModelScope (魔搭)', baseURL: 'https://api.modelscope.cn/v1', models: [
      { label: 'Qwen2.5-72B-Instruct', value: 'qwen2.5-72b-instruct' }
    ]
  },
  {
    id: 'minimax', name: 'MiniMax', baseURL: 'https://api.minimax.chat/v1', models: [
      { label: 'abab6.5s-chat', value: 'abab6.5s-chat' },
      { label: 'abab6.5-chat', value: 'abab6.5-chat' }
    ]
  },
  {
    id: 'ollama', name: 'Ollama 本地', baseURL: 'http://localhost:11434/v1', models: [
      { label: 'llama3', value: 'llama3' },
      { label: 'llama2', value: 'llama2' },
      { label: 'mistral', value: 'mistral' }
    ]
  }
]

function getPresetProvider(type) {
  return presetProviders.find(p => p.id === type)
}

function getAvailableModels() {
  if (providerForm.value.type && providerForm.value.type !== 'custom') {
    const preset = getPresetProvider(providerForm.value.type)
    return preset?.models || []
  }
  return [{ label: '自定义模型', value: 'custom-model' }]
}

watch(() => providerForm.value.type, (newType) => {
  if (newType && newType !== 'custom') {
    const preset = getPresetProvider(newType)
    if (preset) {
      providerForm.value.name = preset.name
      providerForm.value.baseURL = preset.baseURL
      if (preset.models.length > 0) {
        providerForm.value.model = preset.models[0].value
      }
    }
  }
})

function openAddProviderDialog() {
  editingProvider.value = null
  providerForm.value = {
    type: '',
    name: '',
    apiKey: '',
    baseURL: '',
    model: ''
  }
  showProviderDialog.value = true
}

function editProvider(provider) {
  editingProvider.value = provider
  providerForm.value = {
    type: provider.type || 'custom',
    name: provider.name,
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    model: provider.model
  }
  showProviderDialog.value = true
}

function closeProviderDialog() {
  showProviderDialog.value = false
  editingProvider.value = null
  providerForm.value = {
    type: '',
    name: '',
    apiKey: '',
    baseURL: '',
    model: ''
  }
}

function saveProvider() {
  if (!providerForm.value.name || !providerForm.value.apiKey || !providerForm.value.model) {
    return
  }

  if (editingProvider.value) {
    const index = form.value.providers.findIndex(p => p.id === editingProvider.value.id)
    if (index !== -1) {
      form.value.providers[index] = {
        ...form.value.providers[index],
        name: providerForm.value.name,
        apiKey: providerForm.value.apiKey,
        baseURL: providerForm.value.baseURL,
        model: providerForm.value.model,
        type: providerForm.value.type
      }
    }
  } else {
    const newId = providerForm.value.type || `custom-${Date.now()}`
    form.value.providers.push({
      id: newId,
      name: providerForm.value.name,
      apiKey: providerForm.value.apiKey,
      baseURL: providerForm.value.baseURL,
      model: providerForm.value.model,
      type: providerForm.value.type
    })

    if (!form.value.provider) {
      form.value.provider = newId
    }
  }

  closeProviderDialog()
}

function setAsDefault(providerId) {
  form.value.provider = providerId
}

function deleteProvider(providerId) {
  deletingProviderId.value = providerId
  showDeleteDialog.value = true
}

function confirmDelete() {
  form.value.providers = form.value.providers.filter(p => p.id !== deletingProviderId.value)
  if (form.value.provider === deletingProviderId.value) {
    form.value.provider = form.value.providers.length > 0 ? form.value.providers[0].id : ''
  }
  showDeleteDialog.value = false
  deletingProviderId.value = null
}

function toggleKeyVisibility(providerId) {
  showKeys.value[providerId] = !showKeys.value[providerId]
}

async function testProvider(providerId) {
  const provider = form.value.providers.find(p => p.id === providerId)
  if (!provider || !provider.apiKey) {
    return
  }

  testingProviders.value[providerId] = true

  try {
    const testPayload = {
      provider: providerId,
      apiKey: provider.apiKey,
      baseURL: provider.baseURL,
      model: provider.model
    }

    const response = await apiService.post('/admin/config/test-connection', testPayload)

    testResults.value[providerId] = {
      success: true,
      message: '连接成功',
      timestamp: new Date().toLocaleTimeString()
    }
  } catch (error) {
    testResults.value[providerId] = {
      success: false,
      message: error.message || '连接失败',
      timestamp: new Date().toLocaleTimeString()
    }
  } finally {
    testingProviders.value[providerId] = false
  }
}

async function loadConfig() {
  try {
    const res = await apiService.get('/admin/config')
    if (res.config) {
      form.value.provider = res.config.provider || ''

      // 加载所有厂商配置
      const providers = []
      
      // 遍历所有预设提供商
      presetProviders.forEach(preset => {
        if (res.config[preset.id] && res.config[preset.id].apiKey) {
          providers.push({
            id: preset.id,
            name: preset.name,
            apiKey: res.config[preset.id].apiKey,
            baseURL: res.config[preset.id].baseURL || preset.baseURL,
            model: res.config[preset.id].model || preset.models?.[0]?.value || '',
            type: preset.id
          })
        }
      })

      // 检查是否有其他已配置的提供商
      Object.keys(res.config).forEach(key => {
        if (!presetProviders.some(p => p.id === key) && res.config[key] && res.config[key].apiKey) {
          providers.push({
            id: key,
            name: key,
            apiKey: res.config[key].apiKey,
            baseURL: res.config[key].baseURL || '',
            model: res.config[key].model || '',
            type: 'custom'
          })
        }
      })

      form.value.providers = providers
    }
  } catch (e) {
    console.error('加载配置失败', e)
  }
}

async function saveConfig() {
  try {
    loading.value = true

    const selectedProvider = form.value.provider
    const providerConfig = form.value.providers.find(p => p.id === selectedProvider)

    if (selectedProvider && selectedProvider !== 'ollama') {
      if (!providerConfig || !providerConfig.apiKey) {
        throw new Error(`请先配置默认提供商的 API Key`)
      }
    }

    const saveData = {
      provider: form.value.provider
    }

    form.value.providers.forEach(p => {
      saveData[p.id] = {
        apiKey: p.apiKey,
        baseURL: p.baseURL,
        model: p.model
      }
    })

    await apiService.put('/admin/config', saveData)
    await loadConfig()
    emit('save', 'AI 配置已成功保存')
  } catch (e) {
    emit('error', e)
    throw e
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})

defineExpose({
  loadConfig,
  saveConfig
})
</script>
