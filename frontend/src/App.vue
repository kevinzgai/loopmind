<template>
  <div id="app">
    <nav v-if="!isWidgetPage" class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand" style="text-decoration: none; color: white;">AI Chat</router-link>
        <div class="nav-menu">
          <router-link to="/" class="nav-link">首页</router-link>
          
          <template v-if="isAuthenticated">
            <router-link to="/chat" class="nav-link">对话</router-link>
            <router-link to="/agent/my-agents" class="nav-link">我的智能体</router-link>
            <router-link to="/agent/capabilities" class="nav-link">能力矩阵</router-link>
            <router-link to="/knowledge" class="nav-link">知识库</router-link>
            <router-link v-if="isAdmin" to="/admin/system" class="nav-link">系统配置</router-link>
            <div class="nav-user">
              <router-link to="/profile" class="nav-link username-link">
                <span class="user-avatar">{{ currentUser?.profile?.avatar || '👤' }}</span>
                <span class="username">{{ currentUser?.username }}</span>
              </router-link>
              <button @click="handleLogout" class="nav-btn">登出</button>
            </div>
          </template>
          
          <template v-else>
            <router-link to="/register" class="nav-link">注册</router-link>
            <router-link to="/login" class="nav-btn">登录</router-link>
          </template>
          <ThemeToggle />
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { initializeAuth, logout, isAuthenticated, currentUser, isAdmin } from '@/stores/authStore.js'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const route = useRoute()
const { theme } = useTheme()

const isWidgetPage = computed(() => route.path.includes('/widget'))

onMounted(() => {
  console.log('App mounted, initializing auth...')
  initializeAuth()
})

watch(isAuthenticated, (newVal) => {
  console.log('isAuthenticated changed:', newVal)
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.navbar {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  @apply text-primary-foreground;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.nav-brand {
  font-size: 20px;
  font-weight: 600;
  @apply text-primary-foreground;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  @apply text-primary-foreground;
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  font-size: 14px;
}

.username-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none !important;
}

.user-avatar {
  font-size: 18px;
  background: hsla(var(--primary-foreground) / 0.2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-btn {
  padding: 6px 16px;
  background: hsla(var(--primary-foreground) / 0.2);
  @apply text-primary-foreground border-primary-foreground/30;
  border-width: 1px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: hsla(var(--primary-foreground) / 0.3);
}
</style>
