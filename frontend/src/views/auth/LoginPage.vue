<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <div class="logo-icon">
            <Bot class="w-7 h-7 text-white" />
          </div>
          <span class="logo-text">AI Pilot</span>
        </div>
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录您的账户继续使用</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="error" class="error-message">
          <AlertCircle class="w-4 h-4" />
          <span>{{ error }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">用户名</label>
          <div class="input-wrapper">
            <User class="input-icon" />
            <input
              type="text"
              v-model="username"
              placeholder="请输入用户名"
              required
              class="input-base pl-10"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="input-wrapper">
            <Lock class="input-icon" />
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="请输入密码"
              required
              class="input-base pl-10"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="password-toggle"
            >
              <Eye v-if="showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="rememberMe" class="checkbox" />
            <span class="checkbox-label">记住我</span>
          </label>
          <a href="#" class="forgot-link">忘记密码？</a>
        </div>

        <button type="submit" :disabled="isLoading" class="submit-btn">
          <Loader v-if="isLoading" class="w-5 h-5 animate-spin" />
          <span v-else>登录</span>
        </button>
      </form>

      <div class="login-footer">
        <span>还没有账户？</span>
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/stores/authStore.js'
import { Bot, User, Lock, Eye, EyeOff, AlertCircle, Loader } from 'lucide-vue-next'

const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await login(username.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message || '登录失败，请检查用户名和密码'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  @apply bg-background;
}

.login-card {
  width: 100%;
  max-width: 420px;
  @apply bg-card border border-border rounded-2xl p-8;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 1px solid;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 3rem;
  height: 3rem;
  @apply rounded-xl flex items-center justify-center;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  @apply text-foreground;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  @apply text-foreground;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  @apply text-muted-foreground;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  @apply text-foreground;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  @apply text-muted-foreground;
  width: 1.25rem;
  height: 1.25rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  @apply text-muted-foreground hover:text-foreground transition-colors;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  @apply bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  @apply accent-primary;
}

.checkbox-label {
  font-size: 0.875rem;
  @apply text-muted-foreground;
}

.forgot-link {
  font-size: 0.875rem;
  @apply text-primary hover:text-primary/80 transition-colors;
  text-decoration: none;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  @apply text-white font-medium rounded-xl;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid;
  @apply border-border text-muted-foreground text-sm;
}

.login-footer a {
  @apply text-primary font-medium hover:text-primary/80 transition-colors ml-1;
}
</style>
