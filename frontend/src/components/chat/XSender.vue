<template>
  <div class="x-sender">
    <div class="sender-box">
      <textarea
        v-if="inputMode === 'text'"
        v-model="text"
        class="sender-input"
        :placeholder="placeholder"
        :disabled="disabled"
        @keydown.enter.exact.prevent="emitSubmit"
      ></textarea>

      <button
        v-else
        class="voice-input-button"
        :class="{ recording: isRecording, connecting: isConnecting }"
        :disabled="disabled || isConnecting"
        @mousedown.prevent="handleVoiceButtonDown"
        @mouseup.prevent="handleVoiceButtonUp"
        @mouseleave="isRecording ? stopRecording() : null"
        @touchstart.prevent="handleVoiceButtonDown"
        @touchend.prevent="handleVoiceButtonUp"
      >
        <div class="voice-button-content">
          <span class="mic-icon">🎙️</span>
          <div v-if="isRecording" class="audio-visualizer">
            <div
              v-for="i in 20"
              :key="i"
              class="wave-bar"
              :style="{ height: `${Math.random() * audioLevel + 10}%`, animationDelay: `${i * 0.05}s` }"
            />
          </div>
          <span v-else-if="isConnecting" class="status-text">连接中...</span>
          <span v-else-if="displayText" class="status-text recognized">{{ displayText }}</span>
          <span v-else class="status-text">按住说话</span>
        </div>
      </button>

      <div class="sender-actions">
        <button class="mode-btn" @click="toggleInputMode" :title="inputMode === 'text' ? '切换到语音输入' : '切换到文字输入'">
          {{ inputMode === 'text' ? '语音' : '文字' }}
        </button>
        <button class="sender-btn" :disabled="disabled || !text.trim()" @click="emitSubmit">
          发送
        </button>
      </div>
    </div>
  </div>
 </template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'

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

let ws = null
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

function toggleInputMode() {
  if (inputMode.value === 'text') {
    inputMode.value = 'voice'
  } else {
    inputMode.value = 'text'
    stopRecording()
    nextTick(() => {})
  }
}

function emitSubmit() {
  if (!text.value.trim() || props.disabled) return
  emit('submit')
}

function handleWebSocketMessage(event) {
  try {
    const data = JSON.parse(event.data)
    if (data.type === 'intermediate') {
      intermediateText.value = data.text
    } else if (data.type === 'result') {
      if (data.text) {
        recognizedText.value += (recognizedText.value ? ' ' : '') + data.text
        intermediateText.value = ''
      }
    }
  } catch {}
}

async function startRecording() {
  if (isRecording.value || isConnecting.value) return
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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws-asr-stream`
    ws = new WebSocket(wsUrl)
    ws.onopen = () => {
      isConnecting.value = false
      isRecording.value = true
    }
    ws.onmessage = handleWebSocketMessage
    ws.onerror = () => {
      stopRecording()
      isConnecting.value = false
    }
    ws.onclose = () => {
      isRecording.value = false
      isConnecting.value = false
    }
    processor = audioContext.createScriptProcessor(4096, 1, 1)
    processor.onaudioprocess = e => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0)
        const pcmData = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }
        ws.send(pcmData.buffer)
      }
    }
    source.connect(processor)
    processor.connect(audioContext.destination)
  } catch (error) {
    isConnecting.value = false
    alert('无法访问麦克风：' + (error && error.message ? error.message : '未知错误'))
  }
}

function stopRecording() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'stop' }))
    setTimeout(() => {
      if (ws) { ws.close(); ws = null }
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

function visualizeAudio() {
  if (!analyser) return
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  const draw = () => {
    if (!analyser || !isRecording.value) return
    animationId = requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength
    audioLevel.value = Math.min(100, (average / 255) * 100)
  }
  draw()
}

function handleVoiceButtonDown(e) {
  startRecording()
}
function handleVoiceButtonUp(e) {
  stopRecording()
}

onUnmounted(() => {
  stopRecording()
})
</script>

<style scoped>
.x-sender {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  border-top: 1px solid #e2e8f0;
}
.sender-box {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.75rem;
}
.sender-input {
  flex: 1;
  min-height: 48px;
  max-height: 160px;
  padding: 0.5rem 0.75rem;
  border: none;
  resize: vertical;
  outline: none;
  font-size: 0.95rem;
}
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
.mic-icon {
  font-size: 20px;
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
.sender-actions {
  display: flex;
  gap: 0.5rem;
}
.mode-btn {
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #cbd5e0;
  background: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
}
.sender-btn {
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #cbd5e0;
  background: #1a73e8;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.sender-btn:disabled {
  background: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
}
</style>
