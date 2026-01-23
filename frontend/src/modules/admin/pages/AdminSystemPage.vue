<template>
  <div class="admin-system-page">
    <div class="header">
      <h1 class="title">系统配置</h1>
      <p class="subtitle-text">管理系统 AI 模型与语音服务配置</p>
    </div>

    <div class="config-container">
      <!-- 侧边导航 -->
      <div class="sidebar">
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'general' }"
          @click="activeTab = 'general'"
        >
          <span class="icon">⚙️</span>
          通用设置
        </div>
        <div class="nav-divider">AI 模型厂商</div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'deepseek' }"
          @click="activeTab = 'deepseek'"
        >
          <span class="icon">🧠</span>
          DeepSeek
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'qwen' }"
          @click="activeTab = 'qwen'"
        >
          <span class="icon">🐼</span>
          通义千问
        </div>
        <div class="nav-divider">语音服务</div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'seedAsr' }"
          @click="activeTab = 'seedAsr'"
        >
          <span class="icon">🎙️</span>
          Seed ASR
        </div>
      </div>

      <!-- 内容区域 -->
      <form class="content-area" @submit.prevent="save" autocomplete="off">
        <!-- 通用设置 -->
        <div v-show="activeTab === 'general'" class="config-section">
          <div class="section-header">
            <h2>通用设置</h2>
            <p>设置系统默认使用的 AI 服务提供商</p>
          </div>
          <div class="card">
            <div class="field">
              <label>默认 AI 提供商</label>
              <select v-model="form.provider" class="select-input">
                <option value="deepseek">DeepSeek</option>
                <option value="qwen">通义千问</option>
              </select>
              <p class="help-text">选择系统默认使用的对话模型服务商</p>
            </div>
          </div>
        </div>

        <!-- DeepSeek 设置 -->
        <div v-show="activeTab === 'deepseek'" class="config-section">
          <div class="section-header">
            <h2>DeepSeek 配置</h2>
            <p>配置 DeepSeek API 访问参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showDeepseekKey ? 'text' : 'password'" 
                  v-model="form.deepseek.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showDeepseekKey = !showDeepseekKey">
                  {{ showDeepseekKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.deepseek.baseURL" placeholder="例如: https://api.deepseek.com/v1" />
            </div>
            <div class="field">
              <label>Model</label>
              <select v-model="form.deepseek.model" class="select-input">
                <option v-for="model in deepseekModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <p class="help-text">选择 DeepSeek 模型版本</p>
            </div>
          </div>
        </div>

        <!-- 通义千问设置 -->
        <div v-show="activeTab === 'qwen'" class="config-section">
          <div class="section-header">
            <h2>通义千问配置</h2>
            <p>配置阿里云通义千问 API 参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showQwenKey ? 'text' : 'password'" 
                  v-model="form.qwen.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showQwenKey = !showQwenKey">
                  {{ showQwenKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.qwen.baseURL" placeholder="例如: https://dashscope.aliyuncs.com/compatible-mode/v1" />
            </div>
            <div class="field">
              <label>Model</label>
              <select v-model="form.qwen.model" class="select-input">
                <option v-for="model in qwenModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <p class="help-text">选择通义千问模型版本</p>
            </div>
          </div>
        </div>

        <!-- Seed ASR 设置 -->
        <div v-show="activeTab === 'seedAsr'" class="config-section">
          <div class="section-header">
            <h2>Seed ASR 配置</h2>
            <p>配置语音识别服务参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>App ID</label>
              <input type="text" v-model="form.seedAsr.appId" placeholder="请输入 App ID" />
            </div>
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showSeedAsrKey ? 'text' : 'password'" 
                  v-model="form.seedAsr.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showSeedAsrKey = !showSeedAsrKey">
                  {{ showSeedAsrKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>API Secret</label>
              <div class="input-group">
                <input 
                  :type="showSeedAsrSecret ? 'text' : 'password'" 
                  v-model="form.seedAsr.apiSecret" 
                  placeholder="请输入 API Secret"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showSeedAsrSecret = !showSeedAsrSecret">
                  {{ showSeedAsrSecret ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>API URL</label>
              <input type="text" v-model="form.seedAsr.apiUrl" placeholder="wss://..." />
            </div>
            <div class="field">
              <label>Resource ID</label>
              <input type="text" v-model="form.seedAsr.resourceId" placeholder="资源 ID" />
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="actions-bar">
          <div v-if="message" class="status-message success">
            <span class="icon">✅</span> {{ message }}
          </div>
          <div v-if="error" class="status-message error">
            <span class="icon">❌</span> {{ error }}
          </div>
          <button class="btn-save" type="submit" :disabled="loading">
            {{ loading ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiService from '@/services/apiService.js'
import { isAdmin, token } from '@/modules/auth/stores/authStore.js'

const activeTab = ref('general')
const form = ref({
  provider: 'deepseek',
  deepseek: { apiKey: '', baseURL: '', model: 'deepseek-chat' },
  qwen: { apiKey: '', baseURL: '', model: 'qwen-turbo' },
  seedAsr: { appId: '', apiKey: '', apiSecret: '', apiUrl: '', resourceId: '', audioConfig: {} }
})

const deepseekModels = [
  { label: 'DeepSeek-V3 (deepseek-chat)', value: 'deepseek-chat' },
  { label: 'DeepSeek-R1 (deepseek-reasoner)', value: 'deepseek-reasoner' }
]

const qwenModels = [
  { label: 'Qwen-Turbo', value: 'qwen-turbo' },
  { label: 'Qwen-Plus', value: 'qwen-plus' },
  { label: 'Qwen-Max', value: 'qwen-max' },
  { label: 'Qwen-Long', value: 'qwen-long' }
]

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
    message.value = '配置已成功保存'
    
    // 3秒后清除成功消息
    setTimeout(() => {
      message.value = ''
    }, 3000)
    
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
.admin-system-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #1a202c;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.subtitle-text {
  color: #718096;
  font-size: 1rem;
}

.config-container {
  display: flex;
  gap: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-height: 600px;
  overflow: hidden;
}

/* Sidebar Styles */
.sidebar {
  width: 240px;
  background: #f7fafc;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem 0;
  flex-shrink: 0;
}

.nav-divider {
  padding: 1.5rem 1.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  color: #4a5568;
  transition: all 0.2s;
  font-weight: 500;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #edf2f7;
  color: #2d3748;
}

.nav-item.active {
  background: #fff;
  color: #3182ce;
  border-left-color: #3182ce;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.nav-item .icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

/* Content Area Styles */
.content-area {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #718096;
}

.card {
  max-width: 800px;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.help-text {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}

input[type="text"],
input[type="password"],
.select-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  outline: none;
}

input:focus,
.select-input:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  padding: 0 1rem;
  background: #edf2f7;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  color: #4a5568;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #e2e8f0;
}

/* Actions Bar */
.actions-bar {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-message.success {
  color: #38a169;
}

.status-message.error {
  color: #e53e3e;
}

.btn-save {
  padding: 0.75rem 2rem;
  background: #3182ce;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover {
  background: #2b6cb0;
}

.btn-save:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .config-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    overflow-x: auto;
    display: flex;
    padding: 0;
  }
  
  .nav-divider {
    display: none;
  }
  
  .nav-item {
    padding: 1rem;
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  
  .nav-item.active {
    border-left: none;
    border-bottom-color: #3182ce;
  }
}
</style>
