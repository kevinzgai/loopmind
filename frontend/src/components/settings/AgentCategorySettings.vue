<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-foreground">智能体分类管理</h2>
        <p class="text-sm text-muted-foreground mt-0.5">管理智能体广场的分类标签，修改后实时生效。</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增分类
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- 分类列表 -->
    <div v-else class="rounded-xl border border-border overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-muted/50 border-b border-border">
            <th class="text-left px-4 py-3 font-medium text-muted-foreground w-16">图标</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">标识 (value)</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">名称</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">描述</th>
            <th class="text-right px-4 py-3 font-medium text-muted-foreground w-28">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(cat, idx) in categories"
            :key="cat.value"
            class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
          >
            <td class="px-4 py-3 text-2xl">{{ cat.icon || '🏷️' }}</td>
            <td class="px-4 py-3">
              <code class="px-2 py-0.5 bg-muted rounded text-xs font-mono">{{ cat.value }}</code>
            </td>
            <td class="px-4 py-3 font-medium text-foreground">{{ cat.label }}</td>
            <td class="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{{ cat.desc || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="openEdit(cat, idx)"
                  class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="编辑"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="handleDelete(cat)"
                  class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="删除"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="5" class="text-center py-10 text-muted-foreground">暂无分类，点击右上角新增</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增 / 编辑 Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showModal = false">
      <div class="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-foreground mb-4">
          {{ editingCat ? '编辑分类' : '新增分类' }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">标识 (value) <span class="text-destructive">*</span></label>
            <input
              v-model="form.value"
              :disabled="!!editingCat"
              placeholder="例如：education（英文或中文，唯一）"
              class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">名称 <span class="text-destructive">*</span></label>
            <input
              v-model="form.label"
              placeholder="例如：教育"
              class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">图标（Emoji）</label>
            <input
              v-model="form.icon"
              placeholder="例如：🎓"
              class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">描述</label>
            <input
              v-model="form.desc"
              placeholder="简短描述该分类的用途"
              class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div v-if="formError" class="mt-3 text-sm text-destructive">{{ formError }}</div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="handleSave"
            :disabled="saving"
            class="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <div v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import apiService from '@/services/apiService.js'

const emit = defineEmits(['save', 'error'])

const loading = ref(false)
const saving = ref(false)
const categories = ref([])
const showModal = ref(false)
const editingCat = ref(null)
const formError = ref('')

const form = reactive({ value: '', label: '', icon: '', desc: '' })

async function loadCategories() {
  loading.value = true
  try {
    const res = await apiService.get('/admin/config/agent-categories')
    categories.value = res?.data?.categories ?? res?.categories ?? []
  } catch (err) {
    emit('error', err)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingCat.value = null
  formError.value = ''
  Object.assign(form, { value: '', label: '', icon: '🏷️', desc: '' })
  showModal.value = true
}

function openEdit(cat) {
  editingCat.value = cat
  formError.value = ''
  Object.assign(form, { value: cat.value, label: cat.label, icon: cat.icon || '', desc: cat.desc || '' })
  showModal.value = true
}

async function handleSave() {
  formError.value = ''
  if (!form.value.trim() || !form.label.trim()) {
    formError.value = '标识和名称不能为空'
    return
  }

  saving.value = true
  try {
    if (editingCat.value) {
      await apiService.put(`/admin/config/agent-categories/${encodeURIComponent(form.value)}`, {
        label: form.label,
        icon: form.icon,
        desc: form.desc
      })
    } else {
      await apiService.post('/admin/config/agent-categories', {
        value: form.value.trim(),
        label: form.label.trim(),
        icon: form.icon.trim() || '🏷️',
        desc: form.desc.trim()
      })
    }
    showModal.value = false
    await loadCategories()
    emit('save', editingCat.value ? '分类已更新' : '分类已创建')
  } catch (err) {
    formError.value = err.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function handleDelete(cat) {
  if (!confirm(`确定删除分类「${cat.label}」吗？已使用该分类的智能体不受影响。`)) return
  try {
    await apiService.delete(`/admin/config/agent-categories/${encodeURIComponent(cat.value)}`)
    await loadCategories()
    emit('save', '分类已删除')
  } catch (err) {
    emit('error', err)
  }
}

onMounted(loadCategories)
</script>
