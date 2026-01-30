<template>
  <div
    class="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans overflow-hidden transition-colors duration-300">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-20 transition-colors duration-300">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <div
          class="w-8 h-8 bg-violet-600 dark:bg-violet-700 rounded-lg flex items-center justify-center mr-3 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
            <path d="M8.5 8.5v.01"></path>
            <path d="M16 12l-2-2"></path>
            <path d="M12 16l-2-2"></path>
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Pilot</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">主要功能
        </div>

        <router-link to="/" active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors">
          <LayoutDashboard class="w-5 h-5 mr-3" />
          仪表盘
        </router-link>

        <router-link to="/agent/marketplace"
          active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors">
          <Compass class="w-5 h-5 mr-3" />
          探索发现
        </router-link>

        <router-link to="/agent/my-agents" v-if="isAuthenticated"
          active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors"
          @click="isMobileMenuOpen = false">
          <Box class="w-5 h-5 mr-3" />
          我的智能体
        </router-link>

        <router-link to="/chat" v-if="isAuthenticated"
          active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors"
          @click="isMobileMenuOpen = false">
          <MessageSquare class="w-5 h-5 mr-3" />
          对话记录
        </router-link>

        <div class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-8 mb-4 px-2">
          系统管理</div>

        <router-link to="/knowledge" v-if="isAuthenticated"
          active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors"
          @click="isMobileMenuOpen = false">
          <Database class="w-5 h-5 mr-3" />
          知识库
        </router-link>

        <router-link to="/developer/api"
          active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors"
          @click="isMobileMenuOpen = false">
          <Code class="w-5 h-5 mr-3" />
          开发者中心
        </router-link>

        <router-link to="/api-keys"
          active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors"
          @click="isMobileMenuOpen = false">
          <Key class="w-5 h-5 mr-3" />
          API Keys
        </router-link>

        <router-link to="/settings"
          active-class="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
          class="flex items-center px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-medium group transition-colors"
          @click="isMobileMenuOpen = false">
          <Settings class="w-5 h-5 mr-3" />
          设置
        </router-link>
      </nav>

      <!-- User Profile (Sidebar Bottom) -->
      <div v-if="isAuthenticated" class="p-4 border-t border-slate-200 dark:border-slate-800 relative">
        <!-- User Dropdown Menu -->
        <div v-if="isUserMenuOpen"
          class="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-30 animate-in fade-in slide-in-from-bottom-2">
          <router-link to="/profile" @click="isUserMenuOpen = false"
            class="flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <User class="w-4 h-4 mr-3" />
            个人中心
          </router-link>
          <router-link to="/profile" @click="isUserMenuOpen = false"
            class="flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <ShieldCheck class="w-4 h-4 mr-3" />
            安全设置
          </router-link>
          <div class="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
          <button @click="handleLogout"
            class="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <LogOut class="w-4 h-4 mr-3" />
            退出登录
          </button>
        </div>

        <button @click="toggleUserMenu"
          class="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
          <div
            class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600 group-hover:border-violet-400 transition-colors">
            <img v-if="currentUser?.profile?.avatar && currentUser.profile.avatar.startsWith('http')"
              :src="currentUser.profile.avatar" class="w-full h-full object-cover" />
            <span v-else-if="currentUser?.profile?.avatar" class="text-xl">{{ currentUser.profile.avatar }}</span>
            <User v-else class="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div class="flex-1 min-w-0 text-left">
            <div class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{
              currentUser?.username || 'User' }}</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate uppercase tracking-wider font-bold">{{
              currentUser?.role === 'admin' ? 'Administrator' : 'Free Plan' }}</div>
          </div>
          <ChevronUp :class="['w-4 h-4 text-slate-400 transition-transform', isUserMenuOpen ? 'rotate-180' : '']" />
        </button>
      </div>
      <div v-else class="p-4 border-t border-slate-200 dark:border-slate-800">
        <router-link to="/login"
          class="flex items-center justify-center w-full py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors">
          立即登录
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Header -->
      <header
        class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-300">
        <div class="flex items-center gap-4">
          <!-- Dynamic Title based on route (simplified) -->
          <h1 class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ currentRouteName }}</h1>
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <!-- Breadcrumbs or sub-nav could go here -->
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative hidden sm:block group">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-violet-500 transition-colors" />
            <input type="text" placeholder="搜索..."
              class="h-9 pl-9 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-violet-500/20 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-slate-600">⌘K</span>
            </div>
          </div>

          <ThemeToggle />

          <button
            class="relative p-2 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell class="w-5 h-5" />
            <span
              class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 flex flex-col min-h-0"
        :class="isFullScreenPage ? 'overflow-hidden' : 'overflow-y-auto p-6 lg:p-8 space-y-8 scroll-smooth'">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAuthenticated, currentUser, logout, isAdmin } from '@/stores/authStore.js'
import {
  Code,
  LayoutDashboard,
  Compass,
  Box,
  MessageSquare,
  Database,
  Settings,
  User,
  Search,
  Bell,
  Menu,
  LogOut,
  ChevronUp,
  ShieldCheck,
  Key
} from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const searchQuery = ref('')

// Close dropdown when clicking outside
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
  // Chat pages need full height and handle their own scrolling
  return route.path.includes('/chat')
})

const currentRouteName = computed(() => {
  // Simple mapping, can be expanded
  const map: Record<string, string> = {
    'Home': '概览',
    'Marketplace': '探索发现',
    'MyAgents': '我的智能体',
    'Chat': '对话记录',
    'Knowledge': '知识库',
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