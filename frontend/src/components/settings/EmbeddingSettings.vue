<template>
  <section class="bg-card dark:bg-card rounded-xl border  p-6 shadow-sm space-y-6">
    <!-- 权限错误信息 -->
    <div v-if="!isAdmin || permissionError" class="p-8 text-center">
      <div class="w-16 h-16 mx-auto bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
        <Lock class="w-8 h-8 text-rose-600 dark:text-rose-400" />
      </div>
      <h3 class="text-lg font-bold text-foreground mb-2">权限不足</h3>
      <p class="text-muted-foreground">{{ permissionError || '您没有权限查看系统配置，请联系管理员' }}</p>
    </div>
    
    <!-- 管理员配置界面 -->
    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-foreground">Embedding 模型配置</h2>
          <p class="text-sm text-muted-foreground">配置文本向量化模型，用于知识库检索和语义搜索</p>
        </div>
        <div v-if="loading" class="px-4 py-2 bg-muted dark:bg-card text-foreground rounded-lg text-sm font-medium">
          保存中...
        </div>
      </div>

      <div
        class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg text-sm text-blue-700 dark:text-blue-400">
        <span class="font-bold">说明：</span> Embedding 模型用于将文本转换为向量，支持语义搜索和知识库检索。请确保配置正确的 API Key 和模型。
      </div>

      <div class="space-y-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-foreground">默认提供商</h3>
            <button @click="openAddProviderDialog"
              class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus class="w-4 h-4" />
              添加模型
            </button>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">默认 Embedding 提供商 <span
                class="text-red-500">*</span></label>
            <select v-model="form.provider"
              class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="">选择默认提供商</option>
              <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                {{ provider.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="font-bold text-foreground">已配置模型</h3>
          <div v-if="providers.length === 0"
            class="p-8 text-center border-2 border-dashed  rounded-lg">
            <Brain class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p class="text-muted-foreground mb-4">暂无配置的 Embedding 模型</p>
            <button @click="openAddProviderDialog"
              class="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
              添加第一个模型
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
                  <a v-if="getPresetProvider(provider.type)?.apiKeyUrl" :href="getPresetProvider(provider.type)?.apiKeyUrl" target="_blank" rel="noopener noreferrer"
                    class="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="管理 API Key">
                    <ExternalLink class="w-4 h-4" />
                  </a>
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

        <div class="space-y-4">
          <h3 class="font-bold text-foreground">使用统计</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-muted dark:bg-card rounded-lg p-4">
              <div class="text-2xl font-bold text-foreground">{{ stats.totalRequests || 0 }}</div>
              <div class="text-sm text-muted-foreground">总请求次数</div>
            </div>
            <div class="bg-muted dark:bg-card rounded-lg p-4">
              <div class="text-2xl font-bold text-foreground">{{ stats.totalTokens || 0 }}</div>
              <div class="text-sm text-muted-foreground">处理 Token 数</div>
            </div>
            <div class="bg-muted dark:bg-card rounded-lg p-4">
              <div class="text-2xl font-bold text-foreground">{{ stats.avgResponseTime || 0 }}ms</div>
              <div class="text-sm text-muted-foreground">平均响应时间</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加/编辑提供商对话框 -->
      <div v-if="showProviderDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          class="bg-card dark:bg-card rounded-xl border  shadow-xl w-full max-w-lg">
          <div class="p-6 border-b ">
            <h3 class="text-lg font-bold text-foreground">{{ editingProvider ? '编辑模型' : '添加模型' }}</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">提供商类型</label>
              <select v-model="providerForm.type" :disabled="editingProvider"
                class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="">选择提供商</option>
                <option v-for="preset in presetProviders" :key="preset.id" :value="preset.id">
                  {{ preset.name }}
                </option>
                <option value="custom">自定义提供商</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">提供商名称 <span
                  class="text-red-500">*</span></label>
              <input type="text" v-model="providerForm.name"
                :placeholder="providerForm.type && providerForm.type !== 'custom' ? getPresetProvider(providerForm.type)?.name : '请输入提供商名称'"
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
              <label class="text-sm font-medium text-foreground">Embedding 模型 <span
                  class="text-red-500">*</span></label>
              <select v-model="providerForm.model"
                class="w-full bg-muted dark:bg-card border  rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="">选择模型</option>
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

      <!-- 删除确认对话框 -->
      <div v-if="showDeleteDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          class="bg-card dark:bg-card rounded-xl border  shadow-xl w-full max-w-md">
          <div class="p-6">
            <h3 class="text-lg font-bold text-foreground mb-2">确认删除</h3>
            <p class="text-muted-foreground">确定要删除这个 Embedding 模型配置吗？此操作无法撤销。</p>
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
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Play, CheckCircle, XCircle, Loader2, Plus, Pencil, Trash2, Star, Eye, EyeOff, Brain, ExternalLink, Lock } from 'lucide-vue-next'
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
const isAdmin = ref(true) // 默认假设是管理员，实际应该从用户状态中获取
const permissionError = ref('')

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

const stats = ref({
  totalRequests: 0,
  totalTokens: 0,
  avgResponseTime: 0
})

const providers = computed(() => form.value.providers || [])

const presetProviders = [
  {
    id: 'openai', name: 'OpenAI', baseURL: 'https://api.openai.com/v1', apiKeyUrl: 'https://platform.openai.com/api-keys', models: [
      { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
      { label: 'text-embedding-3-large', value: 'text-embedding-3-large' },
      { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002' }
    ]
  },
  {
    id: 'siliconflow', name: '硅基流动', baseURL: 'https://api.siliconflow.cn/v1', apiKeyUrl: 'https://cloud.siliconflow.cn/me/account/ak', models: [
      { label: 'BGE-M3 (BAAI/bge-m3)', value: 'BAAI/bge-m3' },
      { label: 'BGE-Large-Zh (BAAI/bge-large-zh-v1.5)', value: 'BAAI/bge-large-zh-v1.5' },
      { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
      { label: 'text-embedding-3-large', value: 'text-embedding-3-large' }
    ]
  },
  {
    id: 'zhipu', name: '智谱 AI', baseURL: 'https://open.bigmodel.cn/api/paas/v4', apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys', models: [
      { label: 'Embedding-3', value: 'embedding-3' },
      { label: 'Embedding-2', value: 'embedding-2' }
    ]
  },
  {
    id: 'aliyun', name: '阿里云', baseURL: 'https://dashscope.aliyuncs.com/api/v1', apiKeyUrl: 'https://dashscope.console.aliyun.com/apiKey', models: [
      { label: 'text-embedding-v4', value: 'text-embedding-v4' }
    ]
  }
]

function getPresetProvider(type) {
  return presetProviders.find(p => p.id === type)
}

function getAvailableModels() {
  if (providerForm.value.type && providerForm.value.type !== 'custom') {
    const preset = getPresetProvider(providerForm.value.type)
    // 确保即使厂商没有 models 属性也能返回空数组
    return Array.isArray(preset?.models) ? preset.models : []
  }
  return [{ label: '自定义模型', value: 'custom-model' }]
}

watch(() => providerForm.value.type, (newType) => {
  if (newType && newType !== 'custom') {
    const preset = getPresetProvider(newType)
    if (preset) {
      providerForm.value.name = preset.name
      providerForm.value.baseURL = preset.baseURL
      // 确保即使厂商没有 models 属性也能正确处理
      if (Array.isArray(preset.models) && preset.models.length > 0) {
        providerForm.value.model = preset.models[0].value
      } else {
        providerForm.value.model = ''
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

    // 自动保存配置到服务器
    await saveConfig()
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
    await saveConfig()
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
    
    await saveConfig()
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
    const response = await apiService.embeddingConfig.testConnection({
      provider: 'embedding',
      apiKey: provider.apiKey,
      baseURL: provider.baseURL,
      model: provider.model
    })

    // 检查响应状态
    if (response && response.success !== false) {
      testResults.value[providerId] = {
        success: true,
        message: '连接测试成功，Embedding 服务正常',
        timestamp: new Date().toLocaleTimeString()
      }
    } else {
      testResults.value[providerId] = {
        success: false,
        message: response?.message || '连接测试失败',
        timestamp: new Date().toLocaleTimeString()
      }
    }
  } catch (error) {
    // 详细处理不同类型的错误
    let errorMessage = '连接测试失败'
    
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
    // 检查是否为管理员
    // 实际项目中，应该从用户状态或API中获取管理员权限信息
    // 这里使用默认值，因为 /user/info 接口不存在
    isAdmin.value = true
    
    if (!isAdmin.value) {
      permissionError.value = '您没有权限查看系统配置，请联系管理员'
      return
    }
    
    const res = await apiService.embeddingConfig.get()
    
    if (res) {
      // 新接口直接返回配置对象
      if (res.provider !== undefined) {
        form.value.provider = res.provider || ''
        form.value.providers = res.providers || []
        console.log('Embedding 配置加载完成，直接使用新接口返回的配置')
      } else if (res.config) {
        // 向后兼容旧接口格式
        console.log('使用旧接口格式加载 Embedding 配置...')
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
              model: res.config[preset.id].model || (Array.isArray(preset.models) && preset.models.length > 0 ? preset.models[0].value : ''),
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
      
      // 加载统计信息（模拟数据）
      stats.value = {
        totalRequests: 1250,
        totalTokens: 156780,
        avgResponseTime: 245
      }
    }
  } catch (e) {
    console.error('加载 Embedding 配置失败', e)
    
    // 检查是否为权限错误
    if (e.response && e.response.status === 403) {
      isAdmin.value = false
      permissionError.value = '您没有权限查看系统配置，请联系管理员'
    } else {
      emit('error', new Error('加载配置失败，请检查网络连接'))
    }
  }
}

async function saveConfig() {
  try {
    // 检查是否为管理员
    if (!isAdmin.value) {
      throw new Error('您没有权限修改系统配置，请联系管理员')
    }
    
    loading.value = true

    const selectedProvider = form.value.provider
    const providerConfig = form.value.providers.find(p => p.id === selectedProvider)

    if (selectedProvider && !providerConfig) {
      throw new Error('请先配置默认 Embedding 提供商')
    }

    const saveData = {
      provider: form.value.provider,
      providers: form.value.providers
    }

    await apiService.embeddingConfig.save(saveData)
    emit('save', 'Embedding 配置已成功保存')
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
