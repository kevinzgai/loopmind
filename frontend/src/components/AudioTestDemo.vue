<script setup lang="ts">
import { ref } from 'vue'

const isRecording = ref(false)
const isPlaying = ref(false)
const audioChunks = ref<Blob[]>([])
const recordedAudio = ref<HTMLAudioElement | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioUrl = ref('')
const status = ref('准备开始录音')

// 开始录音
async function startRecording() {
  try {
    status.value = '正在请求麦克风权限...'
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    status.value = '麦克风权限获取成功，准备录音...'
    mediaRecorder.value = new MediaRecorder(stream)
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }
    
    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      const url = URL.createObjectURL(audioBlob)
      audioUrl.value = url
      recordedAudio.value = new Audio(url)
      status.value = '录音结束，点击播放按钮试听'
      
      // 停止所有音频轨道
      stream.getTracks().forEach(track => track.stop())
    }
    
    mediaRecorder.value.onstart = () => {
      status.value = '录音中... 点击停止按钮结束录音'
      isRecording.value = true
      audioChunks.value = []
    }
    
    mediaRecorder.value.start()
  } catch (error) {
    status.value = `❌ 录音失败: ${error instanceof Error ? error.message : String(error)}`
    console.error('录音失败:', error)
  }
}

// 停止录音
function stopRecording() {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}

// 播放录音
function playRecording() {
  if (recordedAudio.value) {
    if (isPlaying.value) {
      recordedAudio.value.pause()
      recordedAudio.value.currentTime = 0
    } else {
      recordedAudio.value.play()
    }
    isPlaying.value = !isPlaying.value
  }
}

// 清除录音
function clearRecording() {
  if (recordedAudio.value) {
    recordedAudio.value.pause()
    recordedAudio.value.currentTime = 0
    URL.revokeObjectURL(audioUrl.value)
  }
  audioChunks.value = []
  recordedAudio.value = null
  audioUrl.value = ''
  isPlaying.value = false
  status.value = '准备开始录音'
}
</script>

<template>
  <div class="p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">🎤 录音测试工具</h1>
    
    <!-- 状态显示 -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h2 class="text-lg font-semibold text-blue-800 mb-2">状态</h2>
      <p class="text-blue-700">{{ status }}</p>
    </div>
    
    <!-- 控制按钮 -->
    <div class="flex flex-col gap-4 mb-6">
      <!-- 开始/停止录音按钮 -->
      <button
        @click="isRecording ? stopRecording() : startRecording()"
        class="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300"
        :class="isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'"
      >
        {{ isRecording ? '⏹️ 停止录音' : '▶️ 开始录音' }}
      </button>
      
      <!-- 播放/暂停按钮 -->
      <button
        @click="playRecording"
        :disabled="!recordedAudio"
        class="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
      >
        {{ isPlaying ? '⏸️ 暂停播放' : '🔊 播放录音' }}
      </button>
      
      <!-- 清除录音按钮 -->
      <button
        @click="clearRecording"
        :disabled="!recordedAudio"
        class="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
      >
        🗑️ 清除录音
      </button>
    </div>
    
    <!-- 录音可视化 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">录音可视化</h2>
      <div class="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
        <div
          class="h-full bg-blue-500 transition-all duration-100 ease-out"
          :class="isRecording ? 'animate-pulse' : ''"
          :style="{ width: isRecording ? '100%' : '0%' }"
        ></div>
        <div v-if="isRecording" class="absolute inset-0 flex items-center justify-center text-white font-bold">
          录音中...
        </div>
      </div>
    </div>
    
    <!-- 录音信息 -->
    <div v-if="recordedAudio" class="mt-6 p-4 bg-green-50 rounded-lg">
      <h2 class="text-lg font-semibold text-green-800 mb-2">录音信息</h2>
      <p class="text-green-700 mb-2">📝 录音已保存，点击播放按钮试听</p>
      <p class="text-green-700">🎵 音频 URL: <a :href="audioUrl" target="_blank" class="text-blue-500 underline hover:text-blue-700">点击下载</a></p>
    </div>
    
    <!-- 测试说明 -->
    <div class="mt-8 p-4 bg-yellow-50 rounded-lg">
      <h2 class="text-lg font-semibold text-yellow-800 mb-2">测试说明</h2>
      <ol class="list-decimal list-inside space-y-2 text-yellow-700">
        <li>点击「开始录音」按钮</li>
        <li>对着麦克风说话</li>
        <li>点击「停止录音」按钮</li>
        <li>点击「播放录音」按钮试听</li>
        <li>如果能听到自己的声音，说明录音功能正常</li>
        <li>如果听不到声音，说明录音功能存在问题</li>
      </ol>
    </div>
    
    <!-- 常见问题 -->
    <div class="mt-6 p-4 bg-purple-50 rounded-lg">
      <h2 class="text-lg font-semibold text-purple-800 mb-2">常见问题</h2>
      <ul class="list-disc list-inside space-y-2 text-purple-700">
        <li>麦克风权限是否已允许？</li>
        <li>是否有其他应用占用麦克风？</li>
        <li>麦克风硬件是否正常？</li>
        <li>浏览器是否支持 MediaRecorder API？</li>
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