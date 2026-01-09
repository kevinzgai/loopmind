<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'
import { Mic, MicOff, Send } from 'lucide-vue-next'

interface Props {
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
  (e: 'autoSubmit', text: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const inputMode = ref<'text' | 'voice'>('text')
const isRecording = ref(false)
const isConnecting = ref(false)
const recognizedText = ref('')
const intermediateText = ref('')
const audioLevel = ref(0)

let ws: WebSocket | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let processor: ScriptProcessorNode | null = null
let mediaStream: MediaStream | null = null
let animationId: number | null = null

// 计算显示的文本
const displayText = computed(() => {
  if (recognizedText.value || intermediateText.value) {
    const text = recognizedText.value + (intermediateText.value ? ' ' + intermediateText.value : '')
    return text.length > 30 ? text.substring(0, 30) + '...' : text
  }
  return ''
})

// 是否可以发送
const canSubmit = computed(() => {
  if (inputMode.value === 'text') {
    return props.modelValue.trim().length > 0
  }
  return false
})

// 切换输入模式
function toggleInputMode() {
  if (inputMode.value === 'text') {
    inputMode.value = 'voice'
  } else {
    inputMode.value = 'text'
    stopRecording()
  }
}

// 长按开始录音（语音模式）
function handleVoiceButtonDown(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  startRecording()
}

function handleVoiceButtonUp(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  stopRecording()
}

// 开始录音
async function startRecording() {
  if (isRecording.value || isConnecting.value) return
  
  try {
    isConnecting.value = true
    recognizedText.value = ''
    intermediateText.value = ''
    
    // 请求麦克风权限
    mediaStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    })
    
    // 创建音频上下文
    audioContext = new AudioContext({ sampleRate: 16000 })
    const source = audioContext.createMediaStreamSource(mediaStream)
    
    // 创建分析器用于可视化
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    
    // 开始可视化
    visualizeAudio()
    
    // 建立 WebSocket 连接
    const wsUrl = 'ws://localhost:3000/ws-asr-stream'
    ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('✅ WebSocket 连接已建立')
      isConnecting.value = false
      isRecording.value = true
    }
    
    ws.onmessage = handleWebSocketMessage
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket 错误:', error)
      stopRecording()
      isConnecting.value = false
    }
    
    ws.onclose = () => {
      console.log('🔌 WebSocket 连接已关闭')
      isRecording.value = false
      isConnecting.value = false
    }
    
    // 创建音频处理器
    processor = audioContext.createScriptProcessor(4096, 1, 1)
    
    processor.onaudioprocess = (e) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0)
        
        // 转换为 16-bit PCM
        const pcmData = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }
        
        // 发送 PCM 数据
        ws.send(pcmData.buffer)
      }
    }
    
    source.connect(processor)
    processor.connect(audioContext.destination)
    
    console.log('🎤 开始录音')
    
  } catch (error) {
    console.error('❌ 启动录音失败:', error)
    isConnecting.value = false
    alert('无法访问麦克风：' + (error as Error).message)
  }
}

// 停止录音
function stopRecording() {
  console.log('🛑 停止录音，当前识别文本:', recognizedText.value, '中间文本:', intermediateText.value)
  
  // 停止可视化
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  // 发送停止指令
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'stop' }))
    
    // 等待最终结果，然后自动提交
    setTimeout(() => {
      console.log('⏰ 延迟后的识别文本:', recognizedText.value, '中间文本:', intermediateText.value)
      
      if (ws) {
        ws.close()
        ws = null
      }
      
      // 合并最终结果和中间结果
      let finalText = recognizedText.value
      if (intermediateText.value) {
        finalText += (finalText ? ' ' : '') + intermediateText.value
      }
      
      // 自动提交识别结果
      if (finalText.trim()) {
        console.log('🚀 自动提交识别结果:', finalText)
        emit('autoSubmit', finalText)
        recognizedText.value = ''
        intermediateText.value = ''
      } else {
        console.warn('⚠️ 没有识别到文本，无法自动提交')
      }
    }, 800)  // 增加延迟时间，确保收到最终结果
  }
  
  // 停止音频处理
  if (processor) {
    processor.disconnect()
    processor = null
  }
  
  if (analyser) {
    analyser.disconnect()
    analyser = null
  }
  
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  
  // 停止媒体流
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  isRecording.value = false
  isConnecting.value = false
  audioLevel.value = 0
}

// 处理 WebSocket 消息
function handleWebSocketMessage(event: MessageEvent) {
  try {
    const data = JSON.parse(event.data)
    console.log('📨 收到 WebSocket 消息:', data)
    
    if (data.type === 'started') {
      console.log('✅ 识别已开始')
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
    }
  } catch (error) {
    console.error('❌ 解析消息失败:', error)
  }
}

// 可视化音频
function visualizeAudio() {
  if (!analyser) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!analyser || !isRecording.value) return
    
    animationId = requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    
    // 计算平均音量
    const average = dataArray.reduce((a, b) => a + b) / bufferLength
    audioLevel.value = Math.min(100, (average / 255) * 100)
  }

  draw()
}

// 发送消息（文字模式）
function handleSubmit() {
  if (props.modelValue.trim()) {
    emit('submit')
  }
}

onUnmounted(() => {
  stopRecording()
})
</script>

<template>
  <div class="voice-input-container">
    <div class="input-wrapper">
      <!-- 文字输入区域 -->
      <textarea
        v-if="inputMode === 'text'"
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @keydown.enter.exact.prevent="handleSubmit"
        placeholder="输入消息..."
        class="text-input"
        rows="1"
      />

      <!-- 语音输入按钮（替换文本框位置） -->
      <button
        v-else
        @mousedown="handleVoiceButtonDown"
        @mouseup="handleVoiceButtonUp"
        @mouseleave="isRecording ? stopRecording() : null"
        @touchstart="handleVoiceButtonDown"
        @touchend="handleVoiceButtonUp"
        class="voice-input-button"
        :class="{ 
          'recording': isRecording,
          'connecting': isConnecting
        }"
        :disabled="isConnecting"
      >
        <div class="voice-button-content">
          <!-- 麦克风图标 -->
          <Mic :size="24" :class="{ 'animate-pulse': isRecording }" />

          <!-- 音频波形（录音时显示） -->
          <div v-if="isRecording" class="audio-visualizer">
            <div 
              v-for="i in 20" 
              :key="i" 
              class="wave-bar"
              :style="{ 
                height: `${Math.random() * audioLevel + 10}%`,
                animationDelay: `${i * 0.05}s`
              }"
            />
          </div>

          <!-- 状态文字 -->
          <span v-else-if="isConnecting" class="status-text">连接中...</span>
          <span v-else-if="displayText" class="status-text recognized">{{ displayText }}</span>
          <span v-else class="status-text">按住说话</span>
        </div>
      </button>

      <!-- 右侧按钮组 -->
      <div class="input-actions">
        <!-- 切换模式按钮 -->
        <button 
          @click="toggleInputMode" 
          class="action-btn mode-toggle-btn"
          :title="inputMode === 'text' ? '切换到语音输入' : '切换到文字输入'"
        >
          <Mic v-if="inputMode === 'text'" :size="20" />
          <MicOff v-else :size="20" />
        </button>

        <!-- 发送按钮 -->
        <button 
          @click="handleSubmit" 
          :disabled="!canSubmit"
          class="action-btn send-btn"
          :class="{ 'disabled': !canSubmit }"
        >
          <Send :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-input-container {
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 12px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

/* 文字输入框 */
.text-input {
  flex: 1;
  min-height: 44px;
  max-height: 200px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #4299e1;
}

/* 语音输入按钮（替换文本框） */
.voice-input-button {
  flex: 1;
  min-height: 44px;
  padding: 12px;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  background: #f7fafc;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.voice-input-button:hover:not(:disabled) {
  border-color: #4299e1;
  background: #edf2f7;
}

.voice-input-button.connecting {
  border-color: #ed8936;
  background: #feebc8;
  cursor: wait;
}

.voice-input-button.recording {
  border-color: #f56565;
  border-style: solid;
  background: #fff5f5;
  animation: pulse-border 1.5s ease-in-out infinite;
}

.voice-input-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes pulse-border {
  0%, 100% { 
    border-color: #f56565;
    box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.4);
  }
  50% { 
    border-color: #fc8181;
    box-shadow: 0 0 0 4px rgba(245, 101, 101, 0);
  }
}

.voice-button-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  color: #4a5568;
}

.recording .voice-button-content {
  color: #c53030;
}

.connecting .voice-button-content {
  color: #c05621;
}

.animate-pulse {
  animation: pulse-icon 1s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.audio-visualizer {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 24px;
  flex: 1;
}

.wave-bar {
  width: 3px;
  background: linear-gradient(to top, #f56565, #fc8181);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.status-text {
  flex: 1;
  font-size: 14px;
  color: #718096;
  text-align: left;
}

.status-text.recognized {
  color: #2d3748;
  font-weight: 500;
}

/* 右侧按钮组 */
.input-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle-btn {
  background: #f7fafc;
  color: #4a5568;
}

.mode-toggle-btn:hover {
  background: #edf2f7;
  color: #2d3748;
}

.send-btn {
  background: #4299e1;
  color: white;
}

.send-btn:hover:not(.disabled) {
  background: #3182ce;
}

.send-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
