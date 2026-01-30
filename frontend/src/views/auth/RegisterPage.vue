<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>注册</h1>
        <p>创建新账户</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- 邮箱输入 -->
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- 确认密码输入 -->
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            required
            :disabled="isLoading"
          />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- 注册按钮 -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </form>

      <!-- 登录链接 -->
      <div class="register-footer">
        <p>已有账户？<router-link to="/login">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, isLoading, error } from '@/stores/authStore.js'

const router = useRouter()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = async () => {
  try {
    await register(form.value.username, form.value.email, form.value.password, form.value.confirmPassword)
    // 注册成功，跳转到登录页
    router.push('/login')
  } catch (err) {
    // 错误已在 authStore 中处理
    console.error('注册失败:', err)
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
  padding: 20px;
}

.register-card {
  @apply bg-card text-card-foreground;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 40px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 28px;
  @apply text-foreground;
  margin-bottom: 8px;
}

.register-header p {
  @apply text-muted-foreground;
  font-size: 14px;
}

.register-form {
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

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  @apply text-muted-foreground;
}

.register-footer a {
  @apply text-primary;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.register-footer a:hover {
  @apply text-secondary;
}
</style>
