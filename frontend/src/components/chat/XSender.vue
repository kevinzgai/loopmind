<template>
  <div class="w-full">
    <!-- Text Input Mode -->
    <div v-if="inputMode === 'text'" class="flex items-end gap-3">
      <div class="flex-1 relative">
        <textarea
          v-model="text"
          class="w-full min-h-[52px] max-h-[160px] px-4 py-3 pr-12 bg-muted/50 border border-border rounded-2xl resize-none outline-none text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
          :placeholder="placeholder"
          :disabled="disabled"
          rows="1"
          @keydown.enter.exact.prevent="emitSubmit"
          @input="autoResize"
          ref="textareaRef"
        ></textarea>
        <button
          @click="toggleInputMode"
          :disabled="disabled"
          class="absolute right-3 bottom-3 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="切换到语音输入">
          <Mic class="w-5 h-5" />
        </button>
      </div>
      <button
        @click="emitSubmit"
        :disabled="disabled || !text.trim()"
        :class="[
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer',
          text.trim() && !disabled
            ? 'gradient-primary text-white shadow-glow hover:shadow-lg hover:-translate-y-0.5'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        ]">
        <Send class="w-5 h-5" />
      </button>
    </div>

    <!-- Voice Input Mode -->
    <div v-else class="flex items-center gap-3">
      <button
        class="flex-1 min-h-[52px] px-4 py-3 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex items-center gap-3"
        :class="[
          isRecording 
            ? 'border-red-400 bg-red-500/5 border-solid animate-pulse' 
            : isConnecting 
              ? 'border-yellow-400 bg-yellow-500/5' 
              : 'border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50'
        ]"
        :disabled="disabled || isConnecting"
        @mousedown.prevent="handleVoiceButtonDown"
        @mouseup.prevent="handleVoiceButtonUp"
        @mouseleave="isRecording ? stopRecording() : null"
        @touchstart.prevent="handleVoiceButtonDown"
        @touchend.prevent="handleVoiceButtonUp">
        
        <div 
          :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            isRecording ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
          ]">
          <Mic v-if="!isRecording" class="w-5 h-5" />
          <MicOff v-else class="w-5 h-5" />
        </div>

        <div class="flex-1 min-w-0">
          <div v-if="isRecording" class="flex items-center gap-1 h-6">
            <span 
              v-for="i in 20" 
              :key="i"
              class="w-1 bg-red-400 rounded-full animate-pulse"
              :style="{ 
                height: `${Math.random() * audioLevel + 10}%`, 
                animationDelay: `${i * 0.05}s`,
                animationDuration: '0.5s'
              }">
            </span>
          </div>
          <p v-else-if="isConnecting" class="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            连接中...
          </p>
          <p v-else-if="displayText" class="text-sm text-foreground font-medium truncate">
            {{ displayText }}
          </p>
          <p v-else class="text-sm text-muted-foreground">
            按住说话，松开发送
          </p>
        </div>
      </button>

      <button
        @click="toggleInputMode"
        :disabled="disabled"
        class="flex-shrink-0 w-12 h-12 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="切换到文字输入">
        <Keyboard class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { Mic, MicOff, Send, Keyboard } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '输入消息...' }
})

const emit = defineEmits(['update:modelValue', 'submit', 'autoSubmit'])

const text = ref(props.modelValue)
const inputMode = ref('text')
const isRecording = ref(false)
const isConnecting = ref(false)
const recognizedText = ref('')
const intermediateText = ref('')
const audioLevel = ref(0)
const textareaRef = ref(null)

let ws = null
let reconnectTimer = null
let audioContext = null
let analyser = null
let processor = null
let mediaStream = null
let animationId = null

const displayText = computed(() => {
  if (recognizedText.value || intermediateText.value) {
    const t = recognizedText.value + (intermediateText.value ? ' ' + intermediateText.value : '')
    return t.length > 30 ? t.substring(0, 30) + '...' : t
  }
  return ''
})

watch(() => props.modelValue, v => { text.value = v })
watch(text, v => emit('update:modelValue', v))

function autoResize() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 160) + 'px'
  }
}

function setupWebSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws-asr-stream`
  
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('ASR WebSocket Connected')
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }
  
  ws.onclose = () => {
    console.log('ASR WebSocket Closed')
    ws = null
    if (inputMode.value === 'voice') {
      reconnectTimer = setTimeout(() => {
        setupWebSocket()
      }, 2000)
    }
  }
  
  ws.onerror = (err) => {
    console.error('ASR WebSocket Error', err)
    ws && ws.close()
  }
  
  ws.onmessage = handleWebSocketMessage
}

function toggleInputMode() {
  if (inputMode.value === 'text') {
    inputMode.value = 'voice'
    setupWebSocket()
  } else {
    inputMode.value = 'text'
    stopRecording()
  }
}

function emitSubmit() {
  if (!text.value.trim() || props.disabled) return
  emit('submit')
}

function handleWebSocketMessage(event) {
  try {
    const data = JSON.parse(event.data)
    if (data.type === 'started') {
      isConnecting.value = false
      isRecording.value = true
    } else if (data.type === 'intermediate') {
      intermediateText.value = data.text
    } else if (data.type === 'result') {
      if (data.text) {
        recognizedText.value += (recognizedText.value ? ' ' : '') + data.text
        intermediateText.value = ''
      }
    } else if (data.type === 'error') {
      console.error('ASR Error:', data.message)
      stopRecording()
    }
  } catch {}
}

function handleVoiceButtonDown() {
  if (props.disabled) return
  startRecording()
  document.addEventListener('mouseup', handleGlobalMouseUp)
  document.addEventListener('touchend', handleGlobalTouchEnd)
}

function handleVoiceButtonUp() {
  if (props.disabled) return
  stopRecording()
  document.removeEventListener('mouseup', handleGlobalMouseUp)
  document.removeEventListener('touchend', handleGlobalTouchEnd)
}

function handleGlobalMouseUp() {
  if (isRecording.value) {
    stopRecording()
    document.removeEventListener('mouseup', handleGlobalMouseUp)
    document.removeEventListener('touchend', handleGlobalTouchEnd)
  }
}

function handleGlobalTouchEnd() {
  if (isRecording.value) {
    stopRecording()
    document.removeEventListener('mouseup', handleGlobalMouseUp)
    document.removeEventListener('touchend', handleGlobalTouchEnd)
  }
}

async function startRecording() {
  if (isRecording.value || isConnecting.value) return
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    setupWebSocket()
  }

  try {
    isConnecting.value = true
    recognizedText.value = ''
    intermediateText.value = ''
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    })
    audioContext = new AudioContext({ sampleRate: 16000 })
    const source = audioContext.createMediaStreamSource(mediaStream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    visualizeAudio()
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'start' }))
    }

    await audioContext.audioWorklet.addModule('/src/worklets/AudioProcessor.js')
    processor = new AudioWorkletNode(audioContext, 'audio-streaming-processor')
    
    processor.port.onmessage = (event) => {
      if (event.data.type === 'audioData' && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(event.data.data)
      }
    }
    
    source.connect(processor)
    processor.connect(audioContext.destination)
  } catch (error) {
    isConnecting.value = false
    alert('无法访问麦克风：' + (error && error.message ? error.message : '未知错误'))
  }
}

function visualizeAudio() {
  if (!analyser) return
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!analyser || !isRecording.value) return
    animationId = requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    const average = dataArray.reduce((a, b) => a + b) / bufferLength
    audioLevel.value = Math.min(100, (average / 255) * 100)
  }
  draw()
}

function stopRecording() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'stop' }))
    setTimeout(() => {
      let finalText = recognizedText.value
      if (intermediateText.value) {
        finalText += (finalText ? ' ' : '') + intermediateText.value
      }
      if (finalText.trim()) {
        emit('autoSubmit', finalText)
        recognizedText.value = ''
        intermediateText.value = ''
      }
    }, 800)
  }
  
  if (processor) { processor.disconnect(); processor = null }
  if (analyser) { analyser.disconnect(); analyser = null }
  if (audioContext) { audioContext.close(); audioContext = null }
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null }
  isRecording.value = false
  isConnecting.value = false
  audioLevel.value = 0
}

onMounted(() => {
  if (inputMode.value === 'voice') {
    setupWebSocket()
  }
})

onUnmounted(() => {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  stopRecording()
  if (ws) {
    ws.close()
    ws = null
  }
})
</script>

<style scoped>
.gradient-primary {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
}

.shadow-glow {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}
</style>
