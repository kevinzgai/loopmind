<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-12">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <div class="container flex h-16 items-center justify-between px-4 md:px-6">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Bot class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="font-semibold text-lg text-slate-900 dark:text-slate-100">
              {{ isEditMode ? '编辑智能体' : '创建智能体' }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">定制你的专属 AI 助手</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            @click="$emit('submit')"
            :disabled="isSubmitting"
            class="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg shadow-md shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            {{ isSubmitting ? '保存中...' : (isEditMode ? '保存' : '创建') }}
          </button>
        </div>
      </div>
    </header>

    <main class="container px-4 md:px-6 py-8">
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- 左侧：表单配置 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- AI 智能生成卡片 -->
          <div v-if="!isPublished" class="rounded-2xl border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 p-6">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                <Sparkles class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">AI 智能配置</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400">描述需求，让 AI 自动填写所有配置</p>
              </div>
            </div>
            <div class="flex gap-3">
              <textarea
                v-model="generatePrompt"
                placeholder="例如：我想要一个严厉的数学老师，擅长高等数学，说话风格幽默严谨，喜欢用比喻解释概念..."
                class="flex-1 min-h-[80px] px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm resize-none"
                :disabled="isGenerating"
              />
              <button
                type="button"
                @click="handleAutoGenerate"
                :disabled="isGenerating || !generatePrompt.trim()"
                class="shrink-0 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-md shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Loader2 v-if="isGenerating" class="w-4 h-4 animate-spin" />
                <Sparkles v-else class="w-4 h-4" />
                {{ isGenerating ? '生成中' : '生成' }}
              </button>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-slate-100">基本信息</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">给你的智能体一个清晰的标识</p>
              </div>
            </div>
            <div class="p-6 space-y-5">
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                    名称 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="数学导师"
                    maxlength="50"
                    required
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                  />
                  <div class="flex justify-end">
                    <span class="text-xs text-slate-500">{{ form.name.length }}/50</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">分类</label>
                  <select
                    v-model="form.category"
                    required
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>选择分类</option>
                    <option v-for="cat in AGENT_CATEGORIES" :key="cat.value" :value="cat.value">
                      {{ cat.icon }} {{ cat.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">简短描述</label>
                <textarea
                  v-model="form.description"
                  placeholder="用一句话介绍你的智能体"
                  maxlength="500"
                  rows="2"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm resize-none"
                />
                <div class="flex justify-end">
                  <span class="text-xs text-slate-500">{{ form.description.length }}/500</span>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">关联知识库</label>
                <select
                  v-model="form.knowledgeBaseId"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option :value="null">🧠 纯模型对话</option>
                  <option v-for="kb in knowledgeBases" :key="kb.id" :value="kb.id">
                    📚 {{ kb.name }} ({{ kb.documentCount }} 篇)
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- AI 模型配置 -->
          <div v-if="!isPublished" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BrainCircuit class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-slate-100">AI 模型配置</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">选择智能体的大脑和核心设定</p>
              </div>
            </div>
            <div class="p-6 space-y-5">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">AI 模型</label>
                <div class="grid gap-3 sm:grid-cols-2">
                  <select
                    v-model="form.model"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <optgroup label="推荐">
                      <option value="deepseek-chat">DeepSeek Chat</option>
                      <option value="qwen-turbo">通义千问 Turbo</option>
                      <option value="doubao-pro-32k">豆包 Pro</option>
                    </optgroup>
                    <optgroup label="DeepSeek">
                      <option v-for="m in deepseekModels" :key="m.value" :value="m.value">{{ m.label }}</option>
                    </optgroup>
                    <optgroup label="SiliconFlow">
                      <option v-for="m in siliconflowModels" :key="m.value" :value="m.value">{{ m.label }}</option>
                    </optgroup>
                  </select>
                  <input
                    v-model="form.model"
                    type="text"
                    placeholder="或输入自定义模型 ID"
                    class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">人设与指令</label>
                <textarea
                  v-model="form.personality"
                  placeholder="详细描述智能体的性格、说话风格、专业领域等"
                  maxlength="1000"
                  rows="6"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm resize-none font-mono"
                />
                <div class="flex justify-end">
                  <span class="text-xs text-slate-500">{{ form.personality.length }}/1000</span>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">长期记忆 / 背景设定</label>
                <textarea
                  v-model="form.initialMemory"
                  placeholder="赋予智能体一些预设的记忆或背景信息"
                  maxlength="500"
                  rows="3"
                  class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <!-- 形象与语音 -->
          <div v-if="!isPublished" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Volume2 class="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-slate-100">形象与语音</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">让智能体更有个性</p>
              </div>
            </div>
            <div class="p-6 space-y-6">
              <!-- 头像选择 -->
              <div class="space-y-4">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">头像</label>
                <div class="flex items-start gap-4">
                  <div class="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    <span v-if="!form.avatar || avatarType === 'emoji'" class="text-4xl">{{ form.avatar || '🤖' }}</span>
                    <img v-else :src="form.avatar" alt="Avatar" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 space-y-3">
                    <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                      <button
                        type="button"
                        @click="avatarType = 'emoji'"
                        :class="[
                          'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                          avatarType === 'emoji' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        ]"
                      >
                        Emoji
                      </button>
                      <button
                        type="button"
                        @click="avatarType = 'url'"
                        :class="[
                          'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                          avatarType === 'url' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        ]"
                      >
                        图片链接
                      </button>
                    </div>
                    <div v-if="avatarType === 'emoji'" class="grid grid-cols-8 gap-2">
                      <button
                        v-for="emoji in emojiOptions"
                        :key="emoji"
                        type="button"
                        @click="form.avatar = emoji"
                        :class="[
                          'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                          form.avatar === emoji 
                            ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500' 
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-transparent'
                        ]"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                    <input
                      v-else
                      v-model="form.avatar"
                      type="url"
                      placeholder="https://example.com/avatar.png"
                      class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- 语音配置 -->
              <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">音色</label>
                  <div class="flex gap-2">
                    <select
                      v-model="form.voice"
                      class="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="">跟随系统</option>
                      <optgroup label="推荐">
                        <option value="xiaoxian">小仙 (女，温柔)</option>
                        <option value="aiting">艾婷 (女，甜美)</option>
                      </optgroup>
                      <optgroup label="其他">
                        <option value="longcheng">龙成 (男，沉稳)</option>
                        <option value="xiaomei">小美 (女，活泼)</option>
                      </optgroup>
                    </select>
                    <button
                      type="button"
                      @click="previewVoice"
                      :disabled="!form.voice"
                      class="px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Volume2 class="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-medium text-slate-700 dark:text-slate-300">语速</label>
                    <span class="text-sm text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{ form.speechRate }}</span>
                  </div>
                  <input
                    type="range"
                    v-model.number="form.speechRate"
                    :min="50"
                    :max="400"
                    :step="10"
                    class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <div class="flex justify-between text-xs text-slate-400">
                    <span>慢</span>
                    <span>正常</span>
                    <span>快</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 发布状态 -->
          <div v-if="isEditMode && initialData" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Activity class="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-slate-100">发布状态</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">管理智能体的上线状态</p>
              </div>
            </div>
            <div class="p-6">
              <div :class="[
                'p-4 rounded-xl border flex items-start gap-3',
                isPublished 
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' 
                  : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30'
              ]">
                <CheckCircle2 v-if="isPublished" class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <AlertCircle v-else class="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                <div class="flex-1">
                  <h4 :class="['font-semibold text-sm mb-1', isPublished ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400']">
                    {{ isPublished ? '已上线' : '草稿状态' }}
                  </h4>
                  <p :class="['text-xs', isPublished ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500']">
                    {{ isPublished ? '智能体对外可见，核心配置已锁定' : '仅你可见，可自由修改所有配置' }}
                  </p>
                </div>
              </div>
              <div v-if="isPublished" class="mt-4 space-y-3">
                <p class="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  💡 提示：修改核心参数需先下架智能体
                </p>
                <button
                  type="button"
                  @click="$emit('unpublish')"
                  class="w-full px-4 py-2.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg font-medium transition-all text-sm"
                >
                  下架智能体
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：实时预览 -->
        <div class="space-y-6">
          <div class="sticky top-24 space-y-6">
            <!-- 预览卡片 -->
            <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
                <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">实时预览</h3>
                <span class="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              <div class="p-6">
                <div class="flex items-start gap-4 mb-4">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                    <span v-if="!form.avatar || avatarType === 'emoji'" class="text-3xl">{{ form.avatar || '🤖' }}</span>
                    <img v-else :src="form.avatar" alt="Avatar" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {{ form.name || '未命名智能体' }}
                    </h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {{ form.description || '暂无描述' }}
                    </p>
                    <div class="flex gap-2 mt-2">
                      <span class="inline-flex px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium">
                        {{ getCategoryLabel(form.category) || '未分类' }}
                      </span>
                      <span class="inline-flex px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-900/30">
                        {{ form.model || '未选择' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide mb-1 font-medium">人设</div>
                    <p class="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                      {{ form.personality || '暂无人设' }}
                    </p>
                  </div>
                  <div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide mb-1 font-medium">记忆</div>
                    <p class="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {{ form.initialMemory || '暂无记忆' }}
                    </p>
                  </div>
                  <div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide mb-1 font-medium">知识库</div>
                    <p class="text-sm text-slate-700 dark:text-slate-300">
                      {{ getKnowledgeBaseName(form.knowledgeBaseId) || '无' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 快捷提示 -->
            <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span class="text-lg">💡</span> 优化建议
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-2">
                  <CheckCircle2 class="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">名称控制在 2-6 个字，易于记忆</span>
                </div>
                <div class="flex items-start gap-2">
                  <CheckCircle2 class="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">人设描述越详细，AI 表现越精准</span>
                </div>
                <div class="flex items-start gap-2">
                  <CheckCircle2 class="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span class="text-sm text-slate-600 dark:text-slate-400">关联知识库可提升专业领域回答质量</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Sparkles, Loader2, FileText, BrainCircuit, Volume2, Bot,
  CheckCircle2, AlertCircle, Activity
} from 'lucide-vue-next'
import { AGENT_CATEGORIES } from '@/constants/agent.js'

const props = defineProps({
  modelValue: Object,
  initialData: Object,
  isEditMode: Boolean,
  isPublished: Boolean,
  isSubmitting: Boolean,
  isUnpublishing: Boolean,
  currentProvider: String,
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'unpublish'])

const form = reactive(props.modelValue || {
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

const avatarType = ref('emoji')
const generatePrompt = ref('')
const isGenerating = ref(false)
const knowledgeBases = ref([])

const deepseekModels = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'deepseek-coder', label: 'DeepSeek Coder' },
]
const siliconflowModels = [
  { value: 'qwen2.5-72b-instruct', label: 'Qwen2.5 72B Instruct' },
  { value: 'qwen2.5-32b-instruct', label: 'Qwen2.5 32B Instruct' },
]
const emojiOptions = ['🤖', '👨‍🏫', '👩‍💼', '🧙', '🤵', '🦸', '🦹', '👽', '🐱', '🦊']

function getCategoryLabel(category) {
  const cat = AGENT_CATEGORIES.find(c => c.value === category)
  return cat?.label || null
}

function getKnowledgeBaseName(kbId) {
  if (!kbId) return null
  const kb = knowledgeBases.value.find(k => k.id === kbId)
  return kb?.name || null
}

async function handleAutoGenerate() {
  if (!generatePrompt.value.trim()) return
  isGenerating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('生成配置:', generatePrompt.value)
  } catch (err) {
    console.error('生成失败:', err)
  } finally {
    isGenerating.value = false
  }
}

async function previewVoice() {
  if (!form.voice) return
  console.log('预览音色:', form.voice)
}

async function loadKnowledgeBases() {
  try {
    knowledgeBases.value = [
      { id: '1', name: '编程知识库', documentCount: 15 },
      { id: '2', name: '医学资料', documentCount: 8 },
    ]
  } catch (err) {
    console.error('加载知识库失败:', err)
  }
}

onMounted(() => {
  loadKnowledgeBases()
})
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
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
</style>
