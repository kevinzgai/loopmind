<template>
  <div class="min-h-screen bg-background">
    <header class="sticky top-0 z-40 border-b-2 border-primary bg-background/95 backdrop-blur">
      <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center cartoon-shadow-sm">
            <BookOpen class="w-4 h-4 text-primary-foreground" />
          </div>
          <span class="font-extrabold font-heading text-lg">Chart AI 开发者文档</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/30">v1.0</span>
        </div>
        <a href="/" class="text-sm text-muted-foreground hover:text-primary transition-colors font-bold">\u2190 返回首页</a>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-8 flex gap-8">
      <aside class="hidden lg:block w-56 flex-shrink-0">
        <nav class="sticky top-24 space-y-1">
          <button v-for="s in sections" :key="s.id" @click="activeSection = s.id"
            :class="['w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2',
              activeSection === s.id ? 'bg-primary text-primary-foreground cartoon-shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground']"
          ><component :is="s.icon" class="w-4 h-4 flex-shrink-0" />{{ s.label }}</button>
        </nav>
      </aside>

      <main class="flex-1 min-w-0 space-y-6">
        <div class="lg:hidden flex gap-2 overflow-x-auto pb-2">
          <button v-for="s in sections" :key="s.id" @click="activeSection = s.id"
            :class="['flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all',
              activeSection === s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-primary/30 text-muted-foreground']"
          >{{ s.label }}</button>
        </div>

        <template v-if="activeSection === 'overview'">
          <div class="card-base p-6">
            <h2 class="text-2xl font-extrabold font-heading mb-2">项目概览</h2>
            <p class="text-muted-foreground">Chart AI 是一个全栈 AI 智能体平台，支持自定义智能体、知识库 RAG、语音交互与嵌入式插件。基于 Vue 3 + Node.js + MongoDB + LanceDB 构建。</p>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div v-for="c in overviewCards" :key="c.title" class="card-base p-5">
              <div class="flex items-center gap-3 mb-2">
                <div :class="['w-9 h-9 rounded-xl flex items-center justify-center border-2 border-primary', c.bg]"><component :is="c.icon" class="w-4 h-4" :class="c.color" /></div>
                <h3 class="font-extrabold font-heading">{{ c.title }}</h3>
              </div>
              <p class="text-sm text-muted-foreground">{{ c.desc }}</p>
            </div>
          </div>
          <div class="card-base p-6">
            <h3 class="font-extrabold font-heading mb-3 flex items-center gap-2"><FolderTree class="w-4 h-4 text-primary" />项目结构</h3>
            <pre class="bg-muted rounded-xl p-4 text-xs font-mono border-2 border-primary/20 leading-relaxed overflow-x-auto">{{ projectStructure }}</pre>
          </div>
        </template>

        <template v-if="activeSection === 'stack'">
          <div class="card-base p-6">
            <h2 class="text-2xl font-extrabold font-heading mb-6">技术栈</h2>
            <div class="space-y-6">
              <div v-for="layer in techStack" :key="layer.title">
                <h3 class="font-extrabold font-heading mb-3 flex items-center gap-2"><component :is="layer.icon" class="w-4 h-4 text-primary" />{{ layer.title }}</h3>
                <div class="grid sm:grid-cols-2 gap-3">
                  <div v-for="t in layer.items" :key="t.name" class="flex gap-3 p-3 rounded-xl bg-muted border-2 border-primary/10">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"><span class="text-xs font-extrabold text-primary">{{ t.name.charAt(0) }}</span></div>
                    <div><div class="font-bold text-sm">{{ t.name }} <span class="text-xs text-muted-foreground font-normal">{{ t.version }}</span></div><div class="text-xs text-muted-foreground">{{ t.desc }}</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="activeSection === 'quickstart'">
          <div class="card-base p-6">
            <h2 class="text-2xl font-extrabold font-heading mb-6">快速开始</h2>
            <div class="space-y-6">
              <div v-for="(step, i) in quickStartSteps" :key="i" class="flex gap-4">
                <div class="flex-shrink-0 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm cartoon-shadow-sm">{{ i+1 }}</div>
                <div class="flex-1">
                  <h3 class="font-extrabold font-heading mb-1">{{ step.title }}</h3>
                  <p class="text-sm text-muted-foreground mb-3">{{ step.desc }}</p>
                  <pre v-if="step.code" class="bg-muted rounded-xl p-4 text-xs font-mono border-2 border-primary/20 overflow-x-auto">{{ step.code }}</pre>
                  <div v-if="step.note" class="mt-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 font-medium">\u{1F4A1} {{ step.note }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-base p-6">
            <h3 class="font-extrabold font-heading mb-4 flex items-center gap-2"><Settings class="w-4 h-4 text-primary" />环境变量 (backend/.env)</h3>
            <pre class="bg-muted rounded-xl p-4 text-xs font-mono border-2 border-primary/20 overflow-x-auto leading-relaxed">{{ envExample }}</pre>
          </div>
        </template>

        <template v-if="activeSection === 'arch'">
          <div class="card-base p-6">
            <h2 class="text-2xl font-extrabold font-heading mb-6">架构说明</h2>
            <div class="p-4 rounded-xl bg-muted border-2 border-primary/20 mb-5">
              <h3 class="font-extrabold font-heading mb-3 text-primary">请求链路</h3>
              <div class="flex flex-wrap items-center gap-2 text-sm font-mono">
                <span class="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-bold">Browser</span>
                <span class="text-muted-foreground">\u2192 HTTPS \u2192</span>
                <span class="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg font-bold border-2 border-primary">Vite :5173</span>
                <span class="text-muted-foreground">\u2192 Proxy /api \u2192</span>
                <span class="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold border-2 border-primary">Express :3002</span>
                <span class="text-muted-foreground">\u2192</span>
                <span class="px-3 py-1 bg-muted-foreground/20 rounded-lg font-bold">MongoDB + LanceDB</span>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="mod in archModules" :key="mod.title" class="p-4 rounded-xl border-2 border-primary/20">
                <div class="flex items-center gap-2 mb-2"><component :is="mod.icon" class="w-4 h-4 text-primary" /><h3 class="font-extrabold font-heading">{{ mod.title }}</h3><code class="text-xs text-muted-foreground">{{ mod.path }}</code></div>
                <p class="text-sm text-muted-foreground mb-2">{{ mod.desc }}</p>
                <div class="flex flex-wrap gap-1"><span v-for="tag in mod.tags" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">{{ tag }}</span></div>
              </div>
            </div>
          </div>
          <div class="card-base p-6">
            <h3 class="font-extrabold font-heading mb-4 flex items-center gap-2"><Database class="w-4 h-4 text-primary" />主要数据模型</h3>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="m in dbModels" :key="m.name" class="p-3 rounded-xl bg-muted border-2 border-primary/10">
                <div class="font-bold text-sm mb-1">{{ m.name }}</div><div class="text-xs text-muted-foreground mb-2">{{ m.desc }}</div>
                <div class="flex flex-wrap gap-1"><span v-for="f in m.fields" :key="f" class="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">{{ f }}</span></div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="activeSection === 'api'">
          <div class="card-base p-6">
            <h2 class="text-2xl font-extrabold font-heading mb-2">API 参考</h2>
            <div class="flex items-center gap-3 p-3 rounded-xl bg-muted border-2 border-primary/20 mb-5">
              <Globe class="w-4 h-4 text-primary flex-shrink-0" />
              <code class="text-sm font-mono">Base URL: <strong>http://localhost:3002/api</strong></code>
              <span class="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">Bearer Token</span>
            </div>
            <div class="space-y-5">
              <div v-for="group in apiGroups" :key="group.title">
                <h3 class="font-extrabold font-heading mb-2 flex items-center gap-2"><component :is="group.icon" class="w-4 h-4 text-primary" />{{ group.title }}</h3>
                <div class="space-y-2">
                  <div v-for="ep in group.endpoints" :key="ep.path" class="flex items-center gap-3 p-3 rounded-xl border-2 border-primary/10 hover:border-primary/30 transition-colors">
                    <span :class="['text-xs font-extrabold px-2 py-1 rounded-lg flex-shrink-0 font-mono', methodColor(ep.method)]">{{ ep.method }}</span>
                    <code class="text-sm font-mono font-bold flex-1 min-w-0 truncate">{{ ep.path }}</code>
                    <span class="text-xs text-muted-foreground hidden sm:block flex-shrink-0">{{ ep.desc }}</span>
                    <span v-if="ep.auth" class="text-xs px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 font-bold flex-shrink-0">🔒</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-base p-6">
            <h3 class="font-extrabold font-heading mb-4 flex items-center gap-2"><Code class="w-4 h-4 text-primary" />cURL 示例</h3>
            <pre class="bg-muted rounded-xl p-4 text-xs font-mono border-2 border-primary/20 overflow-x-auto leading-relaxed">{{ curlExample }}</pre>
          </div>
        </template>

        <template v-if="activeSection === 'extend'">
          <div class="card-base p-6">
            <h2 class="text-2xl font-extrabold font-heading mb-6">二次开发指南</h2>
            <div class="space-y-5">
              <div v-for="guide in extendGuides" :key="guide.title" class="p-5 rounded-xl border-2 border-primary/20">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-9 h-9 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center"><component :is="guide.icon" class="w-4 h-4 text-primary" /></div>
                  <h3 class="font-extrabold font-heading">{{ guide.title }}</h3>
                </div>
                <ol class="space-y-2 mb-4">
                  <li v-for="(step, i) in guide.steps" :key="i" class="flex gap-2 text-sm text-muted-foreground">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{{ i+1 }}</span>
                    <span>{{ step }}</span>
                  </li>
                </ol>
                <pre v-if="guide.code" class="bg-muted rounded-xl p-4 text-xs font-mono border-2 border-primary/20 overflow-x-auto">{{ guide.code }}</pre>
              </div>
            </div>
          </div>
          <div class="card-base p-6">
            <h3 class="font-extrabold font-heading mb-4 flex items-center gap-2"><Package class="w-4 h-4 text-primary" />嵌入式 Widget</h3>
            <p class="text-sm text-muted-foreground mb-4">一行 script 标签将任意智能体嵌入第三方网站：</p>
            <pre class="bg-muted rounded-xl p-4 text-xs font-mono border-2 border-primary/20 overflow-x-auto leading-relaxed">{{ widgetExample }}</pre>
          </div>
        </template>

        <template v-if="activeSection === 'faq'">
          <div class="card-base p-6">
            <h2 class="text-2xl font-extrabold font-heading mb-6">常见问题</h2>
            <div class="space-y-3">
              <div v-for="faq in faqs" :key="faq.q" class="border-2 border-primary/20 rounded-xl overflow-hidden">
                <button @click="faq.open = !faq.open" class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted transition-colors">
                  <span class="font-bold text-sm">{{ faq.q }}</span>
                  <ChevronDown :class="['w-4 h-4 text-primary transition-transform duration-200', faq.open ? 'rotate-180' : '']" />
                </button>
                <div v-show="faq.open" class="px-5 pb-4 text-sm text-muted-foreground border-t-2 border-primary/10 pt-3">
                  <p>{{ faq.a }}</p>
                  <pre v-if="faq.code" class="mt-3 bg-muted rounded-xl p-3 text-xs font-mono border border-primary/10 overflow-x-auto">{{ faq.code }}</pre>
                </div>
              </div>
            </div>
          </div>
        </template>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BookOpen, Layers, Zap, Globe, Code, Database, FolderTree, Settings, Package, ChevronDown, HelpCircle, Bot, Key, BarChart2, Mic, Users, Puzzle, Server, Lock } from 'lucide-vue-next'

const activeSection = ref('overview')

const sections = [
  { id: 'overview',   label: '项目概览', icon: BookOpen },
  { id: 'stack',      label: '技术栈',   icon: Layers },
  { id: 'quickstart', label: '快速开始', icon: Zap },
  { id: 'arch',       label: '架构说明', icon: Server },
  { id: 'api',        label: 'API 参考', icon: Code },
  { id: 'extend',     label: '二次开发', icon: Puzzle },
  { id: 'faq',        label: '常见问题', icon: HelpCircle },
]

const overviewCards = [
  { title: '智能体平台', icon: Bot,      bg: 'bg-primary/10',    color: 'text-primary',    desc: '创建、发布、嵌入自定义 AI 智能体，支持 RAG 知识库挂载与工具调用' },
  { title: '语音交互',   icon: Mic,      bg: 'bg-blue-500/10',   color: 'text-blue-500',   desc: '阿里云 ASR/TTS 流式语音，WebSocket 实时通信，150+ 音色可选' },
  { title: '知识库 RAG', icon: Database, bg: 'bg-green-500/10',  color: 'text-green-600',  desc: 'LanceDB 向量存储 + LangChain 检索，PDF/DOCX 文档智能问答' },
  { title: '嵌入插件',   icon: Package,  bg: 'bg-orange-500/10', color: 'text-orange-500', desc: '一行 script 标签将智能体嵌入任意第三方网站，零侵入' },
  { title: '多模型支持', icon: Layers,   bg: 'bg-purple-500/10', color: 'text-purple-500', desc: '兼容 OpenAI SDK，支持 DeepSeek、通义千问、SiliconFlow 等' },
  { title: '权限管理',   icon: Lock,     bg: 'bg-red-500/10',    color: 'text-red-500',    desc: 'RBAC 角色权限，JWT 认证，审计日志，API Key 独立管理' },
]

const techStack = [
  { title: '前端', icon: Globe, items: [
    { name: 'Vue 3',        version: '^3.4',   desc: 'Composition API + script setup' },
    { name: 'Vite',         version: '^5.0',   desc: '开发构建，支持 HTTPS Dev Server' },
    { name: 'Tailwind CSS', version: '^3.4',   desc: '原子化 CSS，CSS 变量主题系统' },
    { name: 'Reka UI',      version: '^2.7',   desc: 'WAI-ARIA 无障碍组件库' },
    { name: 'Vue Router',   version: '^4.6',   desc: '前端路由，beforeEach 认证守卫' },
    { name: 'Lucide Vue',   version: '^0.562', desc: '统一 SVG 图标库' },
    { name: 'VueUse',       version: '^14.1',  desc: '组合式工具函数集合' },
    { name: 'Axios',        version: '^1.13',  desc: 'HTTP 客户端，统一拦截器' },
  ]},
  { title: '后端', icon: Server, items: [
    { name: 'Node.js',    version: '>=18',   desc: 'ESM 模块，原生 async/await' },
    { name: 'Express',    version: '^4.18',  desc: 'Web 框架，模块化路由' },
    { name: 'MongoDB',    version: '^8.21',  desc: 'Mongoose ODM，业务数据存储' },
    { name: 'LanceDB',    version: '^0.23',  desc: '本地向量数据库，RAG 检索' },
    { name: 'LangChain',  version: '^1.2',   desc: 'RAG 管道，文档分割+检索' },
    { name: 'OpenAI SDK', version: '^4.20',  desc: '兼容所有 OpenAI 格式 API' },
    { name: 'ws',         version: '^8.14',  desc: 'WebSocket，ASR/TTS 流式' },
    { name: 'Winston',    version: '^3.19',  desc: '结构化日志，日志轮转' },
  ]},
]

const quickStartSteps = [
  { title: '克隆并安装依赖', desc: '使用 pnpm 安装所有依赖', code: 'git clone https://github.com/your-org/chart-ai.git\ncd chart-ai\npnpm install' },
  { title: '配置环境变量',   desc: '复制示例配置并填入密钥', code: 'cp backend/.env.example backend/.env' },
  { title: '启动开发服务器', desc: '同时启动前端 :5173 和后端 :3002', code: 'pnpm dev', note: '前端默认 HTTPS，浏览器提示证书警告时选择继续访问即可' },
  { title: '创建管理员账号', desc: '第一个注册用户自动成为管理员', code: 'curl -X POST http://localhost:3002/api/auth/register -H "Content-Type: application/json" -d \'{"username":"admin","email":"admin@example.com","password":"admin@123"}\'' },
  { title: '配置 AI 模型',   desc: '登录后进入系统设置配置模型参数', note: '访问 /settings/ai-config 填写 API Key 和 Base URL' },
]

const archModules = [
  { title: '智能体模块', path: 'backend/src/modules/agent/',     icon: Bot,      desc: '智能体 CRUD、版本管理、对话流、记忆系统。',      tags: ['agentController', 'agentService', 'AgentSchema'] },
  { title: '知识库模块', path: 'backend/src/modules/knowledge/', icon: Database, desc: '文档上传解析、向量化存储、LangChain RAG 管道。', tags: ['knowledgeService', 'vectorStoreService'] },
  { title: '工具模块',   path: 'backend/src/modules/tool/',      icon: Puzzle,   desc: '内置工具与自定义 HTTP 工具，智能体自动调用。',  tags: ['toolService', 'toolExecutor'] },
  { title: 'API 服务层', path: 'frontend/src/services/',         icon: Globe,    desc: 'apiService.js 封装所有请求，统一 401 跳转。',   tags: ['apiService.js', 'authStore.js'] },
]

const dbModels = [
  { name: 'User',          desc: '用户账号',   fields: ['username', 'email', 'role', 'isActive'] },
  { name: 'Agent',         desc: '智能体配置', fields: ['name', 'model', 'systemPrompt', 'isPublished'] },
  { name: 'Conversation',  desc: '对话记录',   fields: ['agentId', 'userId', 'messages'] },
  { name: 'KnowledgeBase', desc: '知识库',     fields: ['name', 'documents', 'userId'] },
  { name: 'ApiKey',        desc: 'API 密钥',   fields: ['key', 'userId', 'isActive', 'usageCount'] },
  { name: 'Config',        desc: '系统配置',   fields: ['aiModel', 'embedding', 'speech'] },
]

const apiGroups = [
  { title: '认证', icon: Key, endpoints: [
    { method: 'POST', path: '/auth/register',        desc: '注册新用户' },
    { method: 'POST', path: '/auth/login',           desc: '登录，返回 JWT Token' },
    { method: 'GET',  path: '/auth/me',              desc: '获取当前用户信息', auth: true },
    { method: 'POST', path: '/auth/logout',          desc: '登出', auth: true },
  ]},
  { title: '智能体', icon: Bot, endpoints: [
    { method: 'GET',    path: '/agent/published',   desc: '已发布智能体列表' },
    { method: 'GET',    path: '/agent/my-agents',   desc: '我的智能体', auth: true },
    { method: 'POST',   path: '/agent/create',      desc: '创建智能体', auth: true },
    { method: 'PUT',    path: '/agent/:id',         desc: '更新智能体', auth: true },
    { method: 'DELETE', path: '/agent/:id',         desc: '删除智能体', auth: true },
    { method: 'POST',   path: '/agent/:id/publish', desc: '发布/取消发布', auth: true },
  ]},
  { title: '知识库', icon: Database, endpoints: [
    { method: 'GET',    path: '/knowledge',               desc: '知识库列表', auth: true },
    { method: 'POST',   path: '/knowledge',               desc: '创建知识库', auth: true },
    { method: 'POST',   path: '/knowledge/:id/documents', desc: '上传文档', auth: true },
    { method: 'DELETE', path: '/knowledge/:id',           desc: '删除知识库', auth: true },
  ]},
  { title: '数据分析', icon: BarChart2, endpoints: [
    { method: 'GET', path: '/analytics/overview',    desc: '概览统计', auth: true },
    { method: 'GET', path: '/analytics/trend/daily', desc: '每日趋势', auth: true },
  ]},
  { title: '管理员', icon: Users, endpoints: [
    { method: 'GET', path: '/admin/users',     desc: '用户列表', auth: true },
    { method: 'PUT', path: '/admin/config/ai', desc: '保存 AI 配置', auth: true },
  ]},
]

function methodColor(m) {
  return { GET: 'bg-blue-500/10 text-blue-600', POST: 'bg-green-500/10 text-green-600', PUT: 'bg-orange-500/10 text-orange-600', DELETE: 'bg-red-500/10 text-red-600' }[m] || 'bg-muted text-muted-foreground'
}

const extendGuides = [
  { title: '新增后端 API 模块', icon: Server,
    steps: ['在 backend/src/modules/ 新建模块目录', '创建 controllers/、routes/、services/ 子目录', '在 routes/ 定义 Express Router', '在 backend/src/app.js 注册路由'],
    code: `// paymentRoutes.js
import { Router } from 'express'
const router = Router()
router.get('/', (req, res) => res.json({ ok: true }))
export default router` },
  { title: '新增前端页面', icon: Globe,
    steps: ['在 frontend/src/views/ 新建 .vue 文件', '在 router/index.js 注册路由', '在 services/ 新建 Service 调用 apiService', '在 AppLayout.vue 侧边栏添加链接'],
    code: `// paymentService.js
import apiService from './apiService.js'
export const getPayments = () => apiService.get('/payment')` },
  { title: '接入新 AI 模型', icon: Layers,
    steps: ['访问 /settings/ai-config 修改 API Key 和 Base URL', '任何兼容 OpenAI 格式的服务均可直接使用', '如需特殊处理，修改 backend/src/services/ai/aiService.js'] },
]

const faqs = ref([
  { q: 'MongoDB 连接失败怎么办？', open: false,
    a: '检查 backend/.env 中的 MONGODB_URI 是否正确，确认 MongoDB 服务已启动。',
    code: 'mongosh "mongodb://localhost:27017/chart-ai"' },
  { q: '前端浏览器提示 HTTPS 证书不安全？', open: false,
    a: 'Vite 开发服务器使用自签名证书，属于正常现象，点击高级继续访问即可。' },
  { q: '如何切换 AI 模型？', open: false,
    a: '访问「系统设置 → AI 模型配置」，修改 API Key、Base URL 和模型名称，支持任意 OpenAI 格式兼容接口。' },
  { q: '知识库查询不准确？', open: false,
    a: '确认已在「系统设置 → Embedding 配置」中配置有效的 Embedding 模型，推荐使用 BAAI/bge-m3。',
    code: 'EMBEDDING_MODEL=BAAI/bge-m3\nEMBEDDING_BASE_URL=https://api.siliconflow.cn/v1' },
  { q: '如何部署到生产环境？', open: false,
    a: '后端 pnpm start 直接运行，前端 pnpm build 后用 Nginx 托管 dist/ 目录，推荐 Nginx 反代后端 API 到同域。' },
  { q: 'API Key 和 JWT Token 有什么区别？', open: false,
    a: 'JWT Token 用于前端页面登录态，有效期短（默认 7 天）。API Key 是开发者集成用的长期密钥，在 API Keys 管理页创建。' },
])

const projectStructure = `chart-ai/
├── backend/src/
│   ├── modules/
│   │   ├── agent/       # 智能体：Controller / Service / Schema
│   │   ├── knowledge/   # 知识库 RAG：向量存储 / 文档处理
│   │   └── tool/        # 工具调用：内置工具 / 自定义工具
│   ├── routes/          # API 路由注册
│   ├── middleware/      # 认证 / 限流 / 安全中间件
│   ├── services/        # 业务服务 (AI / 语音 / 导出)
│   └── models/          # MongoDB Schema 定义
└── frontend/src/
    ├── views/           # 页面组件 (agent / chat / settings)
    ├── components/ui/   # 通用 UI 组件库
    ├── services/        # API 封装 (apiService.js)
    ├── stores/          # 状态管理 (authStore.js)
    └── router/          # 路由配置与守卫`

const envExample = `MONGODB_URI=mongodb://localhost:27017/chart-ai
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# AI 模型 (OpenAI 兼容接口)
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.deepseek.com/v1
DEFAULT_MODEL=deepseek-chat

# Embedding 模型
EMBEDDING_API_KEY=sk-xxx
EMBEDDING_BASE_URL=https://api.siliconflow.cn/v1
EMBEDDING_MODEL=BAAI/bge-m3

# 阿里云语音 (可选)
ALI_ACCESS_KEY_ID=xxx
ALI_ACCESS_KEY_SECRET=xxx
ALI_NLS_APP_KEY=xxx

PORT=3002`

const curlExample = `# 登录
curl -X POST http://localhost:3002/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin@123"}'

# 获取当前用户
curl http://localhost:3002/api/auth/me -H "Authorization: Bearer TOKEN"

# 获取已发布智能体
curl "http://localhost:3002/api/agent/published?page=1&limit=10"

# 创建知识库
curl -X POST http://localhost:3002/api/knowledge -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"name":"产品手册"}'`

const widgetExample = '<' + `script
  src="https://your-domain.com/widget.js"
  data-agent-id="AGENT_ID"
  data-title="AI 客服"
  data-position="bottom-right"
  data-theme="light"
>` + '</' + `script>

// 参数说明
// data-agent-id   必填，智能体 ID
// data-title      悬浮按钮标题
// data-position   bottom-right | bottom-left
// data-theme      light | dark | auto`
</script>
