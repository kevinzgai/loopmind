<template>
  <div class="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
    <div class="w-[500px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div class="h-12 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" @click="$router.back()">
            <ArrowLeft class="w-4 h-4" />
          </Button>
          <h1 class="font-bold text-sm">{{ isEditMode ? '编辑' : '创建' }}智能体</h1>
        </div>
        <Button size="sm" @click="handleSubmit" :disabled="isSubmitting || !form.name">
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? '保存中...' : '保存' }}</span>
        </Button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 class="font-bold text-sm mb-3">基本信息</h3>
          <Input v-model="form.name" placeholder="名称" class="mb-2" />
          <Textarea v-model="form.description" placeholder="描述" :rows="2" class="resize-none" />
        </div>

        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-sm">系统提示词</h3>
            <Button variant="ghost" size="sm" @click="optimizePrompt" :disabled="!form.personality || isOptimizing">
              <Loader2 v-if="isOptimizing" class="w-3.5 h-3.5 animate-spin" />
              <Sparkles v-else class="w-3.5 h-3.5" />
              <span>{{ isOptimizing ? 'AI 优化中...' : '优化' }}</span>
            </Button>
          </div>
          <Textarea
            v-model="form.personality"
            :disabled="isOptimizing"
            placeholder="定义智能体的性格和行为..."
            :rows="10"
            class="resize-none font-mono transition-all"
          />
        </div>

        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <label class="flex items-center gap-2 mb-3 cursor-pointer">
            <CheckboxRoot v-model="form.greeting.enabled" class="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center transition-colors">
              <CheckboxIndicator><Check class="w-3 h-3 text-primary-foreground" /></CheckboxIndicator>
            </CheckboxRoot>
            <span class="font-bold text-sm">开场白</span>
          </label>
          <div v-if="form.greeting.enabled" class="space-y-2">
            <Textarea v-model="form.greeting.text" placeholder="开场白文本" :rows="2" class="resize-none" />
            <div class="space-y-1">
              <div v-for="(q, i) in form.greeting.quickQuestions" :key="i" class="flex gap-2">
                <Input v-model="form.greeting.quickQuestions[i]" placeholder="快捷问题" class="h-7 text-xs" />
                <Button variant="ghost" size="icon-sm" @click="form.greeting.quickQuestions.splice(i, 1)">
                  <Trash2 class="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
            <Button v-if="form.greeting.quickQuestions.length < 10" variant="ghost" size="sm" @click="form.greeting.quickQuestions.push('')">
              <Plus class="w-3.5 h-3.5" /> 添加问题
            </Button>
          </div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <label class="flex items-center gap-2 mb-3 cursor-pointer">
            <CheckboxRoot v-model="form.enableKnowledgeBase" class="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center transition-colors">
              <CheckboxIndicator><Check class="w-3 h-3 text-primary-foreground" /></CheckboxIndicator>
            </CheckboxRoot>
            <span class="font-bold text-sm">启用知识库</span>
          </label>
          <div v-if="form.enableKnowledgeBase" class="space-y-2">
            <div class="grid grid-cols-2 gap-2">
              <label v-for="kb in knowledgeBases" :key="kb.id" class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded cursor-pointer hover:bg-accent transition-colors">
                <CheckboxRoot :model-value="form.knowledgeBaseIds.includes(kb.id)" @update:model-value="toggleKnowledgeBase(kb.id)" class="w-3.5 h-3.5 rounded border border-border bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center shrink-0 transition-colors">
                  <CheckboxIndicator><Check class="w-2.5 h-2.5 text-primary-foreground" /></CheckboxIndicator>
                </CheckboxRoot>
                <span class="text-xs font-medium">{{ kb.name }} <span class="text-slate-400">({{ kb.documentCount }} 条)</span></span>
              </label>
            </div>
          </div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 class="font-bold text-sm mb-3">功能</h3>
          <div class="grid grid-cols-2 gap-2">
            <label class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded cursor-pointer hover:bg-accent transition-colors">
              <CheckboxRoot v-model="form.features.conversationOperator" class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center shrink-0 transition-colors">
                <CheckboxIndicator><Check class="w-2.5 h-2.5 text-primary-foreground" /></CheckboxIndicator>
              </CheckboxRoot>
              <span class="text-xs font-medium">对话引导</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded cursor-pointer hover:bg-accent transition-colors">
              <CheckboxRoot v-model="form.features.nextQuestionSuggestion" class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center shrink-0 transition-colors">
                <CheckboxIndicator><Check class="w-2.5 h-2.5 text-primary-foreground" /></CheckboxIndicator>
              </CheckboxRoot>
              <span class="text-xs font-medium">下一步建议</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded cursor-pointer hover:bg-accent transition-colors">
              <CheckboxRoot v-model="form.features.textToSpeech" class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center shrink-0 transition-colors">
                <CheckboxIndicator><Check class="w-2.5 h-2.5 text-primary-foreground" /></CheckboxIndicator>
              </CheckboxRoot>
              <span class="text-xs font-medium">文字转语音</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded cursor-pointer hover:bg-accent transition-colors">
              <CheckboxRoot v-model="form.features.speechToText" class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center shrink-0 transition-colors">
                <CheckboxIndicator><Check class="w-2.5 h-2.5 text-primary-foreground" /></CheckboxIndicator>
              </CheckboxRoot>
              <span class="text-xs font-medium">语音转文字</span>
            </label>
          </div>
        </div>

        <div v-if="form.features.textToSpeech" class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <h3 class="font-bold text-sm mb-3">文字转语音配置</h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">音色</label>
              <Select v-model="form.ttsConfig.voice">
                <SelectTrigger class="h-8 text-xs">
                  <SelectValue placeholder="选择音色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="v in availableVoices" :key="v.id" :value="v.id" class="text-xs">
                    {{ v.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">语速 ({{ form.ttsConfig.speechRate }})</label>
              <input v-model.number="form.ttsConfig.speechRate" type="range" min="50" max="200" step="10" class="w-full" />
              <div class="flex justify-between text-xs text-slate-400 mt-1">
                <span>慢 (50)</span>
                <span>正常 (150)</span>
                <span>快 (200)</span>
              </div>
              <div class="text-xs text-amber-500 dark:text-amber-400 mt-1">⚠ 当前 TTS 模型 (qwen3-tts-flash) 暂不支持语速调整</div>
            </div>
            <Button
              v-if="form.ttsConfig.voice"
              variant="outline"
              size="sm"
              class="w-full"
              @click="previewVoice"
              :disabled="isPreviewPlaying">
              <Pause v-if="isPreviewPlaying" class="w-3.5 h-3.5" />
              <Play v-else class="w-3.5 h-3.5" />
              <span>{{ isPreviewPlaying ? '播放中...' : '预览音色' }}</span>
            </Button>
            <label class="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded cursor-pointer hover:bg-accent transition-colors">
              <CheckboxRoot v-model="form.ttsConfig.autoPlay" class="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center shrink-0 transition-colors">
                <CheckboxIndicator><Check class="w-2.5 h-2.5 text-primary-foreground" /></CheckboxIndicator>
              </CheckboxRoot>
              <span class="text-xs font-medium">自动播放</span>
            </label>
          </div>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
          <label class="flex items-center gap-2 mb-3 cursor-pointer">
            <CheckboxRoot v-model="form.features.contentModeration" class="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center transition-colors">
              <CheckboxIndicator><Check class="w-3 h-3 text-primary-foreground" /></CheckboxIndicator>
            </CheckboxRoot>
            <span class="font-bold text-sm">内容审查</span>
          </label>
          <div v-if="form.features.contentModeration" class="space-y-2">
            <Textarea v-model="sensitiveWordsText" placeholder="每行一个敏感词" :rows="3" class="resize-none font-mono text-xs" />
            <Button variant="outline" size="sm" class="w-full" @click="importSensitiveWords">导入敏感词</Button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div class="h-12 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Bot class="w-4 h-4 text-blue-500" />
          <h2 class="font-bold text-sm">预览 &amp; 测试</h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon-sm" @click="messages = []">
                <RotateCcw class="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>清空对话</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="overflow-y-auto p-3 space-y-2 border-b border-slate-200 dark:border-slate-800 max-h-44">
          <div class="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">名称</p>
            <p class="text-sm font-semibold truncate">{{ form.name || '未设置' }}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">描述</p>
            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{{ form.description || '未设置' }}</p>
          </div>
          <div class="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">启用功能</p>
            <div class="flex flex-wrap gap-1">
              <span v-if="form.features.conversationOperator" class="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">对话引导</span>
              <span v-if="form.features.nextQuestionSuggestion" class="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">下一步建议</span>
              <span v-if="form.features.textToSpeech" class="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">文字转语音</span>
              <span v-if="form.features.speechToText" class="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-800">语音转文字</span>
              <span v-if="!form.features.conversationOperator && !form.features.nextQuestionSuggestion && !form.features.textToSpeech && !form.features.speechToText" class="text-xs text-slate-400">无</span>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div v-if="!messages.length" class="flex flex-col items-center justify-center h-full text-center py-8">
              <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <MessageSquare class="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">开始对话测试</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">在下方输入消息</p>
            </div>
            <div v-for="(msg, i) in messages" :key="i" :class="['flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']">
              <div v-if="msg.role === 'assistant'" class="flex-shrink-0 mb-1">
                <Avatar size="sm" class="w-[25px] h-[25px]"  >
                  <AvatarFallback class="bg-gradient-to-br from-blue-500 to-violet-600">
                    <Bot class="w-3 h-3 text-white" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div :class="['relative max-w-[85%] group', msg.role === 'user' ? 'order-1' : 'order-2']">
                <div :class="[
                  'px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-100 dark:border-slate-700'
                ]">
                  <div v-if="msg.role === 'assistant'" class="prose prose-xs dark:prose-invert max-w-none" v-html="markdownToHtml(msg.content)"></div>
                  <div v-else>{{ msg.content }}</div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        v-if="msg.role === 'assistant' && form.features.textToSpeech && msg.content"
                        @click.stop="playTTS(msg.content, msg.id)"
                        :variant="playingMessageId === msg.id ? 'default' : 'outline'"
                        size="icon-sm"
                        :class="[
                          'absolute -bottom-2 -right-2 w-6 h-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all',
                          playingMessageId === msg.id ? 'scale-110' : 'hover:scale-110'
                        ]"
                      >
                        <VolumeX v-if="playingMessageId === msg.id" class="w-3 h-3 animate-pulse" />
                        <Volume2 v-else class="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{{ playingMessageId === msg.id ? '播放中' : '朗读' }}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div v-if="msg.role === 'user'" class="flex-shrink-0 mb-1 order-2">
                <Avatar size="sm" class="w-[25px] h-[25px]">
                  <AvatarFallback>
                    <User class="w-[15px] h-[15px] text-white" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div v-if="isLoading" class="flex items-end gap-2 justify-start">
              <div class="flex-shrink-0">
                <Avatar size="sm" class="w-[25px] h-[25px]">
                  <AvatarFallback class="bg-gradient-to-br from-blue-500 to-violet-600">
                    <Bot class="w-3 h-3 text-white" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                <div class="flex gap-1 items-center">
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <!-- 语音模式 -->
            <div v-if="form.features.speechToText && isVoiceMode" class="flex gap-2 items-center">
              <Button
                @mousedown="startVoiceInput"
                @mouseup="stopVoiceInput"
                @touchstart.prevent="startVoiceInput"
                @touchend.prevent="stopVoiceInput"
                :variant="isVoiceInputting ? 'destructive' : 'outline'"
                class="flex-1 select-none"
                size="sm"
              >
                <Mic :class="['w-3.5 h-3.5', isVoiceInputting && 'animate-pulse']" />
                <span>{{ isVoiceInputting ? '松开发送' : '按住说话' }}</span>
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="outline" size="icon-sm" @click="isVoiceMode = false">
                      <Keyboard class="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>切换文字输入</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <!-- 文字输入模式 -->
            <div v-else class="flex gap-2 items-center">
              <Input
                v-model="inputMessage"
                @keyup.enter="sendMessage"
                placeholder="输入消息..."
                class="flex-1 h-8 text-xs"
              />
              <TooltipProvider v-if="form.features.speechToText">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="outline" size="icon-sm" @click="isVoiceMode = true">
                      <Mic class="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>切换语音输入</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                size="icon-sm"
                @click="sendMessage"
                :disabled="!inputMessage.trim() || isLoading"
              >
                <Send class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Trash2, MessageSquare, Send, Mic, Volume2, VolumeX, Bot, User, Keyboard, RotateCcw, Loader2, Sparkles, Play, Pause, Plus, Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'

// Markdown 渲染
const markdownToHtml = (markdown: string): string => {
  if (!markdown) return ''
  let html = markdown
  
  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto"><code>$2</code></pre>')
  
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 rounded">$1</code>')
  
  // 标题
  html = html.replace(/^### (.*?)$/gm, '<h3 class="font-bold text-sm mt-2 mb-1">$1</h3>')
  html = html.replace(/^## (.*?)$/gm, '<h2 class="font-bold text-base mt-2 mb-1">$1</h2>')
  html = html.replace(/^# (.*?)$/gm, '<h1 class="font-bold text-lg mt-2 mb-1">$1</h1>')
  
  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong class="font-bold">$1</strong>')
  
  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  html = html.replace(/_(.+?)_/g, '<em class="italic">$1</em>')
  
  // 列表
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')
  html = html.replace(/(<li.*?<\/li>)/s, '<ul class="list-disc">$1</ul>')
  
  // 链接
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline" target="_blank">$1</a>')
  
  // 换行
  html = html.replace(/\n/g, '<br />')
  
  return html
}

interface Voice {
  id: string
  name: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface KnowledgeBase {
  id: string
  name: string
  documentCount?: number
}

interface AgentForm {
  name: string
  description: string
  avatar: string
  category: string
  model: string
  personality: string
  knowledgeBaseIds: string[]
  enableKnowledgeBase: boolean
  greeting: {
    enabled: boolean
    text: string
    quickQuestions: string[]
  }
  features: {
    conversationOperator: boolean
    nextQuestionSuggestion: boolean
    textToSpeech: boolean
    speechToText: boolean
    contentModeration: boolean
  }
  ttsConfig: {
    voice: string
    speechRate: number
    autoPlay: boolean
  }
  sensitiveWords?: string[]
}

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!route.params.agentId)
const agentId = route.params.agentId as string

const form = ref<AgentForm>({
  name: '',
  description: '',
  avatar: '🤖',
  category: '',
  model: 'deepseek',
  personality: '',
  knowledgeBaseIds: [],
  enableKnowledgeBase: false,
  greeting: {
    enabled: false,
    text: '你好！我是你的智能助手，有什么可以帮助你的吗？',
    quickQuestions: []
  },
  features: {
    conversationOperator: true,
    nextQuestionSuggestion: false,
    textToSpeech: false,
    speechToText: false,
    contentModeration: true
  },
  ttsConfig: {
    voice: 'Cherry',
    speechRate: 150,
    autoPlay: false
  }
})

const knowledgeBases = ref<KnowledgeBase[]>([])
const availableVoices = ref<Voice[]>([])
const messages = ref<Message[]>([])
const inputMessage = ref('')
const sensitiveWordsText = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)
const isOptimizing = ref(false)
const isPreviewPlaying = ref(false)
const isVoiceInputting = ref(false)
const isVoiceMode = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const currentConversationId = ref<string | null>(null)

const toggleKnowledgeBase = (kbId: string) => {
  const index = form.value.knowledgeBaseIds.indexOf(kbId)
  if (index > -1) {
    form.value.knowledgeBaseIds.splice(index, 1)
  } else {
    form.value.knowledgeBaseIds.push(kbId)
  }
}

const optimizePrompt = async () => {
  if (!form.value.personality) return
  isOptimizing.value = true
  try {
    const res = await fetch('/api/agent/generate-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ prompt: form.value.personality, type: 'personality' })
    })
    const data = await res.json()
    form.value.personality = data.personality || form.value.personality
  } catch (e) {
    console.error('优化失败:', e)
  } finally {
    isOptimizing.value = false
  }
}

const importSensitiveWords = () => {
  form.value.sensitiveWords = sensitiveWordsText.value.split('\n').filter(w => w.trim())
}

const toggleVoiceInput = () => {
  isVoiceMode.value = !isVoiceMode.value
}

const startVoiceInput = async () => {
  if (isVoiceInputting.value) return
  try {
    isVoiceInputting.value = true
    audioChunks.value = []
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : ''
    
    mediaRecorder.value = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }
    
    mediaRecorder.value.onstop = async () => {
      const mimeType = mediaRecorder.value?.mimeType || 'audio/webm'
      const audioBlob = new Blob(audioChunks.value, { type: mimeType })
      stream.getTracks().forEach(track => track.stop())
      console.log(`🎙️ 录音完成: size=${audioBlob.size} bytes, type=${mimeType}`)
      await sendAudioToASR(audioBlob, true) // true = 识别后直接发送
    }
    
    mediaRecorder.value.start()
  } catch (e) {
    console.error('启动语音输入失败:', e)
    isVoiceInputting.value = false
    alert('无法访问麦克风，请检查权限')
  }
}

const stopVoiceInput = () => {
  if (mediaRecorder.value && isVoiceInputting.value) {
    mediaRecorder.value.stop()
    isVoiceInputting.value = false
  }
}

const sendAudioToASR = async (audioBlob: Blob, autoSend = false) => {
  try {
    const formData = new FormData()
    const ext = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('mp4') ? 'mp4' : 'wav'
    formData.append('audio', audioBlob, `audio.${ext}`)
    
    const res = await fetch('/api/asr', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    })
    
    const data = await res.json()
    const text = data.text || data.data?.text
    if (text) {
      if (autoSend) {
        // 语音模式：直接发送识别结果
        inputMessage.value = text
        await sendMessage()
      } else {
        inputMessage.value += (inputMessage.value ? ' ' : '') + text
      }
    } else {
      console.warn('ASR 未返回文字:', data)
      if (autoSend) alert('未识别到内容，请重试')
    }
  } catch (e) {
    console.error('语音转文字失败:', e)
    alert('语音转文字失败，请重试')
  }
}

const previewVoice = async () => {
  if (!form.value.ttsConfig.voice || isPreviewPlaying.value) return
  isPreviewPlaying.value = true
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        text: '这是音色预览，请听一下这个声音是否满意。',
        voice: form.value.ttsConfig.voice,
        speechRate: form.value.ttsConfig.speechRate
      })
    })
    const audioBlob = await res.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.onended = () => {
      isPreviewPlaying.value = false
    }
    audio.play()
  } catch (e) {
    console.error('音色预览失败:', e)
    isPreviewPlaying.value = false
    alert('音色预览失败，请检查网络连接')
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  messages.value.push({
    role: 'user', content: inputMessage.value,
    id: ''
  })
  const msg = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true

  try {
    // 构建预览配置：始终传递当前表单最新配置（未保存的修改也能生效）
    const previewConfig = {
      personality: form.value.personality,
      model: form.value.model,
      knowledgeBaseIds: form.value.knowledgeBaseIds,
      knowledgeBaseId: form.value.knowledgeBaseIds,
      enableKnowledgeBase: form.value.enableKnowledgeBase,
    }

    const res = await fetch(`/api/agent/${agentId || 'preview'}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        message: msg,
        conversationId: currentConversationId.value,
        userId: `preview_${agentId}`,
        previewConfig
      })
    })

    if (!res.ok) throw new Error('Request failed')

    // 从响应头获取 conversationId
    const convId = res.headers.get('X-Conversation-Id')
    if (convId) currentConversationId.value = convId

    // 添加助手消息占位符
    const assistantMsgObj: Message = { id: Date.now().toString(), role: 'assistant', content: '' }
    messages.value.push(assistantMsgObj)

    // 处理流式响应
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      fullResponse += chunk
      
      // 更新最后一条消息
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content = fullResponse
      }
    }

    // TTS 自动播放
    if (form.value.features.textToSpeech && form.value.ttsConfig.autoPlay && fullResponse) {
      playTTS(fullResponse)
    }
  } catch (e) {
    console.error('聊天错误:', e)
    messages.value.push({
      role: 'assistant', content: '出错了: ' + (e as Error).message,
      id: ''
    })
  } finally {
    isLoading.value = false
  }
}

const playingMessageId = ref<string | null>(null)

const playTTS = async (text: string, messageId?: string) => {
  if (!text.trim()) return
  if (messageId) playingMessageId.value = messageId
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        text,
        voice: form.value.ttsConfig.voice,
        speechRate: form.value.ttsConfig.speechRate
      })
    })
    const audioBlob = await res.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.onended = () => { playingMessageId.value = null }
    audio.play()
  } catch (e) {
    console.error('TTS 播放失败:', e)
    playingMessageId.value = null
  }
}

const handleSubmit = async () => {
  if (!form.value.name) return
  isSubmitting.value = true
  try {
    const url = isEditMode.value ? `/api/agent/${agentId}` : '/api/agent/create'
    // 确保 knowledgeBaseIds 只含字符串 ID
    const cleanIds = form.value.knowledgeBaseIds
      .map((k: any) => typeof k === 'object' ? (k.id || k._id || '').toString() : k)
      .filter((k: string) => k.length === 24)
    const payload: Record<string, any> = {
      ...form.value,
      knowledgeBaseIds: cleanIds,
    }
    // 只在有值时才传 knowledgeBaseId，避免空字符串导致后端报错
    if (cleanIds.length > 0) {
      payload.knowledgeBaseId = cleanIds[0]
    } else {
      delete payload.knowledgeBaseId
    }
    const res = await fetch(url, {
      method: isEditMode.value ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload)
    })
    if (res.ok) router.push('/agent/my-agents')
  } finally {
    isSubmitting.value = false
  }
}

const loadAgent = async () => {
  if (!isEditMode) return
  try {
    const res = await fetch(`/api/agent/${agentId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
    const data = await res.json()
    // knowledgeBaseId 可能被 populate 成对象，需提取 id
    const kb = data.agent.knowledgeBaseId
    const knowledgeBaseIdStr = kb ? (typeof kb === 'object' ? (kb.id || kb._id || '').toString() : kb.toString()) : ''
    form.value = {
      ...data.agent,
      knowledgeBaseId: knowledgeBaseIdStr,
      knowledgeBaseIds: Array.isArray(data.agent.knowledgeBaseIds)
        ? data.agent.knowledgeBaseIds.map((k: any) => typeof k === 'object' ? (k.id || k._id || '').toString() : k.toString())
        : (knowledgeBaseIdStr ? [knowledgeBaseIdStr] : []),
      enableKnowledgeBase: data.agent.enableKnowledgeBase ?? false,
      ttsConfig: data.agent.ttsConfig || { voice: 'Cherry', speechRate: 150, autoPlay: false }
    }
    sensitiveWordsText.value = (data.agent.sensitiveWords || []).join('\n')
  } catch (e) {
    console.error('加载失败:', e)
  }
}

const loadKnowledgeBases = async () => {
  try {
    const res = await fetch('/api/knowledge', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
    const data = await res.json()
    knowledgeBases.value = Array.isArray(data.data) ? data.data : []
  } catch (e) {
    console.error('加载知识库失败:', e)
  }
}

const loadVoices = async () => {
  try {
    const res = await fetch('/api/tts/voices', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    const data = await res.json()
    availableVoices.value = data.data?.voices || getDefaultVoices()
  } catch (e) {
    console.error('加载音色列表失败:', e)
    availableVoices.value = getDefaultVoices()
  }
}

const getDefaultVoices = (): Voice[] => [
  { id: 'Cherry', name: 'Cherry - 标准女声' },
  { id: 'Serena', name: 'Serena - 温柔女声' },
  { id: 'Chelsie', name: 'Chelsie - 活力女声' },
  { id: 'Momo', name: 'Momo - 可爱女声' },
  { id: 'Vivian', name: 'Vivian - 知性女声' },
  { id: 'Moon', name: 'Moon - 成熟女声' },
  { id: 'Maia', name: 'Maia - 甜美女声' },
  { id: 'Kai', name: 'Kai - 标准男声' },
  { id: 'Nofish', name: 'Nofish - 磁性男声' },
  { id: 'Bella', name: 'Bella - 活泼女声' }
]

onMounted(() => {
  loadKnowledgeBases()
  loadVoices()
  if (isEditMode.value) loadAgent()
})
</script>
