<template>
  <section
    class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">语音服务配置</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">配置全系统通用的文字转语音 (TTS) 与语音识别 (ASR) 服务</p>
      </div>
      <button @click="saveConfig" :disabled="loading"
        class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
        {{ loading ? '保存中...' : '保存配置' }}
      </button>
    </div>

    <div class="space-y-6">
      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">文字转语音 (TTS)</h3>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">TTS 服务提供商</label>
          <select v-model="form.speech.ttsProvider"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            <option value="siliconflow">硅基流动 (SiliconFlow)</option>
            <option value="aliyun">阿里云 (Aliyun)</option>
            <option value="openai">OpenAI (TTS-1)</option>
            <option value="edge">Edge TTS (免费)</option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">语音识别 (ASR)</h3>
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">ASR 服务提供商</label>
          <select v-model="form.speech.asrProvider"
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
            <option value="siliconflow">硅基流动 (SiliconFlow)</option>
            <option value="aliyun">阿里云 (Aliyun)</option>
            <option value="seed">Seed ASR</option>
          </select>
        </div>
      </div>

      <div v-if="form.speech.ttsProvider === 'siliconflow' || form.speech.asrProvider === 'siliconflow'"
        class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">硅基流动语音参数</h3>
        <div class="space-y-3">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">API Key</label>
            <div class="flex gap-2">
              <input :type="showSpeechSiliconKey ? 'text' : 'password'" v-model="form.speech.siliconflow.apiKey"
                placeholder="请输入 SiliconFlow API Key"
                class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
              <button @click="showSpeechSiliconKey = !showSpeechSiliconKey"
                class="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                {{ showSpeechSiliconKey ? '隐藏' : '显示' }}
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Base URL</label>
            <input type="text" v-model="form.speech.siliconflow.baseURL" placeholder="https://api.siliconflow.cn/v1"
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import apiService from '@/services/apiService.js'

const emit = defineEmits(['save', 'error'])

const loading = ref(false)
const showSpeechSiliconKey = ref(false)

const form = ref({
  speech: {
    ttsProvider: 'siliconflow',
    asrProvider: 'siliconflow',
    siliconflow: {
      apiKey: '',
      baseURL: '',
      ttsModel: 'FunAudioLLM/CosyVoice2-0.5B',
      ttsVoice: 'anna',
      speechRate: 150,
      asrModel: 'FunAudioLLM/SenseVoiceSmall'
    }
  }
})

async function loadConfig() {
  try {
    const res = await apiService.get('/admin/config')
    if (res.config && res.config.speech) {
      form.value.speech.ttsProvider = res.config.speech.ttsProvider || 'siliconflow'
      form.value.speech.asrProvider = res.config.speech.asrProvider || 'siliconflow'
      if (res.config.speech.siliconflow) {
        form.value.speech.siliconflow.apiKey = res.config.speech.siliconflow.apiKey || ''
        form.value.speech.siliconflow.baseURL = res.config.speech.siliconflow.baseURL || ''
      }
    }
  } catch (e) {
    console.error('加载配置失败', e)
  }
}

async function saveConfig() {
  try {
    loading.value = true
    await apiService.put('/admin/config', { speech: form.value.speech })
    await loadConfig()
    emit('save', '语音配置已成功保存')
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
