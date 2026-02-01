<script setup lang="ts">
import { ref, onUnmounted, computed, nextTick } from 'vue'
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
const textareaRef = ref<HTMLTextAreaElement | null>(null)

let ws: WebSocket | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let processor: AudioWorkletNode | null = null
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
  
  // 添加全局事件监听器以确保在任何地方松开鼠标都能停止录音
  document.addEventListener('mouseup', handleGlobalMouseUp);
  document.addEventListener('touchend', handleGlobalTouchEnd);
}

function handleVoiceButtonUp(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  stopRecording()
  
  // 移除全局事件监听器
  document.removeEventListener('mouseup', handleGlobalMouseUp);
  document.removeEventListener('touchend', handleGlobalTouchEnd);
}

// 全局鼠标松开事件处理
function handleGlobalMouseUp() {
  if (isRecording.value) {
    stopRecording();
    // 移除全局事件监听器
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    document.removeEventListener('touchend', handleGlobalTouchEnd);
  }
}

// 全局触摸结束事件处理
function handleGlobalTouchEnd() {
  if (isRecording.value) {
    stopRecording();
    // 移除全局事件监听器
    document.removeEventListener('mouseup', handleGlobalMouseUp);
    document.removeEventListener('touchend', handleGlobalTouchEnd);
  }
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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws-asr-stream`
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
    
    // 创建 AudioWorklet 处理器
    await audioContext.audioWorklet.addModule('/src/worklets/AudioProcessor.js')
    processor = new AudioWorkletNode(audioContext, 'audio-streaming-processor')
    
    // 处理从 AudioWorklet 发送过来的数据
    processor.port.onmessage = (event: MessageEvent) => {
      if (event.data.type === 'audioData' && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(event.data.data)
      }
    }
    
    // 连接音频节点
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

async function focusTextInput() {
  inputMode.value = 'text'
  await nextTick()
  textareaRef.value?.focus()
}

defineExpose({
  focusTextInput
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
        ref="textareaRef"
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
  @apply bg-card text-card-foreground;
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
  min-height: 52px;
  max-height: 200px;
  padding: 12px;
  @apply border-input bg-background text-foreground;
  border-width: 1px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.7;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.text-input::placeholder {
  @apply text-muted-foreground;
  opacity: 1;
}

.text-input:focus {
  @apply border-primary;
}

/* 语音输入按钮（替换文本框） */
.voice-input-button {
  flex: 1;
  min-height: 44px;
  padding: 12px;
  @apply border-dashed border-input bg-muted;
  border-width: 2px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.voice-input-button:hover:not(:disabled) {
  @apply border-primary bg-accent;
}

.voice-input-button.connecting {
  @apply border-yellow-500 bg-yellow-500/10;
  cursor: wait;
}

.voice-input-button.recording {
  @apply border-destructive border-solid bg-destructive/10;
  animation: pulse-border 1.5s ease-in-out infinite;
}

.voice-input-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes pulse-border {
  0%, 100% { 
    @apply border-destructive;
    box-shadow: 0 0 0 0 hsla(var(--destructive) / 0.4);
  }
  50% { 
    @apply border-destructive/80;
    box-shadow: 0 0 0 4px hsla(var(--destructive) / 0);
  }
}

.voice-button-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  @apply text-muted-foreground;
}

.recording .voice-button-content {
  @apply text-destructive;
}

.connecting .voice-button-content {
  @apply text-yellow-600;
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
  @apply bg-gradient-to-t from-destructive to-destructive/60;
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
  @apply text-muted-foreground;
  text-align: left;
}

.status-text.recognized {
  @apply text-foreground;
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
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle-btn {
  @apply bg-muted text-muted-foreground;
}

.mode-toggle-btn:hover {
  @apply bg-accent text-accent-foreground;
}

.send-btn {
  @apply bg-primary text-primary-foreground;
}

.send-btn:hover:not(.disabled) {
  @apply bg-primary/90;
}

.send-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
