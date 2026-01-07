<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { SeedASRClient, defaultSeedASROptions } from '@/services/seedAsrService'

const isConnected = ref(false)
const isRecording = ref(false)
const isConnecting = ref(false)
const isRecognizing = ref(false)
const finalTranscript = ref('')
const status = ref('准备开始测试')
const error = ref('')
const connectionStatus = ref('未连接')
const useTestAudio = ref(true)
const recordedAudioUrl = ref('')
const isPlaying = ref(false)

const testAudioUrl = 'https://lf3-static.bytednsdoc.com/obj/eden-cn/lm_hz_ihsph/ljhwZthlaukjlkulzlp/console/bigtts/zh_female_cancan_mars_bigtts.mp3'

const websocketServer = computed(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  return `${protocol}//${window.location.host}/seed-asr`
})

let seedAsrClient: SeedASRClient | null = null
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recognitionAudioChunks: Blob[] = []

function handleEvent(event: any) {
  switch (event.type) {
    case 'connect':
      connectionStatus.value = '已连接'
      isConnected.value = true
      status.value = useTestAudio.value ? '连接成功，点击按钮开始识别' : '连接成功，按住按钮开始录音'
      error.value = ''
      break
      
    case 'recording_started':
      status.value = '🎤 录音中，请说话...'
      error.value = ''
      break
      
    case 'recording_stopped':
      isRecording.value = false
      isRecognizing.value = true
      status.value = '⏳ 正在识别...'
      error.value = ''
      break
      
    case 'recognition_result':
      isRecognizing.value = false
      handleRecognitionResult(event.data)
      break
      
    case 'error':
      connectionStatus.value = '连接错误'
      isConnected.value = false
      isRecording.value = false
      isConnecting.value = false
      isRecognizing.value = false
      error.value = event.error || '未知错误'
      status.value = '发生错误'
      break
      
    case 'disconnect':
      connectionStatus.value = '已断开连接'
      isConnected.value = false
      isRecording.value = false
      isConnecting.value = false
      isRecognizing.value = false
      status.value = '连接已断开'
      break
  }
}

function handleRecognitionResult(data: any) {
  if (!data) return
  
  console.log('🎤 识别结果:', data)
  
  if (data.error) {
    error.value = data.error
    status.value = '识别失败'
    return
  }
  
  const recognizedText = data.result?.text || data.text || ''
  if (recognizedText) {
    finalTranscript.value = recognizedText
    status.value = '✅ 识别完成'
  }
}

onMounted(() => {
  try {
    seedAsrClient = new SeedASRClient(defaultSeedASROptions)
    seedAsrClient.on(handleEvent)
    status.value = 'Seed-ASR 客户端初始化成功'
  } catch (err) {
    error.value = `初始化失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '初始化失败'
  }
})

onUnmounted(() => {
  seedAsrClient?.disconnect()
  stopLocalRecording()
})

async function connect() {
  if (!seedAsrClient) {
    error.value = 'Seed-ASR 客户端未初始化'
    return
  }
  
  try {
    isConnecting.value = true
    status.value = '正在连接服务器...'
    error.value = ''
    
    await seedAsrClient.connect()
  } catch (err) {
    error.value = `连接失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '连接失败'
  } finally {
    isConnecting.value = false
  }
}

async function startRecording() {
  if (!seedAsrClient) {
    error.value = 'Seed-ASR 客户端未初始化'
    return
  }
  
  if (!isConnected.value) {
    error.value = '请先连接服务器'
    return
  }
  
  if (isRecording.value) {
    return
  }
  
  try {
    finalTranscript.value = ''
    error.value = ''
    
    if (useTestAudio.value) {
      await recognizeWithTestAudio()
    } else {
      isRecording.value = true
      status.value = '🎤 录音中，请说话...'
      
      await startLocalRecording()
      await seedAsrClient.startRecording()
    }
  } catch (err) {
    isRecording.value = false
    stopLocalRecording()
    error.value = `启动录音失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '启动录音失败'
  }
}

async function startLocalRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
    mediaRecorder = new MediaRecorder(stream, { mimeType })
    
    audioChunks = []
    recognitionAudioChunks = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
        recognitionAudioChunks.push(event.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: mimeType })
      recordedAudioUrl.value = URL.createObjectURL(blob)
      console.log('🎤 录音已保存:', recordedAudioUrl.value)
      
      stream.getTracks().forEach(track => track.stop())
    }
    
    mediaRecorder.start()
  } catch (err) {
    console.error('启动本地录音失败:', err)
    throw err
  }
}

function stopLocalRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}

async function stopRecording() {
  if (!seedAsrClient) return
  
  try {
    isRecording.value = false
    stopLocalRecording()
    await seedAsrClient.stopRecording()
  } catch (err) {
    error.value = `停止录音失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '停止录音失败'
  }
}

async function recognizeWithTestAudio() {
  try {
    isRecognizing.value = true
    status.value = '⏳ 正在下载测试音频并识别...'
    
    const response = await fetch(testAudioUrl)
    if (!response.ok) {
      throw new Error('下载测试音频失败')
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    const pcmData = audioBufferToPCM16(audioBuffer)
    
    status.value = '⏳ 正在识别...'
    
    if (seedAsrClient && seedAsrClient.ws) {
      seedAsrClient.ws.send(JSON.stringify({ type: 'start_recording' }))
      
      const chunkSize = 4096
      for (let i = 0; i < pcmData.length; i += chunkSize) {
        const chunk = pcmData.slice(i, i + chunkSize)
        seedAsrClient.ws.send(chunk)
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      seedAsrClient.ws.send(JSON.stringify({ type: 'stop_recording' }))
    }
  } catch (err) {
    error.value = `识别失败: ${err instanceof Error ? err.message : String(err)}`
    status.value = '识别失败'
    isRecognizing.value = false
  }
}

function audioBufferToPCM16(audioBuffer: AudioBuffer): Int16Array {
  const numberOfChannels = audioBuffer.numberOfChannels
  const length = audioBuffer.length
  const result = new Int16Array(length)
  
  const channelData = []
  for (let channel = 0; channel < numberOfChannels; channel++) {
    channelData.push(audioBuffer.getChannelData(channel))
  }
  
  for (let i = 0; i < length; i++) {
    let sample = 0
    for (let channel = 0; channel < numberOfChannels; channel++) {
      sample += channelData[channel][i]
    }
    sample = sample / numberOfChannels
    
    const intSample = Math.max(-1, Math.min(1, sample))
    result[i] = intSample < 0 ? intSample * 0x8000 : intSample * 0x7FFF
  }
  
  return result
}

function disconnect() {
  seedAsrClient?.disconnect()
  status.value = '已断开连接'
}

function clearResults() {
  finalTranscript.value = ''
  status.value = '结果已清除，准备开始新的识别'
  error.value = ''
  recordedAudioUrl.value = ''
  isPlaying.value = false
}

function playRecordedAudio() {
  if (!recordedAudioUrl.value) return
  
  const audio = new Audio(recordedAudioUrl.value)
  audio.onplay = () => {
    isPlaying.value = true
  }
  audio.onended = () => {
    isPlaying.value = false
  }
  audio.onerror = () => {
    isPlaying.value = false
    error.value = '播放录音失败'
  }
  audio.play()
}

function handleRecordStart(event: Event) {
  event.preventDefault()
  startRecording()
}

function handleRecordEnd(event: Event) {
  event.preventDefault()
  stopRecording()
}
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">🎤 Seed-ASR 语音识别测试</h1>
    
    <div class="mb-6 p-4 bg-purple-50 rounded-lg">
      <h2 class="text-lg font-semibold text-purple-800 mb-3">测试模式</h2>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            v-model="useTestAudio" 
            :value="true"
            class="w-4 h-4"
          >
          <span class="text-purple-700">使用测试音频</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            v-model="useTestAudio" 
            :value="false"
            class="w-4 h-4"
          >
          <span class="text-purple-700">使用麦克风录音</span>
        </label>
      </div>
      <div v-if="useTestAudio" class="mt-2 text-sm text-purple-600">
        测试音频: {{ testAudioUrl }}
      </div>
    </div>
    
    <div class="mb-6 grid grid-cols-2 gap-4">
      <div class="p-4 bg-blue-50 rounded-lg">
        <h2 class="text-lg font-semibold text-blue-800 mb-2">连接状态</h2>
        <p :class="isConnected ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
          {{ connectionStatus }}
        </p>
      </div>
      
      <div class="p-4 bg-green-50 rounded-lg">
        <h2 class="text-lg font-semibold text-green-800 mb-2">识别状态</h2>
        <p class="font-bold">
          <span v-if="isRecording" class="text-red-600 animate-pulse">🎤 录音中...</span>
          <span v-else-if="isRecognizing" class="text-yellow-600">⏳ 识别中...</span>
          <span v-else class="text-gray-600">🔴 待机</span>
        </p>
      </div>
    </div>
    
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">识别结果</h2>
      <div class="p-3 bg-white border border-gray-200 rounded-lg min-h-[80px]">
        {{ finalTranscript || '（暂无识别结果）' }}
      </div>
    </div>
    
    <div v-if="recordedAudioUrl" class="mb-6 p-4 bg-indigo-50 rounded-lg">
      <h2 class="text-lg font-semibold text-indigo-800 mb-3">录音回放</h2>
      <div class="flex items-center gap-4">
        <button
          @click="playRecordedAudio"
          :disabled="isPlaying"
          class="px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          :class="isPlaying 
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-indigo-500 hover:bg-indigo-600 text-white'"
        >
          {{ isPlaying ? '🔊 播放中...' : '▶️ 播放录音' }}
        </button>
        <audio 
          ref="audioPlayer"
          :src="recordedAudioUrl"
          controls
          class="flex-1"
        ></audio>
      </div>
    </div>
    
    <div class="flex flex-col gap-4 mb-6">
      <div class="grid grid-cols-2 gap-4">
        <button
          @click="connect"
          :disabled="isConnected || isConnecting"
          class="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ isConnecting ? '⏳ 连接中...' : '🔗 连接服务器' }}
        </button>
        
        <button
          @click="disconnect"
          :disabled="!isConnected"
          class="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          ❌ 断开连接
        </button>
      </div>
      
      <button
        v-if="useTestAudio"
        @click="startRecording"
        :disabled="!isConnected || isRecognizing"
        class="px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
        :class="isRecognizing 
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse'
          : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'"
      >
        {{ isRecognizing ? '⏳ 识别中...' : '🎤 开始识别' }}
      </button>
      
      <button
        v-else
        @mousedown="handleRecordStart"
        @mouseup="handleRecordEnd"
        @mouseleave="stopRecording"
        @touchstart="handleRecordStart"
        @touchend="handleRecordEnd"
        :disabled="!isConnected"
        class="px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
        :class="isRecording 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
          : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'"
      >
        {{ isRecording ? '🎤 松开识别' : '🎤 按住录音' }}
      </button>
      
      <button
        @click="clearResults"
        class="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white"
      >
        🗑️ 清除结果
      </button>
    </div>
    
    <div class="mb-6 p-4 bg-yellow-50 rounded-lg">
      <h2 class="text-lg font-semibold text-yellow-800 mb-2">状态信息</h2>
      <p class="text-yellow-700">{{ status }}</p>
    </div>
    
    <div v-if="error" class="mb-6 p-4 bg-red-50 rounded-lg">
      <h2 class="text-lg font-semibold text-red-800 mb-2">错误信息</h2>
      <p class="text-red-700">{{ error }}</p>
    </div>
    
    <div class="mt-6 p-4 bg-indigo-50 rounded-lg">
      <h2 class="text-lg font-semibold text-indigo-800 mb-2">连接信息</h2>
      <p class="text-indigo-700 mb-1">🌐 WebSocket 服务器: {{ websocketServer }}</p>
      <p class="text-indigo-700">🔧 服务: Seed-ASR HTTP POST 语音识别</p>
    </div>
    
    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <h2 class="text-lg font-semibold text-blue-800 mb-2">使用说明</h2>
      <ol class="list-decimal list-inside space-y-2 text-blue-700">
        <li>选择测试模式：使用测试音频 或 使用麦克风录音</li>
        <li>点击「连接服务器」按钮建立 WebSocket 连接</li>
        <li v-if="useTestAudio">
          点击「🎤 开始识别」按钮，系统会自动下载测试音频并识别
        </li>
        <li v-else>
          按住「🎤 按住录音」按钮开始录音，松开按钮进行识别
        </li>
        <li>系统会显示识别结果</li>
        <li v-if="!useTestAudio">录音会自动保存，可以点击「▶️ 播放录音」回放</li>
        <li>点击「清除结果」按钮清空结果</li>
      </ol>
    </div>
    
    <div class="mt-6 p-4 bg-orange-50 rounded-lg">
      <h2 class="text-lg font-semibold text-orange-800 mb-2">注意事项</h2>
      <ul class="list-disc list-inside space-y-2 text-orange-700">
        <li>确保已配置正确的环境变量（见 .env）</li>
        <li>确保后端服务正在运行（端口 3000）</li>
        <li v-if="useTestAudio">测试音频会自动下载并转换为 PCM 格式</li>
        <li v-else>确保麦克风权限已允许</li>
        <li>使用 HTTP POST API 进行语音识别</li>
        <li>在安静环境下测试效果更佳</li>
        <li v-if="!useTestAudio">录音会自动保存为 WebM 或 MP4 格式</li>
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
