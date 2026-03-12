<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold font-heading tracking-tight">知识库管理</h1>
        <p class="text-base text-muted-foreground mt-1">上传并管理私有文档，让智能体具备专业知识</p>
      </div>
      <Button @click="showCreateKBModal = true" class="shadow-glow">
        <Plus class="w-4 h-4" /><span>新建知识库</span>
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-12 flex justify-center">
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="w-8 h-8 animate-spin text-primary" />
        <span class="text-sm text-muted-foreground">正在加载知识库...</span>
      </div>
    </div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="kbs.length === 0" class="py-20 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <BookOpen class="w-10 h-10 text-primary" />
        </div>
        <h3 class="text-xl font-bold font-heading mb-2">暂无知识库</h3>
        <p class="text-muted-foreground mb-6">创建一个知识库并上传文档，开始构建你的 RAG 应用</p>
        <Button variant="outline" @click="showCreateKBModal = true">立即创建</Button>
      </div>

      <template v-else>
        <!-- KB Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="kb in kbs"
            :key="kb.id"
            @click="selectKB(kb)"
            :class="[
              'card-base p-4 cursor-pointer group transition-all duration-200',
              selectedKB?.id === kb.id ? 'border-primary/50 shadow-glow bg-primary/5' : ''
            ]">
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:shadow-glow transition-all">
                <Database class="w-5 h-5 text-primary" />
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                @click.stop="handleDeleteKB(kb)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                <Trash2 class="w-3.5 h-3.5" />
              </Button>
            </div>
            <h3 class="font-bold text-sm mb-1 truncate">{{ kb.name }}</h3>
            <p class="text-xs text-muted-foreground mb-3 line-clamp-2">{{ kb.description || '暂无描述' }}</p>
            <div class="flex items-center gap-3 text-xs text-muted-foreground">
              <span class="flex items-center gap-1"><FileText class="w-3 h-3" />{{ kb.documentCount }} 文档</span>
              <span class="flex items-center gap-1"><Layers class="w-3 h-3" />{{ kb.chunkCount }} 片段</span>
            </div>
          </div>
        </div>

        <!-- Doc Section -->
        <div v-if="selectedKB" class="bg-card border border-border rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <div class="flex items-center gap-2">
              <Database class="w-4 h-4 text-primary" />
              <h2 class="font-bold text-sm">{{ selectedKB.name }}</h2>
              <span class="text-xs text-muted-foreground">- 文档列表</span>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" size="sm" @click="selectKB(selectedKB)" :disabled="docsLoading">
                <RefreshCw :class="['w-3.5 h-3.5', docsLoading ? 'animate-spin' : '']" /><span>刷新</span>
              </Button>
              <input type="file" ref="fileInput" class="hidden" accept=".pdf,.docx,.txt" @change="handleFileUpload" />
              <Button size="sm" @click="$refs.fileInput.click()" :disabled="uploading" class="shadow-glow">
                <Loader2 v-if="uploading" class="w-3.5 h-3.5 animate-spin" />
                <Upload v-else class="w-3.5 h-3.5" />
                <span>{{ uploading ? '上传中...' : '上传文档' }}</span>
              </Button>
            </div>
          </div>

          <div v-if="docsLoading" class="py-10 flex justify-center">
            <Loader2 class="w-6 h-6 animate-spin text-primary" />
          </div>

          <div v-else-if="documents.length === 0" class="py-12 text-center text-muted-foreground">
            <FileText class="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p class="text-sm">该知识库下暂无文档，请上传文件</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/30">
                  <th class="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-2/5">文件名</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-16">类型</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-20">大小</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-24">状态</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-20">片段</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-36">上传时间</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in documents" :key="doc.id" class="border-b border-border hover:bg-muted/20 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <FileText class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span class="truncate font-medium max-w-xs" :title="doc.name">{{ doc.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs px-2 py-0.5 bg-muted rounded font-mono font-medium">{{ formatDocType(doc.type, doc.name) }}</span>
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">{{ formatFileSize(doc.fileSize) }}</td>
                  <td class="px-4 py-3">
                    <span :class="[
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      doc.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      doc.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' :
                      doc.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    ]">{{ formatStatus(doc.status) }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <button v-if="doc.status === 'completed'" @click="handleViewChunks(doc)" class="text-primary text-xs hover:underline cursor-pointer">{{ doc.chunkCount }} 片段</button>
                    <span v-else class="text-muted-foreground text-xs">{{ doc.chunkCount || 0 }}</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-muted-foreground">{{ new Date(doc.createdAt).toLocaleString() }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button v-if="doc.status === 'pending' || doc.status === 'failed'" @click="handlePreviewChunks(doc)" class="text-xs text-primary hover:underline cursor-pointer">预览分段</button>
                      <button v-if="doc.status === 'pending' || doc.status === 'failed'" @click="handleProcessDoc(doc)" class="text-xs text-primary hover:underline cursor-pointer">执行解析</button>
                      <button @click="handleDeleteDoc(doc)" class="text-xs text-destructive hover:underline cursor-pointer">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>

    <!-- Chunks Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showChunksModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showChunksModal = false">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in">
            <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <h2 class="font-bold font-heading text-base">{{ isPreviewMode ? '文档切分预览' : '文档片段' }}</h2>
                <p class="text-xs text-muted-foreground mt-0.5">{{ viewingDoc?.name }}</p>
              </div>
              <Button variant="ghost" size="icon-sm" @click="showChunksModal = false"><X class="w-4 h-4" /></Button>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <div v-if="isPreviewMode" class="flex items-start gap-2 p-3 mb-4 bg-primary/5 border border-primary/20 rounded-xl text-sm text-primary">
                <Info class="w-4 h-4 shrink-0 mt-0.5" />
                <span>当前为预览模式，仅展示文本切分结果。点击「执行解析」后才会消耗 Token 进行向量化。</span>
              </div>
              <div v-if="chunksLoading" class="py-10 flex justify-center">
                <Loader2 class="w-6 h-6 animate-spin text-primary" />
              </div>
              <div v-else-if="chunks.length === 0" class="py-12 text-center text-muted-foreground">
                <p>未找到解析片段</p>
              </div>
              <div v-else class="space-y-3">
                <div v-for="(chunk, index) in chunks" :key="index" class="bg-muted/30 border border-border rounded-xl p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold font-mono text-primary">#{{ index + 1 }}</span>
                    <span class="text-xs text-muted-foreground">{{ chunk.content.length }} 字符</span>
                  </div>
                  <p class="text-xs leading-relaxed text-foreground whitespace-pre-wrap break-all">{{ chunk.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Create KB Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateKBModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showCreateKBModal = false">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-6">
              <h2 class="font-bold font-heading text-lg">新建知识库</h2>
              <Button variant="ghost" size="icon-sm" @click="showCreateKBModal = false"><X class="w-4 h-4" /></Button>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">名称</label>
                <Input v-model="newKB.name" placeholder="例如：产品说明书" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">描述</label>
                <Textarea v-model="newKB.description" placeholder="简单介绍一下这个知识库的内容..." :rows="3" class="resize-none" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <Button variant="outline" @click="showCreateKBModal = false">取消</Button>
              <Button @click="handleCreateKB" :disabled="!newKB.name" class="shadow-glow">确定创建</Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import {
  getKnowledgeBases, createKnowledgeBase, getDocuments, uploadDocument,
  deleteDocument, processDocument, deleteKnowledgeBase, getDocumentChunks, previewDocumentChunks
} from '@/services/knowledgeService'
import { Plus, Loader2, BookOpen, Database, FileText, Layers, Trash2, RefreshCw, Upload, X, Info } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const kbs = ref([])
const loading = ref(true)
const selectedKB = ref(null)
const documents = ref([])
const docsLoading = ref(false)
const showCreateKBModal = ref(false)
const uploading = ref(false)
const showChunksModal = ref(false)
const chunksLoading = ref(false)
const chunks = ref([])
const viewingDoc = ref(null)
const isPreviewMode = ref(false)
const fileInput = ref(null)

const newKB = reactive({ name: '', description: '' })

const loadKBs = async () => {
  try {
    loading.value = true
    const res = await getKnowledgeBases()
    kbs.value = res.kbs || []
    if (kbs.value.length > 0 && !selectedKB.value) {
      selectKB(kbs.value[0])
    } else if (selectedKB.value) {
      const updated = kbs.value.find(k => k.id === selectedKB.value.id)
      if (updated) selectedKB.value = updated
    }
  } catch (error) {
    console.error('获取知识库失败:', error)
    kbs.value = []
  } finally {
    loading.value = false
  }
}

const selectKB = async (kb) => {
  selectedKB.value = kb
  docsLoading.value = true
  try {
    const res = await getDocuments(kb.id)
    documents.value = res.docs || []
  } catch (error) {
    console.error('获取文档失败:', error)
    documents.value = []
  } finally {
    docsLoading.value = false
  }
}

const handleCreateKB = async () => {
  try {
    await createKnowledgeBase(newKB)
    showCreateKBModal.value = false
    newKB.name = ''
    newKB.description = ''
    await loadKBs()
  } catch (error) {
    alert('创建失败: ' + error.message)
  }
}

const handleDeleteKB = async (kb) => {
  if (!confirm(`确定要删除知识库 "${kb.name}" 吗？这将删除该库下的所有文档及向量数据。`)) return
  try {
    await deleteKnowledgeBase(kb.id)
    if (selectedKB.value?.id === kb.id) selectedKB.value = null
    await loadKBs()
  } catch (error) {
    alert('删除失败: ' + error.message)
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file || !selectedKB.value) return
  try {
    uploading.value = true
    await uploadDocument(selectedKB.value.id, file)
    await selectKB(selectedKB.value)
    await loadKBs()
  } catch (error) {
    alert('上传失败: ' + error.message)
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const handleProcessDoc = async (doc) => {
  try {
    doc.status = 'processing'
    await processDocument(selectedKB.value.id, doc.id)
    alert('解析任务已启动，请稍后刷新查看状态')
    await selectKB(selectedKB.value)
  } catch (error) {
    alert('启动解析失败: ' + error.message)
  }
}

const handleViewChunks = async (doc) => {
  viewingDoc.value = doc
  showChunksModal.value = true
  chunksLoading.value = true
  chunks.value = []
  isPreviewMode.value = false
  try {
    const res = await getDocumentChunks(selectedKB.value.id, doc.id)
    chunks.value = res.chunks
  } catch (error) {
    alert('获取片段失败: ' + error.message)
  } finally {
    chunksLoading.value = false
  }
}

const handlePreviewChunks = async (doc) => {
  viewingDoc.value = doc
  showChunksModal.value = true
  chunksLoading.value = true
  chunks.value = []
  isPreviewMode.value = true
  try {
    const res = await previewDocumentChunks(selectedKB.value.id, doc.id)
    chunks.value = res.chunks.map(text => ({ content: text }))
  } catch (error) {
    alert('预览分段失败: ' + (error.response?.data?.error || error.message))
  } finally {
    chunksLoading.value = false
  }
}

const handleDeleteDoc = async (doc) => {
  if (!confirm(`确定要删除文档 "${doc.name}" 吗？`)) return
  try {
    await deleteDocument(selectedKB.value.id, doc.id)
    await selectKB(selectedKB.value)
    await loadKBs()
  } catch (error) {
    alert('删除失败: ' + error.message)
  }
}

const formatDocType = (type, name) => {
  if (name?.endsWith('.docx')) return 'DOCX'
  if (name?.endsWith('.pdf')) return 'PDF'
  if (name?.endsWith('.txt')) return 'TXT'
  if (type?.includes('pdf')) return 'PDF'
  if (type?.includes('word')) return 'DOCX'
  return 'TXT'
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatStatus = (status) => {
  const maps = { pending: '等待处理', processing: '正在解析', completed: '解析成功', failed: '解析失败' }
  return maps[status] || status
}

onMounted(loadKBs)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
