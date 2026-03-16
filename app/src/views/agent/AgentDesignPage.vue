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
          <!-- System Prompt Editor -->
          <div v-if="activeConfig === 'prompt'" class="editor-panel full-height">
            <SystemPromptEditor
              :soul="agentData.persona.soul"
              :memory="agentData.persona.memory"
              @update="handlePromptUpdate"
            />
          </div>

          <!-- Skills Editor -->
          <div v-if="activeConfig === 'skills'" class="editor-panel full-height skills-panel">
            <div class="skills-header">
              <div class="header-content">
                <div class="header-icon">🎯</div>
                <div class="header-info">
                  <h2>{{ t('agent.design.config.skills') }}</h2>
                  <p>{{ t('agent.design.config.skillsDesc') }}</p>
                </div>
              </div>
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ agentData.skills.length }}</span>
                  <span class="stat-label">{{ t('agent.design.skills.selected') }}</span>
                </div>
              </div>
            </div>
            <div class="skills-body">
              <SkillSelector :bindings="agentData.skills" @update="handleSkillsUpdate" />
            </div>
          </div>

          <!-- MCP Editor -->
          <div v-if="activeConfig === 'mcp'" class="editor-panel full-height mcp-panel">
            <div class="mcp-header">
              <div class="header-content">
                <div class="header-icon">🔌</div>
                <div class="header-info">
                  <h2>{{ t('agent.design.config.mcp') }}</h2>
                  <p>{{ t('agent.design.config.mcpDesc') }}</p>
                </div>
              </div>
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ agentData.mcpServers.length }}</span>
                  <span class="stat-label">{{ t('agent.design.mcp.selected') }}</span>
                </div>
              </div>
            </div>
            <div class="mcp-body">
              <MCPSelector :bindings="agentData.mcpServers" @update="handleMCPUpdate" />
            </div>
          </div>

          <!-- RAG Editor -->
          <div v-if="activeConfig === 'rag'" class="editor-panel">
            <div class="editor-header">
              <h2>{{ t('agent.design.config.rag') }}</h2>
              <p>{{ t('agent.design.config.ragDesc') }}</p>
            </div>
            <div class="editor-body">
              <div class="rag-settings">
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
          <div v-if="activeConfig === 'llm'" class="editor-panel">
            <div class="editor-header">
              <h2>{{ t('agent.design.config.llm') }}</h2>
              <p>{{ t('agent.design.config.llmDesc') }}</p>
            </div>
            <div class="editor-body">
              <div class="llm-settings">
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
                  <input
                    v-model.number="agentData.llm.temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                  />
                  <span class="value">{{ agentData.llm.temperature }}</span>
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
          <div v-if="activeConfig === 'view'" class="editor-panel full-height view-panel">
            <div class="view-header">
              <div class="header-content">
                <div class="header-icon">🎨</div>
                <div class="header-info">
                  <h2>{{ t('agent.design.config.view') }}</h2>
                  <p>{{ t('agent.design.config.viewDesc') }}</p>
                </div>
              </div>
              <div class="header-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ agentData.views.length }}</span>
                  <span class="stat-label">{{ t('agent.design.view.created') }}</span>
                </div>
              </div>
            </div>
            <div class="view-body">
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
  import SystemPromptEditor from '@/components/agent/SystemPromptEditor.vue'
  import SkillSelector from '@/components/agent/SkillSelector.vue'
  import MCPSelector from '@/components/agent/MCPSelector.vue'
  import InteractionViewSelector from '@/components/agent/InteractionViewSelector.vue'
  import type { SkillBinding, MCPServerBinding, InteractionView } from '@/types'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const agentStore = useAgentStore()
  const viewStore = useViewStore()

  // Config items
  const configItems = [
    { key: 'prompt', icon: '💬' },
    { key: 'skills', icon: '🎯' },
    { key: 'mcp', icon: '🔌' },
    { key: 'rag', icon: '📚' },
    { key: 'llm', icon: '🧠' },
    { key: 'view', icon: '🎨' }
  ]

  const activeConfig = ref('prompt')

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
      prompt: !!(agentData.persona.soul || agentData.persona.memory),
      llm: !!agentData.llm.model,
      rag: agentData.knowledge.searchConfig.enabled
    }
    return statusMap[key] ? 'configured' : ''
  }

  function handlePreview() {
    // Preview logic
  }

  function handlePromptUpdate(data: { soul: string; memory: string }) {
    agentData.persona.soul = data.soul
    agentData.persona.memory = data.memory
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

  .agent-name {
    font-size: $font-size-lg;
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

  .editor-panel {
    max-width: 900px;
    margin: 0 auto;

    &.full-height {
      max-width: none;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .editor-header {
    margin-bottom: $spacing-xl;

    h2 {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    p {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0;
    }
  }

  .editor-body {
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-lighter;
    padding: $spacing-xl;
  }

  // Empty State
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
    opacity: 0.6;
  }

  .empty-state h3 {
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;
  }

  .empty-state p {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0 0 $spacing-lg 0;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $primary-light;
    }
  }

  // Settings
  .rag-settings,
  .llm-settings {
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

    input[type='range'] {
      flex: 1;
    }

    .value {
      width: 40px;
      font-size: $font-size-sm;
      color: $text-secondary;
      text-align: right;
    }

    input[type='checkbox'] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }

  // Design Editor
  .design-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .design-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: $text-tertiary;

    .placeholder-icon {
      font-size: 64px;
      margin-bottom: $spacing-md;
      opacity: 0.4;
    }

    p {
      font-size: $font-size-sm;
    }
  }

  // Skills Panel
  .skills-panel {
    display: flex;
    flex-direction: column;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-lighter;
    overflow: hidden;
  }

  .skills-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
    border-radius: $border-radius-lg;
    font-size: 24px;
  }

  .header-info {
    h2 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    p {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0;
    }
  }

  .header-stats {
    display: flex;
    gap: $spacing-lg;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-sm $spacing-lg;
    background: $bg-primary;
    border-radius: $border-radius-md;
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

  .skills-body {
    flex: 1;
    overflow: hidden;
    padding: $spacing-lg;
  }

  // MCP Panel
  .mcp-panel {
    display: flex;
    flex-direction: column;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-lighter;
    overflow: hidden;

    .header-icon {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.15) 0%,
        rgba(59, 130, 246, 0.15) 100%
      );
    }

    .stat-value {
      color: #10b981;
    }
  }

  .mcp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .mcp-body {
    flex: 1;
    overflow: hidden;
    padding: $spacing-lg;
  }

  // View Panel
  .view-panel {
    display: flex;
    flex-direction: column;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-lighter;
    overflow: hidden;

    .header-icon {
      background: linear-gradient(
        135deg,
        rgba(168, 85, 247, 0.15) 0%,
        rgba(236, 72, 153, 0.15) 100%
      );
    }

    .stat-value {
      color: #a855f7;
    }
  }

  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .view-body {
    flex: 1;
    overflow: hidden;
    padding: $spacing-lg;
  }
</style>
