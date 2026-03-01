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
            <div class="flex-1">
              <h4 class="font-medium text-slate-900 dark:text-slate-100">{{ result.provider }}</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ result.message }}</p>
              <!-- 音频播放器 -->
              <div v-if="result.audioUrl" class="mt-2">
                <audio controls :src="result.audioUrl" class="w-full h-8">
                  您的浏览器不支持音频播放
                </audio>
              </div>
            </div>
            <div class="text-lg ml-3">
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
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-slate-900 dark:text-slate-100">硅基流动 (SiliconFlow)</h4>
            <div class="flex gap-2">
              <button @click="testTTS('siliconflow')" :disabled="testingTTS.siliconflow"
                class="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {{ testingTTS.siliconflow ? '测试中...' : '测试语音' }}
              </button>
              <a href="https://cloud.siliconflow.cn/console/keys" target="_blank" rel="noopener noreferrer"
                class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors">
                查看凭证
              </a>
            </div>
          </div>
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
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-slate-900 dark:text-slate-100">阿里云 (Aliyun)</h4>
            <div class="flex gap-2">
              <button @click="testTTS('aliyun')" :disabled="testingTTS.aliyun"
                class="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {{ testingTTS.aliyun ? '测试中...' : '测试语音' }}
              </button>
              <a href="https://nls-portal.console.aliyun.com/" target="_blank" rel="noopener noreferrer"
                class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors">
                控制台
              </a>
            </div>
          </div>
          <div class="space-y-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">AccessKey ID</label>
              <div class="flex gap-2">
                <input :type="showKeys.aliyun ? 'text' : 'password'" v-model="providers.aliyun.accessKeyId"
                  placeholder="请输入阿里云 AccessKey ID"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">AccessKey Secret</label>
              <div class="flex gap-2">
                <input :type="showKeys.aliyun ? 'text' : 'password'" v-model="providers.aliyun.accessKeySecret"
                  placeholder="请输入阿里云 AccessKey Secret"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">AppKey</label>
              <div class="flex gap-2">
                <input :type="showKeys.aliyun ? 'text' : 'password'" v-model="providers.aliyun.appKey"
                  placeholder="请输入智能语音服务 AppKey"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
                <button @click="showKeys.aliyun = !showKeys.aliyun"
                  class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                  {{ showKeys.aliyun ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">DashScope API Key (可选，用于百炼 TTS)</label>
              <div class="flex gap-2">
                <input :type="showKeys.aliyun ? 'text' : 'password'" v-model="providers.aliyun.apiKey"
                  placeholder="用于阿里百炼 TTS 服务"
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
              </div>
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
const testingTTS = ref({
  siliconflow: false,
  aliyun: false
})
const testResults = ref([])
const showKeys = ref({
  siliconflow: false,
  aliyun: false
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
    apiKey: '',
    accessKeyId: '',
    accessKeySecret: '',
    appKey: '',
    ttsVoice: 'Cherry'
  }
})

const availableProviders = computed(() => [
  { id: 'siliconflow', name: '硅基流动' },
  { id: 'aliyun', name: '阿里云' }
])

async function loadConfig() {
  try {
    const res = await apiService.get('/admin/config/speech')
    if (res) {
      form.value.ttsProvider = res.ttsProvider || 'siliconflow'
      form.value.asrProvider = res.asrProvider || 'siliconflow'
      
      if (res.providers) {
        res.providers.forEach(provider => {
          if (providers.value[provider.id]) {
            providers.value[provider.id].apiKey = provider.apiKey || providers.value[provider.id].apiKey
            providers.value[provider.id].baseURL = provider.baseURL || providers.value[provider.id].baseURL
            providers.value[provider.id].model = provider.model || providers.value[provider.id].model
            providers.value[provider.id].ttsVoice = provider.ttsVoice || providers.value[provider.id].ttsVoice
            providers.value[provider.id].speechRate = provider.speechRate || providers.value[provider.id].speechRate
            providers.value[provider.id].asrModel = provider.asrModel || providers.value[provider.id].asrModel
            if (provider.id === 'aliyun') {
              providers.value[provider.id].apiKey = provider.apiKey || providers.value[provider.id].apiKey
              providers.value[provider.id].accessKeyId = provider.accessKeyId || providers.value[provider.id].accessKeyId
              providers.value[provider.id].accessKeySecret = provider.accessKeySecret || providers.value[provider.id].accessKeySecret
              providers.value[provider.id].appKey = provider.appKey || providers.value[provider.id].appKey
            }
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
    }).filter(p => (p.apiKey || p.accessKeyId) && (p.apiKey || p.accessKeyId).trim() !== '')
    
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

async function testTTS(providerId) {
  try {
    testingTTS.value[providerId] = true
    
    const testData = {
      provider: providerId,
      text: '你好，这是语音测试，请确认语音服务是否正常工作。',
      voice: providers.value[providerId].ttsVoice,
      speechRate: providers.value[providerId].speechRate
    }
    
    const result = await apiService.post('/admin/config/test-tts', testData)
    
    const testResult = {
      provider: availableProviders.value.find(p => p.id === providerId)?.name || providerId,
      success: result.success,
      message: result.message,
      audioUrl: result.audioUrl
    }
    
    testResults.value = [testResult]
  } catch (e) {
    const testResult = {
      provider: availableProviders.value.find(p => p.id === providerId)?.name || providerId,
      success: false,
      message: e.message || '测试失败',
      audioUrl: null
    }
    testResults.value = [testResult]
  } finally {
    testingTTS.value[providerId] = false
  }
}

async function testAllConnections() {
  try {
    testing.value = true
    testResults.value = []
    
    const providerIds = Object.keys(providers.value).filter(id => id !== 'edge')
    const testPromises = providerIds.map(id => testConnection(id))
    
    const results = await Promise.all(testPromises)
    testResults.value = results
  } catch (e) {
    console.error('测试连接失败', e)
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  loadConfig()
})

defineExpose({
  loadConfig,
  saveConfig,
  testAllConnections
})
</script>