<template>
  <div class="capabilities-page">
    <div class="header">
      <h1 class="title">智能体能力矩阵</h1>
      <p class="subtitle-text">浏览并调试智能体提供的各项功能模块与 API 接口</p>
    </div>

    <div class="main-container">
      <!-- 侧边功能列表 -->
      <div class="sidebar">
        <div v-for="(group, index) in groupedModules" :key="index">
          <div class="nav-divider" :class="{ 'mt-6': index > 0 }">{{ group.title }}</div>
          <div 
            v-for="mod in group.items" 
            :key="mod.id"
            class="nav-item" 
            :class="{ active: activeModule?.id === mod.id }" 
            @click="selectModule(mod)"
          >
            <span class="icon">{{ mod.icon }}</span>
            {{ mod.name.replace(' (外部 API)', '') }}
          </div>
        </div>
        
        <div class="nav-divider mt-6">调试工具</div>
        <div 
          class="nav-item" 
          :class="{ active: showHistory }" 
          @click="showHistory = true; activeModule = null"
        >
          <span class="icon">📜</span>
          调用历史
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-area">
        <!-- 欢迎页 -->
        <div v-if="!activeModule && !showHistory" class="space-y-10">
          <div v-for="(group, index) in groupedModules" :key="index">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span class="w-1 h-6 bg-blue-600 rounded-full"></span>
              {{ group.title }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="mod in group.items" 
                :key="mod.id"
                @click="selectModule(mod)"
                class="group bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-200"
              >
                <div class="flex items-start justify-between mb-3">
                  <span class="text-2xl group-hover:scale-110 transition-transform duration-200">{{ mod.icon }}</span>
                  <span class="text-xs font-mono px-2 py-1 rounded bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {{ mod.method }}
                  </span>
                </div>
                <h3 class="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{{ mod.name.replace(' (外部 API)', '') }}</h3>
                <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">{{ mod.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeModule && !showHistory" class="module-detail">
          <!-- 文档部分 -->
          <div class="section-header">
            <div class="flex items-center gap-3">
              <span class="text-3xl">{{ activeModule.icon }}</span>
              <div>
                <h2>{{ activeModule.name }}</h2>
                <p>{{ activeModule.description }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- 左侧：文档与代码 -->
            <div class="space-y-6">
              <div class="card p-6">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                  <span class="w-1 h-5 bg-blue-500 rounded"></span>
                  接口定义
                </h3>
                <div class="space-y-4">
                  <div class="flex items-center gap-2">
                    <span 
                      class="px-2 py-1 rounded text-xs font-bold"
                      :class="getMethodClass(activeModule.method)"
                    >
                      {{ activeModule.method }}
                    </span>
                    <code class="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{{ activeModule.endpoint }}</code>
                  </div>
                  
                  <div v-if="activeModule.params && activeModule.params.length">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">输入参数</h4>
                    <table class="w-full text-sm border-collapse">
                      <thead>
                        <tr class="bg-gray-50 border-b">
                          <th class="text-left p-2">参数名</th>
                          <th class="text-left p-2">类型</th>
                          <th class="text-left p-2">描述</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="param in activeModule.params" :key="param.name" class="border-b">
                          <td class="p-2 font-mono text-blue-600">{{ param.name }}</td>
                          <td class="p-2 text-gray-500">{{ param.type }}</td>
                          <td class="p-2 text-gray-600">{{ param.description }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="card p-6">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                  <span class="w-1 h-5 bg-green-500 rounded"></span>
                  示例代码 (cURL)
                </h3>
                <div class="bg-gray-900 rounded-lg p-4 relative group">
                  <pre class="text-gray-300 text-xs font-mono overflow-x-auto"><code>{{ dynamicExampleCode }}</code></pre>
                  <button 
                    @click="copyText(dynamicExampleCode)"
                    class="absolute top-2 right-2 p-1.5 bg-gray-800 text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>

            <!-- 右侧：调试面板 -->
            <div class="space-y-6">
              <div class="card p-6 border-blue-100 bg-blue-50/30">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold flex items-center gap-2">
                    <span class="w-1 h-5 bg-orange-500 rounded"></span>
                    交互式调试
                  </h3>
                  <router-link to="/profile" class="text-xs text-blue-600 hover:underline">管理 API Key ↗</router-link>
                </div>
                
                <div class="space-y-4">
                  <!-- 动态表单 -->
                  <div v-for="param in activeModule.params" :key="param.name" class="field">
                    <label class="text-sm font-medium mb-1 block">{{ param.description }}</label>
                    
                    <input 
                      v-if="param.type === 'string' || param.type === 'number'"
                      v-model="debugParams[param.name]"
                      :type="param.name.toLowerCase().includes('password') || param.name.toLowerCase().includes('key') ? 'password' : 'text'"
                      class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      :placeholder="'请输入 ' + param.name"
                    />
                    
                    <select 
                      v-else-if="param.type === 'select'"
                      v-model="debugParams[param.name]"
                      class="w-full p-2 border rounded text-sm outline-none"
                    >
                      <option v-for="opt in param.options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>

                    <textarea
                      v-else-if="param.type === 'textarea'"
                      v-model="debugParams[param.name]"
                      class="w-full p-2 border rounded text-sm min-h-[100px] outline-none"
                      :placeholder="'请输入 ' + param.name"
                    ></textarea>

                    <div v-else-if="param.type === 'file'" class="flex items-center gap-2">
                      <input 
                        type="file" 
                        @change="handleFileChange($event, param.name)"
                        class="text-xs"
                      />
                    </div>
                  </div>

                  <button 
                    @click="executeCall"
                    :disabled="calling"
                    class="w-full py-3 bg-blue-600 text-white rounded-lg font-bold transition-all hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <span v-if="calling" class="animate-spin text-xl">⏳</span>
                    {{ calling ? '正在调用...' : '发送请求' }}
                  </button>
                </div>

                <!-- 结果展示 -->
                <div v-if="debugResult" class="mt-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-gray-700">响应结果</span>
                    <span 
                      class="text-xs px-2 py-0.5 rounded"
                      :class="debugResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    >
                      {{ debugResult.success ? 'Success' : 'Error' }} ({{ debugResult.time }}ms)
                    </span>
                  </div>
                  
                  <!-- TTS 音频预览 -->
                  <div v-if="activeModule.id === 'tts' && debugResult.success && debugResult.data.url" class="p-4 bg-white border rounded-lg">
                    <p class="text-xs text-gray-500 mb-2">音频预览:</p>
                    <audio controls :src="debugResult.data.url" class="w-full h-10"></audio>
                    <a :href="debugResult.data.url" target="_blank" class="text-xs text-blue-600 mt-2 inline-block hover:underline">在新窗口打开音频</a>
                  </div>

                  <!-- ASR 文本显示 -->
                  <div v-if="activeModule.id === 'asr' && debugResult.success && debugResult.data.text" class="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <p class="text-xs text-blue-500 mb-1 font-bold">识别结果:</p>
                    <p class="text-sm text-gray-800 leading-relaxed">{{ debugResult.data.text }}</p>
                  </div>

                  <div class="bg-gray-900 rounded-lg p-4 overflow-hidden relative group">
                    <pre class="text-xs font-mono text-green-400 overflow-x-auto max-h-[300px]"><code>{{ JSON.stringify(debugResult.data, null, 2) }}</code></pre>
                    <button 
                      @click="copyText(JSON.stringify(debugResult.data, null, 2))"
                      class="absolute top-2 right-2 p-1 bg-gray-800 text-gray-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 调用历史记录 -->
        <div v-else-if="showHistory" class="history-view">
          <div class="section-header">
            <h2>调用历史记录</h2>
            <p>查看并回放过去的 API 调用请求</p>
          </div>

          <div class="card overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b">
                  <th class="text-left p-4">功能模块</th>
                  <th class="text-left p-4">时间</th>
                  <th class="text-left p-4">状态</th>
                  <th class="text-left p-4">耗时</th>
                  <th class="text-right p-4">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="history.length === 0">
                  <td colspan="5" class="p-8 text-center text-gray-500">暂无调用历史记录</td>
                </tr>
                <tr v-for="(item, index) in history" :key="index" class="border-b hover:bg-gray-50 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-2 font-medium">
                      <span>{{ getModuleById(item.moduleId)?.icon }}</span>
                      {{ getModuleById(item.moduleId)?.name }}
                    </div>
                  </td>
                  <td class="p-4 text-gray-500">{{ formatDate(item.timestamp) }}</td>
                  <td class="p-4">
                    <span 
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      :class="item.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    >
                      {{ item.success ? 'Success' : 'Error' }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-500">{{ item.time }}ms</td>
                  <td class="p-4 text-right">
                    <button 
                      @click="replayHistory(item)"
                      class="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      回放
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 默认空状态 -->
        <!-- <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
          <span class="text-6xl mb-4">🚀</span>
          <p class="text-xl">选择左侧的功能模块开始探索</p>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import apiService from '@/services/apiService.js'
import { token } from '@/stores/authStore.js'
import { getMyApiKey } from '@/services/apiKeyService'

// API 模块元数据定义
const modules = [
  {
    id: 'agent-chat',
    name: '智能体对话 (外部 API)',
    category: 'interaction',
    icon: '🤖',
    description: '通过 API Key 授权与智能体进行对话，支持 RAG 知识库检索。',
    method: 'POST',
    endpoint: '/api/external/agent/:agentId/chat',
    params: [
      { name: 'agentId', type: 'string', description: '智能体 ID (URL 参数)' },
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'message', type: 'textarea', description: '用户发送的消息' },
      { name: 'stream', type: 'select', options: ['false', 'true'], description: '是否启用流式响应' },
      { name: 'conversationId', type: 'string', description: '会话 ID (可选，指定会话上下文)' }
    ],
    exampleCode: `curl -X POST https://api.yourdomain.com/api/external/agent/AGENT_ID/chat \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "你好", "stream": false}'`
  },
  {
    id: 'conversation-manage',
    name: '会话管理 (外部 API)',
    category: 'interaction',
    icon: '💬',
    description: '管理智能体的会话上下文（创建、查询、删除）。',
    method: 'POST',
    endpoint: '/api/external/agent/:agentId/conversations',
    params: [
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'agentId', type: 'string', description: '智能体 ID (URL 参数)' },
      { name: 'action', type: 'select', options: ['create', 'list', 'messages', 'delete'], description: '操作类型' },
      { name: 'title', type: 'string', description: '会话标题 (仅创建时)' },
      { name: 'conversationId', type: 'string', description: '会话 ID (查询消息/删除时)' }
    ],
    exampleCode: `curl -X POST https://api.yourdomain.com/api/external/agent/AGENT_ID/conversations \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "新会话"}'`
  },
  {
    id: 'agent-list',
    name: '获取公开智能体 (外部 API)',
    category: 'management',
    icon: '🌐',
    description: '通过 API Key 授权获取平台上所有已发布的公开智能体列表。',
    method: 'GET',
    endpoint: '/api/external/agents',
    params: [
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'search', type: 'string', description: '搜索关键词 (可选)' },
      { name: 'category', type: 'string', description: '分类过滤 (可选)' },
      { name: 'page', type: 'number', description: '页码 (默认 1)' },
      { name: 'limit', type: 'number', description: '每页数量 (默认 20)' }
    ],
    exampleCode: `curl -H "X-API-Key: YOUR_API_KEY" https://api.yourdomain.com/api/external/agents`
  },
  {
    id: 'my-agents',
    name: '获取我的智能体 (外部 API)',
    category: 'management',
    icon: '👤',
    description: '获取当前 API Key 所属用户创建的所有智能体列表。',
    method: 'GET',
    endpoint: '/api/external/agents/my',
    params: [
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'page', type: 'number', description: '页码 (默认 1)' },
      { name: 'limit', type: 'number', description: '每页数量 (默认 20)' }
    ],
    exampleCode: `curl -H "X-API-Key: YOUR_API_KEY" https://api.yourdomain.com/api/external/agents/my`
  },
  {
    id: 'agent-detail',
    name: '获取智能体详情 (外部 API)',
    category: 'management',
    icon: 'ℹ️',
    description: '通过 API Key 授权获取指定智能体的详细配置信息。',
    method: 'GET',
    endpoint: '/api/external/agent/:agentId',
    params: [
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'agentId', type: 'string', description: '智能体 ID (URL 参数)' }
    ],
    exampleCode: `curl -H "X-API-Key: YOUR_API_KEY" https://api.yourdomain.com/api/external/agent/AGENT_ID`
  },
  {
    id: 'kb-search',
    name: '知识库检索 (外部 API)',
    category: 'services',
    icon: '🔍',
    description: '通过 API Key 授权在指定的知识库中进行语义搜索。',
    method: 'POST',
    endpoint: '/api/external/knowledge/:kbId/query',
    params: [
      { name: 'kbId', type: 'string', description: '知识库 ID (URL 参数)' },
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'query', type: 'string', description: '搜索关键词' },
      { name: 'topK', type: 'number', description: '返回结果数量 (默认 3)' }
    ],
    exampleCode: `curl -X POST https://api.yourdomain.com/api/external/knowledge/KB_ID/query \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "什么是 AI?", "topK": 3}'`
  },
  {
    id: 'tts',
    name: '文字转语音 (外部 API)',
    category: 'services',
    icon: '🔊',
    description: '通过 API Key 授权将文本转换为自然语音。',
    method: 'POST',
    endpoint: '/api/external/tts',
    params: [
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'text', type: 'textarea', description: '要转换的文本' },
      { name: 'voice', type: 'string', description: '音色 ID (如 anna, david)' },
      { name: 'speechRate', type: 'number', description: '语速 (50-400)' },
      { name: 'provider', type: 'select', options: ['siliconflow', 'aliyun', 'openai', 'edge'], description: '服务提供商' }
    ],
    exampleCode: `curl -X POST https://api.yourdomain.com/api/external/tts \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "你好，世界", "voice": "anna", "speechRate": 150, "provider": "siliconflow"}'`
  },
  {
    id: 'asr',
    name: '语音识别 (外部 API)',
    category: 'services',
    icon: '🎙️',
    description: '通过 API Key 授权将音频文件转换为文本。',
    method: 'POST',
    endpoint: '/api/external/asr',
    params: [
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' },
      { name: 'file', type: 'file', description: '音频文件 (wav/mp3)' },
      { name: 'provider', type: 'select', options: ['siliconflow', 'aliyun'], description: '服务提供商' }
    ],
    exampleCode: `curl -X POST https://api.yourdomain.com/api/external/asr \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@/path/to/audio.wav" \\
  -F "provider=siliconflow"`
  },
  {
    id: 'voice-list',
    name: '获取音色列表 (外部 API)',
    category: 'services',
    icon: '🎭',
    description: '通过 API Key 授权获取当前配置的 TTS 服务商支持的所有音色列表。',
    method: 'GET',
    endpoint: '/api/external/tts/voices',
    params: [
      { name: 'X-API-Key', type: 'string', description: '授权码 (Header 参数)' }
    ],
    exampleCode: `curl -H "X-API-Key: YOUR_API_KEY" https://api.yourdomain.com/api/external/tts/voices`
  }
]

// 分组计算属性
const groupedModules = computed(() => [
  {
    title: '🤖 智能体交互',
    items: modules.filter(m => m.category === 'interaction')
  },
  {
    title: '🛠️ 智能体管理',
    items: modules.filter(m => m.category === 'management')
  },
  {
    title: '🧩 原子能力服务',
    items: modules.filter(m => m.category === 'services')
  }
])

const activeModule = ref(null)
const showHistory = ref(false)
const debugParams = reactive({})
const debugResult = ref(null)
const calling = ref(false)
const history = ref([])
const selectedFile = ref(null)
const userApiKey = ref('')

const dynamicExampleCode = computed(() => {
  if (!activeModule.value) return ''
  
  const mod = activeModule.value
  const baseUrl = window.location.origin
  
  if (mod.id === 'agent-chat') {
    const id = debugParams.agentId || 'AGENT_ID'
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    const cid = debugParams.conversationId ? `, "conversationId": "${debugParams.conversationId}"` : ''
    return `curl -X POST ${baseUrl}/api/external/agent/${id}/chat \\
  -H "X-API-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "${debugParams.message || '你好'}", "stream": ${debugParams.stream || 'false'}${cid}}'`
  }

  if (mod.id === 'conversation-manage') {
    const id = debugParams.agentId || 'AGENT_ID'
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    const action = debugParams.action || 'create'
    
    if (action === 'create') {
      return `curl -X POST ${baseUrl}/api/external/agent/${id}/conversations \\
  -H "X-API-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "${debugParams.title || '新会话'}"}'`
    }
    
    if (action === 'list') {
      return `curl -H "X-API-Key: ${key}" ${baseUrl}/api/external/agent/${id}/conversations`
    }
    
    if (action === 'messages') {
      const cid = debugParams.conversationId || 'CONVERSATION_ID'
      return `curl -H "X-API-Key: ${key}" ${baseUrl}/api/external/agent/${id}/conversations/${cid}/messages`
    }
    
    if (action === 'delete') {
      const cid = debugParams.conversationId || 'CONVERSATION_ID'
      return `curl -X DELETE -H "X-API-Key: ${key}" ${baseUrl}/api/external/agent/${id}/conversations/${cid}`
    }
  }

  if (mod.id === 'agent-detail') {
    const id = debugParams.agentId || 'AGENT_ID'
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    return `curl -H "X-API-Key: ${key}" ${baseUrl}/api/external/agent/${id}`
  }

  if (mod.id === 'my-agents') {
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    return `curl -H "X-API-Key: ${key}" ${baseUrl}/api/external/agents/my`
  }

  if (mod.id === 'kb-search') {
    const kbId = debugParams.kbId || 'KB_ID'
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    return `curl -X POST ${baseUrl}/api/external/knowledge/${kbId}/query \\
  -H "X-API-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "${debugParams.query || '关键词'}", "topK": ${debugParams.topK || 3}}'`
  }

  if (mod.id === 'tts') {
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    return `curl -X POST ${baseUrl}/api/external/tts \\
  -H "X-API-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    text: debugParams.text || '你好',
    voice: debugParams.voice || 'anna',
    speechRate: debugParams.speechRate || 150,
    provider: debugParams.provider || 'siliconflow'
  })}'`
  }
  
  if (mod.id === 'asr') {
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    return `curl -X POST ${baseUrl}/api/external/asr \\
  -H "X-API-Key: ${key}" \\
  -F "file=@/path/to/audio.wav" \\
  -F "provider=${debugParams.provider || 'siliconflow'}"`
  }

  if (mod.id === 'voice-list') {
    const key = debugParams['X-API-Key'] || 'YOUR_API_KEY'
    return `curl -H "X-API-Key: ${key}" ${baseUrl}/api/external/tts/voices`
  }
  
  if (mod.method === 'GET') {
    const params = new URLSearchParams()
    Object.keys(debugParams).forEach(k => {
      if (debugParams[k] && k !== 'X-API-Key') params.append(k, debugParams[k])
    })
    const qs = params.toString()
    const key = debugParams['X-API-Key']
    const headerStr = key ? ` -H "X-API-Key: ${key}"` : ''
    return `curl${headerStr} "${baseUrl}${mod.endpoint}${qs ? '?' + qs : ''}"`
  }
})

// 生命周期
onMounted(async () => {
  loadHistory()
  try {
    const res = await getMyApiKey()
    userApiKey.value = res.apiKey
  } catch (e) {
    console.error('获取用户 API Key 失败:', e)
  }
})

// 模块选择
function selectModule(mod) {
  activeModule.value = mod
  showHistory.value = false
  debugResult.value = null
  
  // 初始化调试参数
  Object.keys(debugParams).forEach(key => delete debugParams[key])
  mod.params.forEach(p => {
    if (p.name === 'X-API-Key') {
      debugParams[p.name] = userApiKey.value
    } else {
      debugParams[p.name] = p.type === 'select' ? p.options[0] : ''
    }
  })
}

// 文件处理
function handleFileChange(event, paramName) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

// 执行 API 调用
async function executeCall() {
  if (!activeModule.value) return
  
  calling.value = true
  const startTime = Date.now()
  const mod = activeModule.value
  
  try {
    let res
    const config = {}
    
    // 准备请求数据
    const apiKey = debugParams['X-API-Key']
    const headers = apiKey ? { 'X-API-Key': apiKey } : {}

    if (mod.id === 'agent-chat') {
      const { agentId, 'X-API-Key': key, ...data } = debugParams
      const url = `/external/agent/${agentId}/chat`
      res = await apiService.post(url, 
        { ...data, stream: data.stream === 'true' },
        { headers }
      )
    } else if (mod.id === 'agent-detail') {
      const { agentId } = debugParams
      const url = `/external/agent/${agentId}`
      res = await apiService.get(url, {}, { headers })
    } else if (mod.id === 'my-agents') {
      // 过滤掉 X-API-Key
      const queryParams = { ...debugParams }
      delete queryParams['X-API-Key']
      // 移除 /api 前缀
      const url = '/external/agents/my'
      res = await apiService.get(url, queryParams, { headers })
    } else if (mod.id === 'conversation-manage') {
      const { agentId, action, conversationId, title } = debugParams
      
      if (action === 'create') {
        res = await apiService.post(`/external/agent/${agentId}/conversations`, { title }, { headers })
      } else if (action === 'list') {
        res = await apiService.get(`/external/agent/${agentId}/conversations`, {}, { headers })
      } else if (action === 'messages') {
        res = await apiService.get(`/external/agent/${agentId}/conversations/${conversationId}/messages`, {}, { headers })
      } else if (action === 'delete') {
        res = await apiService.delete(`/external/agent/${agentId}/conversations/${conversationId}`, { headers })
      }
    } else if (mod.id === 'kb-search') {
      const { kbId, 'X-API-Key': key, ...data } = debugParams
      res = await apiService.post(`/external/knowledge/${kbId}/query`, data, { headers })
    } else if (mod.id === 'tts') {
      const { 'X-API-Key': key, ...data } = debugParams
      res = await apiService.post(`/external/tts`, data, { headers })
    } else if (mod.id === 'asr') {
      const formData = new FormData()
      if (selectedFile.value) {
        formData.append('file', selectedFile.value)
      }
      // 将其他调试参数也加入 FormData
      Object.keys(debugParams).forEach(key => {
        if (key !== 'file' && key !== 'X-API-Key') {
          formData.append(key, debugParams[key])
        }
      })
      res = await apiService.post(`/external/asr`, formData, {
        headers
      })
    } else if (mod.id === 'voice-list') {
      res = await apiService.get(`/external/tts/voices`, {}, { headers })
    } else if (mod.method === 'GET') {
      // 过滤掉 X-API-Key，不作为查询参数
      const queryParams = { ...debugParams }
      delete queryParams['X-API-Key']
      // 移除 /api 前缀，因为 apiService 会自动添加
      const url = mod.endpoint.startsWith('/api') ? mod.endpoint.slice(4) : mod.endpoint
      res = await apiService.get(url, queryParams, { headers })
    } else {
      const url = mod.endpoint.startsWith('/api') ? mod.endpoint.slice(4) : mod.endpoint
      res = await apiService.post(url, debugParams, { headers })
    }

    const duration = Date.now() - startTime
    debugResult.value = { success: true, data: res, time: duration }
    saveToHistory(mod.id, true, res, duration)
    
  } catch (error) {
    const duration = Date.now() - startTime
    debugResult.value = { success: false, data: { error: error.message }, time: duration }
    saveToHistory(mod.id, false, { error: error.message }, duration)
  } finally {
    calling.value = false
  }
}

// 历史记录管理
function saveToHistory(moduleId, success, data, time) {
  const item = {
    moduleId,
    success,
    data,
    time,
    params: { ...debugParams },
    timestamp: new Date().toISOString()
  }
  history.value.unshift(item)
  if (history.value.length > 20) history.value.pop()
  localStorage.setItem('capability_history', JSON.stringify(history.value))
}

function loadHistory() {
  const saved = localStorage.getItem('capability_history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (e) {
      history.value = []
    }
  }
}

function replayHistory(item) {
  const mod = getModuleById(item.moduleId)
  if (mod) {
    selectModule(mod)
    Object.assign(debugParams, item.params)
    debugResult.value = { success: item.success, data: item.data, time: item.time }
  }
}

// 工具函数
function getModuleById(id) {
  return modules.find(m => m.id === id)
}

function getMethodClass(method) {
  switch (method) {
    case 'POST': return 'bg-blue-100 text-blue-700'
    case 'GET': return 'bg-green-100 text-green-700'
    case 'PUT': return 'bg-yellow-100 text-yellow-700'
    case 'DELETE': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text)
  alert('代码已复制到剪贴板')
}

function formatDate(iso) {
  const date = new Date(iso)
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.capabilities-page {
  width: 100%;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f7fafc;
  overflow: hidden;
}

.header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.subtitle-text {
  color: #718096;
  font-size: 0.875rem;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-divider {
  padding: 1rem 1.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
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
  font-weight: 500;
  transition: all 0.2s;
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

.content-area {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #f7fafc;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.section-header p {
  color: #718096;
  margin-top: 0.25rem;
}

.module-detail {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Custom Table Styles */
th {
  font-weight: 600;
  color: #4a5568;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
