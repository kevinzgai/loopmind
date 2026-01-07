<script setup lang="ts">
import { ref } from 'vue'
import { voiceCategories, getRecommendedVoices } from '../data/voices'

const text = ref('你好，我是 AI 助手。这是一个文字转语音测试。')
const voice = ref('xiaoyun')
const speed = ref(0)
const isConverting = ref(false)
const isPlaying = ref(false)
const audioUrl = ref('')
const status = ref('准备开始测试')
const error = ref('')
const audioElement = ref<HTMLAudioElement | null>(null)

// 使用分类的音色列表
const voices = voiceCategories


const sampleTexts = [
  '你好，我是 AI 助手。这是一个文字转语音测试。',
  '今天天气真不错，适合出去散步。',
  '人工智能正在改变我们的生活方式。',
  '学习新知识是一件令人兴奋的事情。',
  'Hello, this is a text-to-speech test in English.',
  '多说无益不愿意相信的人就一辈子待在井底吧',
  '于是就这样被骗了',
  '其实我旅行的路线都规划好了',
  '群众无小事市民满意了社会也就和谐了',
  '它是宏观的是抽象的',
  '如果不是有什么区别吗',
  '阳逻不是新洲居民吗',
  '这里每年要办好几场展销会价格非常便宜',
  '这个妈妈也不合格这么放心把孩子让男人带啊',
  '当面就把信撕掉了',
  '怎么跟别人比'
  
]

async function convertToSpeech() {
  if (!text.value.trim()) {
    error.value = '请输入要转换的文字'
    return
  }

  try {
    isConverting.value = true
    status.value = '正在转换为语音...'
    error.value = ''

    const response = await fetch('/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text.value,
        voice: voice.value,
        speechRate: speed.value
      })
    })

    if (!response.ok) {
      throw new Error(`转换失败: ${response.status} ${response.statusText}`)
    }

    const audioBlob = await response.blob()
    const url = URL.createObjectURL(audioBlob)
    
    // 清理旧的 URL
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
    
    audioUrl.value = url
    status.value = '✅ 转换成功，点击播放按钮试听'
    
    // 创建音频元素
    if (audioElement.value) {
      audioElement.value.pause()
    }
    audioElement.value = new Audio(url)
    
    audioElement.value.onended = () => {
      isPlaying.value = false
    }
    
    audioElement.value.onerror = () => {
      error.value = '音频播放失败'
      isPlaying.value = false
    }

  } catch (err) {
    error.value = `转换失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '转换失败'
  } finally {
    isConverting.value = false
  }
}

function playAudio() {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
    audioElement.value.currentTime = 0
    isPlaying.value = false
  } else {
    audioElement.value.play()
    isPlaying.value = true
    status.value = '🔊 正在播放...'
  }
}

function downloadAudio() {
  if (!audioUrl.value) return

  const a = document.createElement('a')
  a.href = audioUrl.value
  a.download = `speech_${Date.now()}.mp3`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function clearAudio() {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value = null
  }
  
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = ''
  }
  
  isPlaying.value = false
  status.value = '准备开始测试'
  error.value = ''
}

function useSampleText(sampleText: string) {
  text.value = sampleText
}
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">🔊 文字转语音（TTS）测试</h1>
    
    <!-- 输入文字 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">输入文字</h2>
      <textarea
        v-model="text"
        class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows="4"
        placeholder="请输入要转换为语音的文字..."
      ></textarea>
      
      <!-- 示例文字 -->
      <div class="mt-3">
        <p class="text-sm text-gray-600 mb-2">快速选择示例文字：</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(sample, index) in sampleTexts"
            :key="index"
            @click="useSampleText(sample)"
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            示例 {{ index + 1 }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 语音选择 -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-3">选择语音</h2>
        <select
          v-model="voice"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <optgroup v-for="category in voices" :key="category.category" :label="category.category">
            <option v-for="v in category.voices" :key="v.id" :value="v.id">
              {{ v.name }} - {{ v.type }} ({{ v.quality }})
            </option>
          </optgroup>
        </select>
      </div>
      
      <!-- 语速调节 -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 mb-3">语速: {{ speed > 0 ? '+' : '' }}{{ speed }}</h2>
        <input
          v-model.number="speed"
          type="range"
          min="-500"
          max="500"
          step="50"
          class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>-500 (慢)</span>
          <span>0 (正常)</span>
          <span>+500 (快)</span>
        </div>
      </div>
    </div>
    
    <!-- 控制按钮 -->
    <div class="flex flex-col gap-4 mb-6">
      <button
        @click="convertToSpeech"
        :disabled="isConverting || !text.trim()"
        class="px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
        :class="isConverting 
          ? 'bg-yellow-500 text-white animate-pulse cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'"
      >
        {{ isConverting ? '⏳ 转换中...' : '🔊 转换为语音' }}
      </button>
      
      <div class="grid grid-cols-3 gap-4">
        <button
          @click="playAudio"
          :disabled="!audioUrl"
          class="px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
        </button>
        
        <button
          @click="downloadAudio"
          :disabled="!audioUrl"
          class="px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          💾 下载
        </button>
        
        <button
          @click="clearAudio"
          :disabled="!audioUrl"
          class="px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          🗑️ 清除
        </button>
      </div>
    </div>
    
    <!-- 音频播放器 -->
    <div v-if="audioUrl" class="mb-6 p-4 bg-green-50 rounded-lg">
      <h2 class="text-lg font-semibold text-green-800 mb-3">音频播放器</h2>
      <audio
        :src="audioUrl"
        controls
        class="w-full"
      ></audio>
    </div>
    
    <!-- 状态信息 -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h2 class="text-lg font-semibold text-blue-800 mb-2">状态</h2>
      <p class="text-blue-700">{{ status }}</p>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg">
      <h2 class="text-lg font-semibold text-red-800 mb-2">错误</h2>
      <p class="text-red-700">{{ error }}</p>
    </div>
    
    <!-- 使用说明 -->
    <div class="mt-8 p-4 bg-purple-50 rounded-lg">
      <h2 class="text-lg font-semibold text-purple-800 mb-2">使用说明</h2>
      <ol class="list-decimal list-inside space-y-2 text-purple-700">
        <li>在文本框中输入要转换的文字（或选择示例文字）</li>
        <li>选择喜欢的语音类型（阿里云 TTS）</li>
        <li>调整语速（-500 到 +500）</li>
        <li>点击「转换为语音」按钮</li>
        <li>转换完成后，点击「播放」按钮试听</li>
        <li>可以下载音频文件保存</li>
      </ol>
    </div>
    
    <!-- 技术信息 -->
    <div class="mt-6 p-4 bg-indigo-50 rounded-lg">
      <h2 class="text-lg font-semibold text-indigo-800 mb-2">技术信息</h2>
      <ul class="list-disc list-inside space-y-1 text-indigo-700">
        <li>🎯 API 端点: /tts</li>
        <li>🔊 音频格式: MP3</li>
        <li>🎤 支持 20+ 种中文语音</li>
        <li>⚡ 语速范围: -500 到 +500</li>
        <li>🌐 服务提供商: 阿里云智能语音</li>
        <li>🇨🇳 国内服务，稳定快速</li>
      </ul>
    </div>
    
    <!-- 配置说明 -->
    <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
      <h2 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ 配置说明</h2>
      <p class="text-yellow-700 mb-2">使用前需要配置阿里云 TTS 服务：</p>
      <ol class="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
        <li>访问 <a href="https://nls-portal.console.aliyun.com/" target="_blank" class="underline">阿里云智能语音交互</a></li>
        <li>创建应用并获取 AccessKey ID、AccessKey Secret、AppKey</li>
        <li>在 .env 文件中配置相关参数</li>
        <li>重启后端服务</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
button {
  cursor: pointer;
  outline: none;
  border: none;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}
</style>
