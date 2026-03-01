import { ref, onUnmounted } from 'vue'

/**
 * 语音录音逻辑复用
 * 处理录音开始、停止、音频数据收集
 */
export function useVoiceRecorder() {
  const isRecording = ref(false)
  const audioContext = ref(null)
  const mediaStream = ref(null)
  const mediaRecorder = ref(null)
  const audioChunks = ref([])

  // 初始化音频上下文
  async function initAudio() {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }
  }

  // 开始录音
  async function startRecording() {
    try {
      await initAudio()
      mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.value = new MediaRecorder(mediaStream.value)
      audioChunks.value = []

      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data)
        }
      }

      mediaRecorder.value.start()
      isRecording.value = true
      return true
    } catch (err) {
      console.error('录音失败:', err)
      return false
    }
  }

  // 停止录音
  function stopRecording() {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || !isRecording.value) {
        resolve(null)
        return
      }

      mediaRecorder.value.onstop = () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
        resolve(audioBlob)
      }

      mediaRecorder.value.stop()
      isRecording.value = false

      // 停止所有音轨
      if (mediaStream.value) {
        mediaStream.value.getTracks().forEach(track => track.stop())
      }
    })
  }

  // 清理资源
  function cleanup() {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
    }
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop())
    }
    if (audioContext.value) {
      audioContext.value.close()
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    isRecording,
    startRecording,
    stopRecording,
    cleanup,
  }
}

export default useVoiceRecorder
