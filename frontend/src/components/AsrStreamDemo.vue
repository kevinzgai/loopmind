<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const isRecording = ref(false)
const recognizedText = ref('')
const intermediateText = ref('')
const status = ref('准备开始实时识别')
const error = ref('')
const audioLevel = ref(0)
const sentenceCount = ref(0)

let mediaRecorder: MediaRecorder | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let animationId: number | null = null
let ws: WebSocket | null = null
let audioWorklet: AudioWorkletNode | null = null

// 示例文本
const sampleTexts = [
  '你好，这是实时语音识别测试',
  '今天天气真不错，适合出去走走',
  '人工智能正在改变我们的生活方式',
  '实时识别可以边说边看到结果'
]

// 开始实时识别
async function startStreaming() {
  try {
    error.value = ''
    status.value = '正在初始化...'
    recognizedText.value = ''
    intermediateText.value = ''
    sentenceCount.value = 0

    // 请求麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    })

    // 创建音频上下文用于可视化和处理
    audioContext = new AudioContext({ sampleRate: 16000 })
    const source = audioContext.createMediaStreamSource(stream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    
    // 开始可视化
    visualizeAudio()

    status.value = '正在连接识别服务...'

    // 建立 WebSocket 连接 - 使用相对路径，让 Vite 代理处理
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws-asr-stream`
    console.log('🔗 连接到:', wsUrl)
    
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('✅ WebSocket 连接已建立')
      status.value = '🎤 实时识别中...'
      isRecording.value = true
      
      // 开始发送音频数据
      startSendingAudio(stream)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 收到消息:', data)
        
        if (data.type === 'started') {
          console.log('✅ 识别已开始')
        } else if (data.type === 'intermediate') {
          // 中间结果（实时显示）
          intermediateText.value = data.text
        } else if (data.type === 'result') {
          // 最终结果（句子完成）
          if (data.text) {
            recognizedText.value += data.text
            sentenceCount.value++
            intermediateText.value = ''
          }
        } else if (data.type === 'error') {
          error.value = data.message
          stopStreaming()
        }
      } catch (err) {
        console.error('❌ 解析消息失败:', err)
      }
    }

    ws.onerror = (err) => {
      console.error('❌ WebSocket 错误:', err)
      error.value = 'WebSocket 连接错误'
      stopStreaming()
    }

    ws.onclose = () => {
      console.log('🔌 WebSocket 连接已关闭')
      if (isRecording.value) {
        status.value = '连接已断开'
        isRecording.value = false
      }
    }

  } catch (err) {
    error.value = `无法访问麦克风: ${err instanceof Error ? err.message : String(err)}`
    status.value = '启动失败'
    console.error('启动错误:', err)
  }
}

// 发送音频数据
function startSendingAudio(stream: MediaStream) {
  // 使用 Web Audio API 直接获取 PCM 数据
  audioContext = new AudioContext({ sampleRate: 16000 })
  const source = audioContext.createMediaStreamSource(stream)
  
  // 创建 ScriptProcessor 来处理音频数据
  const processor = audioContext.createScriptProcessor(4096, 1, 1)
  
  processor.onaudioprocess = (e) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const inputData = e.inputBuffer.getChannelData(0)
      
      // 转换为 16-bit PCM
      const pcmData = new Int16Array(inputData.length)
      for (let i = 0; i < inputData.length; i++) {
        // 将 -1.0 到 1.0 的浮点数转换为 -32768 到 32767 的整数
        const s = Math.max(-1, Math.min(1, inputData[i]))
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }
      
      // 发送 PCM 数据
      ws.send(pcmData.buffer)
      console.log('📤 发送 PCM 数据:', pcmData.length * 2, 'bytes')
    }
  }
  
  source.connect(processor)
  processor.connect(audioContext.destination)
  
  console.log('🎤 开始录音并实时发送 PCM 数据')
}

// 停止实时识别
function stopStreaming() {
  console.log('🛑 停止实时识别')
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close()
  }

  if (audioContext) {
    audioContext.close()
  }

  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  isRecording.value = false
  status.value = recognizedText.value ? '✅ 识别完成' : '已停止'
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

// 清除结果
function clearResult() {
  recognizedText.value = ''
  intermediateText.value = ''
  error.value = ''
  status.value = '准备开始实时识别'
  audioLevel.value = 0
  sentenceCount.value = 0
}

// 复制结果
function copyResult() {
  if (recognizedText.value) {
    navigator.clipboard.writeText(recognizedText.value)
    status.value = '✅ 已复制到剪贴板'
    setTimeout(() => {
      status.value = '准备开始实时识别'
    }, 2000)
  }
}

// 组件卸载时清理
onUnmounted(() => {
  stopStreaming()
})
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">🎙️ 实时语音识别（流式 ASR）</h1>
    
    <!-- 实时识别控制 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">实时识别控制</h2>
      
      <!-- 音量可视化 -->
      <div v-if="isRecording" class="mb-4 p-4 bg-red-50 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="text-red-600 font-semibold animate-pulse">🔴 实时识别中</span>
          <div class="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-100"
              :style="{ width: audioLevel + '%' }"
            ></div>
          </div>
          <span class="text-sm text-gray-600">{{ Math.round(audioLevel) }}%</span>
        </div>
        <div class="mt-2 text-sm text-gray-600">
          已识别句子: {{ sentenceCount }} 句
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="flex gap-4">
        <button
          v-if="!isRecording"
          @click="startStreaming"
          class="flex-1 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🎙️ 开始实时识别
        </button>
        
        <button
          v-else
          @click="stopStreaming"
          class="flex-1 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white"
        >
          ⏹️ 停止识别
        </button>
      </div>
    </div>

    <!-- 实时结果显示 -->
    <div v-if="isRecording || recognizedText || intermediateText" class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">识别结果</h2>
      
      <div class="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 min-h-[120px]">
        <!-- 已确认的文本 -->
        <div v-if="recognizedText" class="text-gray-800 text-lg leading-relaxed mb-2">
          {{ recognizedText }}
        </div>
        
        <!-- 实时中间结果 -->
        <div v-if="intermediateText" class="text-blue-600 text-lg leading-relaxed italic">
          {{ intermediateText }}
          <span class="inline-block w-1 h-5 bg-blue-600 animate-pulse ml-1"></span>
        </div>

        <!-- 空状态提示 -->
        <div v-if="!recognizedText && !intermediateText" class="text-gray-400 text-center py-8">
          开始说话，识别结果将实时显示在这里...
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="recognizedText" class="mt-3 flex gap-2">
        <button
          @click="copyResult"
          class="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          📋 复制结果
        </button>
        <button
          @click="clearResult"
          class="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          🗑️ 清除
        </button>
      </div>
    </div>

    <!-- 状态信息 -->
    <div class="mb-6 p-4 rounded-lg" :class="isRecording ? 'bg-green-50' : 'bg-blue-50'">
      <h2 class="text-lg font-semibold mb-2" :class="isRecording ? 'text-green-800' : 'text-blue-800'">
        状态
      </h2>
      <p :class="isRecording ? 'text-green-700' : 'text-blue-700'">
        {{ status }}
      </p>
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
        <li>点击「开始实时识别」按钮，允许浏览器访问麦克风</li>
        <li>开始说话，识别结果会实时显示</li>
        <li>灰色文字是已确认的结果，蓝色斜体是正在识别的内容</li>
        <li>说完后点击「停止识别」按钮</li>
        <li>可以复制或清除识别结果</li>
      </ol>
    </div>

    <!-- 技术信息 -->
    <div class="mt-6 p-4 bg-indigo-50 rounded-lg">
      <h2 class="text-lg font-semibold text-indigo-800 mb-2">技术特点</h2>
      <ul class="list-disc list-inside space-y-1 text-indigo-700">
        <li>⚡ 实时识别：边说边显示结果</li>
        <li>🔄 流式传输：每 250ms 发送一次音频数据</li>
        <li>📊 中间结果：实时显示正在识别的内容</li>
        <li>✅ 最终结果：句子完成后自动确认</li>
        <li>🎤 音频格式: WebM / Opus</li>
        <li>📊 采样率: 16000 Hz</li>
        <li>🔊 声道: 单声道</li>
        <li>🌐 服务提供商: 阿里云智能语音</li>
        <li>🇨🇳 支持中文普通话识别</li>
      </ul>
    </div>

    <!-- 对比说明 -->
    <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
      <h2 class="text-lg font-semibold text-yellow-800 mb-2">💡 流式 vs 普通识别</h2>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h3 class="font-semibold text-yellow-800 mb-1">普通识别</h3>
          <ul class="list-disc list-inside space-y-1 text-yellow-700">
            <li>录音完成后识别</li>
            <li>延迟 3-5 秒</li>
            <li>适合短语音</li>
            <li>结果一次性返回</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-yellow-800 mb-1">流式识别（当前）</h3>
          <ul class="list-disc list-inside space-y-1 text-yellow-700">
            <li>边说边识别</li>
            <li>延迟 &lt;1 秒</li>
            <li>适合长语音</li>
            <li>结果实时显示</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 示例文本 -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h2 class="text-lg font-semibold text-gray-800 mb-2">💬 测试建议</h2>
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
    opacity: 0.5;
  }
}
</style>
