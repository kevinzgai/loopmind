<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="handleCancel" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft class="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {{ isEditMode ? '编辑智能体' : '创建智能体' }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {{ currentStep === 0 ? '选择模板开始' : currentStep === 1 ? '设置基本信息' : '配置 AI 能力' }}
            </p>
          </div>
        </div>
        
        <!-- 步骤指示器 -->
        <div class="hidden md:flex items-center gap-2">
          <template v-for="(step, index) in steps" :key="index">
            <div :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              currentStep === index 
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' 
                : currentStep > index
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            ]">
              <Check v-if="currentStep > index" class="w-4 h-4" />
              <span v-else>{{ index + 1 }}</span>
              <span class="hidden lg:inline">{{ step.title }}</span>
            </div>
            <ChevronRight v-if="index < steps.length - 1" class="w-4 h-4 text-slate-400" />
          </template>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="currentStep > 0"
            @click="prevStep"
            class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            上一步
          </button>
          <button
            v-if="currentStep < 2"
            @click="nextStep"
            :disabled="!canProceed"
            class="px-6 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一步
          </button>
          <button
            v-else
            @click="handleSubmit"
            :disabled="isSubmitting || !isFormValid"
            class="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-md shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            {{ isSubmitting ? '保存中...' : (isEditMode ? '保存修改' : '创建智能体') }}
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端步骤指示器 -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ steps[currentStep].title }}</span>
        <span class="text-xs text-slate-500">{{ currentStep + 1 }} / {{ steps.length }}</span>
      </div>
      <div class="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
          :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }"
        />
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-violet-200 dark:border-violet-900 border-t-violet-600 rounded-full animate-spin mb-4" />
        <p class="text-slate-500 dark:text-slate-400">加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <p class="text-slate-900 dark:text-slate-100 font-medium mb-2">加载失败</p>
        <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">{{ error }}</p>
        <button @click="loadAgent" class="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">
          重试
        </button>
      </div>

      <!-- 步骤内容 -->
      <template v-else>
        <!-- 步骤 0: 选择模板 -->
        <div v-if="currentStep === 0" class="space-y-6">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">选择创建方式</h2>
            <p class="text-slate-500 dark:text-slate-400">从模板快速开始，或从头创建专属智能体</p>
          </div>

          <!-- 模板网格 -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <!-- 空白模板 -->
            <button
              @click="selectTemplate(null)"
              :class="[
                'group relative p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg',
                selectedTemplate === null 
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700'
              ]"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0">
                  <Plus class="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-1">从头创建</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">完全自定义你的智能体</p>
                </div>
              </div>
              <div v-if="selectedTemplate === null" class="absolute top-4 right-4 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                <Check class="w-4 h-4 text-white" />
              </div>
            </button>

            <!-- 预设模板 -->
            <button
              v-for="template in templates"
              :key="template.id"
              @click="selectTemplate(template.id)"
              :class="[
                'group relative p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg',
                selectedTemplate === template.id 
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700'
              ]"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" :style="{ background: template.gradient }">
                  {{ template.emoji }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-1">{{ template.name }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{{ template.description }}</p>
                </div>
              </div>
              <div class="mt-4 flex flex-wrap gap-1.5">
                <span v-for="tag in template.tags" :key="tag" class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                  {{ tag }}
                </span>
              </div>
              <div v-if="selectedTemplate === template.id" class="absolute top-4 right-4 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                <Check class="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
        </div>

        <!-- 步骤 1: 基本信息 -->
        <div v-if="currentStep === 1" class="grid gap-8 lg:grid-cols-5">
          <div class="lg:col-span-3 space-y-6">
            <!-- 头像和名称 -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs">1</span>
                基础信息
              </h3>
              
              <div class="flex flex-col sm:flex-row gap-6">
                <!-- 头像选择 -->
                <div class="flex flex-col items-center gap-3">
                  <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 border-2 border-dashed border-violet-300 dark:border-violet-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-violet-500 transition-colors" @click="showEmojiPicker = !showEmojiPicker">
                    <span class="text-4xl">{{ form.avatar || '🤖' }}</span>
                  </div>
                  <button type="button" @click="showEmojiPicker = !showEmojiPicker" class="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                    更换头像
                  </button>
                  
                  <!-- Emoji 选择器 -->
                  <div v-if="showEmojiPicker" class="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-10">
                    <div class="grid grid-cols-6 gap-1.5">
                      <button
                        v-for="emoji in emojiOptions"
                        :key="emoji"
                        type="button"
                        @click="form.avatar = emoji; showEmojiPicker = false"
                        :class="[
                          'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                          form.avatar === emoji 
                            ? 'bg-violet-100 dark:bg-violet-900/30 ring-2 ring-violet-500' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        ]"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 名称和描述 -->
                <div class="flex-1 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      智能体名称 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      placeholder="给你的智能体起个名字"
                      maxlength="20"
                      class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                    />
                    <div class="flex justify-end mt-1">
                      <span class="text-xs text-slate-400">{{ form.name.length }}/20</span>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      简短描述
                    </label>
                    <textarea
                      v-model="form.description"
                      placeholder="用一句话介绍你的智能体"
                      maxlength="100"
                      rows="2"
                      class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 分类和知识库 -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 text-xs">2</span>
                分类与知识
              </h3>
              
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">分类</label>
                  <select
                    v-model="form.category"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">选择分类</option>
                    <option v-for="cat in AGENT_CATEGORIES" :key="cat.value" :value="cat.value">
                      {{ cat.icon }} {{ cat.label }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">关联知识库</label>
                  <select
                    v-model="form.knowledgeBaseId"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                  >
                    <option :value="null">不关联知识库</option>
                    <option v-for="kb in knowledgeBases" :key="kb.id" :value="kb.id">
                      {{ kb.name }} ({{ kb.documentCount }} 篇文档)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧预览 -->
          <div class="lg:col-span-2">
            <div class="sticky top-24">
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-500 dark:text-slate-400">预览效果</span>
                  <span class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    实时更新
                  </span>
                </div>
                <div class="p-6">
                  <div class="flex items-center gap-4 mb-4">
                    <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center text-2xl">
                      {{ form.avatar || '🤖' }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {{ form.name || '未命名智能体' }}
                      </h4>
                      <p class="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {{ form.description || '暂无描述' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <span v-if="form.category" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium">
                      {{ getCategoryLabel(form.category) }}
                    </span>
                    <span v-if="form.knowledgeBaseId" class="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
                      已关联知识库
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤 2: AI 配置 -->
        <div v-if="currentStep === 2" class="grid gap-8 lg:grid-cols-5">
          <div class="lg:col-span-3 space-y-6">
            <!-- AI 模型选择 -->
            <div v-if="!isPublished" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <BrainCircuit class="w-4 h-4 text-violet-600 dark:text-violet-400" />
                AI 模型
              </h3>
              
              <div class="grid gap-3 sm:grid-cols-2">
                <button
                  v-for="model in modelOptions"
                  :key="model.value"
                  type="button"
                  @click="form.model = model.value"
                  :class="[
                    'p-4 rounded-xl border-2 text-left transition-all',
                    form.model === model.value 
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', model.bgColor]">
                      <component :is="model.icon" class="w-5 h-5" :class="model.iconColor" />
                    </div>
                    <div>
                      <div class="font-medium text-slate-900 dark:text-slate-100 text-sm">{{ model.label }}</div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">{{ model.desc }}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- 人设与指令 -->
            <div v-if="!isPublished" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles class="w-4 h-4 text-amber-500" />
                  人设与指令
                </h3>
                <button
                  type="button"
                  @click="generatePersonality"
                  :disabled="isGenerating"
                  class="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Loader2 v-if="isGenerating" class="w-3 h-3 animate-spin" />
                  <Wand2 v-else class="w-3 h-3" />
                  {{ isGenerating ? '生成中...' : 'AI 辅助生成' }}
                </button>
              </div>
              
              <textarea
                v-model="form.personality"
                placeholder="描述智能体的性格、说话风格、专业领域等。例如：你是一位严厉但幽默的数学老师，擅长用生动的比喻解释复杂概念..."
                maxlength="2000"
                rows="6"
                :disabled="isGenerating"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none disabled:opacity-50"
              />
              <div class="flex justify-between mt-2">
                <span class="text-xs text-slate-400">支持 Markdown 格式</span>
                <span class="text-xs text-slate-400">{{ form.personality.length }}/2000</span>
              </div>
            </div>

            <!-- 长期记忆 -->
            <div v-if="!isPublished" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <BookOpen class="w-4 h-4 text-emerald-500" />
                长期记忆
              </h3>
              
              <textarea
                v-model="form.initialMemory"
                placeholder="预设的背景信息或记忆，智能体会在对话中记住这些内容"
                maxlength="1000"
                rows="3"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
              />
            </div>

            <!-- 语音配置 -->
            <div v-if="!isPublished" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Volume2 class="w-4 h-4 text-blue-500" />
                语音设置
              </h3>
              
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">音色</label>
                  <select
                    v-model="form.voice"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">跟随系统设置</option>
                    <optgroup label="普通话女声">
                      <option value="Cherry">Cherry - 标准女声</option>
                      <option value="Serena">Serena - 温柔女声</option>
                      <option value="Chelsie">Chelsie - 活力女声</option>
                      <option value="Momo">Momo - 可爱女声</option>
                      <option value="Vivian">Vivian - 知性女声</option>
                      <option value="Moon">Moon - 成熟女声</option>
                      <option value="Maia">Maia - 甜美女声</option>
                      <option value="Bella">Bella - 活泼女声</option>
                    </optgroup>
                    <optgroup label="普通话男声">
                      <option value="Kai">Kai - 标准男声</option>
                      <option value="Nofish">Nofish - 磁性男声</option>
                    </optgroup>
                    <optgroup label="方言音色">
                      <option value="Jada">Jada - 粤语女声</option>
                      <option value="Dylan">Dylan - 粤语男声</option>
                      <option value="Li">Li - 台湾话女声</option>
                      <option value="Marcus">Marcus - 台湾话男声</option>
                      <option value="Roy">Roy - 东北话男声</option>
                      <option value="Peter">Peter - 东北话男声</option>
                      <option value="Sunny">Sunny - 东北话女声</option>
                      <option value="Eric">Eric - 四川话男声</option>
                      <option value="Rocky">Rocky - 四川话男声</option>
                      <option value="Kiki">Kiki - 四川话女声</option>
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    语速: {{ form.speechRate }}
                  </label>
                  <input
                    type="range"
                    v-model.number="form.speechRate"
                    min="50"
                    max="400"
                    step="10"
                    class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div class="flex justify-between text-xs text-slate-400 mt-1">
                    <span>慢</span>
                    <span>正常</span>
                    <span>快</span>
                  </div>
                </div>
              </div>
              
              <!-- 音色预览 -->
              <div class="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">音色预览</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">{{ getVoiceName(form.voice) }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <input
                    v-model="previewText"
                    type="text"
                    placeholder="输入要试听的文本..."
                    class="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                  <button
                    type="button"
                    @click="playVoicePreview"
                    :disabled="isPlayingPreview || !previewText.trim()"
                    class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Loader2 v-if="isPlayingPreview" class="w-4 h-4 animate-spin" />
                    <Play v-else class="w-4 h-4" />
                    {{ isPlayingPreview ? '播放中' : '试听' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 发布状态（编辑模式） -->
            <div v-if="isEditMode && initialAgentData" class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Activity class="w-4 h-4 text-orange-500" />
                发布状态
              </h3>
              
              <div :class="[
                'p-4 rounded-xl flex items-center gap-3',
                isPublished 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-amber-50 dark:bg-amber-900/20'
              ]">
                <CheckCircle2 v-if="isPublished" class="w-5 h-5 text-green-600 dark:text-green-400" />
                <AlertCircle v-else class="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <div :class="['font-medium text-sm', isPublished ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400']">
                    {{ isPublished ? '已发布到广场' : '草稿状态' }}
                  </div>
                  <div :class="['text-xs', isPublished ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-500']">
                    {{ isPublished ? '核心配置已锁定，修改需先下架' : '仅自己可见，可随时修改' }}
                  </div>
                </div>
              </div>
              
              <button
                v-if="isPublished"
                type="button"
                @click="$emit('unpublish')"
                class="mt-4 w-full px-4 py-2.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-medium transition-all text-sm"
              >
                下架智能体
              </button>
            </div>
          </div>

          <!-- 右侧配置摘要 -->
          <div class="lg:col-span-2">
            <div class="sticky top-24 space-y-4">
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">配置摘要</h3>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span class="text-sm text-slate-500 dark:text-slate-400">模型</span>
                    <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ getModelLabel(form.model) }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span class="text-sm text-slate-500 dark:text-slate-400">人设</span>
                    <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ form.personality ? '已配置' : '未配置' }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span class="text-sm text-slate-500 dark:text-slate-400">记忆</span>
                    <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ form.initialMemory ? '已设置' : '未设置' }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-sm text-slate-500 dark:text-slate-400">语音</span>
                    <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ form.voice || '跟随系统' }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl border border-violet-200 dark:border-violet-800 p-6">
                <div class="flex items-start gap-3">
                  <Lightbulb class="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 class="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1">优化建议</h4>
                    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      详细的人设描述能让 AI 更准确地扮演角色。建议包含性格特点、说话风格、专业领域和回答偏好。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- AI 生成人设弹窗 -->
    <div v-if="showGenerateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showGenerateModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
            <Wand2 class="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">AI 辅助生成人设</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">描述你想要的智能体，AI 将为你生成专业的人设</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">智能体描述</label>
            <textarea
              v-model="generatePrompt"
              placeholder="例如：一个擅长讲解物理知识的老师，说话幽默风趣，善于用生活中的例子解释复杂的物理概念..."
              rows="4"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
            />
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span class="text-xs text-slate-500 dark:text-slate-400">快速选择：</span>
            <button
              v-for="example in generateExamples"
              :key="example"
              type="button"
              @click="generatePrompt = example"
              class="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {{ example }}
            </button>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="showGenerateModal = false; generatePrompt = ''"
            class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            type="button"
            @click="submitGenerate"
            :disabled="isGenerating || !generatePrompt.trim()"
            class="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg shadow-md shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
          >
            <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
            {{ isGenerating ? '生成中...' : '开始生成' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft, Check, ChevronRight, Loader2, AlertCircle, Plus,
  BrainCircuit, Sparkles, BookOpen, Volume2, Activity, Lightbulb,
  CheckCircle2, Wand2, Bot, Cpu, Zap, Play
} from 'lucide-vue-next'
import { token } from '@/stores/authStore.js'
import { getAgent, createAgent, updateAgent, unpublishAgent } from '@/services/agentService.js'
import apiService from '@/services/apiService.js'
import { AGENT_CATEGORIES } from '@/constants/agent.js'

const route = useRoute()
const router = useRouter()
const agentId = route.params.agentId

const isEditMode = computed(() => !!agentId)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isGenerating = ref(false)
const error = ref(null)
const initialAgentData = ref(null)
const knowledgeBases = ref([])
const showEmojiPicker = ref(false)
const showGenerateModal = ref(false)
const generatePrompt = ref('')
const previewText = ref('你好，我是你的智能助手，很高兴为你服务。')
const isPlayingPreview = ref(false)
const audioElement = ref(null)

const currentStep = ref(0)
const selectedTemplate = ref(null)

const steps = [
  { title: '选择模板' },
  { title: '基本信息' },
  { title: 'AI 配置' }
]

const form = reactive({
  name: '',
  description: '',
  category: '',
  avatar: '🤖',
  model: 'deepseek-chat',
  personality: '',
  initialMemory: '',
  voice: '',
  speechRate: 150,
  knowledgeBaseId: null,
})

const templates = [
  {
    id: 'teacher',
    name: '知识导师',
    emoji: '👨‍🏫',
    description: '专业的知识讲解助手，擅长深入浅出地解释概念',
    tags: ['教育', '讲解', '耐心'],
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    config: { 
      category: 'education', 
      avatar: '👨‍🏫',
      personality: '你是一位耐心、专业的知识导师，擅长用通俗易懂的语言解释复杂的概念。你的教学风格亲切友好，善于使用生动的比喻和实际案例来帮助学生理解知识。你会根据学生的提问调整讲解的深度和方式，确保他们真正理解而不是死记硬背。在回答问题时，你会先确认学生的理解程度，然后逐步引导他们掌握知识点。'
    }
  },
  {
    id: 'coder',
    name: '编程助手',
    emoji: '👨‍💻',
    description: '精通多种编程语言，提供代码建议和调试帮助',
    tags: ['编程', '代码', '技术'],
    gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    config: { 
      category: 'technology', 
      avatar: '👨‍💻',
      personality: '你是一位经验丰富的编程专家，精通 Python、JavaScript、TypeScript、Java、Go 等多种编程语言。你擅长代码审查、调试问题、性能优化和架构设计。在回答问题时，你会提供清晰、可运行的代码示例，并解释代码的工作原理。你会主动指出潜在的 bug 和安全隐患，并给出最佳实践建议。你的回答简洁明了，注重实用性。'
    }
  },
  {
    id: 'writer',
    name: '写作助手',
    emoji: '✍️',
    description: '帮助润色文章、提供写作建议和创意灵感',
    tags: ['写作', '创意', '润色'],
    gradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
    config: { 
      category: 'creative', 
      avatar: '✍️',
      personality: '你是一位富有创意的写作顾问，擅长各类文体的写作指导。你可以帮助用户润色文章、优化表达、提供创意灵感和结构建议。你的语言优美流畅，善于发现文字中的亮点和不足。在提供建议时，你会尊重作者的原意和风格，同时给出具体的修改方案。你熟悉各种写作技巧，包括叙事结构、修辞手法、情感表达等。'
    }
  },
  {
    id: 'translator',
    name: '翻译专家',
    emoji: '🌐',
    description: '多语言翻译，保持原文风格和语境',
    tags: ['翻译', '多语言', '专业'],
    gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    config: { 
      category: 'tools', 
      avatar: '🌐',
      personality: '你是一位专业的翻译专家，精通中文、英文、日文、韩文、法文、德文等多种语言。你在翻译时会准确传达原文的含义，同时保持原文的风格、语气和文化背景。你了解不同语言的文化差异和表达习惯，能够进行地道的本地化翻译。对于专业术语，你会提供准确的翻译并在必要时添加注释。'
    }
  },
  {
    id: 'assistant',
    name: '私人助理',
    emoji: '🎯',
    description: '日程管理、任务提醒、信息整理的好帮手',
    tags: ['效率', '管理', '提醒'],
    gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    config: { 
      category: 'efficiency', 
      avatar: '🎯',
      personality: '你是一位高效的私人助理，擅长日程管理、任务规划、信息整理和提醒服务。你做事有条理、注重效率，能够帮助用户合理安排时间、设置优先级。你会主动询问用户的需求，并提供个性化的建议。在处理任务时，你会确保信息准确、回复及时，并用简洁清晰的方式呈现结果。'
    }
  },
]

const modelOptions = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat', desc: '综合能力强', icon: Bot, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
  { value: 'qwen-turbo', label: '通义千问', desc: '响应速度快', icon: Zap, bgColor: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
  { value: 'doubao-pro-32k', label: '豆包 Pro', desc: '长文本支持', icon: Cpu, bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
]

const emojiOptions = ['🤖', '👨‍🏫', '👩‍💼', '🧙‍♂️', '🤵', '🦸', '🦹', '👽', '🐱', '🦊', '🐼', '🦁', '🐯', '🦄', '🐲', '🧛', '👻', '🤠', '😎', '🥷']

const generateExamples = [
  '幽默风趣的物理老师',
  '严谨专业的法律顾问',
  '温柔耐心的心理咨询师',
  '犀利毒舌的影评人',
  '充满创意的广告文案',
]

const isPublished = computed(() => initialAgentData.value?.isPublished || false)

const canProceed = computed(() => {
  if (currentStep.value === 0) return true
  if (currentStep.value === 1) return form.name.trim().length > 0
  return true
})

const isFormValid = computed(() => {
  return form.name.trim().length > 0
})

function selectTemplate(templateId) {
  selectedTemplate.value = templateId
  if (templateId) {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      form.avatar = template.config.avatar || template.emoji
      form.name = template.name
      form.category = template.config.category
      form.personality = template.config.personality
    }
  }
}

function nextStep() {
  if (currentStep.value < steps.length - 1 && canProceed.value) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function getCategoryLabel(category) {
  const cat = AGENT_CATEGORIES.find(c => c.value === category)
  return cat?.label || null
}

function getModelLabel(model) {
  const m = modelOptions.find(opt => opt.value === model)
  return m?.label || model
}

function getVoiceName(voice) {
  const voiceMap = {
    '': '跟随系统设置',
    // 普通话女声
    'Cherry': 'Cherry - 标准女声',
    'Serena': 'Serena - 温柔女声',
    'Chelsie': 'Chelsie - 活力女声',
    'Momo': 'Momo - 可爱女声',
    'Vivian': 'Vivian - 知性女声',
    'Moon': 'Moon - 成熟女声',
    'Maia': 'Maia - 甜美女声',
    'Bella': 'Bella - 活泼女声',
    // 普通话男声
    'Kai': 'Kai - 标准男声',
    'Nofish': 'Nofish - 磁性男声',
    // 方言音色
    'Jada': 'Jada - 粤语女声',
    'Dylan': 'Dylan - 粤语男声',
    'Li': 'Li - 台湾话女声',
    'Marcus': 'Marcus - 台湾话男声',
    'Roy': 'Roy - 东北话男声',
    'Peter': 'Peter - 东北话男声',
    'Sunny': 'Sunny - 东北话女声',
    'Eric': 'Eric - 四川话男声',
    'Rocky': 'Rocky - 四川话男声',
    'Kiki': 'Kiki - 四川话女声'
  }
  return voiceMap[voice] || voice || '跟随系统设置'
}

async function playVoicePreview() {
  if (!previewText.value.trim() || isPlayingPreview.value) return
  
  isPlayingPreview.value = true
  
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: previewText.value.trim(),
        voice: form.voice || undefined,
        speed: form.speechRate
      })
    })
    
    if (!response.ok) {
      throw new Error('语音合成失败')
    }
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value = null
    }
    
    audioElement.value = new Audio(url)
    audioElement.value.onended = () => {
      isPlayingPreview.value = false
      URL.revokeObjectURL(url)
    }
    audioElement.value.onerror = () => {
      isPlayingPreview.value = false
      URL.revokeObjectURL(url)
    }
    
    await audioElement.value.play()
  } catch (err) {
    console.error('语音预览失败:', err)
    alert('语音预览失败: ' + (err.message || '请稍后重试'))
    isPlayingPreview.value = false
  }
}

async function generatePersonality() {
  showGenerateModal.value = true
}

async function submitGenerate() {
  if (!generatePrompt.value.trim()) return
  
  isGenerating.value = true
  try {
    const res = await apiService.post('/agent/generate-config', {
      prompt: generatePrompt.value.trim(),
      type: 'personality'
    })
    
    if (res.personality) {
      form.personality = res.personality
      showGenerateModal.value = false
      generatePrompt.value = ''
    }
  } catch (err) {
    console.error('生成人设失败:', err)
    alert('生成失败: ' + (err.message || '请稍后重试'))
  } finally {
    isGenerating.value = false
  }
}

async function loadAgent() {
  if (!isEditMode.value) return

  try {
    isLoading.value = true
    error.value = null

    const data = await getAgent(agentId)
    const result = data.agent || data
    initialAgentData.value = result

    form.name = result.name
    form.description = result.description || ''
    form.avatar = result.avatar || '🤖'
    form.category = result.category || ''
    form.model = result.model || 'deepseek-chat'
    form.personality = result.personality || ''
    form.initialMemory = result.initialMemory || ''
    form.voice = result.voice || ''
    form.speechRate = result.speechRate || 150
    
    if (result.knowledgeBaseId && typeof result.knowledgeBaseId === 'object') {
      form.knowledgeBaseId = result.knowledgeBaseId.id || result.knowledgeBaseId._id?.toString() || null
    } else {
      form.knowledgeBaseId = result.knowledgeBaseId || null
    }

    currentStep.value = 1
  } catch (err) {
    error.value = err.message
    console.error('加载智能体失败:', err.message)
  } finally {
    isLoading.value = false
  }
}

async function loadKnowledgeBases() {
  try {
    const res = await apiService.get('/knowledge')
    knowledgeBases.value = res.kbs || []
  } catch (err) {
    console.error('加载知识库失败:', err)
  }
}

async function handleSubmit() {
  try {
    isSubmitting.value = true
    error.value = null

    if (isEditMode.value) {
      const updateData = {
        name: form.name,
        description: form.description,
        avatar: form.avatar,
        category: form.category,
        knowledgeBaseId: form.knowledgeBaseId
      }

      if (!isPublished.value) {
        Object.assign(updateData, {
          model: form.model,
          personality: form.personality,
          initialMemory: form.initialMemory,
          voice: form.voice,
          speechRate: form.speechRate
        })
      }

      await updateAgent(agentId, updateData, token.value)
    } else {
      await createAgent({
        name: form.name,
        description: form.description,
        avatar: form.avatar,
        category: form.category,
        model: form.model,
        personality: form.personality,
        initialMemory: form.initialMemory,
        voice: form.voice,
        speechRate: form.speechRate,
        knowledgeBaseId: form.knowledgeBaseId
      }, token.value)
    }

    router.push('/agent/my-agents')
  } catch (err) {
    error.value = err.message
    console.error('保存失败:', err.message)
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.push('/agent/my-agents')
}

onMounted(() => {
  loadKnowledgeBases()
  loadAgent()
})
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #7c3aed;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.2);
}

select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.dark select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
