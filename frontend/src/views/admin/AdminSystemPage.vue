<template>
  <div class="admin-system-page">
    <div class="header">
      <h1 class="title">系统配置</h1>
      <p class="subtitle-text">管理系统 AI 模型与语音服务配置</p>
    </div>

    <div class="config-container">
      <!-- 侧边导航 -->
      <div class="sidebar">
        <div class="nav-item" :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">
          <span class="icon">⚙️</span>
          通用设置
          <span class="text-red-500 ml-auto font-bold">*</span>
        </div>
        <div class="nav-divider">AI 模型厂商</div>
        <div class="nav-item" :class="{ active: activeTab === 'deepseek' }" @click="activeTab = 'deepseek'">
          <span class="icon">🧠</span>
          DeepSeek
          <span v-if="form.provider === 'deepseek'" class="text-red-500 ml-auto font-bold">*</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'qwen' }" @click="activeTab = 'qwen'">
          <span class="icon">🐼</span>
          通义千问
          <span v-if="form.provider === 'qwen'" class="text-red-500 ml-auto font-bold">*</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'doubao' }" @click="activeTab = 'doubao'">
          <span class="icon">🍲</span>
          火山引擎
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'glm' }" @click="activeTab = 'glm'">
          <span class="icon">🤖</span>
          智谱GLM
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'moonshot' }" @click="activeTab = 'moonshot'">
          <span class="icon">🌙</span>
          Kimi (Moonshot)
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'modelscope' }" @click="activeTab = 'modelscope'">
          <span class="icon">🔮</span>
          ModelScope (魔搭)
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'minimax' }" @click="activeTab = 'minimax'">
          <span class="icon">🐚</span>
          MiniMax
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'ollama' }" @click="activeTab = 'ollama'">
          <span class="icon">🖥️</span>
          Ollama 本地
        </div>
        <div class="nav-divider">语音服务</div>
        <div class="nav-item" :class="{ active: activeTab === 'speech' }" @click="activeTab = 'speech'">
          <span class="icon">🔊</span>
          语音服务 (TTS/ASR)
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'seedAsr' }" @click="activeTab = 'seedAsr'">
          <span class="icon">🎙️</span>
          Seed ASR
        </div>
        <div class="nav-divider">RAG 增强</div>
        <div class="nav-item" :class="{ active: activeTab === 'embedding' }" @click="activeTab = 'embedding'">
          <span class="icon">🔍</span>
          向量模型 (Embedding)
          <span class="text-red-500 ml-auto font-bold">*</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
          <span class="icon">📊</span>
          系统日志
        </div>
      </div>

      <!-- 内容区域 -->
      <form v-show="activeTab !== 'logs'" class="content-area" @submit.prevent="save" autocomplete="off">
        <div
          class="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-center gap-2">
          <span class="text-blue-500 text-lg">ℹ️</span>
          <span>标注 <span class="text-red-500 font-bold">*</span> 的项目为系统初始化及运行必备配置，请务必填写完整。</span>
        </div>

        <!-- 通用设置 -->
        <div v-show="activeTab === 'general'" class="config-section">
          <div class="section-header">
            <h2>通用设置</h2>
            <p>设置系统默认使用的 AI 服务提供商</p>
          </div>
          <div class="card">
            <div class="field">
              <label class="flex items-center">
                默认 AI 提供商
                <span class="text-red-500 ml-1" title="系统运行必备配置">*</span>
              </label>
              <select v-model="form.provider" class="select-input" required>
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
              <label class="flex items-center justify-between">
                <div class="flex items-center">
                  API Key
                  <span class="text-red-500 ml-1" title="作为默认提供商时必填">*</span>
                </div>
                <a href="https://platform.deepseek.com/api_keys" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showDeepseekKey ? 'text' : 'password'" v-model="form.deepseek.apiKey"
                  placeholder="请输入 API Key" autocomplete="new-password" />
                <button class="toggle-btn" @click="showDeepseekKey = !showDeepseekKey">
                  {{ showDeepseekKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label class="flex items-center">
                Base URL
              </label>
              <input type="text" v-model="form.deepseek.baseURL" placeholder="例如: https://api.deepseek.com/v1" />
            </div>
            <div class="field">
              <label class="flex items-center">
                Model
                <span class="text-red-500 ml-1" title="作为默认提供商时必填">*</span>
              </label>
              <select v-model="form.deepseek.model" class="select-input">
                <option v-for="model in deepseekModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.deepseek.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择 DeepSeek 模型版本</p>
            </div>
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('deepseek')" :disabled="testingProvider === 'deepseek' || !form.deepseek.apiKey">
                {{ testingProvider === 'deepseek' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.deepseek" class="text-sm font-medium"
                :class="testResults.deepseek.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.deepseek.success ? '✅ 连接成功' : '❌ ' + testResults.deepseek.message }}
              </span>
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
              <label class="flex items-center justify-between">
                <div class="flex items-center">
                  API Key
                  <span class="text-red-500 ml-1" title="作为默认提供商时必填">*</span>
                </div>
                <a href="https://dashscope.console.aliyun.com/apiKey" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showQwenKey ? 'text' : 'password'" v-model="form.qwen.apiKey" placeholder="请输入 API Key"
                  autocomplete="new-password" />
                <button class="toggle-btn" @click="showQwenKey = !showQwenKey">
                  {{ showQwenKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label class="flex items-center">
                Base URL
              </label>
              <input type="text" v-model="form.qwen.baseURL"
                placeholder="例如: https://dashscope.aliyuncs.com/compatible-mode/v1" />
            </div>
            <div class="field">
              <label class="flex items-center">
                Model
                <span class="text-red-500 ml-1" title="作为默认提供商时必填">*</span>
              </label>
              <select v-model="form.qwen.model" class="select-input">
                <option v-for="model in qwenModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.qwen.model" placeholder="或自定义填写模型标识" />
              <p class="help-text">选择通义千问模型版本</p>
            </div>
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('qwen')" :disabled="testingProvider === 'qwen' || !form.qwen.apiKey">
                {{ testingProvider === 'qwen' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.qwen" class="text-sm font-medium"
                :class="testResults.qwen.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.qwen.success ? '✅ 连接成功' : '❌ ' + testResults.qwen.message }}
              </span>
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
              <label class="flex items-center justify-between">
                <span>API Key</span>
                <a href="https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showDoubaoKey ? 'text' : 'password'" v-model="form.doubao.apiKey"
                  placeholder="请输入 API Key" autocomplete="new-password" />
                <button class="toggle-btn" @click="showDoubaoKey = !showDoubaoKey">
                  {{ showDoubaoKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.doubao.baseURL"
                placeholder="例如: https://ark.cn-beijing.volces.com/api/v3" />
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
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('doubao')" :disabled="testingProvider === 'doubao' || !form.doubao.apiKey">
                {{ testingProvider === 'doubao' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.doubao" class="text-sm font-medium"
                :class="testResults.doubao.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.doubao.success ? '✅ 连接成功' : '❌ ' + testResults.doubao.message }}
              </span>
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
              <label class="flex items-center justify-between">
                <span>API Key</span>
                <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showGlmKey ? 'text' : 'password'" v-model="form.glm.apiKey" placeholder="请输入 API Key"
                  autocomplete="new-password" />
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
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('glm')" :disabled="testingProvider === 'glm' || !form.glm.apiKey">
                {{ testingProvider === 'glm' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.glm" class="text-sm font-medium"
                :class="testResults.glm.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.glm.success ? '✅ 连接成功' : '❌ ' + testResults.glm.message }}
              </span>
            </div>
          </div>
        </div>

        <!-- Embedding 设置 -->
        <div v-show="activeTab === 'embedding'" class="config-section">
          <div class="section-header">
            <h2>Embedding 模型配置</h2>
            <p>配置用于知识库向量化的 Embedding 模型 (支持 OpenAI 兼容接口)</p>
          </div>
          <div class="card">
            <div class="field">
              <label class="flex items-center">
                API Key
                <span class="text-red-500 ml-1" title="向量模型必备配置">*</span>
              </label>
              <div class="input-group">
                <input :type="showEmbeddingKey ? 'text' : 'password'" v-model="form.embedding.apiKey"
                  placeholder="请输入 API Key" autocomplete="new-password" required />
                <button class="toggle-btn" @click="showEmbeddingKey = !showEmbeddingKey">
                  {{ showEmbeddingKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label class="flex items-center">
                Base URL
                <span class="text-red-500 ml-1" title="向量模型必备配置">*</span>
              </label>
              <input type="text" v-model="form.embedding.baseURL" placeholder="例如: https://api.siliconflow.cn/v1"
                required />
              <p class="help-text">
                推荐国产地址：<br>
                硅基流动: https://api.siliconflow.cn/v1<br>
                智谱AI: https://open.bigmodel.cn/api/paas/v4<br>
                阿里DashScope: https://dashscope.aliyuncs.com/compatible-mode/v1
              </p>
            </div>
            <div class="field">
              <label class="flex items-center">
                Model
                <span class="text-red-500 ml-1" title="向量模型必备配置">*</span>
              </label>
              <select v-model="form.embedding.model" class="select-input" required>
                <option v-for="model in embeddingModels" :key="model.value" :value="model.value">
                  {{ model.label }}
                </option>
              </select>
              <input type="text" v-model="form.embedding.model" placeholder="或自定义填写模型标识" required />
              <p class="help-text">选择 Embedding 模型版本</p>
            </div>
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('embedding')"
                :disabled="testingProvider === 'embedding' || !form.embedding.apiKey">
                {{ testingProvider === 'embedding' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.embedding" class="text-sm font-medium"
                :class="testResults.embedding.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.embedding.success ? '✅ 连接成功' : '❌ ' + testResults.embedding.message }}
              </span>
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
              <label class="flex items-center justify-between">
                <span>API Key</span>
                <a href="https://platform.moonshot.cn/console/api-keys" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showMoonshotKey ? 'text' : 'password'" v-model="form.moonshot.apiKey"
                  placeholder="请输入 API Key" autocomplete="new-password" />
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
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('moonshot')" :disabled="testingProvider === 'moonshot' || !form.moonshot.apiKey">
                {{ testingProvider === 'moonshot' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.moonshot" class="text-sm font-medium"
                :class="testResults.moonshot.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.moonshot.success ? '✅ 连接成功' : '❌ ' + testResults.moonshot.message }}
              </span>
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
              <label class="flex items-center justify-between">
                <span>API Key</span>
                <a href="https://modelscope.cn/my/overview" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showModelscopeKey ? 'text' : 'password'" v-model="form.modelscope.apiKey"
                  placeholder="请输入 API Key" autocomplete="new-password" />
                <button class="toggle-btn" @click="showModelscopeKey = !showModelscopeKey">
                  {{ showModelscopeKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.modelscope.baseURL"
                placeholder="例如: https://api-inference.modelscope.cn/v1" />
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
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('modelscope')"
                :disabled="testingProvider === 'modelscope' || !form.modelscope.apiKey">
                {{ testingProvider === 'modelscope' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.modelscope" class="text-sm font-medium"
                :class="testResults.modelscope.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.modelscope.success ? '✅ 连接成功' : '❌ ' + testResults.modelscope.message }}
              </span>
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
              <label class="flex items-center justify-between">
                <span>API Key</span>
                <a href="https://platform.minimaxi.com/usercenter/key" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showMinimaxKey ? 'text' : 'password'" v-model="form.minimax.apiKey"
                  placeholder="请输入 API Key" autocomplete="new-password" />
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
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('minimax')" :disabled="testingProvider === 'minimax' || !form.minimax.apiKey">
                {{ testingProvider === 'minimax' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.minimax" class="text-sm font-medium"
                :class="testResults.minimax.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.minimax.success ? '✅ 连接成功' : '❌ ' + testResults.minimax.message }}
              </span>
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
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('ollama')" :disabled="testingProvider === 'ollama'">
                {{ testingProvider === 'ollama' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults.ollama" class="text-sm font-medium"
                :class="testResults.ollama.success ? 'text-green-600' : 'text-red-600'">
                {{ testResults.ollama.success ? '✅ 连接成功' : '❌ ' + testResults.ollama.message }}
              </span>
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
              <label class="flex items-center justify-between">
                <span>API Key</span>
                <a href="https://console.volcengine.com/speech/service/1" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showSeedAsrKey ? 'text' : 'password'" v-model="form.seedAsr.apiKey"
                  placeholder="请输入 API Key" autocomplete="new-password" />
                <button class="toggle-btn" @click="showSeedAsrKey = !showSeedAsrKey">
                  {{ showSeedAsrKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>API Secret</label>
              <div class="input-group">
                <input :type="showSeedAsrSecret ? 'text' : 'password'" v-model="form.seedAsr.apiSecret"
                  placeholder="请输入 API Secret" autocomplete="new-password" />
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

        <!-- 语音服务 (TTS/ASR) 设置 -->
        <div v-show="activeTab === 'speech'" class="config-section">
          <div class="section-header">
            <h2>系统语音服务配置</h2>
            <p>配置全系统通用的文字转语音 (TTS) 与语音识别 (ASR) 服务</p>
          </div>

          <!-- TTS 提供商 -->
          <div class="card mb-6">
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <span class="text-blue-500">🗣️</span> 文字转语音 (TTS)
            </h3>
            <div class="field">
              <label>TTS 服务提供商</label>
              <select v-model="form.speech.ttsProvider" class="select-input">
                <option value="siliconflow">硅基流动 (SiliconFlow)</option>
                <option value="aliyun">阿里云 (Aliyun)</option>
                <option value="openai">OpenAI (TTS-1)</option>
                <option value="edge">Edge TTS (免费)</option>
              </select>
            </div>
          </div>

          <!-- ASR 提供商 -->
          <div class="card mb-6">
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <span class="text-blue-500">🎤</span> 语音识别 (ASR)
            </h3>
            <div class="field">
              <label>ASR 服务提供商</label>
              <select v-model="form.speech.asrProvider" class="select-input">
                <option value="siliconflow">硅基流动 (SiliconFlow)</option>
                <option value="aliyun">阿里云 (Aliyun)</option>
                <option value="seed">Seed ASR</option>
              </select>
            </div>
          </div>

          <!-- 硅基流动语音配置 -->
          <div class="card mb-6"
            v-if="form.speech.ttsProvider === 'siliconflow' || form.speech.asrProvider === 'siliconflow'">
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <span class="text-blue-500">🚀</span> 硅基流动语音参数
            </h3>
            <div class="field">
              <label class="flex items-center justify-between">
                <span>API Key</span>
                <a href="https://cloud.siliconflow.cn/account/ak" target="_blank"
                  class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  获取 API Key ↗
                </a>
              </label>
              <div class="input-group">
                <input :type="showSpeechSiliconKey ? 'text' : 'password'" v-model="form.speech.siliconflow.apiKey"
                  placeholder="请输入 SiliconFlow API Key" autocomplete="new-password" />
                <button class="toggle-btn" @click="showSpeechSiliconKey = !showSpeechSiliconKey">
                  {{ showSpeechSiliconKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.speech.siliconflow.baseURL"
                placeholder="https://api.siliconflow.cn/v1" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="field">
                <label>TTS 模型</label>
                <input type="text" v-model="form.speech.siliconflow.ttsModel"
                  placeholder="FunAudioLLM/CosyVoice2-0.5B" />
              </div>
              <div class="field">
                <label>默认音色 (Voice ID)</label>
                <input type="text" v-model="form.speech.siliconflow.ttsVoice" placeholder="anna" />
              </div>
            </div>
            <div class="field">
              <div class="flex justify-between items-center mb-2">
                <label class="mb-0">默认语速</label>
                <span class="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">{{
                  form.speech.siliconflow.speechRate }} 字/分</span>
              </div>
              <input type="range" v-model.number="form.speech.siliconflow.speechRate" min="50" max="400" step="10"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <div class="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>50 (极慢)</span>
                <span>150 (正常)</span>
                <span>400 (极快)</span>
              </div>
            </div>
            <div class="field">
              <label>ASR 模型</label>
              <input type="text" v-model="form.speech.siliconflow.asrModel" placeholder="FunAudioLLM/SenseVoiceSmall" />
            </div>
            <div class="field mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center gap-4">
              <button type="button"
                class="px-4 py-1.5 bg-white border border-blue-500 text-blue-500 rounded-md text-sm font-medium transition-all hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed"
                @click="testConnection('speech-siliconflow')"
                :disabled="testingProvider === 'speech-siliconflow' || !form.speech.siliconflow.apiKey">
                {{ testingProvider === 'speech-siliconflow' ? '测试中...' : '测试连接' }}
              </button>
              <span v-if="testResults['speech-siliconflow']" class="text-sm font-medium"
                :class="testResults['speech-siliconflow'].success ? 'text-green-600' : 'text-red-600'">
                {{ testResults['speech-siliconflow'].success ? '✅ 连接成功' : '❌ ' +
                  testResults['speech-siliconflow'].message }}
              </span>
            </div>
          </div>

          <!-- 阿里云语音配置 -->
          <div class="card mb-6" v-if="form.speech.ttsProvider === 'aliyun' || form.speech.asrProvider === 'aliyun'">
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <span class="text-blue-500">☁️</span> 阿里云语音参数
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="field">
                <label>Access Key ID</label>
                <div class="input-group">
                  <input :type="showSpeechAliKey ? 'text' : 'password'" v-model="form.speech.aliyun.accessKeyId"
                    placeholder="请输入 Access Key ID" autocomplete="new-password" />
                </div>
              </div>
              <div class="field">
                <label>Access Key Secret</label>
                <div class="input-group">
                  <input :type="showSpeechAliKey ? 'text' : 'password'" v-model="form.speech.aliyun.accessKeySecret"
                    placeholder="请输入 Access Key Secret" autocomplete="new-password" />
                  <button class="toggle-btn" @click="showSpeechAliKey = !showSpeechAliKey">
                    {{ showSpeechAliKey ? '隐藏' : '显示' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="field">
                <label>App Key</label>
                <input type="text" v-model="form.speech.aliyun.appKey" placeholder="请输入 App Key" />
              </div>
              <div class="field">
                <label>默认音色 (Voice ID)</label>
                <input type="text" v-model="form.speech.aliyun.ttsVoice" placeholder="xiaoxian" />
              </div>
            </div>
            <div class="field">
              <div class="flex justify-between items-center mb-2">
                <label class="mb-0">默认语速</label>
                <span class="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">{{
                  form.speech.aliyun.speechRate }} 字/分</span>
              </div>
              <input type="range" v-model.number="form.speech.aliyun.speechRate" min="50" max="400" step="10"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <div class="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>50 (极慢)</span>
                <span>150 (正常)</span>
                <span>400 (极快)</span>
              </div>
            </div>
          </div>

          <!-- OpenAI TTS 配置 -->
          <div class="card mb-6" v-if="form.speech.ttsProvider === 'openai'">
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <span class="text-blue-500">🤖</span> OpenAI TTS 参数
            </h3>
            <div class="field">
              <label>API Key</label>
              <div class="input-group">
                <input :type="showSpeechOpenAIKey ? 'text' : 'password'" v-model="form.speech.openai.apiKey"
                  placeholder="请输入 OpenAI API Key" autocomplete="new-password" />
                <button class="toggle-btn" @click="showSpeechOpenAIKey = !showSpeechOpenAIKey">
                  {{ showSpeechOpenAIKey ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>Base URL</label>
              <input type="text" v-model="form.speech.openai.baseURL" placeholder="https://api.openai.com/v1" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="field">
                <label>TTS 模型</label>
                <input type="text" v-model="form.speech.openai.ttsModel" placeholder="tts-1" />
              </div>
              <div class="field">
                <label>默认音色 (Voice ID)</label>
                <input type="text" v-model="form.speech.openai.ttsVoice" placeholder="alloy" />
              </div>
            </div>
            <div class="field">
              <div class="flex justify-between items-center mb-2">
                <label class="mb-0">默认语速</label>
                <span class="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">{{
                  form.speech.openai.speechRate }} 字/分</span>
              </div>
              <input type="range" v-model.number="form.speech.openai.speechRate" min="50" max="400" step="10"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <div class="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>50 (极慢)</span>
                <span>150 (正常)</span>
                <span>400 (极快)</span>
              </div>
            </div>
          </div>

          <!-- Edge TTS 配置 -->
          <div class="card mb-6" v-if="form.speech.ttsProvider === 'edge'">
            <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
              <span class="text-blue-500">🌐</span> Edge TTS 参数
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="field">
                <label>默认音色 (Voice ID)</label>
                <input type="text" v-model="form.speech.edge.ttsVoice" placeholder="zh-CN-XiaoxiaoNeural" />
              </div>
              <div class="field">
                <div class="flex justify-between items-center mb-2">
                  <label class="mb-0">默认语速</label>
                  <span class="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded">{{
                    form.speech.edge.speechRate }} 字/分</span>
                </div>
                <input type="range" v-model.number="form.speech.edge.speechRate" min="50" max="400" step="10"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div class="flex justify-between mt-1 text-[10px] text-gray-400">
                  <span>50 (极慢)</span>
                  <span>150 (正常)</span>
                  <span>400 (极快)</span>
                </div>
              </div>
            </div>
            <p class="help-text">Edge TTS 免费提供，无需 API Key。常用音色：zh-CN-XiaoxiaoNeural, zh-CN-YunxiNeural</p>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div v-if="activeTab !== 'logs'" class="actions-bar">
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

      <!-- 日志查看器 (独立于 form) -->
      <div v-show="activeTab === 'logs'" class="content-area logs-area">
        <div class="section-header">
          <h2>系统日志</h2>
          <div class="logs-actions">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" v-model="autoRefresh" class="rounded border-gray-300 text-blue-600" />
              自动刷新 (5s)
            </label>
            <select v-model="logLevel" class="select-input log-filter">
              <option value="all">所有级别</option>
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="error">ERROR</option>
            </select>
            <button class="btn-refresh" @click="fetchLogs" :disabled="logsLoading">
              {{ logsLoading ? '加载中...' : '刷新日志' }}
            </button>
          </div>
        </div>

        <div class="logs-container" ref="logsContainer">
          <div v-if="logs.length === 0" class="no-logs">暂无日志</div>
          <div v-else class="log-list">
            <div v-for="(log, index) in filteredLogs" :key="index" class="log-item" :class="log.level">
              <span class="log-time">{{ log.timestamp }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import apiService from '@/services/apiService.js'
import { isAdmin, token } from '@/stores/authStore.js'

const activeTab = ref('general')
// ... (保留其他响应式变量)

// 日志相关
const logs = ref([])
const logsLoading = ref(false)
const logLevel = ref('all')
const logsContainer = ref(null)
const autoRefresh = ref(false)
let refreshTimer = null

const filteredLogs = computed(() => {
  if (logLevel.value === 'all') return logs.value
  return logs.value.filter(log => log.level === logLevel.value)
})

async function fetchLogs() {
  if (activeTab.value !== 'logs') return

  logsLoading.value = true
  try {
    const res = await apiService.get('/admin/logs')
    logs.value = res.logs || []

    // 自动滚动到底部
    setTimeout(() => {
      if (logsContainer.value) {
        logsContainer.value.scrollTop = logsContainer.value.scrollHeight
      }
    }, 100)
  } catch (e) {
    console.error('获取日志失败:', e)
  } finally {
    logsLoading.value = false
  }
}

watch(autoRefresh, (val) => {
  if (val) {
    refreshTimer = setInterval(fetchLogs, 5000) // 每5秒刷新一次
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
})

watch(activeTab, (val) => {
  if (val === 'logs') {
    fetchLogs()
  } else {
    // 离开日志页时停止自动刷新
    autoRefresh.value = false
  }
})

// ... (保留其他函数)

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
  embedding: { apiKey: '', baseURL: '', model: 'text-embedding-3-small' },
  seedAsr: { appId: '', apiKey: '', apiSecret: '', apiUrl: '', resourceId: '', audioConfig: {} },
  speech: {
    ttsProvider: 'siliconflow',
    asrProvider: 'siliconflow',
    siliconflow: {
      apiKey: '',
      baseURL: '',
      ttsModel: 'FunAudioLLM/CosyVoice2-0.5B',
      ttsVoice: 'anna',
      speechRate: 150,
      asrModel: 'FunAudioLLM/SenseVoiceSmall'
    },
    aliyun: {
      accessKeyId: '',
      accessKeySecret: '',
      appKey: '',
      ttsVoice: 'xiaoxian',
      speechRate: 150
    },
    openai: {
      apiKey: '',
      baseURL: '',
      ttsModel: 'tts-1',
      ttsVoice: 'alloy',
      speechRate: 150
    },
    edge: {
      ttsVoice: 'zh-CN-XiaoxiaoNeural',
      speechRate: 150
    }
  }
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

const embeddingModels = [
  { label: 'OpenAI text-embedding-3-small', value: 'text-embedding-3-small' },
  { label: 'OpenAI text-embedding-3-large', value: 'text-embedding-3-large' },
  { label: '硅基流动 BGE-M3 (BAAI/bge-m3)', value: 'BAAI/bge-m3' },
  { label: '硅基流动 BGE-Large-Zh (BAAI/bge-large-zh-v1.5)', value: 'BAAI/bge-large-zh-v1.5' },
  { label: '智谱 AI Embedding-3', value: 'embedding-3' },
  { label: '智谱 AI Embedding-2', value: 'embedding-2' },
  { label: '阿里通义千问 Text-Embedding-V3', value: 'text-embedding-v3' },
  { label: '阿里通义千问 Text-Embedding-V2', value: 'text-embedding-v2' }
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
const showEmbeddingKey = ref(false)
const showMoonshotKey = ref(false)
const showModelscopeKey = ref(false)
const showMinimaxKey = ref(false)
const showSeedAsrKey = ref(false)
const showSeedAsrSecret = ref(false)
const showSpeechSiliconKey = ref(false)
const showSpeechAliKey = ref(false)
const showSpeechOpenAIKey = ref(false)
const loading = ref(false)
const message = ref('')
const error = ref('')

// 连通性测试相关
const testingProvider = ref('')
const testResults = ref({}) // 存储各厂商的测试结果

async function testConnection(provider) {
  testingProvider.value = provider
  testResults.value[provider] = null

  try {
    let config;
    if (provider === 'speech-siliconflow') {
      config = {
        provider,
        apiKey: form.value.speech.siliconflow.apiKey,
        baseURL: form.value.speech.siliconflow.baseURL || 'https://api.siliconflow.cn/v1',
        model: 'deepseek-ai/DeepSeek-V3' // 使用一个通用的对话模型来测试 API Key 连通性
      }
    } else {
      config = {
        provider,
        apiKey: form.value[provider].apiKey,
        baseURL: form.value[provider].baseURL,
        model: form.value[provider].model
      }
    }

    const res = await apiService.post('/admin/config/test-connection', config)
    testResults.value[provider] = {
      success: res.success,
      message: res.message
    }

    if (res.success) {
      setTimeout(() => {
        if (testResults.value[provider]?.success) {
          testResults.value[provider] = null
        }
      }, 5000)
    }
  } catch (e) {
    testResults.value[provider] = {
      success: false,
      message: e.message || '测试失败'
    }
  } finally {
    testingProvider.value = ''
  }
}

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
      if (res.config.embedding) {
        form.value.embedding.baseURL = res.config.embedding.baseURL || ''
        form.value.embedding.model = res.config.embedding.model || 'text-embedding-3-small'
        form.value.embedding.apiKey = res.config.embedding.apiKey || ''
      }
      if (res.config.speech) {
        form.value.speech.ttsProvider = res.config.speech.ttsProvider || 'siliconflow'
        form.value.speech.asrProvider = res.config.speech.asrProvider || 'siliconflow'
        if (res.config.speech.siliconflow) {
          form.value.speech.siliconflow.apiKey = res.config.speech.siliconflow.apiKey || ''
          form.value.speech.siliconflow.baseURL = res.config.speech.siliconflow.baseURL || ''
          form.value.speech.siliconflow.ttsModel = res.config.speech.siliconflow.ttsModel || 'FunAudioLLM/CosyVoice2-0.5B'
          form.value.speech.siliconflow.ttsVoice = res.config.speech.siliconflow.ttsVoice || 'anna'
          form.value.speech.siliconflow.speechRate = res.config.speech.siliconflow.speechRate || 150
          form.value.speech.siliconflow.asrModel = res.config.speech.siliconflow.asrModel || 'FunAudioLLM/SenseVoiceSmall'
        }
        if (res.config.speech.aliyun) {
          form.value.speech.aliyun.accessKeyId = res.config.speech.aliyun.accessKeyId || ''
          form.value.speech.aliyun.accessKeySecret = res.config.speech.aliyun.accessKeySecret || ''
          form.value.speech.aliyun.appKey = res.config.speech.aliyun.appKey || ''
          form.value.speech.aliyun.ttsVoice = res.config.speech.aliyun.ttsVoice || 'xiaoxian'
          form.value.speech.aliyun.speechRate = res.config.speech.aliyun.speechRate || 150
        }
        if (res.config.speech.openai) {
          form.value.speech.openai.apiKey = res.config.speech.openai.apiKey || ''
          form.value.speech.openai.baseURL = res.config.speech.openai.baseURL || ''
          form.value.speech.openai.ttsModel = res.config.speech.openai.ttsModel || 'tts-1'
          form.value.speech.openai.ttsVoice = res.config.speech.openai.ttsVoice || 'alloy'
          form.value.speech.openai.speechRate = res.config.speech.openai.speechRate || 150
        }
        if (res.config.speech.edge) {
          form.value.speech.edge.ttsVoice = res.config.speech.edge.ttsVoice || 'zh-CN-XiaoxiaoNeural'
          form.value.speech.edge.speechRate = res.config.speech.edge.speechRate || 150
        }
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

    // 校验逻辑：确保选中的默认提供商已配置 API Key (Ollama 除外，通常不需要 Key)
    const selectedProvider = form.value.provider
    if (selectedProvider !== 'ollama') {
      const providerConfig = form.value[selectedProvider]
      if (!providerConfig || !providerConfig.apiKey) {
        const providerName = {
          deepseek: 'DeepSeek',
          qwen: '通义千问',
          doubao: '火山引擎',
          glm: '智谱GLM',
          moonshot: 'Kimi (Moonshot)',
          modelscope: 'ModelScope (魔搭)',
          minimax: 'MiniMax'
        }[selectedProvider] || selectedProvider

        throw new Error(`请先配置 ${providerName} 的 API Key，然后再将其设为默认提供商`)
      }
    }

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
  width: 100%;
  height: calc(100vh - 60px);
  /* 减去导航栏高度 */
  margin: 0;
  padding: 0;
  color: #1a202c;
  background: #f7fafc;
  overflow: hidden;
}

.header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.subtitle-text {
  color: #718096;
  font-size: 0.875rem;
}

.config-container {
  display: flex;
  height: calc(100% - 85px);
  /* 减去 header 高度 */
  background: white;
  border-radius: 0;
  box-shadow: none;
  min-height: auto;
  overflow: hidden;
}

/* Sidebar Styles */
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  padding: 1rem 0;
  flex-shrink: 0;
}

/* Content Area Styles */
.content-area {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #f7fafc;
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
  background: #f7fafc;
  color: #2d3748;
}

.nav-item.active {
  background: #ebf8ff;
  color: #3182ce;
  border-left-color: #3182ce;
}

.nav-item .icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
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
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
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

/* 连通性测试样式 */
/* 已移至 Tailwind */

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

/* 日志查看器样式 */
.logs-area {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logs-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.log-filter {
  width: 120px;
  padding: 0.5rem;
}

.btn-refresh {
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  cursor: pointer;
  color: #4a5568;
}

.btn-refresh:hover {
  background: #edf2f7;
}

.logs-container {
  flex: 1;
  background: #1a202c;
  color: #e2e8f0;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-y: auto;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  max-height: calc(100vh - 250px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.no-logs {
  text-align: center;
  color: #718096;
  margin-top: 2rem;
}

.log-item {
  margin-bottom: 0.5rem;
  line-height: 1.4;
  word-break: break-all;
}

.log-time {
  color: #718096;
  margin-right: 0.5rem;
}

.log-level {
  font-weight: bold;
  margin-right: 0.5rem;
  min-width: 50px;
  display: inline-block;
}

.log-item.info .log-level {
  color: #48bb78;
}

.log-item.warn .log-level {
  color: #ecc94b;
}

.log-item.error .log-level {
  color: #f56565;
}
</style>
