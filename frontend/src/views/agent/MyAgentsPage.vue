<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold font-heading tracking-tight">我的智能体</h1>
        <p class="text-base text-muted-foreground mt-2">管理和配置您的 AI 智能体</p>
      </div>
      <Button as-child class="shadow-glow">
        <router-link to="/agent/create" class="inline-flex items-center gap-2">
          <Plus class="w-4 h-4" />
          <span>创建智能体</span>
        </router-link>
      </Button>
    </div>

    <div v-if="isLoading" class="py-20 flex justify-center">
      <div class="flex flex-col items-center gap-4">
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </div>
    </div>

    <div v-else-if="error" class="p-5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
      <div class="flex items-center gap-3">
        <AlertCircle class="w-5 h-5" />
        <span class="font-medium">{{ error }}</span>
      </div>
    </div>

    <div v-else-if="agents.length === 0" class="py-20 text-center">
      <div class="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Bot class="w-12 h-12 text-primary" />
      </div>
      <h2 class="text-2xl font-bold font-heading mb-3">还没有创建智能体</h2>
      <p class="text-muted-foreground mb-8 text-base">点击下方按钮创建您的第一个 AI 智能体</p>
      <Button as-child class="shadow-glow">
        <router-link to="/agent/create" class="inline-flex items-center gap-2">
          <Plus class="w-4 h-4" />
          <span>创建智能体</span>
        </router-link>
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="agent in agents"
        :key="agent.id"
        class="card-base p-6 flex flex-col group cursor-pointer">
        <div class="flex items-start gap-4 mb-5">
          <div class="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:shadow-glow transition-all duration-200">
            <img
              v-if="agent.avatar && (agent.avatar.startsWith('http') || agent.avatar.startsWith('data:'))"
              :src="agent.avatar" :alt="agent.name" class="w-full h-full object-cover rounded-xl" />
            <span v-else-if="agent.avatar && agent.avatar.length <= 4" class="text-2xl">{{ agent.avatar }}</span>
            <Bot v-else class="w-7 h-7 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold font-heading text-base truncate">{{ agent.name }}</h3>
              <span :class="['badge flex-shrink-0 text-xs', agent.isPublished ? 'badge-success' : 'bg-muted text-muted-foreground']">
                {{ agent.isPublished ? '已发布' : '草稿' }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground">{{ getModelName(agent.model) }}</p>
          </div>
        </div>

        <p v-if="agent.description" class="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1 leading-relaxed">{{ agent.description }}</p>
        <div v-else class="flex-1 mb-5"></div>

        <div class="p-3 bg-muted/30 rounded-xl mb-5 border border-border">
          <div class="text-center">
            <p class="text-lg font-bold font-heading">{{ agent.userCount || 0 }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">对话用户数</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <Button as-child size="sm" class="flex-1">
            <router-link :to="`/agent/${agent.id}/chat`" class="inline-flex items-center gap-1.5">
              <MessageSquare class="w-3.5 h-3.5" /><span>对话</span>
            </router-link>
          </Button>
          <Button as-child variant="outline" size="sm" class="flex-1">
            <router-link :to="`/agent/${agent.id}/edit`" class="inline-flex items-center gap-1.5">
              <Edit class="w-3.5 h-3.5" /><span>编辑</span>
            </router-link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon-sm"><MoreVertical class="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-44">
              <DropdownMenuItem @click="showEmbedModal(agent)" class="cursor-pointer">
                <Code class="w-4 h-4 mr-2" /><span>获取嵌入代码</span>
              </DropdownMenuItem>
              <DropdownMenuItem v-if="!agent.isPublished" @click="handlePublish(agent.id)" :disabled="publishingId === agent.id" class="cursor-pointer">
                <Upload class="w-4 h-4 mr-2" /><span>{{ publishingId === agent.id ? '发布中...' : '发布' }}</span>
              </DropdownMenuItem>
              <DropdownMenuItem v-if="agent.isPublished" @click="handleUnpublish(agent.id)" :disabled="unpublishingId === agent.id" class="cursor-pointer">
                <Download class="w-4 h-4 mr-2" /><span>{{ unpublishingId === agent.id ? '下架中...' : '下架' }}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="handleDelete(agent.id)" :disabled="deletingId === agent.id" class="text-destructive cursor-pointer">
                <Trash2 class="w-4 h-4 mr-2" /><span>{{ deletingId === agent.id ? '删除中...' : '删除' }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <div v-if="total > limit" class="flex items-center justify-center gap-3 pt-6">
      <Button variant="outline" size="sm" @click="previousPage" :disabled="page === 1">
        <ChevronLeft class="w-4 h-4" /><span>上一页</span>
      </Button>
      <span class="text-sm text-muted-foreground px-2">第 {{ page }} / {{ pages }} 页</span>
      <Button variant="outline" size="sm" @click="nextPage" :disabled="page === pages">
        <span>下一页</span><ChevronRight class="w-4 h-4" />
      </Button>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showingEmbedModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showingEmbedModal = false">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-card rounded-2xl w-full max-w-lg overflow-hidden border border-border animate-scale-in">
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Code class="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 class="font-bold font-heading text-base">获取嵌入代码</h2>
                  <p class="text-xs text-muted-foreground">将智能体嵌入到您的网站</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" @click="showingEmbedModal = false">
                <X class="w-4 h-4" />
              </Button>
            </div>
            <div class="p-6">
              <p class="text-sm text-muted-foreground mb-4">将以下代码粘贴到您网站的 <code class="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">&lt;body&gt;</code> 标签底部：</p>
              <div class="relative bg-slate-950 rounded-xl p-4 mb-4 border border-slate-800">
                <pre class="text-sm text-slate-200 overflow-x-auto font-mono leading-relaxed"><code>{{ embedCode }}</code></pre>
                <Button variant="ghost" size="sm" @click="copyEmbedCode" class="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs">
                  <Copy class="w-3.5 h-3.5" /><span>{{ copied ? '已复制!' : '复制' }}</span>
                </Button>
              </div>
              <div class="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div class="flex items-start gap-3">
                  <Lightbulb class="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p class="text-sm text-muted-foreground">该插件会在页面右下角显示一个聊天气泡，访客可以随时与您的智能体对话。</p>
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
import { getMyAgents, publishAgent, unpublishAgent, deleteAgent } from '@/api/agent.api.ts'
import {
  Plus, Bot, MessageSquare, Edit, MoreVertical, Code, Upload, Download, Trash2,
  ChevronLeft, ChevronRight, X, Copy, Lightbulb, AlertCircle, Loader2
} from 'lucide-vue-next'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

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
    const res = await getMyAgents({ page: page.value, limit: limit.value })
    const data = res.data.data
    agents.value = data.agents || data.list || []
    total.value = data.total || 0
    pages.value = data.pages || data.totalPages || 1
  } catch (err) {
    error.value = err.message
    if (err.message.includes('登录已失效')) router.push('/login')
  } finally {
    isLoading.value = false
  }
}

const handlePublish = async (agentId) => {
  try {
    publishingId.value = agentId
    await publishAgent(agentId)
    await loadAgents()
  } catch (err) {
    error.value = err.message
    if (err.message.includes('登录已失效')) router.push('/login')
  } finally {
    publishingId.value = null
  }
}

const handleUnpublish = async (agentId) => {
  if (!confirm('确定要下架这个智能体吗？下架后将从广场中移除。')) return
  try {
    unpublishingId.value = agentId
    await unpublishAgent(agentId)
    await loadAgents()
  } catch (err) {
    error.value = err.message
    if (err.message.includes('登录已失效')) router.push('/login')
  } finally {
    unpublishingId.value = null
  }
}

const handleDelete = async (agentId) => {
  if (!confirm('确定要删除这个智能体吗？')) return
  try {
    deletingId.value = agentId
    await deleteAgent(agentId)
    await loadAgents()
  } catch (err) {
    error.value = err.message
    if (err.message.includes('登录已失效')) router.push('/login')
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
