<template>
  <div class="flex h-screen bg-background text-foreground font-sans overflow-hidden">
    <aside class="w-64 bg-card border-r border-border flex flex-col shrink-0 z-20">
      <div class="h-16 flex items-center px-5 border-b border-border">
        <div class="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center mr-3 text-white" style="box-shadow: 0 0 20px hsl(var(--primary) / 0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
            <path d="M8.5 8.5v.01"></path>
            <path d="M16 12l-2-2"></path>
            <path d="M12 16l-2-2"></path>
          </svg>
        </div>
        <span class="text-xl font-bold font-heading">AI Pilot</span>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">主要功能</div>

        <router-link to="/" class="sidebar-item" active-class="active">
          <LayoutDashboard class="w-5 h-5" />
          <span>仪表盘</span>
        </router-link>

        <router-link to="/agent/marketplace" class="sidebar-item" active-class="active">
          <Compass class="w-5 h-5" />
          <span>探索发现</span>
        </router-link>

        <router-link to="/agent/my-agents" v-if="isAuthenticated" class="sidebar-item" active-class="active">
          <Box class="w-5 h-5" />
          <span>我的智能体</span>
        </router-link>

        <router-link to="/chat" v-if="isAuthenticated" class="sidebar-item" active-class="active">
          <MessageSquare class="w-5 h-5" />
          <span>对话记录</span>
        </router-link>

        <router-link to="/developer/api" v-if="isAuthenticated" class="sidebar-item" active-class="active">
          <Code class="w-5 h-5" />
          <span>开发者中心</span>
        </router-link>

        <router-link to="/knowledge" v-if="isAuthenticated" class="sidebar-item" active-class="active">
          <Database class="w-5 h-5" />
          <span>知识库</span>
        </router-link>

        <router-link to="/analytics" v-if="isAuthenticated" class="sidebar-item" active-class="active">
          <BarChart2 class="w-5 h-5" />
          <span>数据分析</span>
        </router-link>

        <div v-permission="'admin'">
          <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3 px-3">系统管理</div>

          <router-link to="/settings" class="sidebar-item" exact-active-class="active">
            <Settings class="w-5 h-5" />
            <span>设置</span>
          </router-link>

          <router-link to="/settings/ai-config" class="sidebar-item" exact-active-class="active">
            <Cpu class="w-5 h-5" />
            <span>AI 模型配置</span>
          </router-link>

          <router-link to="/settings/embedding-config" class="sidebar-item" exact-active-class="active">
            <Brain class="w-5 h-5" />
            <span>Embedding 配置</span>
          </router-link>

          <router-link to="/settings/speech-config" class="sidebar-item" exact-active-class="active">
            <Mic class="w-5 h-5" />
            <span>语音服务配置</span>
          </router-link>

          <router-link to="/settings/logs" class="sidebar-item" exact-active-class="active">
            <FileText class="w-5 h-5" />
            <span>系统日志</span>
          </router-link>

          <router-link to="/settings/agent-categories" class="sidebar-item" exact-active-class="active">
            <Tag class="w-5 h-5" />
            <span>分类管理</span>
          </router-link>

          <router-link to="/settings/users" class="sidebar-item" exact-active-class="active">
            <Users class="w-5 h-5" />
            <span>账号管理</span>
          </router-link>
        </div>
      </nav>

      <div v-if="isAuthenticated" class="p-3 border-t border-border relative">
        <div v-if="isUserMenuOpen"
          class="absolute bottom-full left-3 right-3 mb-2 bg-card rounded-xl shadow-lg border border-border py-2 z-30 animate-fade-in">
          <router-link to="/profile" @click="isUserMenuOpen = false"
            class="flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <User class="w-4 h-4 mr-3" />
            个人中心
          </router-link>
          <router-link to="/profile" @click="isUserMenuOpen = false"
            class="flex items-center px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
            <ShieldCheck class="w-4 h-4 mr-3" />
            安全设置
          </router-link>
          <div class="h-px bg-border my-1 mx-2"></div>
          <button @click="handleLogout"
            class="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut class="w-4 h-4 mr-3" />
            退出登录
          </button>
        </div>

        <button @click="toggleUserMenu"
          class="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-muted transition-colors group cursor-pointer">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden border border-border group-hover:border-primary/30 transition-colors">
            <img v-if="currentUser?.profile?.avatar && currentUser.profile.avatar.startsWith('http')"
              :src="currentUser.profile.avatar" class="w-full h-full object-cover" />
            <span v-else-if="currentUser?.profile?.avatar" class="text-xl">{{ currentUser.profile.avatar }}</span>
            <User v-else class="w-5 h-5 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0 text-left">
            <div class="text-sm font-semibold truncate">{{ currentUser?.username || 'User' }}</div>
            <div class="text-xs text-muted-foreground truncate">{{ currentUser?.isSuperAdmin ? 'Administrator' : 'Free Plan' }}</div>
          </div>
          <ChevronUp :class="['w-4 h-4 text-muted-foreground transition-transform', isUserMenuOpen ? 'rotate-180' : '']" />
        </button>
      </div>
      <div v-else class="p-3 border-t border-border">
        <router-link to="/login" class="btn-primary w-full justify-center">
          立即登录
        </router-link>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-bold font-heading">{{ currentRouteName }}</h1>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative hidden sm:block group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="搜索..."
              class="h-9 pl-9 pr-4 bg-muted border-none rounded-lg text-sm w-56 focus:ring-2 focus:ring-primary/20 focus:bg-background text-foreground transition-all placeholder:text-muted-foreground" />
            <div class="absolute right-2 top-1/2 -translate-y-1/2">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-background text-muted-foreground border border-border">⌘K</span>
            </div>
          </div>

          <ThemeToggle />

          <button class="relative p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer">
            <Bell class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          </button>
        </div>
      </header>

      <div class="flex-1 flex flex-col min-h-0"
        :class="isFullScreenPage ? 'overflow-hidden' : 'overflow-y-auto p-6 lg:p-8'">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAuthenticated, currentUser, logout } from '@/stores/authStore.js'
import {
  Code, LayoutDashboard, Compass, Box, MessageSquare, Database, Settings, User, Search, Bell, LogOut, ChevronUp, ShieldCheck, Cpu, Brain, Mic, FileText, Users, Tag, BarChart2
} from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()

const isUserMenuOpen = ref(false)

const closeUserMenu = (e: MouseEvent) => {
  if (isUserMenuOpen.value) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', closeUserMenu)
})

const handleLogout = () => {
  logout()
  router.push('/login')
}

const toggleUserMenu = (e: Event) => {
  e.stopPropagation()
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const isFullScreenPage = computed(() => {
  return route.path.includes('/chat')
})

const currentRouteName = computed(() => {
  const map: Record<string, string> = {
    'Home': '概览',
    'Marketplace': '探索发现',
    'MyAgents': '我的智能体',
    'Chat': '对话记录',
    'Knowledge': '知识库',
    'Analytics': '数据分析',
    'Profile': '个人设置',
    'Settings': '系统设置',
    'ApiKeys': 'API Keys',
    'ApiKeysStats': 'API Key 统计',
    'Login': '登录',
    'Register': '注册',
    'ApiDocs': '开发者中心'
  }
  return map[route.name as string] || 'AI Pilot'
})
</script>
