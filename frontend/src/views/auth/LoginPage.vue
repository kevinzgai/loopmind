<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4 cartoon-bg">
    <!-- Background deco -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md animate-fade-in">
      <!-- Card -->
      <div class="bg-card border-2 border-primary rounded-2xl p-8 cartoon-shadow-lg">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 cartoon-shadow-dark">
            <Bot class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-2xl font-heading font-bold text-foreground tracking-tight">欢迎回来</h1>
          <p class="text-sm text-muted-foreground mt-1">登录您的 ChartAI 账户</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Error -->
          <div v-if="error" class="flex items-center gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm animate-fade-in">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ error }}</span>
          </div>

          <!-- Username -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">用户名</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                required
                class="pl-10 h-11"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">密码</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="请输入密码"
                required
                class="pl-10 pr-10 h-11"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Eye v-if="showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Options -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <CheckboxRoot v-model="rememberMe" class="w-4 h-4 rounded border border-border bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center transition-colors">
                <CheckboxIndicator><Check class="w-3 h-3 text-primary-foreground" /></CheckboxIndicator>
              </CheckboxRoot>
              <span class="text-sm text-muted-foreground">记住我</span>
            </label>
            <a href="#" class="text-sm text-primary hover:text-primary/80 transition-colors">忘记密码？</a>
          </div>

          <!-- Submit -->
          <Button
            type="submit"
            :disabled="isLoading"
            class="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm shadow-glow"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <span v-else>登录</span>
          </Button>
        </form>

        <!-- Footer -->
        <div class="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          还没有账户？
          <router-link to="/register" class="text-primary font-medium hover:text-primary/80 transition-colors ml-1">立即注册</router-link>
        </div>
      </div>

      <!-- Bottom badge -->
      <p class="text-center text-xs text-muted-foreground mt-4">
        安全加密 · 数据保护 · 隐私优先
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/stores/authStore.js'
import { Bot, User, Lock, Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'

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
