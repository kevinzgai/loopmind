<template>
  <div class="admin-system-page">
    <h1 class="title">系统配置</h1>
    <div class="card">
      <div class="field">
        <label>默认提供商</label>
        <select v-model="form.provider">
          <option value="deepseek">DeepSeek</option>
          <option value="qwen">通义千问</option>
        </select>
      </div>
      <h2 class="subtitle">DeepSeek</h2>
      <div class="field">
        <label>API Key</label>
        <input :type="showDeepseekKey ? 'text' : 'password'" v-model="form.deepseek.apiKey" />
        <button class="toggle" @click="showDeepseekKey = !showDeepseekKey">{{ showDeepseekKey ? '隐藏' : '显示' }}</button>
      </div>
      <div class="field">
        <label>Base URL</label>
        <input type="text" v-model="form.deepseek.baseURL" />
      </div>
      <div class="field">
        <label>Model</label>
        <input type="text" v-model="form.deepseek.model" />
      </div>
      <h2 class="subtitle">通义千问</h2>
      <div class="field">
        <label>API Key</label>
        <input :type="showQwenKey ? 'text' : 'password'" v-model="form.qwen.apiKey" />
        <button class="toggle" @click="showQwenKey = !showQwenKey">{{ showQwenKey ? '隐藏' : '显示' }}</button>
      </div>
      <div class="field">
        <label>Base URL</label>
        <input type="text" v-model="form.qwen.baseURL" />
      </div>
      <div class="field">
        <label>Model</label>
        <input type="text" v-model="form.qwen.model" />
      </div>
      <h2 class="subtitle">Seed ASR</h2>
      <div class="field">
        <label>App ID</label>
        <input type="text" v-model="form.seedAsr.appId" />
      </div>
      <div class="field">
        <label>API Key</label>
        <input :type="showSeedAsrKey ? 'text' : 'password'" v-model="form.seedAsr.apiKey" />
        <button class="toggle" @click="showSeedAsrKey = !showSeedAsrKey">{{ showSeedAsrKey ? '隐藏' : '显示' }}</button>
      </div>
      <div class="field">
        <label>API Secret</label>
        <input :type="showSeedAsrSecret ? 'text' : 'password'" v-model="form.seedAsr.apiSecret" />
        <button class="toggle" @click="showSeedAsrSecret = !showSeedAsrSecret">{{ showSeedAsrSecret ? '隐藏' : '显示' }}</button>
      </div>
      <div class="field">
        <label>API URL</label>
        <input type="text" v-model="form.seedAsr.apiUrl" />
      </div>
      <div class="field">
        <label>Resource ID</label>
        <input type="text" v-model="form.seedAsr.resourceId" />
      </div>
      <div class="actions">
        <button class="save" @click="save" :disabled="loading">{{ loading ? '保存中...' : '保存' }}</button>
      </div>
      <p v-if="message" class="message">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiService from '@/services/apiService.js'
import { isAdmin, token } from '@/modules/auth/stores/authStore.js'

const form = ref({
  provider: 'deepseek',
  deepseek: { apiKey: '', baseURL: '', model: '' },
  qwen: { apiKey: '', baseURL: '', model: '' },
  seedAsr: { appId: '', apiKey: '', apiSecret: '', apiUrl: '', resourceId: '', audioConfig: {} }
})

const showDeepseekKey = ref(false)
const showQwenKey = ref(false)
const showSeedAsrKey = ref(false)
const showSeedAsrSecret = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')

async function load() {
  try {
    message.value = ''
    error.value = ''
    const res = await apiService.get('/admin/config')
    if (res && res.config) {
      form.value.provider = res.config.provider
      form.value.deepseek.baseURL = res.config.deepseek.baseURL
      form.value.deepseek.model = res.config.deepseek.model
      form.value.qwen.baseURL = res.config.qwen.baseURL
      form.value.qwen.model = res.config.qwen.model
      form.value.seedAsr = res.config.seedAsr || form.value.seedAsr
      form.value.deepseek.apiKey = ''
      form.value.qwen.apiKey = ''
      form.value.seedAsr.apiKey = ''
      form.value.seedAsr.apiSecret = ''
    }
  } catch (e) {
    error.value = e.message || '加载失败'
  }
}

async function save() {
  try {
    loading.value = true
    message.value = ''
    error.value = ''
    await apiService.put('/admin/config', form.value)
    message.value = '保存成功'
    await load()
  } catch (e) {
    error.value = e.message || '保存失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!token.value || !isAdmin.value) {
    error.value = '需要管理员权限'
    return
  }
  load()
})
</script>

<style scoped>
.admin-system-page { padding: 2rem; }
.title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; }
.subtitle { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 .5rem; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; max-width: 760px; }
.field { display: flex; align-items: center; gap: .5rem; margin: .5rem 0; }
label { width: 120px; color: #4a5568; }
input, select { flex: 1; padding: .5rem .75rem; border: 1px solid #cbd5e0; border-radius: 6px; }
.toggle { padding: .4rem .6rem; background: #edf2f7; border: 1px solid #cbd5e0; border-radius: 6px; }
.actions { margin-top: 1rem; }
.save { padding: .6rem 1.2rem; background: #4299e1; color: #fff; border: none; border-radius: 6px; }
.message { color: #2f855a; margin-top: .5rem; }
.error { color: #e53e3e; margin-top: .5rem; }
</style>
