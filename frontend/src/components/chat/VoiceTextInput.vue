<template>
  <div class="voice-text-input-container">
    <!-- 文字输入模式 -->
    <div v-if="inputMode === 'text'" class="text-input-wrapper">
      <textarea
        ref="textareaRef"
        v-model="textValue"
        class="text-input-area"
        :placeholder="placeholder"
        :rows="1"
        @input="adjustTextareaHeight"
        @keydown.enter.exact.prevent="handleTextSubmit"
        @keydown.enter.shift.exact.prevent="insertNewline"
      />
      <div class="input-controls">
        <button
          class="mode-toggle-btn"
          :title="t('switchToVoice')"
          @click="switchToVoiceMode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v11a3 3 0 1 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <path d="M12 19v4"/>
            <path d="M8 23h8"/>
          </svg>
        </button>
        <button
          class="send-btn"
          :disabled="!textValue.trim()"
          @click="handleTextSubmit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <!-- 语音输入模式 -->
    <div v-else class="voice-input-wrapper">
      <div
        class="voice-input-button"
        :class="{ 
          'recording': isRecording, 
          'connecting': isConnecting,
          'has-visualizer': showVisualizer
        }"
        @mousedown="handleVoiceStart"
        @mouseup="handleVoiceEnd"
        @mouseleave="handleVoiceCancel"
        @touchstart="handleVoiceStart"
        @touchend="handleVoiceEnd"
        @touchcancel="handleVoiceCancel"
      >
        <div class="voice-button-content">
          <!-- 麦克风图标 -->
          <div class="mic-icon-wrapper">
            <svg v-if="!isRecording && !isConnecting" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v11a3 3 0 1 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <path d="M12 19v4"/>
              <path d="M8 23h8"/>
            </svg>
            
            <svg v-else-if="isConnecting" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="15" y2="9"></line>
              <line x1="22" y1="2" x2="15" y2="2"></line>
              <line x1="22" y1="2" x2="22" y2="9"></line>
            </svg>
            
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v11a3 3 0 1 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <path d="M12 19v4"/>
              <path d="M8 23h8"/>
            </svg>
          </div>

          <!-- 音频可视化 -->
          <div v-if="showVisualizer && isRecording" class="audio-visualizer">
            <div
              v-for="n in 21"
              :key="n"
              class="visualizer-bar"
              :style="{
                height: `${getBarHeight(n)}%`,
                animationDelay: `${n * 0.05}s`,
                backgroundColor: visualizerColor
              }"
            />
          </div>

          <!-- 状态文本 -->
          <div class="status-text">
            <span v-if="isConnecting">{{ t('connecting') }}</span>
            <span v-else-if="isRecording">{{ t('recording') }}{{ recordingDots }}</span>
            <span v-else-if="displayText">{{ displayText }}</span>
            <span v-else>{{ t('holdToSpeak') }}</span>
          </div>
        </div>
      </div>

      <div class="voice-input-controls">
        <button
          class="mode-toggle-btn"
          :title="t('switchToText')"
          @click="switchToTextMode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'

// 国际化支持
const t = (key) => {
  const translations = {
    holdToSpeak: '按住说话',
    recording: '录音中',
    connecting: '连接中',
    switchToText: '切换到文字输入',
    switchToVoice: '切换到语音输入'
  }
  return translations[key] || key
}

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '输入消息...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showVisualizer: {
    type: Boolean,
    default: true
  },
  visualizerColor: {
    type: String,
    default: '#ef4444' // red-500
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'submit', 'autoSubmit'])

// Refs
const textareaRef = ref(null)
const textValue = ref(props.modelValue)

// State
const inputMode = ref('text') // 'text' or 'voice'
const isRecording = ref(false)
const isConnecting = ref(false)
const recognizedText = ref('')
const intermediateText = ref('')
const audioLevel = ref(0)
const recordingInterval = ref(null)

// Audio variables
let mediaRecorder = null
let audioChunks = []
let audioContext = null
let analyser = null
let mediaStream = null
let animationId = null

// Computed
const displayText = computed(() => {
  if (recognizedText.value || intermediateText.value) {
    const text = recognizedText.value + (intermediateText.value ? ' ' + intermediateText.value : '')
    return text.length > 50 ? text.substring(0, 50) + '...' : text
  }
  return ''
})

const recordingDots = computed(() => {
  const dots = ['.', '..', '...', '']
  return dots[Math.floor(Date.now() / 500) % dots.length]
})

// Watchers
watch(() => props.modelValue, (newVal) => {
  textValue.value = newVal
})

watch(textValue, (newVal) => {
  emit('update:modelValue', newVal)
})

// Text input methods
const adjustTextareaHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
  }
}

const handleTextSubmit = () => {
  if (textValue.value.trim()) {
    emit('submit')
  }
}

const insertNewline = () => {
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  textValue.value = textValue.value.substring(0, start) + '\n' + textValue.value.substring(end)
  
  // Restore cursor position
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1
    adjustTextareaHeight()
  })
}

// Voice input methods
const switchToVoiceMode = async () => {
  if (props.disabled) return
  inputMode.value = 'voice'
  await nextTick()
}

const switchToTextMode = () => {
  if (props.disabled) return
  // 如果正在录音，先停止
  if (isRecording.value) {
    stopRecording()
  }
  inputMode.value = 'text'
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  })
}

const handleVoiceStart = async (event) => {
  event.preventDefault()
  if (props.disabled || isConnecting.value) return
  await startRecording()
}

const handleVoiceEnd = (event) => {
  event.preventDefault()
  if (props.disabled) return
  stopRecording()
}

const handleVoiceCancel = (event) => {
  event.preventDefault()
  if (props.disabled) return
  // 取消录音（比如鼠标离开按钮区域）
  if (isRecording.value) {
    stopRecording()
  }
}

const getBarHeight = (index) => {
  // 生成动态高度，模拟音频波形
  if (!isRecording.value) return 20
  
  const baseHeight = 20
  const variation = Math.sin(Date.now() * 0.01 + index * 0.5) * 30
  const levelEffect = audioLevel.value * 0.5
  return Math.max(baseHeight, baseHeight + variation + levelEffect)
}

// Audio processing
const startRecording = async () => {
  if (isRecording.value || isConnecting.value) return

  try {
    isConnecting.value = true
    recognizedText.value = ''
    intermediateText.value = ''
    audioChunks = []

    // 获取可用的音频输入设备
    let audioConstraints = {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      // 如果有多个音频输入设备，可以指定使用特定设备
      if (audioInputDevices.length > 0) {
        // 使用第一个可用的音频输入设备
        audioConstraints.deviceId = { exact: audioInputDevices[0].deviceId };
      }
    } catch (error) {
      console.warn('⚠️ 无法枚举音频设备，使用默认设置:', error);
      // 如果无法枚举设备，使用默认约束
    }
    
    console.log('🎤 请求麦克风权限')
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints
    })

    // 创建音频上下文用于可视化
    audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(mediaStream)
    
    // 创建分析器用于可视化
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    // 开始可视化
    if (props.showVisualizer) {
      visualizeAudio()
    }

    // 创建 MediaRecorder 实例
    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'audio/webm'
    })

    // 处理录音数据
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    // 处理录音结束
    mediaRecorder.onstop = async () => {
      console.log('✅ 录音结束，开始处理音频文件')
      
      try {
        // 创建完整的音频文件
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        console.log('📊 音频文件大小:', audioBlob.size, '字节')
        
        // 创建 FormData 发送文件
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')
        
        // 发送到后端处理
        console.log('📤 发送音频文件到后端')
        const response = await fetch('/api/asr', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('✅ 后端处理完成，结果:', result)
        
        if (result.text) {
          recognizedText.value = result.text
          emit('autoSubmit', result.text)
        } else {
          console.warn('⚠️ 没有识别到文本')
        }
      } catch (error) {
        console.error('❌ 处理音频文件失败:', error)
        alert('处理音频文件失败：' + (error.message || '未知错误'))
      } finally {
        // 清理资源
        cleanupRecording()
      }
    }

    // 开始录音
    mediaRecorder.start()
    console.log('🎤 开始录音')
    isConnecting.value = false
    isRecording.value = true
    
    // 开始录音指示动画
    if (recordingInterval.value) {
      clearInterval(recordingInterval.value)
    }
    recordingInterval.value = setInterval(() => {
      // 更新录音动画
    }, 300)
  } catch (error) {
    console.error('❌ 启动录音失败:', error)
    isConnecting.value = false
    alert('无法访问麦克风：' + (error.message || '未知错误'))
    cleanupRecording()
  }
}

const stopRecording = () => {
  console.log('🛑 停止录音')

  // 停止录音指示动画
  if (recordingInterval.value) {
    clearInterval(recordingInterval.value)
    recordingInterval.value = null
  }

  // 停止可视化
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  // 停止 MediaRecorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    console.log('⏹️ 停止 MediaRecorder')
    mediaRecorder.stop()
  } else {
    console.warn('⚠️ MediaRecorder 不存在或未在录音')
    cleanupRecording()
  }
}

// 清理录音资源
const cleanupRecording = () => {
  console.log('🧹 清理录音资源')
  
  // 停止音频处理
  if (analyser) {
    analyser.disconnect()
    analyser = null
  }

  // 停止媒体流
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }

  // 关闭音频上下文
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }

  isRecording.value = false
  isConnecting.value = false
  audioLevel.value = 0
}



const handleWebSocketMessage = (event) => {
  try {
    const data = JSON.parse(event.data)
    console.log('📨 收到 WebSocket 消息:', data)

    if (data.type === 'started') {
      console.log('✅ 识别已开始')
      isConnecting.value = false
      isRecording.value = true
    } else if (data.type === 'intermediate') {
      // 中间结果
      console.log('🔄 中间结果:', data.text)
      intermediateText.value = data.text
    } else if (data.type === 'result') {
      // 最终结果
      console.log('✅ 最终结果:', data.text)
      if (data.text) {
        recognizedText.value += (recognizedText.value ? ' ' : '') + data.text
        intermediateText.value = ''
        console.log('📝 累积识别文本:', recognizedText.value)
      }
    } else if (data.type === 'error') {
      console.error('❌ 识别错误:', data.message)
      stopRecording()
    } else if (data.type === 'completed') {
      console.log('✅ 识别已完成，关闭 WebSocket 连接')
      // 关闭 WebSocket 连接
      if (ws) {
        ws.close()
        ws = null
      }
    }
  } catch (error) {
    console.error('❌ 解析消息失败:', error)
  }
}

const visualizeAudio = () => {
      if (!analyser) return

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        if (!analyser || !isRecording.value) return

        animationId = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray)

        // 计算平均音量（参考文章中的方法）
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const averageVolume = sum / dataArray.length
        audioLevel.value = averageVolume
      }

      draw()
    }

// Lifecycle
onUnmounted(() => {
  stopRecording()
  if (recordingInterval.value) {
    clearInterval(recordingInterval.value)
  }
})

// Initialize textarea height
nextTick(() => {
  if (textareaRef.value) {
    adjustTextareaHeight()
  }
})
</script>

<style scoped>
.voice-text-input-container {
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  border: 1px solid #bfdbfe;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.voice-text-input-container:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #93c5fd;
}

.text-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.text-input-area {
  width: 100%;
  min-height: 56px;
  max-height: 150px;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.text-input-area:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.text-input-area::placeholder {
  color: #94a3b8;
}

.input-controls {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
}

.mode-toggle-btn, .send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: #eff6ff;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-toggle-btn:hover, .send-btn:hover {
  background: #dbeafe;
  transform: translateY(-1px);
}

.mode-toggle-btn:active, .send-btn:active {
  transform: translateY(0);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background: #3b82f6;
  color: white;
}

.voice-input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.voice-input-button {
  flex: 1;
  min-height: 56px;
  padding: 14px 20px;
  border: 2px dashed #c7d2fe;
  border-radius: 12px;
  background: #f0f9ff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.voice-input-button:hover:not(.recording):not(.connecting) {
  border-color: #a5b4fc;
  background: #e0f2fe;
}

.voice-input-button.recording {
  border: 2px solid #ef4444;
  border-style: solid;
  background: #fef2f2;
  animation: pulse-border 1.5s ease-in-out infinite;
}

.voice-input-button.connecting {
  border-color: #f59e0b;
  background: #fffbeb;
  cursor: wait;
}

.voice-input-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.voice-button-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  color: #4f46e5;
}

.voice-button-content.recording {
  color: #dc2626;
}

.mic-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.audio-visualizer {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 28px;
  flex: 1;
  padding: 0 4px;
}

.visualizer-bar {
  width: 4px;
  border-radius: 2px;
  background: #ef4444;
  transition: height 0.1s ease;
  animation: wave 1s ease-in-out infinite alternate;
}

.status-text {
  flex: 1;
  font-size: 14px;
  color: #64748b;
  text-align: left;
  font-weight: 500;
}

.status-text.recognized {
  color: #1e293b;
  font-weight: 500;
}

.voice-input-controls {
  display: flex;
  gap: 8px;
}

@keyframes pulse-border {
  0%, 100% { 
    border-color: #ef4444;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% { 
    border-color: #f87171;
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
}

@keyframes wave {
  from { transform: scaleY(0.5); }
  to { transform: scaleY(1); }
}

@media (max-width: 768px) {
  .voice-text-input-container {
    padding: 10px;
    border-radius: 12px;
  }
  
  .text-input-area {
    min-height: 52px;
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .voice-input-button {
    min-height: 52px;
    padding: 12px 16px;
  }
  
  .mode-toggle-btn, .send-btn {
    width: 40px;
    height: 40px;
  }
}
</style>