<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4 oled-grid-bg">
    <!-- Background glow orbs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md animate-fade-in">
      <div class="bg-card border border-border rounded-2xl p-8 shadow-soft-lg">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-glow">
            <Bot class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-2xl font-heading font-bold text-foreground tracking-tight">创建账户</h1>
          <p class="text-sm text-muted-foreground mt-1">开始使用 ChartAI 智能助手</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
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
                v-model="form.username"
                type="text"
                placeholder="请输入用户名"
                required
                :disabled="isLoading"
                class="pl-10 h-11"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">邮箱</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="form.email"
                type="email"
                placeholder="请输入邮箱"
                required
                :disabled="isLoading"
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
                v-model="form.password"
                placeholder="请输入密码（至少6位）"
                required
                :disabled="isLoading"
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

          <!-- Confirm Password -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">确认密码</label>
            <div class="relative">
              <ShieldCheck class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                :type="showConfirm ? 'text' : 'password'"
                v-model="form.confirmPassword"
                placeholder="请再次输入密码"
                required
                :disabled="isLoading"
                class="pl-10 pr-10 h-11"
                :class="form.confirmPassword && form.password !== form.confirmPassword ? 'border-destructive' : ''"
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Eye v-if="showConfirm" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-xs text-destructive mt-1">密码不一致</p>
          </div>

          <!-- Submit -->
          <Button
            type="submit"
            :disabled="isLoading || (form.confirmPassword && form.password !== form.confirmPassword)"
            class="w-full h-11 mt-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-glow"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <span v-else>创建账户</span>
          </Button>
        </form>

        <div class="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          已有账户？
          <router-link to="/login" class="text-primary font-medium hover:text-primary/80 transition-colors ml-1">立即登录</router-link>
        </div>
      </div>

      <p class="text-center text-xs text-muted-foreground mt-4">
        注册即代表您同意我们的服务条款与隐私政策
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register, isLoading, error } from '@/stores/authStore.js'
import { Bot, User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const router = useRouter()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirm = ref(false)

const handleRegister = async () => {
  try {
    await register(form.value.username, form.value.email, form.value.password, form.value.confirmPassword)
    router.push('/login')
  } catch (err) {
    console.error('注册失败:', err)
  }
}
</script>
