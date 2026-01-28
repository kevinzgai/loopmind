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
            <router-link to="/knowledge" class="nav-link">知识库</router-link>
            <router-link v-if="isAdmin" to="/admin/system" class="nav-link">系统配置</router-link>
            <div class="nav-user">
              <span class="username">{{ currentUser?.username }}</span>
              <button @click="handleLogout" class="nav-btn">登出</button>
            </div>
          </template>
          
          <template v-else>
            <router-link to="/register" class="nav-link">注册</router-link>
            <router-link to="/login" class="nav-btn">登录</router-link>
          </template>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { initializeAuth, logout, isAuthenticated, currentUser, isAdmin } from '@/stores/authStore.js'

const router = useRouter()
const route = useRoute()

const isWidgetPage = computed(() => route.path.includes('/widget'))

onMounted(() => {
  // 初始化认证状态
  initializeAuth()
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  color: white;
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

.nav-btn {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.3);
}
</style>
