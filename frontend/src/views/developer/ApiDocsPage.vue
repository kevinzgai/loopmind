<template>
  <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 py-4 px-2">
    <!-- Left Sidebar Navigation -->
    <aside class="w-full lg:w-64 shrink-0">
      <div class="sticky top-6 space-y-6">
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">开发者中心</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">REST API 接口文档与集成指南</p>
        </div>

        <nav class="space-y-1">
          <div v-for="group in menuGroups" :key="group.title" class="py-2">
            <div class="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {{ group.title }}
            </div>
            <button v-for="item in group.items" :key="item.id" @click="scrollToSection(item.id)" :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
              activeSection === item.id
                ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            ]">
              <component :is="item.icon" class="w-4 h-4" v-if="item.icon" />
              {{ item.label }}
            </button>
          </div>
        </nav>

        <div
          class="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800/50">
          <h4 class="text-xs font-bold text-violet-700 dark:text-violet-300 mb-2 uppercase">需要 API Key?</h4>
          <p class="text-xs text-violet-600/80 dark:text-violet-400/80 mb-3">所有接口调用均需在 Header 中携带 API Key。</p>
          <router-link to="/profile"
            class="text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center hover:underline">
            立即去获取
            <ChevronRight class="w-3 h-3 ml-1" />
          </router-link>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 space-y-12 pb-20">
      <!-- Intro Section -->
      <section id="intro" class="scroll-mt-24">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">概览</h2>
        <div class="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
          <p>
            AI Pilot 提供的外部 API 允许开发者将平台上的智能体对话、知识库检索、语音识别及合成能力集成到自己的第三方应用中。
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <div class="text-xs font-medium text-slate-400 mb-1">Base URL</div>
              <div class="font-mono text-sm text-slate-700 dark:text-slate-200 break-all select-all">
                https://api.aipilot.com/api/external
              </div>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <div class="text-xs font-medium text-slate-400 mb-1">Authentication Header</div>
              <div class="font-mono text-sm text-slate-700 dark:text-slate-200 break-all select-all">
                X-API-Key: YOUR_API_KEY
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Agent Management -->
      <section id="agents" class="scroll-mt-24 space-y-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Box class="w-5 h-5" />
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">智能体管理</h2>
        </div>

        <!-- List Agents -->
        <ApiEndpoint method="GET" path="/agents" description="获取公开智能体列表。" :responseExample="{
          agents: [{ id: '679a...', name: '情感守护者', avatar: '❤️', category: '生活' }],
          total: 12
        }" :curl="`curl -X GET https://api.aipilot.com/api/external/agents \\
  -H 'X-API-Key: YOUR_API_KEY'`" />

        <ApiEndpoint method="GET" path="/agents/my" description="获取我创建的智能体列表。" :curl="`curl -X GET https://api.aipilot.com/api/external/agents/my \\
  -H 'X-API-Key: YOUR_API_KEY'`" />
      </section>

      <!-- Chat API -->
      <section id="chat" class="scroll-mt-24 space-y-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
            <MessageSquare class="w-5 h-5" />
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">对话交互 (Chat)</h2>
        </div>

        <ApiEndpoint method="POST" path="/agent/{agentId}/chat" description="与智能体进行对话，支持流式和非流式返回。" :parameters="[
          { name: 'message', type: 'string', required: true, desc: '用户输入的文本内容' },
          { name: 'stream', type: 'boolean', required: false, desc: '是否开启流式返回，默认为 false' },
          { name: 'conversationId', type: 'string', required: false, desc: '指定会话 ID 以维持上下文' }
        ]" :responseExample="{
            content: '你好！我是你的智能助手，有什么可以帮你的吗？',
            agent: { id: '...', name: '...' }
          }" :curl="`curl -X POST https://api.aipilot.com/api/external/agent/{agentId}/chat \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: YOUR_API_KEY' \\
  -d '{
    &quot;message&quot;: &quot;你好&quot;,
    &quot;stream&quot;: false
  }'`" />

        <ApiEndpoint method="POST" path="/agent/{agentId}/conversations" description="为指定智能体创建一个新会话。"
          :responseExample="{ conversationId: 'conv_123456' }" :curl="`curl -X POST https://api.aipilot.com/api/external/agent/{agentId}/conversations \\
  -H 'X-API-Key: YOUR_API_KEY'`" />
      </section>

      <!-- Knowledge API -->
      <section id="knowledge" class="scroll-mt-24 space-y-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Database class="w-5 h-5" />
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">知识库检索</h2>
        </div>

        <ApiEndpoint method="POST" path="/knowledge/{kbId}/query" description="从指定的知识库中检索相关文档内容。" :parameters="[
          { name: 'query', type: 'string', required: true, desc: '检索关键词' },
          { name: 'topK', type: 'number', required: false, desc: '返回最相关的文档数量，默认 3' }
        ]" :responseExample="{
            kbId: 'kb_001',
            results: [{ content: '匹配到的文档片段...', metadata: { source: 'manual.pdf' } }]
          }" :curl="`curl -X POST https://api.aipilot.com/api/external/knowledge/{kbId}/query \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: YOUR_API_KEY' \\
  -d '{
    &quot;query&quot;: &quot;如何使用&quot;,
    &quot;topK&quot;: 3
  }'`" />
      </section>

      <!-- Voice API -->
      <section id="voice" class="scroll-mt-24 space-y-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
            <Mic class="w-5 h-5" />
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">语音能力 (TTS & ASR)</h2>
        </div>

        <!-- TTS -->
        <ApiEndpoint method="POST" path="/tts" description="文字转语音 (TTS)。成功时直接返回音频二进制流。" :parameters="[
          { name: 'text', type: 'string', required: true, desc: '待转换文本' },
          { name: 'voice', type: 'string', required: false, desc: '音色 ID，如 anna, xiaoxian' },
          { name: 'format', type: 'string', required: false, desc: '音频格式: mp3, wav' }
        ]" :curl="`curl -X POST https://api.aipilot.com/api/external/tts \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: YOUR_API_KEY' \\
  -d '{
    &quot;text&quot;: &quot;欢迎使用开发者中心&quot;,
    &quot;voice&quot;: &quot;anna&quot;
  }' --output welcome.mp3`" />

        <!-- ASR -->
        <ApiEndpoint method="POST" path="/asr" description="语音识别 (ASR)。支持文件上传或 Base64。" :parameters="[
          { name: 'file', type: 'file', required: true, desc: '音频文件 (multipart/form-data)' },
          { name: 'format', type: 'string', required: false, desc: '音频格式，默认根据文件识别' }
        ]" :responseExample="{
            success: true,
            text: '识别出的文本内容'
          }" :curl="`curl -X POST https://api.aipilot.com/api/external/asr \\
  -H 'X-API-Key: YOUR_API_KEY' \\
  -F 'file=@audio.mp3'`" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  MessageSquare, Box, Database, Mic,
  ChevronRight, Copy, Check
} from 'lucide-vue-next'
import ApiEndpoint from '@/components/developer/ApiEndpoint.vue'

const activeSection = ref('intro')

const menuGroups = [
  {
    title: '基础信息',
    items: [
      { id: 'intro', label: '概览', icon: Box }
    ]
  },
  {
    title: '智能体服务',
    items: [
      { id: 'agents', label: '智能体管理', icon: Box },
      { id: 'chat', label: '对话交互', icon: MessageSquare }
    ]
  },
  {
    title: '高级能力',
    items: [
      { id: 'knowledge', label: '知识库检索', icon: Database },
      { id: 'voice', label: '语音 ASR/TTS', icon: Mic }
    ]
  }
]

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    activeSection.value = id
  }
}

// 简单的滚动监听更新 activeSection
const handleScroll = () => {
  const sections = ['intro', 'agents', 'chat', 'knowledge', 'voice']
  for (const id of sections) {
    const el = document.getElementById(id)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top >= 0 && rect.top <= 200) {
        activeSection.value = id
        break
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.prose {
  @apply text-sm leading-relaxed;
}
</style>
