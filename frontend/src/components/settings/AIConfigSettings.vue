<template>
  <section
    class="bg-card dark:bg-card rounded-xl border  p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-foreground">AI 模型配置</h2>
              <p class="text-sm text-muted-foreground">配置系统默认使用的 AI 服务提供商</p>
            </div>
            <div v-if="loading" class="px-4 py-2 bg-muted dark:bg-card text-foreground rounded-lg text-sm font-medium">
              保存中...
            </div>
          </div>

    <div
      class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg text-sm text-blue-700 dark:text-blue-400">
      <span class="font-bold">提示：</span> 标注 <span class="text-red-500 font-bold">*</span>
      的项目为系统初始化及运行必备配置，请务必填写完整。
    </div>

    <div class="space-y-6">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-foreground">默认提供商</h3>
          <button @click="openAddProviderDialog"
            class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus class="w-4 h-4" />
            添加厂商
          </button>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">默认 AI 提供商 <span
              class="text-red-500">*</span></label>
          <select v-model="form.provider"
            class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
            <option v-for="provider in providers" :key="provider.id" :value="provider.id">
              {{ provider.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-foreground">已配置厂商</h3>
        <div v-if="providers.length === 0"
          class="p-8 text-center border-2 border-dashed  rounded-lg">
          <Cpu class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p class="text-muted-foreground mb-4">暂无配置的厂商</p>
          <button @click="openAddProviderDialog"
            class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
            添加第一个厂商
          </button>
        </div>
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="provider in providers" :key="provider.id"
            class="border  rounded-lg p-4 space-y-3"
            :class="form.provider === provider.id ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/10' : 'bg-muted dark:bg-card'">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-foreground">{{ provider.name }}</h4>
                  <span v-if="form.provider === provider.id"
                    class="px-2 py-0.5 bg-primary text-white text-xs rounded-full">默认</span>
                </div>
                <p class="text-sm text-muted-foreground mt-1">模型: {{ provider.model }}</p>
              </div>
              <div class="flex gap-1">
                <button @click="testProvider(provider.id)" :disabled="testingProviders[provider.id] || !provider.apiKey"
                  class="p-2 text-muted-foreground hover:text-green-500 hover:bg-primary/10 dark:hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="provider.apiKey ? '测试连接' : '请先配置 API Key'">
                  <Loader2 v-if="testingProviders[provider.id]" class="w-4 h-4 animate-spin" />
                  <Play v-else class="w-4 h-4" />
                </button>
                <button @click="editProvider(provider)"
                  class="p-2 text-muted-foreground hover:text-muted-foreground  hover:bg-muted  rounded-lg transition-colors"
                  title="编辑">
                  <Pencil class="w-4 h-4" />
                </button>
                <button v-if="form.provider !== provider.id" @click="setAsDefault(provider.id)"
                  class="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10  rounded-lg transition-colors"
                  title="设为默认">
                  <Star class="w-4 h-4" />
                </button>
                <button @click="deleteProvider(provider.id)"
                  class="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  title="删除">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground w-16">API Key:</span>
                <div class="flex-1 flex items-center gap-2">
                  <code class="flex-1 bg-muted dark:bg-card px-2 py-1 rounded text-xs font-mono">
                    {{ provider.apiKey ? (showKeys[provider.id] ? provider.apiKey : '••••••••••••') : '未配置' }}
                  </code>
                  <button v-if="provider.apiKey" @click="toggleKeyVisibility(provider.id)"
                    class="text-muted-foreground hover:text-muted-foreground ">
                    <Eye v-if="!showKeys[provider.id]" class="w-4 h-4" />
                    <EyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground w-16">Base URL:</span>
                <code class="flex-1 bg-muted dark:bg-card px-2 py-1 rounded text-xs font-mono truncate">
                  {{ provider.baseURL || '未配置' }}
                </code>
              </div>
              <div v-if="testResults[provider.id]" class="flex items-center gap-2">
                <span class="text-muted-foreground w-16">测试结果:</span>
                <div class="flex items-center gap-2">
                  <CheckCircle v-if="testResults[provider.id].success" class="w-4 h-4 text-primary" />
                  <XCircle v-else class="w-4 h-4 text-rose-500" />
                  <span
                    :class="testResults[provider.id].success ? 'text-green-500' : 'text-rose-600 dark:text-rose-400'">
                    {{ testResults[provider.id].message }}
                  </span>
                  <span class="text-muted-foreground text-xs">
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
        class="bg-card dark:bg-card rounded-xl border  shadow-xl w-full max-w-lg">
        <div class="p-6 border-b ">
          <h3 class="text-lg font-bold text-foreground">{{ editingProvider ? '编辑厂商' : '添加厂商' }}</h3>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">厂商类型</label>
            <select v-model="providerForm.type" :disabled="editingProvider"
              class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="">选择预设厂商</option>
              <option v-for="preset in presetProviders" :key="preset.id" :value="preset.id">
                {{ preset.name }}
              </option>
              <option value="custom">自定义厂商</option>
            </select>
          </div>
          <div v-if="providerForm.type && providerForm.type !== 'custom' && getPresetProvider(providerForm.type)?.apiKeyUrl" class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-foreground">API Key 管理:</span>
              <a :href="getPresetProvider(providerForm.type)?.apiKeyUrl" target="_blank" rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center gap-1">
                前往 {{ getPresetProvider(providerForm.type)?.name }} 获取 API Key
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">厂商名称 <span
                class="text-red-500">*</span></label>
            <input type="text" v-model="providerForm.name"
              :placeholder="providerForm.type && providerForm.type !== 'custom' ? getPresetProvider(providerForm.type)?.name : '请输入厂商名称'"
              :disabled="providerForm.type && providerForm.type !== 'custom'"
              class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">API Key <span
                class="text-red-500">*</span></label>
            <input type="password" v-model="providerForm.apiKey" placeholder="请输入 API Key"
              class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Base URL</label>
            <input type="text" v-model="providerForm.baseURL"
              :placeholder="providerForm.type && providerForm.type !== 'custom' ? getPresetProvider(providerForm.type)?.baseURL : 'https://api.example.com/v1'"
              class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Model <span
                class="text-red-500">*</span></label>
            <select v-model="providerForm.model"
              class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
              <option v-for="model in getAvailableModels()" :key="model.value" :value="model.value">
                {{ model.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="p-6 border-t  flex justify-end gap-3">
          <button @click="closeProviderDialog"
            class="px-4 py-2 bg-muted dark:bg-card text-foreground rounded-lg text-sm font-medium hover:bg-muted  transition-colors">
            取消
          </button>
          <button @click="saveProvider"
            class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
            {{ editingProvider ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        class="bg-card dark:bg-card rounded-xl border  shadow-xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-lg font-bold text-foreground mb-2">确认删除</h3>
          <p class="text-muted-foreground">确定要删除这个厂商配置吗？此操作无法撤销。</p>
        </div>
        <div class="p-6 border-t  flex justify-end gap-3">
          <button @click="showDeleteDialog = false"
            class="px-4 py-2 bg-muted dark:bg-card text-foreground rounded-lg text-sm font-medium hover:bg-muted  transition-colors">
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
import { Cpu, Plus, Pencil, Trash2, Star, Eye, EyeOff, Play, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-vue-next'
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
    ],
    apiKeyUrl: 'https://cloud.siliconflow.cn/me/account/ak'
  },
  {
    id: 'deepseek', name: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', models: [
      { label: 'DeepSeek-V3 (deepseek-chat)', value: 'deepseek-chat' },
      { label: 'DeepSeek-R1 (deepseek-reasoner)', value: 'deepseek-reasoner' }
    ],
    apiKeyUrl: 'https://platform.deepseek.com/apikeys'
  },
  {
    id: 'qwen', name: '通义千问', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: [
      { label: 'Qwen-Turbo', value: 'qwen-turbo' },
      { label: 'Qwen-Plus', value: 'qwen-plus' },
      { label: 'Qwen-Max', value: 'qwen-max' },
      { label: 'Qwen-Long', value: 'qwen-long' }
    ],
    apiKeyUrl: 'https://dashscope.console.aliyun.com/apiKey'
  },
  {
    id: 'doubao', name: '火山引擎', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', models: [
      { label: 'Doubao-Seed-1-8-251228', value: 'doubao-seed-1-8-251228' }
    ],
    apiKeyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/service/ark/server_ai/edit'
  },
  {
    id: 'glm', name: '智谱GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', models: [
      { label: 'GLM-4-Flash', value: 'glm-4-flash' },
      { label: 'GLM-4-Plus', value: 'glm-4-plus' }
    ],
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
  },
  {
    id: 'moonshot', name: 'Kimi (Moonshot)', baseURL: 'https://api.moonshot.cn/v1', models: [
      { label: 'Moonshot V1 8K', value: 'moonshot-v1-8k' },
      { label: 'Moonshot V1 32K', value: 'moonshot-v1-32k' },
      { label: 'Moonshot V1 128K', value: 'moonshot-v1-128k' }
    ],
    apiKeyUrl: 'https://platform.moonshot.cn/console/api-keys'
  },
  {
    id: 'modelscope', name: 'ModelScope (魔搭)', baseURL: 'https://api.modelscope.cn/v1', models: [
      { label: 'Qwen2.5-72B-Instruct', value: 'qwen2.5-72b-instruct' }
    ],
    apiKeyUrl: 'https://modelscope.cn/my/apiKeys'
  },
  {
    id: 'minimax', name: 'MiniMax', baseURL: 'https://api.minimax.chat/v1', models: [
      { label: 'abab6.5s-chat', value: 'abab6.5s-chat' },
      { label: 'abab6.5-chat', value: 'abab6.5-chat' }
    ],
    apiKeyUrl: 'https://platform.minimax.chat/mykey'
  },
  {
    id: 'ollama', name: 'Ollama 本地', baseURL: 'http://localhost:11434/v1', models: [
      { label: 'llama3', value: 'llama3' },
      { label: 'llama2', value: 'llama2' },
      { label: 'mistral', value: 'mistral' }
    ],
    apiKeyUrl: null
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

async function saveProvider() {
  if (!providerForm.value.name || !providerForm.value.apiKey || !providerForm.value.model) {
    return
  }

  try {
    loading.value = true

    if (editingProvider.value) {
      const index = form.value.providers.findIndex(p => p.id === editingProvider.value.id)
      if (index !== -1) {
        form.value.providers[index] = {
          ...form.value.providers[index],
          name: providerForm.value.name,
          apiKey: providerForm.value.apiKey,
          baseURL: providerForm.value.baseURL,
          model: providerForm.value.model,
          type: providerForm.value.type,
          apiKeyUrl: getPresetProvider(providerForm.value.type)?.apiKeyUrl || null
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
        type: providerForm.value.type,
        apiKeyUrl: getPresetProvider(providerForm.value.type)?.apiKeyUrl || null
      })

      if (!form.value.provider) {
        form.value.provider = newId
      }
    }

    // 自动保存配置到服务器
    const saveData = {
      provider: form.value.provider,
      providers: form.value.providers
    }

    await apiService.aiConfig.save(saveData)
    emit('save', editingProvider.value ? '厂商配置已更新' : '厂商已添加并保存')
    closeProviderDialog()
  } catch (e) {
    emit('error', e)
  } finally {
    loading.value = false
  }
}

async function setAsDefault(providerId) {
  try {
    loading.value = true
    form.value.provider = providerId
    
    // 自动保存配置到服务器
    const saveData = {
      provider: form.value.provider,
      providers: form.value.providers
    }

    await apiService.aiConfig.save(saveData)
    emit('save', '默认提供商已更新')
  } catch (e) {
    emit('error', e)
  } finally {
    loading.value = false
  }
}

function deleteProvider(providerId) {
  deletingProviderId.value = providerId
  showDeleteDialog.value = true
}

async function confirmDelete() {
  try {
    loading.value = true
    
    form.value.providers = form.value.providers.filter(p => p.id !== deletingProviderId.value)
    if (form.value.provider === deletingProviderId.value) {
      form.value.provider = form.value.providers.length > 0 ? form.value.providers[0].id : ''
    }
    
    // 自动保存配置到服务器
    const saveData = {
      provider: form.value.provider,
      providers: form.value.providers
    }

    await apiService.aiConfig.save(saveData)
    emit('save', '厂商已删除')
    showDeleteDialog.value = false
    deletingProviderId.value = null
  } catch (e) {
    emit('error', e)
  } finally {
    loading.value = false
  }
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

    const response = await apiService.aiConfig.testConnection(testPayload)
    
    // 检查响应状态
    if (response && response.success !== false) {
      testResults.value[providerId] = {
        success: true,
        message: '连接成功',
        timestamp: new Date().toLocaleTimeString()
      }
    } else {
      testResults.value[providerId] = {
        success: false,
        message: response?.message || '连接失败',
        timestamp: new Date().toLocaleTimeString()
      }
    }
  } catch (error) {
    // 详细处理不同类型的错误
    let errorMessage = '连接失败'
    
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          errorMessage = '认证失败，请检查 API Key'
          break
        case 403:
          errorMessage = '权限不足'
          break
        case 404:
          errorMessage = 'API 端点不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = `HTTP 错误 ${error.response.status}`
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '无法连接到服务器，请检查网络'
    } else {
      // 请求配置出错
      errorMessage = error.message || '请求失败'
    }
    
    testResults.value[providerId] = {
      success: false,
      message: errorMessage,
      timestamp: new Date().toLocaleTimeString()
    }
  } finally {
    testingProviders.value[providerId] = false
  }
}

async function loadConfig() {
  try {
    console.log('开始加载 AI 配置...')
    const res = await apiService.aiConfig.get()
    console.log('API 响应:', res)
    
    if (res) {
      // 新接口直接返回配置对象
      if (res.provider !== undefined) {
        form.value.provider = res.provider || ''
        form.value.providers = res.providers || []
        console.log('配置加载完成，直接使用新接口返回的配置')
      } else if (res.config) {
        // 向后兼容旧接口格式
        console.log('使用旧接口格式加载配置...')
        form.value.provider = res.config.provider || ''

        // 加载所有厂商配置
        const providers = []
        
        // 遍历所有预设提供商
        console.log('遍历预设提供商...')
        presetProviders.forEach(preset => {
          console.log(`检查 ${preset.name} 配置...`)
          if (res.config[preset.id] && res.config[preset.id].apiKey) {
            console.log(`${preset.name} 已配置，添加到列表`)
            providers.push({
              id: preset.id,
              name: preset.name,
              apiKey: res.config[preset.id].apiKey,
              baseURL: res.config[preset.id].baseURL || preset.baseURL,
              model: res.config[preset.id].model || preset.models?.[0]?.value || '',
              type: preset.id,
              apiKeyUrl: preset.apiKeyUrl
            })
          } else {
            console.log(`${preset.name} 未配置或无 API Key`)
          }
        })

        // 检查是否有其他已配置的提供商
        console.log('检查其他已配置的提供商...')
        Object.keys(res.config).forEach(key => {
          if (!presetProviders.some(p => p.id === key) && res.config[key] && res.config[key].apiKey) {
            console.log(`发现自定义提供商: ${key}，添加到列表`)
            providers.push({
              id: key,
              name: key,
              apiKey: res.config[key].apiKey,
              baseURL: res.config[key].baseURL || '',
              model: res.config[key].model || '',
              type: 'custom',
              apiKeyUrl: null
            })
          }
        })

        console.log('最终提供商列表:', providers)
        form.value.providers = providers
      }
      console.log('配置加载完成')
    } else {
      console.error('API 响应格式错误')
    }
  } catch (e) {
    console.error('加载配置失败:', e)
    // 显示错误消息
    emit('error', new Error('加载配置失败，请检查网络连接'))
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})

defineExpose({
  loadConfig
})
</script>
