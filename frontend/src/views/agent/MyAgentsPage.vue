<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold font-heading tracking-tight">我的智能体</h1>
        <p class="text-base text-muted-foreground mt-2">管理和配置您的 AI 智能体</p>
      </div>
      <router-link to="/agent/create" class="btn-primary">
        <Plus class="w-4 h-4" />
        <span>创建智能体</span>
      </router-link>
    </div>

    <div v-if="isLoading" class="py-20 flex justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <span class="text-sm text-muted-foreground">加载中...</span>
      </div>
    </div>

    <div v-else-if="error" class="p-5 rounded-xl bg-red-500/10 border-2 border-red-500/20 text-red-600 dark:text-red-400">
      <div class="flex items-center gap-3">
        <AlertCircle class="w-6 h-6" />
        <span class="font-medium">{{ error }}</span>
      </div>
    </div>

    <div v-else-if="agents.length === 0" class="py-20 text-center">
      <div class="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
        <Bot class="w-12 h-12 text-primary" />
      </div>
      <h2 class="text-2xl font-bold font-heading mb-3">还没有创建智能体</h2>
      <p class="text-muted-foreground mb-8 text-lg">点击下方按钮创建您的第一个 AI 智能体</p>
      <router-link to="/agent/create" class="btn-primary inline-flex">
        <Plus class="w-4 h-4" />
        <span>创建智能体</span>
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="agent in agents" 
        :key="agent.id"
        class="card-base p-6 flex flex-col group border-2 border-border hover:border-primary/50 transition-colors duration-200">
        <div class="flex items-start gap-4 mb-5">
          <div class="w-16 h-16 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
            <img 
              v-if="agent.avatar && (agent.avatar.startsWith('http') || agent.avatar.startsWith('data:'))" 
              :src="agent.avatar" 
              :alt="agent.name" 
              class="w-full h-full object-cover rounded-xl" />
            <span v-else-if="agent.avatar" class="text-4xl">{{ agent.avatar }}</span>
            <Bot v-else class="w-8 h-8 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-bold font-heading text-lg truncate">{{ agent.name }}</h3>
              <span 
                :class="[
                  'badge flex-shrink-0 text-xs px-2.5 py-1 rounded-md',
                  agent.isPublished ? 'badge-success' : 'bg-muted text-muted-foreground'
                ]">
                {{ agent.isPublished ? '已发布' : '草稿' }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground font-medium">{{ getModelName(agent.model) }}</p>
          </div>
        </div>

        <p v-if="agent.description" class="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1 leading-relaxed">
          {{ agent.description }}
        </p>

        <div class="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl mb-5 border border-border">
          <div class="text-center">
            <p class="text-xl font-bold font-heading text-foreground">{{ agent.usageCount || 0 }}</p>
            <p class="text-xs text-muted-foreground mt-1">使用次数</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold font-heading text-foreground">{{ agent.userCount || 0 }}</p>
            <p class="text-xs text-muted-foreground mt-1">用户数</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-bold font-heading text-foreground">{{ agent.conversationCount || 0 }}</p>
            <p class="text-xs text-muted-foreground mt-1">对话数</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <router-link 
            :to="`/agent/${agent.id}/chat`"
            class="btn-primary flex-1 text-sm py-2.5">
            <MessageSquare class="w-4 h-4" />
            <span>对话</span>
          </router-link>
          <router-link 
            :to="`/agent/${agent.id}/edit`"
            class="btn-ghost flex-1 text-sm py-2.5">
            <Edit class="w-4 h-4" />
            <span>编辑</span>
          </router-link>
          <DropdownMenu>
            <DropdownMenuTrigger class="p-2.5 hover:bg-muted rounded-lg transition-colors duration-200 cursor-pointer">
              <MoreVertical class="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-44">
              <DropdownMenuItem @click="showEmbedModal(agent)" class="cursor-pointer">
                <Code class="w-4 h-4 mr-2" />
                <span>获取嵌入代码</span>
              </DropdownMenuItem>
              <DropdownMenuItem v-if="!agent.isPublished" @click="handlePublish(agent.id)" :disabled="publishingId === agent.id" class="cursor-pointer">
                <Upload class="w-4 h-4 mr-2" />
                <span>{{ publishingId === agent.id ? '发布中...' : '发布' }}</span>
              </DropdownMenuItem>
              <DropdownMenuItem v-if="agent.isPublished" @click="handleUnpublish(agent.id)" :disabled="unpublishingId === agent.id" class="cursor-pointer">
                <Download class="w-4 h-4 mr-2" />
                <span>{{ unpublishingId === agent.id ? '下架中...' : '下架' }}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleDelete(agent.id)" :disabled="deletingId === agent.id" class="text-red-600 dark:text-red-400 cursor-pointer">
                <Trash2 class="w-4 h-4 mr-2" />
                <span>{{ deletingId === agent.id ? '删除中...' : '删除' }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <div v-if="total > limit" class="flex items-center justify-center gap-4 pt-6">
      <button
        @click="previousPage"
        :disabled="page === 1"
        class="btn-ghost text-sm py-2.5 px-5">
        <ChevronLeft class="w-4 h-4" />
        <span>上一页</span>
      </button>
      <span class="text-sm text-muted-foreground px-4 font-medium">
        第 {{ page }} / {{ pages }} 页
      </span>
      <button
        @click="nextPage"
        :disabled="page === pages"
        class="btn-ghost text-sm py-2.5 px-5">
        <span>下一页</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showingEmbedModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showingEmbedModal = false">
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div class="relative bg-card rounded-2xl w-full max-w-lg overflow-hidden border-2 border-border animate-scale-in">
            <div class="flex items-center justify-between px-6 py-5 border-b-2 border-border">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <Code class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 class="font-bold font-heading text-lg">获取嵌入代码</h2>
                  <p class="text-xs text-muted-foreground">将智能体嵌入到您的网站</p>
                </div>
              </div>
              <button 
                @click="showingEmbedModal = false" 
                class="p-2 hover:bg-muted rounded-lg transition-colors duration-200 cursor-pointer">
                <X class="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div class="p-6">
              <p class="text-sm text-muted-foreground mb-5 leading-relaxed">
                将以下代码复制并粘贴到您网站的 <code class="px-2 py-1 bg-muted rounded text-xs font-mono">&lt;body&gt;</code> 标签底部：
              </p>
              
              <div class="relative bg-slate-900 dark:bg-slate-950 rounded-xl p-5 mb-5 border-2 border-slate-800">
                <pre class="text-sm text-slate-200 overflow-x-auto font-mono leading-relaxed"><code>{{ embedCode }}</code></pre>
                <button 
                  @click="copyEmbedCode"
                  class="absolute top-4 right-4 btn-ghost text-xs py-2 px-3.5 bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Copy class="w-3.5 h-3.5" />
                  <span>{{ copied ? '已复制!' : '复制' }}</span>
                </button>
              </div>

              <div class="p-5 bg-primary/5 border-2 border-primary/10 rounded-xl">
                <div class="flex items-start gap-3">
                  <Lightbulb class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div class="text-sm">
                    <p class="font-medium text-foreground mb-1">使用提示</p>
                    <p class="text-muted-foreground leading-relaxed">该插件会在页面右下角显示一个聊天气泡，访客可以随时与您的智能体对话。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { token } from '@/stores/authStore.js'
import { getUserAgents, publishAgent, unpublishAgent, deleteAgent } from '@/services/agentService.js'
import {
  Plus, Bot, MessageSquare, Edit, MoreVertical, Code, Upload, Download, Trash2,
  ChevronLeft, ChevronRight, X, Copy, Lightbulb, AlertCircle
} from 'lucide-vue-next'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const router = useRouter()

const agents = ref([])
const isLoading = ref(false)
const error = ref(null)
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const pages = ref(0)
const publishingId = ref(null)
const unpublishingId = ref(null)
const deletingId = ref(null)

const showingEmbedModal = ref(false)
const selectedAgent = ref(null)
const copied = ref(false)

const embedCode = computed(() => {
  if (!selectedAgent.value) return ''
  const baseUrl = window.location.origin
  return `<script src="${baseUrl}/widget.js" data-agent-id="${selectedAgent.value.id}"><\/script>`
})

const showEmbedModal = (agent) => {
  selectedAgent.value = agent
  showingEmbedModal.value = true
  copied.value = false
}

const copyEmbedCode = async () => {
  try {
    await navigator.clipboard.writeText(embedCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    // 忽略复制失败
  }
}

const getModelName = (model) => {
  const models = {
    deepseek: 'DeepSeek',
    qwen: '通义千问'
  }
  return models[model] || model
}

const loadAgents = async () => {
  try {
    isLoading.value = true
    error.value = null

    const result = await getUserAgents(page.value, limit.value)
    agents.value = result.agents
    total.value = result.total
    pages.value = result.pages
  } catch (err) {
    error.value = err.message
    
    if (err.message.includes('登录已失效')) {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

const handlePublish = async (agentId) => {
  try {
    publishingId.value = agentId
    await publishAgent(agentId, token.value)
    await loadAgents()
  } catch (err) {
    error.value = err.message
    
    if (err.message.includes('登录已失效')) {
      router.push('/login')
    }
  } finally {
    publishingId.value = null
  }
}

const handleUnpublish = async (agentId) => {
  if (!confirm('确定要下架这个智能体吗？下架后将从广场中移除。')) {
    return
  }

  try {
    unpublishingId.value = agentId
    await unpublishAgent(agentId, token.value)
    await loadAgents()
  } catch (err) {
    error.value = err.message
    
    if (err.message.includes('登录已失效')) {
      router.push('/login')
    }
  } finally {
    unpublishingId.value = null
  }
}

const handleDelete = async (agentId) => {
  if (!confirm('确定要删除这个智能体吗？')) {
    return
  }

  try {
    deletingId.value = agentId
    await deleteAgent(agentId, token.value)
    await loadAgents()
  } catch (err) {
    error.value = err.message
    
    if (err.message.includes('登录已失效')) {
      router.push('/login')
    }
  } finally {
    deletingId.value = null
  }
}

const previousPage = () => {
  if (page.value > 1) {
    page.value--
    loadAgents()
  }
}

const nextPage = () => {
  if (page.value < pages.value) {
    page.value++
    loadAgents()
  }
}

onMounted(() => {
  loadAgents()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
</style>
