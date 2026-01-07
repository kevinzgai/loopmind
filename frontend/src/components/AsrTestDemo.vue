<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isRecording = ref(false)
const isProcessing = ref(false)
const recognizedText = ref('')
const status = ref('准备开始录音')
const error = ref('')
const audioLevel = ref(0)

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let animationId: number | null = null

// 示例文本（用于测试）
const sampleTexts = [
  '你好，这是一个语音识别测试',
  '今天天气真不错',
  '人工智能正在改变我们的生活',
  '学习新知识是一件令人兴奋的事情'
]

// 开始录音
async function startRecording() {
  try {
    error.value = ''
    status.value = '正在请求麦克风权限...'

    // 请求麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
      } 
    })

    // 创建音频上下文用于可视化
    audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    
    // 开始可视化
    visualizeAudio()

    // 创建 MediaRecorder
    // 尝试使用 WAV 格式，如果不支持则使用 WebM
    let mimeType = 'audio/wav';
    let options: MediaRecorderOptions = {};
    
    if (MediaRecorder.isTypeSupported(mimeType)) {
      options.mimeType = mimeType;
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
      options.mimeType = mimeType;
      console.warn('⚠️ 浏览器不支持 audio/wav，使用 audio/webm;codecs=opus')
    } else {
      mimeType = 'audio/webm';
      options.mimeType = mimeType;
      console.warn('⚠️ 浏览器不支持 audio/wav，使用 audio/webm')
    }
    
    mediaRecorder = new MediaRecorder(stream, options)

    console.log('🎤 使用音频格式:', mimeType)

    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log('📦 收到音频数据块:', event.data.size, 'bytes')
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      status.value = '正在处理音频...'
      
      // 立即处理音频，不等待
      processAudio()
      
      // 停止音频流
      stream.getTracks().forEach(track => track.stop())
      
      // 停止可视化
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
    }

    // 每 1 秒收集一次数据，确保数据不会丢失
    mediaRecorder.start(1000)
    isRecording.value = true
    status.value = '🎤 正在录音...'
    console.log('🎤 开始录音，格式:', mimeType)

  } catch (err) {
    error.value = `无法访问麦克风: ${err instanceof Error ? err.message : String(err)}`
    status.value = '录音失败'
    console.error('录音错误:', err)
  }
}

// 停止录音
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

// 可视化音频
function visualizeAudio() {
  if (!analyser) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!analyser) return
    
    animationId = requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    
    // 计算平均音量
    const average = dataArray.reduce((a, b) => a + b) / bufferLength
    audioLevel.value = Math.min(100, (average / 255) * 100)
  }

  draw()
}

// 处理音频并发送到服务器
async function processAudio() {
  try {
    isProcessing.value = true
    status.value = '🔄 正在识别...'
    
    // 合并音频块
    const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
    const mimeType = audioBlob.type
    console.log('📦 音频格式:', mimeType)
    console.log('📦 音频大小:', audioBlob.size, 'bytes')
    console.log('📦 音频块数量:', audioChunks.length)

    // 检查音频大小
    if (audioBlob.size < 100) {
      throw new Error('录音数据太小，请重新录音并说话时间长一些')
    }

    // 检测音频格式
    let format = 'pcm'
    if (mimeType.includes('wav')) {
      format = 'wav'
    } else if (mimeType.includes('webm')) {
      format = 'webm'
    }

    // 使用 FormData 发送文件，而不是 base64
    const formData = new FormData()
    formData.append('audio', audioBlob, `recording.${format === 'wav' ? 'wav' : 'webm'}`)
    formData.append('format', format)
    formData.append('sampleRate', '16000')

    console.log('📤 发送音频到服务器...')
    const startTime = Date.now()

    // 发送到服务器
    const response = await fetch('/asr', {
      method: 'POST',
      body: formData
    })

    const elapsed = Date.now() - startTime
    console.log(`⏱️ 请求耗时: ${elapsed}ms`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `识别失败: ${response.status}`)
    }

    const result = await response.json()
    recognizedText.value = result.text || '未识别到内容'
    status.value = `✅ 识别完成 (${elapsed}ms)`
    
    console.log('✅ 识别结果:', result)

  } catch (err) {
    error.value = `识别失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '识别失败'
    console.error('❌ 识别错误:', err)
  } finally {
    isProcessing.value = false
  }
}

// 上传音频文件
async function uploadAudioFile(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  try {
    isProcessing.value = true
    status.value = '正在识别上传的音频...'
    error.value = ''

    const formData = new FormData()
    formData.append('audio', file)
    formData.append('format', file.type.includes('wav') ? 'wav' : 'pcm')
    formData.append('sampleRate', '16000')

    const response = await fetch('/asr', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `识别失败: ${response.status}`)
    }

    const result = await response.json()
    recognizedText.value = result.text || '未识别到内容'
    status.value = '✅ 识别完成'

  } catch (err) {
    error.value = `识别失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '识别失败'
  } finally {
    isProcessing.value = false
    // 清空文件输入
    target.value = ''
  }
}

// 清除结果
function clearResult() {
  recognizedText.value = ''
  error.value = ''
  status.value = '准备开始录音'
  audioLevel.value = 0
}

// 复制结果
function copyResult() {
  if (recognizedText.value) {
    navigator.clipboard.writeText(recognizedText.value)
    status.value = '✅ 已复制到剪贴板'
    setTimeout(() => {
      status.value = '准备开始录音'
    }, 2000)
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (audioContext) {
    audioContext.close()
  }
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">🎤 语音识别（ASR）测试</h1>
    
    <!-- 录音控制 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">录音控制</h2>
      
      <!-- 音量可视化 -->
      <div v-if="isRecording" class="mb-4 p-4 bg-red-50 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-red-600 font-semibold">🔴 录音中</span>
          <div class="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-red-500 transition-all duration-100"
              :style="{ width: audioLevel + '%' }"
            ></div>
          </div>
          <span class="text-sm text-gray-600">{{ Math.round(audioLevel) }}%</span>
        </div>
      </div>

      <!-- 录音按钮 -->
      <div class="flex gap-4">
        <button
          v-if="!isRecording"
          @click="startRecording"
          :disabled="isProcessing"
          class="flex-1 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          🎤 开始录音
        </button>
        
        <button
          v-else
          @click="stopRecording"
          class="flex-1 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white animate-pulse"
        >
          ⏹️ 停止录音
        </button>
      </div>
    </div>

    <!-- 文件上传 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">或上传音频文件</h2>
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          accept="audio/*"
          @change="uploadAudioFile"
          :disabled="isRecording || isProcessing"
          class="hidden"
          id="audioFileInput"
        />
        <label
          for="audioFileInput"
          class="cursor-pointer inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          :class="{ 'opacity-50 cursor-not-allowed': isRecording || isProcessing }"
        >
          📁 选择音频文件
        </label>
        <p class="mt-2 text-sm text-gray-500">支持 WAV、MP3、WebM 等格式</p>
      </div>
    </div>

    <!-- 识别结果 -->
    <div v-if="recognizedText" class="mb-6 p-4 bg-green-50 rounded-lg">
      <div class="flex justify-between items-start mb-2">
        <h2 class="text-lg font-semibold text-green-800">识别结果</h2>
        <button
          @click="copyResult"
          class="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
        >
          📋 复制
        </button>
      </div>
      <div class="p-4 bg-white rounded border border-green-200">
        <p class="text-gray-800 text-lg leading-relaxed">{{ recognizedText }}</p>
      </div>
    </div>

    <!-- 状态信息 -->
    <div class="mb-6 p-4 rounded-lg" :class="isProcessing ? 'bg-yellow-50' : 'bg-blue-50'">
      <h2 class="text-lg font-semibold mb-2" :class="isProcessing ? 'text-yellow-800' : 'text-blue-800'">
        状态
      </h2>
      <p :class="isProcessing ? 'text-yellow-700' : 'text-blue-700'">
        {{ isProcessing ? '⏳ ' : '' }}{{ status }}
      </p>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg">
      <h2 class="text-lg font-semibold text-red-800 mb-2">错误</h2>
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- 操作按钮 -->
    <div v-if="recognizedText" class="mb-6">
      <button
        @click="clearResult"
        class="w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white"
      >
        🗑️ 清除结果
      </button>
    </div>

    <!-- 使用说明 -->
    <div class="mt-8 p-4 bg-purple-50 rounded-lg">
      <h2 class="text-lg font-semibold text-purple-800 mb-2">使用说明</h2>
      <ol class="list-decimal list-inside space-y-2 text-purple-700">
        <li>点击「开始录音」按钮，允许浏览器访问麦克风</li>
        <li>对着麦克风说话（建议说普通话，清晰发音）</li>
        <li>说完后点击「停止录音」按钮</li>
        <li>等待识别完成，查看识别结果</li>
        <li>也可以直接上传音频文件进行识别</li>
      </ol>
    </div>

    <!-- 技术信息 -->
    <div class="mt-6 p-4 bg-indigo-50 rounded-lg">
      <h2 class="text-lg font-semibold text-indigo-800 mb-2">技术信息</h2>
      <ul class="list-disc list-inside space-y-1 text-indigo-700">
        <li>🎯 API 端点: /asr</li>
        <li>🎤 音频格式: WebM / WAV / PCM</li>
        <li>📊 采样率: 16000 Hz</li>
        <li>🔊 声道: 单声道</li>
        <li>🌐 服务提供商: 阿里云智能语音</li>
        <li>🇨🇳 支持中文普通话识别</li>
        <li>✨ 自动标点、数字转换</li>
      </ul>
    </div>

    <!-- 配置说明 -->
    <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
      <h2 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ 配置说明</h2>
      <p class="text-yellow-700 mb-2">使用前需要配置阿里云语音识别服务：</p>
      <ol class="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
        <li>访问 <a href="https://nls-portal.console.aliyun.com/" target="_blank" class="underline">阿里云智能语音交互</a></li>
        <li>创建应用并获取 AccessKey ID、AccessKey Secret、AppKey</li>
        <li>在 .env 文件中配置相关参数（与 TTS 共用）</li>
        <li>重启后端服务</li>
      </ol>
    </div>

    <!-- 示例文本 -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h2 class="text-lg font-semibold text-gray-800 mb-2">💡 测试建议</h2>
      <p class="text-gray-700 mb-2">可以尝试说以下内容：</p>
      <ul class="list-disc list-inside space-y-1 text-gray-600 text-sm">
        <li v-for="(text, index) in sampleTexts" :key="index">{{ text }}</li>
      </ul>
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
    opacity: 0.7;
  }
}
</style>
