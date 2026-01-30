<template>
  <section
    class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">语音服务配置</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">配置全系统通用的文字转语音 (TTS) 与语音识别 (ASR) 服务</p>
      </div>
      <div class="flex gap-2">
        <button @click="testAllConnections" :disabled="testing"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {{ testing ? '测试中...' : '测试所有连接' }}
        </button>
        <button @click="saveConfig" :disabled="loading"
          class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {{ loading ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
    
    <!-- 测试结果 -->
    <div v-if="testResults.length > 0" class="space-y-2">
      <h3 class="font-bold text-slate-900 dark:text-slate-100">测试结果</h3>
      <div class="space-y-2">
        <div v-for="result in testResults" :key="result.provider"
          class="p-3 rounded-lg border" :class="result.success ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="font-medium text-slate-900 dark:text-slate-100">{{ result.provider }}</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ result.message }}</p>
            </div>
            <div class="text-lg">
              {{ result.success ? '✅' : '❌' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">文字转语音 (TTS)</h3>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">默认 TTS 服务提供商</label>
          <select v-model="form.ttsProvider"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            <option v-for="provider in availableProviders" :key="provider.id" :value="provider.id">
              {{ provider.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">语音识别 (ASR)</h3>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">默认 ASR 服务提供商</label>
          <select v-model="form.asrProvider"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            <option v-for="provider in availableProviders" :key="provider.id" :value="provider.id">
              {{ provider.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">提供商配置</h3>
        
        <!-- 硅基流动配置 -->
        <div class="space-y-4 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h4 class="font-medium text-slate-900 dark:text-slate-100">硅基流动 (SiliconFlow)</h4>
          <div class="space-y-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">API Key</label>
              <div class="flex gap-2">
                <input :type="showKeys.siliconflow ? 'text' : 'password'" v-model="providers.siliconflow.apiKey"
                  placeholder="请输入 SiliconFlow API Key"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
                <button @click="showKeys.siliconflow = !showKeys.siliconflow"
                  class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                  {{ showKeys.siliconflow ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Base URL</label>
              <input type="text" v-model="providers.siliconflow.baseURL" placeholder="https://api.siliconflow.cn/v1"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
            </div>
          </div>
        </div>

        <!-- 阿里云配置 -->
        <div class="space-y-4 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h4 class="font-medium text-slate-900 dark:text-slate-100">阿里云 (Aliyun)</h4>
          <div class="space-y-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Access Key ID</label>
              <div class="flex gap-2">
                <input :type="showKeys.aliyun ? 'text' : 'password'" v-model="providers.aliyun.accessKeyId"
                  placeholder="请输入 Access Key ID"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
                <button @click="showKeys.aliyun = !showKeys.aliyun"
                  class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                  {{ showKeys.aliyun ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Access Key Secret</label>
              <input :type="showKeys.aliyun ? 'text' : 'password'" v-model="providers.aliyun.accessKeySecret"
                placeholder="请输入 Access Key Secret"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">App Key</label>
              <input :type="showKeys.aliyun ? 'text' : 'password'" v-model="providers.aliyun.appKey"
                placeholder="请输入 App Key"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
            </div>
          </div>
        </div>

        <!-- OpenAI 配置 -->
        <div class="space-y-4 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h4 class="font-medium text-slate-900 dark:text-slate-100">OpenAI</h4>
          <div class="space-y-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">API Key</label>
              <div class="flex gap-2">
                <input :type="showKeys.openai ? 'text' : 'password'" v-model="providers.openai.apiKey"
                  placeholder="请输入 OpenAI API Key"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
                <button @click="showKeys.openai = !showKeys.openai"
                  class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                  {{ showKeys.openai ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Base URL</label>
              <input type="text" v-model="providers.openai.baseURL" placeholder="https://api.openai.com/v1"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
            </div>
          </div>
        </div>

        <!-- Seed 配置 -->
        <div class="space-y-4 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <h4 class="font-medium text-slate-900 dark:text-slate-100">Seed ASR</h4>
          <div class="space-y-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">App ID</label>
              <input type="text" v-model="providers.seed.appId"
                placeholder="请输入 App ID"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">API Key</label>
              <div class="flex gap-2">
                <input :type="showKeys.seed ? 'text' : 'password'" v-model="providers.seed.apiKey"
                  placeholder="请输入 API Key"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
                <button @click="showKeys.seed = !showKeys.seed"
                  class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                  {{ showKeys.seed ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">API Secret</label>
              <input :type="showKeys.seed ? 'text' : 'password'" v-model="providers.seed.apiSecret"
                placeholder="请输入 API Secret"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import apiService from '@/services/apiService.js'

const emit = defineEmits(['save', 'error'])

const loading = ref(false)
const testing = ref(false)
const testResults = ref([])
const showKeys = ref({
  siliconflow: false,
  aliyun: false,
  openai: false,
  seed: false
})

const form = ref({
  ttsProvider: 'siliconflow',
  asrProvider: 'siliconflow'
})

const providers = ref({
  siliconflow: {
    apiKey: '',
    baseURL: 'https://api.siliconflow.cn/v1',
    ttsModel: 'FunAudioLLM/CosyVoice2-0.5B',
    ttsVoice: 'anna',
    speechRate: 150,
    asrModel: 'FunAudioLLM/SenseVoiceSmall'
  },
  aliyun: {
    accessKeyId: '',
    accessKeySecret: '',
    appKey: '',
    ttsVoice: 'xiaoxian',
    speechRate: 150
  },
  openai: {
    apiKey: '',
    baseURL: 'https://api.openai.com/v1',
    ttsModel: 'tts-1',
    ttsVoice: 'alloy',
    speechRate: 150
  },
  seed: {
    appId: '',
    apiKey: '',
    apiSecret: '',
    apiUrl: '',
    resourceId: ''
  },
  edge: {
    ttsVoice: 'zh-CN-XiaoxiaoNeural',
    speechRate: 150
  }
})

const availableProviders = computed(() => [
  { id: 'siliconflow', name: '硅基流动 (SiliconFlow)' },
  { id: 'aliyun', name: '阿里云 (Aliyun)' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'edge', name: 'Edge TTS' },
  { id: 'seed', name: 'Seed ASR' }
])

async function loadConfig() {
  try {
    const res = await apiService.get('/admin/config/speech')
    if (res) {
      form.value.ttsProvider = res.ttsProvider || 'siliconflow'
      form.value.asrProvider = res.asrProvider || 'siliconflow'
      
      // 加载提供商配置
      if (res.providers) {
        res.providers.forEach(provider => {
          if (providers.value[provider.id]) {
            providers.value[provider.id].apiKey = provider.apiKey || providers.value[provider.id].apiKey
            providers.value[provider.id].baseURL = provider.baseURL || providers.value[provider.id].baseURL
          }
        })
      }
    }
  } catch (e) {
    console.error('加载配置失败', e)
  }
}

async function saveConfig() {
  try {
    loading.value = true
    
    // 构建提供商配置数组
    const providersArray = Object.keys(providers.value).map(id => {
      const p = providers.value[id]
      return {
        id,
        name: availableProviders.value.find(provider => provider.id === id)?.name || id,
        apiKey: p.apiKey || p.accessKeyId || '',
        baseURL: p.baseURL || '',
        model: p.ttsModel || p.asrModel || '',
        ttsVoice: p.ttsVoice,
        speechRate: p.speechRate,
        asrModel: p.asrModel,
        accessKeyId: p.accessKeyId,
        accessKeySecret: p.accessKeySecret,
        appKey: p.appKey,
        appId: p.appId,
        apiSecret: p.apiSecret,
        apiUrl: p.apiUrl,
        resourceId: p.resourceId,
        type: 'tts'
      }
    }).filter(p => p.apiKey && p.apiKey.trim() !== '')
    
    const payload = {
      ttsProvider: form.value.ttsProvider,
      asrProvider: form.value.asrProvider,
      providers: providersArray
    }
    
    await apiService.put('/admin/config/speech', payload)
    await loadConfig()
    emit('save', '语音配置已成功保存')
  } catch (e) {
    console.error('保存配置失败', e)
    emit('error', e)
  } finally {
    loading.value = false
  }
}

async function testConnection(providerId) {
  const provider = providers.value[providerId]
  if (!provider || (!provider.apiKey && !provider.accessKeyId)) {
    return {
      provider: availableProviders.value.find(p => p.id === providerId)?.name || providerId,
      success: false,
      message: '未配置 API Key'
    }
  }
  
  try {
    const testData = {
      provider: providerId,
      apiKey: provider.apiKey || provider.accessKeyId,
      baseURL: provider.baseURL,
      model: provider.ttsModel || provider.asrModel || 'default'
    }
    
    const result = await apiService.post('/admin/config/test-connection', testData)
    return {
      provider: availableProviders.value.find(p => p.id === providerId)?.name || providerId,
      success: result.success || false,
      message: result.message || '测试成功'
    }
  } catch (e) {
    return {
      provider: availableProviders.value.find(p => p.id === providerId)?.name || providerId,
      success: false,
      message: e.message || '测试失败'
    }
  }
}

async function testAllConnections() {
  try {
    testing.value = true
    testResults.value = []
    
    const providerIds = Object.keys(providers.value).filter(id => id !== 'edge') // Edge TTS 不需要 API Key
    const testPromises = providerIds.map(id => testConnection(id))
    
    const results = await Promise.all(testPromises)
    testResults.value = results
  } catch (e) {
    console.error('测试连接失败', e)
  } finally {
    testing.value = false
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadConfig()
})

defineExpose({
  loadConfig,
  saveConfig,
  testAllConnections
})
</script>