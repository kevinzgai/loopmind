<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>登录</h1>
        <p>欢迎回来</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" v-model="form.username" type="text" placeholder="请输入用户名" required
            :disabled="isLoading" />
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="form.password" type="password" placeholder="请输入密码" required
            :disabled="isLoading" />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- 登录按钮 -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册链接 -->
      <div class="login-footer">
        <p>还没有账户？<router-link to="/register">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { login, isLoading, error, isAuthenticated } from '@/stores/authStore.js'

const router = useRouter()

const form = ref({
  username: '',
  password: ''
})

// 如果已经登录，直接跳转到首页
onMounted(() => {
  if (isAuthenticated.value) {
    console.log('User already authenticated, redirecting to home...')
    router.push('/')
  }
})

// 监听登录状态，一旦成功立即跳转
watch(isAuthenticated, (newVal) => {
  if (newVal) {
    console.log('Login state changed to authenticated, redirecting...')
    router.push('/')
  }
})

const handleLogin = async () => {
  console.log('Attempting login for:', form.value.username)
  try {
    const response = await login(form.value.username, form.value.password)
    console.log('Login response received:', response)
    // 登录成功，尝试跳转
    console.log('Calling router.replace("/")')
    await router.replace('/')
    console.log('router.replace("/") called')
  } catch (err) {
    // 错误已在 authStore 中处理
    console.error('登录失败:', err)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  padding: 20px;
}

.login-card {
  @apply bg-card text-card-foreground;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  @apply text-foreground;
  margin-bottom: 8px;
}

.login-header p {
  @apply text-muted-foreground;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  @apply text-foreground;
}

.form-group input {
  padding: 12px;
  @apply border-input bg-background text-foreground;
  border-width: 1px;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  @apply border-primary ring-offset-background;
  box-shadow: 0 0 0 3px hsla(var(--primary) / 0.1);
}

.form-group input:disabled {
  @apply bg-muted text-muted-foreground;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  @apply bg-destructive/10 border-destructive text-destructive;
  border-width: 1px;
  border-radius: 6px;
  font-size: 14px;
}

.submit-btn {
  padding: 12px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  @apply text-primary-foreground;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px hsla(var(--primary) / 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  @apply text-muted-foreground;
}

.login-footer a {
  @apply text-primary;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.login-footer a:hover {
  @apply text-secondary;
}
</style>
