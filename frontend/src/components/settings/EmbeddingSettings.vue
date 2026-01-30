<template>
  <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Embedding 模型配置</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">配置文本向量化模型，用于知识库检索和语义搜索</p>
      </div>
      <div class="flex gap-2">
        <button @click="testConnection" :disabled="loading || !form.apiKey"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          <Play v-else class="w-4 h-4" />
          测试连接
        </button>
        <button @click="saveConfig" :disabled="loading"
          class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {{ loading ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>

    <div
      class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg text-sm text-blue-700 dark:text-blue-400">
      <span class="font-bold">说明：</span> Embedding 模型用于将文本转换为向量，支持语义搜索和知识库检索。请确保配置正确的 API Key 和模型。
    </div>

    <div v-if="testResult"
      class="p-4 rounded-lg flex items-center gap-3"
      :class="testResult.success ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 text-rose-700 dark:text-rose-400'">
      <CheckCircle v-if="testResult.success" class="w-5 h-5" />
      <XCircle v-else class="w-5 h-5" />
      <div>
        <div class="font-medium">{{ testResult.success ? '连接成功' : '连接失败' }}</div>
        <div class="text-sm">{{ testResult.message }}</div>
        <div class="text-xs opacity-75">{{ testResult.timestamp }}</div>
      </div>
    </div>

    <div class="space-y-6">
      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">基础配置</h3>
        
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Embedding 提供商 <span
              class="text-red-500">*</span></label>
          <select v-model="form.provider"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            <option value="">选择提供商</option>
            <option value="openai">OpenAI</option>
            <option value="siliconflow">硅基流动</option>
            <option value="zhipu">智谱 AI</option>
            <option value="aliyun">阿里云</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">API Key <span
              class="text-red-500">*</span></label>
          <div class="flex gap-2">
            <input :type="showApiKey ? 'text' : 'password'" v-model="form.apiKey"
              placeholder="请输入 API Key"
              class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
            <button @click="showApiKey = !showApiKey"
              class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              {{ showApiKey ? '隐藏' : '显示' }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Base URL <span
              class="text-red-500">*</span></label>
          <input type="text" v-model="form.baseURL" :placeholder="getPlaceholderURL()"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Embedding 模型 <span
              class="text-red-500">*</span></label>
          <select v-model="form.model"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            <option value="">选择模型</option>
            <option v-for="model in getAvailableModels()" :key="model.value" :value="model.value">
              {{ model.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">高级配置</h3>
        
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">批次大小</label>
          <input type="number" v-model.number="form.batchSize" min="1" max="1000"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
          <p class="text-xs text-slate-500 dark:text-slate-400">单次处理的最大文本数量，默认 100</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">超时时间 (秒)</label>
          <input type="number" v-model.number="form.timeout" min="1" max="300"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
          <p class="text-xs text-slate-500 dark:text-slate-400">请求超时时间，默认 30 秒</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">使用统计</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats.totalRequests || 0 }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">总请求次数</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats.totalTokens || 0 }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">处理 Token 数</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats.avgResponseTime || 0 }}ms</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">平均响应时间</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-vue-next'
import apiService from '@/services/apiService.js'

const emit = defineEmits(['save', 'error'])

const loading = ref(false)
const showApiKey = ref(false)
const testResult = ref(null)

const form = ref({
  provider: '',
  apiKey: '',
  baseURL: '',
  model: '',
  batchSize: 100,
  timeout: 30
})

const stats = ref({
  totalRequests: 0,
  totalTokens: 0,
  avgResponseTime: 0
})

const providerConfigs = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    models: [
      { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
      { label: 'text-embedding-3-large', value: 'text-embedding-3-large' },
      { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002' }
    ]
  },
  siliconflow: {
    baseURL: 'https://api.siliconflow.cn/v1',
    models: [
      { label: 'BGE-M3 (BAAI/bge-m3)', value: 'BAAI/bge-m3' },
      { label: 'BGE-Large-Zh (BAAI/bge-large-zh-v1.5)', value: 'BAAI/bge-large-zh-v1.5' },
      { label: 'text-embedding-3-small', value: 'text-embedding-3-small' },
      { label: 'text-embedding-3-large', value: 'text-embedding-3-large' }
    ]
  },
  zhipu: {
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { label: 'Embedding-3', value: 'embedding-3' },
      { label: 'Embedding-2', value: 'embedding-2' }
    ]
  },
  aliyun: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { label: 'text-embedding-v3', value: 'text-embedding-v3' },
      { label: 'text-embedding-v2', value: 'text-embedding-v2' },
      { label: 'text-embedding-ada-002', value: 'text-embedding-ada-002' }
    ]
  }
}

watch(() => form.value.provider, (newProvider) => {
  if (newProvider && providerConfigs[newProvider]) {
    form.value.baseURL = providerConfigs[newProvider].baseURL
    if (providerConfigs[newProvider].models.length > 0) {
      form.value.model = providerConfigs[newProvider].models[0].value
    }
  }
})

function getPlaceholderURL() {
  if (form.value.provider && providerConfigs[form.value.provider]) {
    return providerConfigs[form.value.provider].baseURL
  }
  return 'https://api.example.com/v1'
}

function getAvailableModels() {
  if (form.value.provider && providerConfigs[form.value.provider]) {
    return providerConfigs[form.value.provider].models
  }
  return []
}

async function testConnection() {
  if (!form.value.apiKey || !form.value.baseURL || !form.value.model) {
    emit('error', { message: '请填写完整的配置信息' })
    return
  }

  loading.value = true
  testResult.value = null

  try {
    const response = await apiService.post('/admin/config/test-connection', {
      provider: 'embedding',
      apiKey: form.value.apiKey,
      baseURL: form.value.baseURL,
      model: form.value.model
    })

    testResult.value = {
      success: true,
      message: '连接测试成功，Embedding 服务正常',
      timestamp: new Date().toLocaleTimeString()
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message || '连接测试失败',
      timestamp: new Date().toLocaleTimeString()
    }
  } finally {
    loading.value = false
  }
}

async function loadConfig() {
  try {
    const res = await apiService.get('/admin/config')
    if (res.config && res.config.embedding) {
      form.value = {
        ...form.value,
        ...res.config.embedding
      }
    }
    
    // 加载统计信息（模拟数据）
    stats.value = {
      totalRequests: 1250,
      totalTokens: 156780,
      avgResponseTime: 245
    }
  } catch (e) {
    console.error('加载 Embedding 配置失败', e)
  }
}

async function saveConfig() {
  try {
    loading.value = true

    if (!form.value.provider || !form.value.apiKey || !form.value.baseURL || !form.value.model) {
      throw new Error('请填写完整的 Embedding 配置信息')
    }

    await apiService.put('/admin/config', {
      embedding: form.value
    })

    emit('save', 'Embedding 配置已成功保存')
  } catch (e) {
    emit('error', e)
    throw e
  } finally {
    loading.value = false
  }
}

defineExpose({
  loadConfig,
  saveConfig
})
</script>
