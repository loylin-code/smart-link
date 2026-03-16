<template>
  <div class="prompt-editor">
    <!-- Tab Header -->
    <div class="prompt-tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'soul' }" @click="activeTab = 'soul'">
        <span class="tab-icon">🧬</span>
        <span class="tab-label">{{ t('agent.design.prompt.soul') }}</span>
        <span v-if="localData.soul" class="tab-indicator" />
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'memory' }"
        @click="activeTab = 'memory'"
      >
        <span class="tab-icon">🧠</span>
        <span class="tab-label">{{ t('agent.design.prompt.memory') }}</span>
        <span v-if="localData.memory" class="tab-indicator" />
      </button>
    </div>

    <!-- Editor Area -->
    <div class="editor-wrapper">
      <!-- Soul Editor -->
      <div v-show="activeTab === 'soul'" class="editor-section">
        <div class="section-header">
          <div class="header-info">
            <h3>{{ t('agent.design.prompt.soulTitle') }}</h3>
            <p>{{ t('agent.design.prompt.soulDesc') }}</p>
          </div>
          <div class="header-actions">
            <button class="template-btn" @click="showSoulTemplates = !showSoulTemplates">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              {{ t('agent.design.prompt.templates') }}
            </button>
            <button
              class="view-btn"
              :class="{ active: viewMode === 'edit' }"
              @click="viewMode = 'edit'"
            >
              {{ t('agent.design.prompt.edit') }}
            </button>
            <button
              class="view-btn"
              :class="{ active: viewMode === 'preview' }"
              @click="viewMode = 'preview'"
            >
              {{ t('agent.design.prompt.preview') }}
            </button>
          </div>
        </div>

        <!-- Templates Dropdown -->
        <Transition name="slide">
          <div v-if="showSoulTemplates" class="templates-panel">
            <div
              v-for="template in soulTemplates"
              :key="template.id"
              class="template-item"
              @click="applyTemplate('soul', template)"
            >
              <span class="template-icon">{{ template.icon }}</span>
              <div class="template-info">
                <span class="template-name">{{ template.name }}</span>
                <span class="template-desc">{{ template.description }}</span>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Editor -->
        <div class="editor-content">
          <textarea
            v-if="viewMode === 'edit'"
            v-model="localData.soul"
            class="code-editor"
            :placeholder="t('agent.design.prompt.soulPlaceholder')"
          />
          <div v-else class="preview-content" v-html="renderMarkdown(localData.soul)" />
        </div>

        <!-- Stats -->
        <div class="editor-stats">
          <span>{{ t('agent.design.prompt.chars') }}: {{ localData.soul?.length || 0 }}</span>
          <span>{{ t('agent.design.prompt.words') }}: {{ countWords(localData.soul) }}</span>
        </div>
      </div>

      <!-- Memory Editor -->
      <div v-show="activeTab === 'memory'" class="editor-section">
        <div class="section-header">
          <div class="header-info">
            <h3>{{ t('agent.design.prompt.memoryTitle') }}</h3>
            <p>{{ t('agent.design.prompt.memoryDesc') }}</p>
          </div>
          <div class="header-actions">
            <button class="template-btn" @click="showMemoryTemplates = !showMemoryTemplates">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              {{ t('agent.design.prompt.templates') }}
            </button>
            <button
              class="view-btn"
              :class="{ active: viewMode === 'edit' }"
              @click="viewMode = 'edit'"
            >
              {{ t('agent.design.prompt.edit') }}
            </button>
            <button
              class="view-btn"
              :class="{ active: viewMode === 'preview' }"
              @click="viewMode = 'preview'"
            >
              {{ t('agent.design.prompt.preview') }}
            </button>
          </div>
        </div>

        <!-- Templates Dropdown -->
        <Transition name="slide">
          <div v-if="showMemoryTemplates" class="templates-panel">
            <div
              v-for="template in memoryTemplates"
              :key="template.id"
              class="template-item"
              @click="applyTemplate('memory', template)"
            >
              <span class="template-icon">{{ template.icon }}</span>
              <div class="template-info">
                <span class="template-name">{{ template.name }}</span>
                <span class="template-desc">{{ template.description }}</span>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Editor -->
        <div class="editor-content">
          <textarea
            v-if="viewMode === 'edit'"
            v-model="localData.memory"
            class="code-editor"
            :placeholder="t('agent.design.prompt.memoryPlaceholder')"
          />
          <div v-else class="preview-content" v-html="renderMarkdown(localData.memory)" />
        </div>

        <!-- Stats -->
        <div class="editor-stats">
          <span>{{ t('agent.design.prompt.chars') }}: {{ localData.memory?.length || 0 }}</span>
          <span>{{ t('agent.design.prompt.words') }}: {{ countWords(localData.memory) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  interface PromptData {
    soul: string
    memory: string
  }

  const props = defineProps<{
    soul?: string
    memory?: string
  }>()

  const emit = defineEmits<{
    update: [data: PromptData]
  }>()

  const { t } = useI18n()

  // Local state
  const activeTab = ref<'soul' | 'memory'>('soul')
  const viewMode = ref<'edit' | 'preview'>('edit')
  const showSoulTemplates = ref(false)
  const showMemoryTemplates = ref(false)

  const localData = reactive<PromptData>({
    soul: props.soul || '',
    memory: props.memory || ''
  })

  // Soul templates
  const soulTemplates = [
    {
      id: 'professional',
      icon: '💼',
      name: '专业顾问',
      description: '适合客服、咨询场景',
      content: `## 角色定义
你是一位专业的智能助手，具备以下特质：

### 性格特点
- 专业、耐心、细致
- 善于倾听和理解用户需求
- 用简洁清晰的语言表达

### 行为准则
1. 始终保持专业态度
2. 提供准确、有价值的信息
3. 遇到不确定的问题，坦诚说明

### 沟通风格
- 使用礼貌用语
- 避免过度使用表情符号
- 保持回答简洁有力`
    },
    {
      id: 'creative',
      icon: '🎨',
      name: '创意助手',
      description: '适合设计、创作场景',
      content: `## 角色定义
你是一位富有创造力的智能助手：

### 性格特点
- 思维活跃、充满想象
- 善于发现问题和机会
- 鼓励探索和尝试

### 核心能力
- 创意构思与头脑风暴
- 提供多角度思考
- 给出具体可行的建议

### 沟通风格
- 使用生动有趣的语言
- 适时提出启发式问题
- 鼓励用户表达想法`
    },
    {
      id: 'technical',
      icon: '🔧',
      name: '技术专家',
      description: '适合开发、运维场景',
      content: `## 角色定义
你是一位技术领域的专家助手：

### 专业领域
- 软件开发与架构
- 系统运维与优化
- 技术方案设计

### 行为准则
1. 提供准确的技术信息
2. 给出代码示例时确保可运行
3. 解释技术概念时循序渐进

### 输出规范
- 代码使用标准格式
- 关键步骤添加注释
- 给出最佳实践建议`
    }
  ]

  // Memory templates
  const memoryTemplates = [
    {
      id: 'product',
      icon: '📦',
      name: '产品知识库',
      description: '产品信息和功能说明',
      content: `## 产品信息

### 核心功能
- 功能A：描述...
- 功能B：描述...

### 使用限制
- 限制1
- 限制2

### 常见问题
Q: 问题1?
A: 回答1

Q: 问题2?
A: 回答2`
    },
    {
      id: 'user',
      icon: '👤',
      name: '用户画像',
      description: '目标用户特征信息',
      content: `## 用户信息

### 基本特征
- 用户群体：...
- 主要需求：...
- 使用场景：...

### 行为偏好
- 偏好1
- 偏好2

### 历史记录
- 最近交互：...
- 已解决问题：...`
    },
    {
      id: 'context',
      icon: '📋',
      name: '上下文记忆',
      description: '对话上下文信息',
      content: `## 上下文信息

### 当前状态
- 会话主题：...
- 用户意图：...
- 进度状态：...

### 已确认信息
- 信息1
- 信息2

### 待处理事项
- [ ] 事项1
- [ ] 事项2`
    }
  ]

  // Methods
  function applyTemplate(type: 'soul' | 'memory', template: (typeof soulTemplates)[0]) {
    localData[type] = template.content
    if (type === 'soul') {
      showSoulTemplates.value = false
    } else {
      showMemoryTemplates.value = false
    }
  }

  function renderMarkdown(text: string): string {
    if (!text) return ''
    // Simple markdown rendering
    return text
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      .replace(/\n/g, '<br>')
  }

  function countWords(text: string): number {
    if (!text) return 0
    // Count Chinese characters and English words
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const english = (text.match(/[a-zA-Z]+/g) || []).length
    return chinese + english
  }

  // Watch for changes
  watch(
    () => localData,
    (data) => {
      emit('update', { ...data })
    },
    { deep: true }
  )

  // Sync props
  watch(
    () => [props.soul, props.memory],
    ([soul, memory]) => {
      localData.soul = soul || ''
      localData.memory = memory || ''
    }
  )
</script>

<style scoped lang="scss">
  .prompt-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    overflow: hidden;
  }

  // Tab Header
  .prompt-tabs {
    display: flex;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-lighter;
    gap: $spacing-sm;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: $bg-primary;
      border-color: $primary-color;
      color: $primary-color;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
    }
  }

  .tab-icon {
    font-size: 18px;
  }

  .tab-label {
    font-weight: $font-weight-medium;
  }

  .tab-indicator {
    width: 6px;
    height: 6px;
    background: $success;
    border-radius: 50%;
    position: absolute;
    top: 8px;
    right: 8px;
  }

  // Editor Wrapper
  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // Section Header
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-lighter;
  }

  .header-info {
    h3 {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    p {
      font-size: $font-size-xs;
      color: $text-tertiary;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .template-btn,
  .view-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .view-btn.active {
    background: $primary-color;
    border-color: $primary-color;
    color: #fff;
  }

  // Templates Panel
  .templates-panel {
    padding: $spacing-md;
    background: $bg-tertiary;
    border-bottom: 1px solid $border-color-lighter;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm;
  }

  .template-item {
    display: flex;
    align-items: flex-start;
    gap: $spacing-sm;
    padding: $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }
  }

  .template-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .template-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .template-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .template-desc {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  // Editor Content
  .editor-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .code-editor {
    flex: 1;
    padding: $spacing-lg;
    background: $bg-primary;
    border: none;
    outline: none;
    font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
    font-size: $font-size-sm;
    line-height: 1.7;
    color: $text-primary;
    resize: none;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  .preview-content {
    flex: 1;
    padding: $spacing-lg;
    overflow-y: auto;
    font-size: $font-size-sm;
    line-height: 1.8;
    color: $text-primary;

    :deep(h2) {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      margin: $spacing-md 0 $spacing-sm 0;
      color: $text-primary;
    }

    :deep(h3) {
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      margin: $spacing-sm 0;
      color: $text-primary;
    }

    :deep(h4) {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      margin: $spacing-xs 0;
      color: $text-secondary;
    }

    :deep(code) {
      padding: 2px 6px;
      background: $bg-secondary;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: $font-size-xs;
    }

    :deep(li) {
      margin-left: $spacing-md;
      position: relative;

      &::before {
        content: '•';
        position: absolute;
        left: -$spacing-sm;
        color: $primary-color;
      }
    }

    :deep(strong) {
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  // Editor Stats
  .editor-stats {
    display: flex;
    gap: $spacing-lg;
    padding: $spacing-sm $spacing-lg;
    background: $bg-secondary;
    border-top: 1px solid $border-color-lighter;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  // Transitions
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.2s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>
