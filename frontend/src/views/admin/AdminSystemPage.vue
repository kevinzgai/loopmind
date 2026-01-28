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
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'doubao' }"
          @click="activeTab = 'doubao'"
        >
          <span class="icon">🍲</span>
          火山引擎
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'glm' }"
          @click="activeTab = 'glm'"
        >
          <span class="icon">🤖</span>
          智谱GLM
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'moonshot' }"
          @click="activeTab = 'moonshot'"
        >
          <span class="icon">🌙</span>
          Kimi (Moonshot)
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'modelscope' }"
          @click="activeTab = 'modelscope'"
        >
          <span class="icon">🔮</span>
          ModelScope (魔搭)
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'minimax' }"
          @click="activeTab = 'minimax'"
        >
          <span class="icon">🐚</span>
          MiniMax
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeTab === 'ollama' }"
          @click="activeTab = 'ollama'"
        >
          <span class="icon">🖥️</span>
          Ollama 本地
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
                <option value="doubao">火山引擎</option>
                <option value="glm">智谱GLM</option>
                <option value="moonshot">Kimi (Moonshot)</option>
                <option value="modelscope">ModelScope (魔搭)</option>
                <option value="minimax">MiniMax</option>
                <option value="ollama">Ollama 本地</option>
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
              <input type="text" v-model="form.deepseek.model" placeholder="或自定义填写模型标识" />
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
              <input type="text" v-model="form.qwen.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择通义千问模型版本</p>
            </div>
          </div>
        </div>

        <!-- 豆包设置 -->
        <div v-show="activeTab === 'doubao'" class="config-section">
          <div class="section-header">
            <h2>火山引擎配置</h2>
            <p>配置字节跳动火山引擎豆包 API 参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showDoubaoKey ? 'text' : 'password'" 
                  v-model="form.doubao.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showDoubaoKey = !showDoubaoKey">
                  {{ showDoubaoKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.doubao.baseURL" placeholder="例如: https://ark.cn-beijing.volces.com/api/v3" />
            </div>
            <div class="field">
              <label>Model</label>
              <select v-model="form.doubao.model" class="select-input">
                <option v-for="model in doubaoModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.doubao.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择火山引擎模型版本</p>
            </div>
          </div>
        </div>

        <!-- 智谱GLM设置 -->
        <div v-show="activeTab === 'glm'" class="config-section">
          <div class="section-header">
            <h2>智谱GLM配置</h2>
            <p>配置智谱AI GLM大模型 API 参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showGlmKey ? 'text' : 'password'" 
                  v-model="form.glm.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showGlmKey = !showGlmKey">
                  {{ showGlmKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.glm.baseURL" placeholder="例如: https://open.bigmodel.cn/api/paas/v4" />
            </div>
            <div class="field">
              <label>Model</label>
              <select v-model="form.glm.model" class="select-input">
                <option v-for="model in glmModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.glm.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择GLM模型版本</p>
            </div>
          </div>
        </div>

        <!-- Moonshot (Kimi) 设置 -->
        <div v-show="activeTab === 'moonshot'" class="config-section">
          <div class="section-header">
            <h2>Kimi (Moonshot) 配置</h2>
            <p>配置月之暗面 Kimi 大模型 API 参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showMoonshotKey ? 'text' : 'password'" 
                  v-model="form.moonshot.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showMoonshotKey = !showMoonshotKey">
                  {{ showMoonshotKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.moonshot.baseURL" placeholder="例如: https://api.moonshot.cn/v1" />
            </div>
            <div class="field">
              <label>Model</label>
              <select v-model="form.moonshot.model" class="select-input">
                <option v-for="model in moonshotModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.moonshot.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择Moonshot模型版本</p>
            </div>
          </div>
        </div>

        <!-- ModelScope (魔搭) 设置 -->
        <div v-show="activeTab === 'modelscope'" class="config-section">
          <div class="section-header">
            <h2>ModelScope (魔搭) 配置</h2>
            <p>配置阿里魔搭 ModelScope 大模型 API 参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showModelscopeKey ? 'text' : 'password'" 
                  v-model="form.modelscope.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showModelscopeKey = !showModelscopeKey">
                  {{ showModelscopeKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.modelscope.baseURL" placeholder="例如: https://api-inference.modelscope.cn/v1" />
            </div>
            <div class="field">
              <label>Model</label>
              <select v-model="form.modelscope.model" class="select-input">
                <option v-for="model in modelscopeModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.modelscope.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择ModelScope模型版本</p>
            </div>
          </div>
        </div>

        <!-- MiniMax 设置 -->
        <div v-show="activeTab === 'minimax'" class="config-section">
          <div class="section-header">
            <h2>MiniMax 配置</h2>
            <p>配置 MiniMax 大模型 API 参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input 
                  :type="showMinimaxKey ? 'text' : 'password'" 
                  v-model="form.minimax.apiKey" 
                  placeholder="请输入 API Key"
                  autocomplete="new-password"
                />
                <button class="toggle-btn" @click="showMinimaxKey = !showMinimaxKey">
                  {{ showMinimaxKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.minimax.baseURL" placeholder="例如: https://api.minimax.chat/v1" />
            </div>
            <div class="field">
              <label>Model</label>
              <select v-model="form.minimax.model" class="select-input">
                <option v-for="model in minimaxModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.minimax.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择MiniMax模型版本</p>
            </div>
          </div>
        </div>

        <!-- Ollama 本地设置 -->
        <div v-show="activeTab === 'ollama'" class="config-section">
          <div class="section-header">
            <h2>Ollama 本地配置</h2>
            <p>配置本地 Ollama OpenAI 兼容接口参数</p>
          </div>
          <div class="card">
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.ollama.baseURL" placeholder="例如: http://localhost:11434/v1" />
            </div>
            <div class="field">
              <label>Model</label>
              <input type="text" v-model="form.ollama.model" placeholder="例如: llama3.1:8b 或 qwen2.5:7b" />
              <p class="help-text">在本机通过 ollama pull 获取的模型名称，例如 llama3.1:8b</p>
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
import { isAdmin, token } from '@/stores/authStore.js'

const activeTab = ref('general')
const form = ref({
  provider: 'deepseek',
  deepseek: { apiKey: '', baseURL: '', model: 'deepseek-chat' },
  qwen: { apiKey: '', baseURL: '', model: 'qwen-turbo' },
  doubao: { apiKey: '', baseURL: '', model: 'doubao-seed-1-8-251228' },
  glm: { apiKey: '', baseURL: '', model: 'glm-4-flash' },
  moonshot: { apiKey: '', baseURL: '', model: 'moonshot-v1-8k' },
  modelscope: { apiKey: '', baseURL: '', model: 'Qwen/Qwen2.5-72B-Instruct' },
  minimax: { apiKey: '', baseURL: '', model: 'abab6.5s-chat' },
  ollama: { apiKey: '', baseURL: 'http://localhost:11434/v1', model: 'llama3.1:8b' },
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

const doubaoModels = [
  { label: 'Doubao-Pro-4k', value: 'doubao-pro-4k' },
  { label: 'Doubao-Pro-32k', value: 'doubao-pro-32k' },
  { label: 'Doubao-Pro-128k', value: 'doubao-pro-128k' },
  { label: 'Doubao-Lite-4k', value: 'doubao-lite-4k' },
  { label: 'Doubao-Lite-32k', value: 'doubao-lite-32k' },
  { label: 'Doubao-Lite-128k', value: 'doubao-lite-128k' },
  { label: 'Doubao-Seed-1-8', value: 'doubao-seed-1-8-251228' }
]

const glmModels = [
  { label: 'GLM-4-Flash', value: 'glm-4-flash' },
  { label: 'GLM-4-Plus', value: 'glm-4-plus' },
  { label: 'GLM-4-Air', value: 'glm-4-air' },
  { label: 'GLM-4', value: 'glm-4' }
]

const moonshotModels = [
  { label: 'Moonshot-v1-8k', value: 'moonshot-v1-8k' },
  { label: 'Moonshot-v1-32k', value: 'moonshot-v1-32k' },
  { label: 'Moonshot-v1-128k', value: 'moonshot-v1-128k' }
]

const modelscopeModels = [
  { label: 'Qwen 2.5 72B Instruct', value: 'Qwen/Qwen2.5-72B-Instruct' },
  { label: 'Qwen 2.5 7B Instruct', value: 'Qwen/Qwen2.5-7B-Instruct' },
  { label: 'Qwen 2.5 Coder 32B Instruct', value: 'Qwen/Qwen2.5-Coder-32B-Instruct' },
  { label: 'DeepSeek R1 Distill Qwen 32B', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B' }
]

const minimaxModels = [
  { label: 'Abab 6.5s Chat', value: 'abab6.5s-chat' },
  { label: 'Abab 6.5 Chat', value: 'abab6.5-chat' },
  { label: 'Abab 6.5g Chat', value: 'abab6.5g-chat' }
]

const showDeepseekKey = ref(false)
const showQwenKey = ref(false)
const showDoubaoKey = ref(false)
const showGlmKey = ref(false)
const showMoonshotKey = ref(false)
const showModelscopeKey = ref(false)
const showMinimaxKey = ref(false)
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
      form.value.deepseek.apiKey = res.config.deepseek.apiKey || ''
      form.value.qwen.baseURL = res.config.qwen.baseURL
      form.value.qwen.model = res.config.qwen.model
      form.value.qwen.apiKey = res.config.qwen.apiKey || ''
      if (res.config.doubao) {
        form.value.doubao.baseURL = res.config.doubao.baseURL
        form.value.doubao.model = res.config.doubao.model
        form.value.doubao.apiKey = res.config.doubao.apiKey || ''
      }
      if (res.config.glm) {
        form.value.glm.baseURL = res.config.glm.baseURL
        form.value.glm.model = res.config.glm.model
        form.value.glm.apiKey = res.config.glm.apiKey || ''
      }
      if (res.config.moonshot) {
        form.value.moonshot.baseURL = res.config.moonshot.baseURL
        form.value.moonshot.model = res.config.moonshot.model
        form.value.moonshot.apiKey = res.config.moonshot.apiKey || ''
      }
      if (res.config.modelscope) {
        form.value.modelscope.baseURL = res.config.modelscope.baseURL
        form.value.modelscope.model = res.config.modelscope.model
        form.value.modelscope.apiKey = res.config.modelscope.apiKey || ''
      }
      if (res.config.minimax) {
        form.value.minimax.baseURL = res.config.minimax.baseURL
        form.value.minimax.model = res.config.minimax.model
        form.value.minimax.apiKey = res.config.minimax.apiKey || ''
      }
      if (res.config.ollama) {
        form.value.ollama.baseURL = res.config.ollama.baseURL
        form.value.ollama.model = res.config.ollama.model
        form.value.ollama.apiKey = res.config.ollama.apiKey || ''
      }
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
    
    await load()

    message.value = '配置已成功保存'
    
    // 3秒后清除成功消息
    setTimeout(() => {
      message.value = ''
    }, 3000)
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
