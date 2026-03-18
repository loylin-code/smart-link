<template>
  <div class="agent-design-page">
    <!-- Top Info Bar -->
    <header class="info-bar">
      <div class="info-left">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="agent-info">
          <div class="agent-avatar">{{ agentData.avatar || agentData.name?.charAt(0) || '?' }}</div>
          <div class="agent-meta">
            <h1 class="agent-name">{{ agentData.name || t('agent.design.untitled') }}</h1>
            <span class="agent-type">{{ getTypeLabel(agentData.category) }}</span>
          </div>
        </div>
      </div>
      <div class="info-right">
        <div class="status-selector">
          <select v-model="agentData.status">
            <option value="draft">{{ t('agent.status.draft') }}</option>
            <option value="active">{{ t('agent.status.active') }}</option>
            <option value="paused">{{ t('agent.status.paused') }}</option>
          </select>
        </div>
        <button class="action-btn preview" @click="handlePreview">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              stroke-width="2"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>{{ t('agent.design.preview') }}</span>
        </button>
        <button class="action-btn save" @click="handleSave">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
              stroke="currentColor"
              stroke-width="2"
            />
            <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>{{ t('agent.design.save') }}</span>
        </button>
        <button class="action-btn publish" @click="handlePublish">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>{{ t('agent.design.publish') }}</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Sidebar - Config Navigation -->
      <aside class="config-sidebar">
        <nav class="config-nav">
          <button
            v-for="item in configItems"
            :key="item.key"
            class="nav-item"
            :class="{ active: activeConfig === item.key }"
            @click="activeConfig = item.key"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ t(`agent.design.config.${item.key}`) }}</span>
            <span
              v-if="getConfigStatus(item.key)"
              class="nav-status"
              :class="getConfigStatus(item.key)"
            >
              {{ getConfigStatus(item.key) === 'configured' ? '✓' : '' }}
            </span>
          </button>
        </nav>
      </aside>

      <!-- Editor Area -->
      <main class="editor-area">
        <div class="editor-container">
          <!-- Soul Editor (人格定义) -->
          <div v-if="activeConfig === 'soul'" class="editor-panel full-height" data-config="soul">
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon">🧬</div>
                <div class="panel-info">
                  <h2 class="panel-title">{{ t('agent.design.config.soul') }}</h2>
                  <p class="panel-desc">{{ t('agent.design.config.soulDesc') }}</p>
                </div>
              </div>
              <div class="panel-header-right">
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

            <div class="panel-body">
              <textarea
                v-model="agentData.persona.soul"
                class="code-editor"
                :placeholder="t('agent.design.prompt.soulPlaceholder')"
              />
            </div>

            <div class="panel-footer">
              <span
                >{{ t('agent.design.prompt.chars') }}:
                {{ agentData.persona.soul?.length || 0 }}</span
              >
              <span
                >{{ t('agent.design.prompt.words') }}:
                {{ countWords(agentData.persona.soul) }}</span
              >
            </div>
          </div>

          <!-- Memory Editor (记忆) -->
          <div
            v-if="activeConfig === 'memory'"
            class="editor-panel full-height"
            data-config="memory"
          >
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon">🧠</div>
                <div class="panel-info">
                  <h2 class="panel-title">{{ t('agent.design.config.memory') }}</h2>
                  <p class="panel-desc">{{ t('agent.design.config.memoryDesc') }}</p>
                </div>
              </div>
              <div class="panel-header-right">
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

            <div class="panel-body">
              <textarea
                v-model="agentData.persona.memory"
                class="code-editor"
                :placeholder="t('agent.design.prompt.memoryPlaceholder')"
              />
            </div>

            <div class="panel-footer">
              <span
                >{{ t('agent.design.prompt.chars') }}:
                {{ agentData.persona.memory?.length || 0 }}</span
              >
              <span
                >{{ t('agent.design.prompt.words') }}:
                {{ countWords(agentData.persona.memory) }}</span
              >
            </div>
          </div>

          <!-- Skills Editor -->
          <div
            v-if="activeConfig === 'skills'"
            class="editor-panel full-height"
            data-config="skills"
          >
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon">🎯</div>
                <div class="panel-info">
                  <h2 class="panel-title">{{ t('agent.design.config.skills') }}</h2>
                  <p class="panel-desc">{{ t('agent.design.config.skillsDesc') }}</p>
                </div>
              </div>
              <div class="panel-header-right">
                <div class="panel-stat">
                  <span class="stat-value">{{ agentData.skills.length }}</span>
                  <span class="stat-label">{{ t('agent.design.skills.selected') }}</span>
                </div>
              </div>
            </div>
            <div class="panel-body">
              <SkillSelector :bindings="agentData.skills" @update="handleSkillsUpdate" />
            </div>
          </div>

          <!-- MCP Editor -->
          <div v-if="activeConfig === 'mcp'" class="editor-panel full-height" data-config="mcp">
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon">🔌</div>
                <div class="panel-info">
                  <h2 class="panel-title">{{ t('agent.design.config.mcp') }}</h2>
                  <p class="panel-desc">{{ t('agent.design.config.mcpDesc') }}</p>
                </div>
              </div>
              <div class="panel-header-right">
                <div class="panel-stat">
                  <span class="stat-value">{{ agentData.mcpServers.length }}</span>
                  <span class="stat-label">{{ t('agent.design.mcp.selected') }}</span>
                </div>
              </div>
            </div>
            <div class="panel-body">
              <MCPSelector :bindings="agentData.mcpServers" @update="handleMCPUpdate" />
            </div>
          </div>

          <!-- RAG Editor -->
          <div v-if="activeConfig === 'rag'" class="editor-panel" data-config="rag">
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon">📚</div>
                <div class="panel-info">
                  <h2 class="panel-title">{{ t('agent.design.config.rag') }}</h2>
                  <p class="panel-desc">{{ t('agent.design.config.ragDesc') }}</p>
                </div>
              </div>
            </div>
            <div class="panel-body">
              <div class="settings-grid">
                <div class="setting-item">
                  <label>{{ t('agent.design.rag.enable') }}</label>
                  <input v-model="agentData.knowledge.searchConfig.enabled" type="checkbox" />
                </div>
                <div class="setting-item">
                  <label>{{ t('agent.design.rag.topK') }}</label>
                  <input
                    v-model.number="agentData.knowledge.searchConfig.topK"
                    type="number"
                    min="1"
                    max="20"
                  />
                </div>
                <div class="setting-item">
                  <label>{{ t('agent.design.rag.threshold') }}</label>
                  <input
                    v-model.number="agentData.knowledge.searchConfig.similarityThreshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- LLM Editor -->
          <div v-if="activeConfig === 'llm'" class="editor-panel" data-config="llm">
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon">⚙️</div>
                <div class="panel-info">
                  <h2 class="panel-title">{{ t('agent.design.config.llm') }}</h2>
                  <p class="panel-desc">{{ t('agent.design.config.llmDesc') }}</p>
                </div>
              </div>
            </div>
            <div class="panel-body">
              <div class="settings-grid">
                <div class="setting-item">
                  <label>{{ t('agent.design.llm.provider') }}</label>
                  <select v-model="agentData.llm.provider">
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="ollama">Ollama</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label>{{ t('agent.design.llm.model') }}</label>
                  <select v-model="agentData.llm.model">
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label>{{ t('agent.design.llm.temperature') }}</label>
                  <div class="slider-group">
                    <input
                      v-model.number="agentData.llm.temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                    />
                    <span class="slider-value">{{ agentData.llm.temperature }}</span>
                  </div>
                </div>
                <div class="setting-item">
                  <label>{{ t('agent.design.llm.maxTokens') }}</label>
                  <input
                    v-model.number="agentData.llm.maxTokens"
                    type="number"
                    min="100"
                    max="128000"
                    step="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Interaction View Editor -->
          <div v-if="activeConfig === 'view'" class="editor-panel full-height" data-config="view">
            <div class="panel-header">
              <div class="panel-header-left">
                <div class="panel-icon">🎨</div>
                <div class="panel-info">
                  <h2 class="panel-title">{{ t('agent.design.config.view') }}</h2>
                  <p class="panel-desc">{{ t('agent.design.config.viewDesc') }}</p>
                </div>
              </div>
              <div class="panel-header-right">
                <div class="panel-stat">
                  <span class="stat-value">{{ agentData.views.length }}</span>
                  <span class="stat-label">{{ t('agent.design.view.created') }}</span>
                </div>
              </div>
            </div>
            <div class="panel-body">
              <InteractionViewSelector v-model="agentData.views" />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAgentStore } from '@/store/modules/agent'
  import { useViewStore } from '@/store/modules/view'
  import SkillSelector from '@/components/agent/SkillSelector.vue'
  import MCPSelector from '@/components/agent/MCPSelector.vue'
  import InteractionViewSelector from '@/components/agent/InteractionViewSelector.vue'
  import type { SkillBinding, MCPServerBinding, InteractionView } from '@/types'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const agentStore = useAgentStore()
  const viewStore = useViewStore()

  // Template visibility
  const showSoulTemplates = ref(false)
  const showMemoryTemplates = ref(false)

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

  // Config items
  const configItems = [
    { key: 'soul', icon: '🧬' },
    { key: 'memory', icon: '🧠' },
    { key: 'skills', icon: '🎯' },
    { key: 'mcp', icon: '🔌' },
    { key: 'rag', icon: '📚' },
    { key: 'llm', icon: '⚙️' },
    { key: 'view', icon: '🎨' }
  ]

  const activeConfig = ref('soul')

  // Agent data - split persona into soul and memory
  const agentData = reactive({
    id: '',
    name: '',
    code: '',
    description: '',
    avatar: '',
    category: 'conversational',
    status: 'draft',
    persona: {
      soul: '',
      memory: ''
    },
    welcomeMessage: '',
    skills: [] as SkillBinding[],
    mcpServers: [] as MCPServerBinding[],
    views: [] as InteractionView[],
    llm: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1
    },
    knowledge: {
      searchConfig: {
        enabled: false,
        topK: 5,
        similarityThreshold: 0.7,
        rerankEnabled: false
      }
    }
  })

  // Methods
  function handleBack() {
    router.push('/app/agent/design')
  }

  function getTypeLabel(category: string): string {
    const labels: Record<string, string> = {
      conversational: t('agent.categories.conversational'),
      workflow: t('agent.categories.workflow'),
      automation: t('agent.categories.automation')
    }
    return labels[category] || category
  }

  function getConfigStatus(key: string): string {
    const statusMap: Record<string, boolean> = {
      soul: !!agentData.persona.soul,
      memory: !!agentData.persona.memory,
      llm: !!agentData.llm.model,
      rag: agentData.knowledge.searchConfig.enabled
    }
    return statusMap[key] ? 'configured' : ''
  }

  function applyTemplate(type: 'soul' | 'memory', template: (typeof soulTemplates)[0]) {
    agentData.persona[type] = template.content
    if (type === 'soul') {
      showSoulTemplates.value = false
    } else {
      showMemoryTemplates.value = false
    }
  }

  function countWords(text: string): number {
    if (!text) return 0
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const english = (text.match(/[a-zA-Z]+/g) || []).length
    return chinese + english
  }

  function handlePreview() {
    // Preview logic
  }

  function handleSkillsUpdate(bindings: SkillBinding[]) {
    agentData.skills = bindings
  }

  function handleMCPUpdate(bindings: MCPServerBinding[]) {
    agentData.mcpServers = bindings
  }

  // Sync views from store (called when switching to view tab)
  function syncViewsFromStore() {
    const storeViews = viewStore.getViewsAsArray()
    if (storeViews.length > 0) {
      agentData.views = storeViews
    }
  }

  // Watch activeConfig to sync views when switching to view tab
  watch(activeConfig, (newConfig) => {
    if (newConfig === 'view') {
      syncViewsFromStore()
    }
  })

  async function handleSave() {
    // Save logic
  }

  async function handlePublish() {
    // Publish logic
  }

  // Load agent data if editing
  onMounted(async () => {
    const id = route.params.id as string

    // Check if returning from view orchestration
    if (route.query.tab === 'view') {
      activeConfig.value = 'view'
      syncViewsFromStore()
    }

    if (id && id !== 'new') {
      const agent = await agentStore.fetchAgent(id)
      if (agent) {
        Object.assign(agentData, {
          id: agent.id,
          name: agent.identity.name,
          code: agent.identity.code,
          description: agent.identity.description,
          avatar: agent.identity.avatar,
          category: agent.category,
          status: agent.status,
          persona: agent.identity.persona,
          welcomeMessage: agent.identity.welcomeMessage,
          llm: agent.capabilities.llm,
          knowledge: agent.knowledge
        })
      }
    }
  })
</script>

<style scoped lang="scss">
  .agent-design-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: $bg-secondary;
    overflow: hidden;
  }

  // Info Bar
  .info-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-xl;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .info-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .agent-info {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .agent-avatar {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
  }

  .agent-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .agent-meta h1.agent-name {
    font-size: $font-size-lg !important;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .agent-type {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .info-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .status-selector select {
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.publish {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
      }
    }
  }

  // Main Content
  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  // Config Sidebar
  .config-sidebar {
    width: 240px;
    background: $bg-primary;
    border-right: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .config-nav {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    width: 100%;
    padding: $spacing-md;
    background: transparent;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      background: $bg-secondary;
    }

    &.active {
      background: rgba(59, 130, 246, 0.1);
      color: $primary-color;
      font-weight: $font-weight-medium;
    }
  }

  .nav-icon {
    font-size: 18px;
  }

  .nav-label {
    flex: 1;
  }

  .nav-status {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 10px;

    &.configured {
      background: $success;
      color: #fff;
    }
  }

  // Editor Area
  .editor-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .editor-container {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-xl;
  }

  // ============================================
  // 统一的面板样式
  // ============================================
  .editor-panel {
    max-width: 900px;
    margin: 0 auto;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-lighter;
    overflow: hidden;

    &.full-height {
      max-width: none;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  // 面板头部 - 统一结构
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .panel-header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .panel-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
    border-radius: $border-radius-lg;
    font-size: 24px;
    flex-shrink: 0;
  }

  .panel-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .panel-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .panel-desc {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0;
  }

  .panel-header-right {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  // 面板统计
  .panel-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-sm $spacing-lg;
    background: $bg-primary;
    border-radius: $border-radius-md;
    min-width: 80px;
  }

  .stat-value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $primary-color;
    line-height: 1;
  }

  .stat-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: $spacing-xs;
  }

  // 模板按钮
  .template-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // 面板内容区
  .panel-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: $spacing-lg;

    // 如果是代码编辑器，移除padding（编辑器自带padding）
    > .code-editor {
      padding: 0;
      margin: (-$spacing-lg);
      flex: 1;
    }
  }

  // 代码编辑器
  .code-editor {
    flex: 1;
    padding: $spacing-lg;
    background: transparent;
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

  // 面板底部
  .panel-footer {
    display: flex;
    gap: $spacing-lg;
    padding: $spacing-sm $spacing-lg;
    background: $bg-secondary;
    border-top: 1px solid $border-color-lighter;
    font-size: $font-size-xs;
    color: $text-tertiary;
    flex-shrink: 0;
  }

  // 模板面板
  .templates-panel {
    padding: $spacing-md;
    background: $bg-tertiary;
    border-bottom: 1px solid $border-color-lighter;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm;
    flex-shrink: 0;
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

  // ============================================
  // 设置表单样式
  // ============================================
  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .setting-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    label {
      width: 120px;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-primary;
      flex-shrink: 0;
    }

    select,
    input[type='number'] {
      flex: 1;
      padding: $spacing-sm $spacing-md;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-md;
      font-size: $font-size-sm;
      color: $text-primary;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }

    input[type='checkbox'] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }

  .slider-group {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    input[type='range'] {
      flex: 1;
    }

    .slider-value {
      width: 40px;
      font-size: $font-size-sm;
      color: $text-secondary;
      text-align: right;
    }
  }

  // ============================================
  // 不同配置项的图标颜色
  // ============================================
  .editor-panel {
    // Soul - 紫色
    &[data-config='soul'] .panel-icon {
      background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.15) 0%,
        rgba(236, 72, 153, 0.15) 100%
      );
    }

    // Memory - 青色
    &[data-config='memory'] .panel-icon {
      background: linear-gradient(
        135deg,
        rgba(6, 182, 212, 0.15) 0%,
        rgba(59, 130, 246, 0.15) 100%
      );
    }

    // Skills - 蓝色
    &[data-config='skills'] .panel-icon {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.15) 0%,
        rgba(99, 102, 241, 0.15) 100%
      );
    }

    // MCP - 绿色
    &[data-config='mcp'] .panel-icon {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.15) 0%,
        rgba(34, 197, 94, 0.15) 100%
      );
    }

    // RAG - 橙色
    &[data-config='rag'] .panel-icon {
      background: linear-gradient(
        135deg,
        rgba(249, 115, 22, 0.15) 0%,
        rgba(234, 179, 8, 0.15) 100%
      );
    }

    // LLM - 灰色
    &[data-config='llm'] .panel-icon {
      background: linear-gradient(
        135deg,
        rgba(100, 116, 139, 0.15) 0%,
        rgba(71, 85, 105, 0.15) 100%
      );
    }

    // View - 粉色
    &[data-config='view'] .panel-icon {
      background: linear-gradient(
        135deg,
        rgba(236, 72, 153, 0.15) 0%,
        rgba(244, 114, 182, 0.15) 100%
      );
    }
  }

  // 统计值的颜色
  .editor-panel[data-config='skills'] .stat-value {
    color: $primary-color;
  }

  .editor-panel[data-config='mcp'] .stat-value {
    color: #10b981;
  }

  .editor-panel[data-config='view'] .stat-value {
    color: #a855f7;
  }

  // ============================================
  // 动画过渡
  // ============================================
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
