import apiClient from './client.js'

/**
 * TTS 相关 API
 */
export const ttsApi = {
  // 获取音色列表
  getVoices() {
    return apiClient.get('/tts/voices')
  },

  // 获取 TTS 配置
  getConfig() {
    return apiClient.get('/admin/config/speech')
  },

  // 更新 TTS 配置
  updateConfig(config) {
    return apiClient.put('/admin/config/speech', config)
  },

  // 文字转语音
  textToSpeech(text, options = {}) {
    return apiClient.post('/tts', {
      text,
      ...options
    })
  },

  // 流式文字转语音
  textToSpeechStream(text, options = {}) {
    return apiClient.post('/tts/stream', {
      text,
      ...options
    })
  }
}

export default ttsApi
