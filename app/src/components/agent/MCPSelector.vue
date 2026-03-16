<template>
  <div class="mcp-selector">
    <!-- Empty State -->
    <div v-if="selectedServers.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <span class="empty-icon">🔌</span>
      </div>
      <h3>{{ t('agent.design.mcp.emptyTitle') }}</h3>
      <p>{{ t('agent.design.mcp.emptyDesc') }}</p>
      <button class="add-mcp-btn" @click="openModal">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ t('agent.design.mcp.addMCP') }}
      </button>
    </div>

    <!-- Selected MCP List -->
    <div v-else class="mcp-content">
      <div class="content-header">
        <h3>{{ t('agent.design.mcp.selected') }}</h3>
        <span class="count-badge">{{ selectedServers.length }}</span>
        <button class="add-more-btn" @click="openModal">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          {{ t('agent.design.mcp.addMore') }}
        </button>
      </div>

      <TransitionGroup name="mcp-list" tag="div" class="selected-list">
        <div v-for="server in selectedServers" :key="server.id" class="selected-mcp-card">
          <div class="mcp-main">
            <div class="mcp-icon" :class="`icon--${server.transport}`">
              {{ getTransportIcon(server.transport) }}
            </div>
            <div class="mcp-info">
              <span class="mcp-name">{{ server.name }}</span>
              <span class="mcp-meta">
                <span class="mcp-transport">{{ getTransportLabel(server.transport) }}</span>
                <span class="mcp-version">v{{ server.version }}</span>
              </span>
            </div>
          </div>
          <div class="mcp-capabilities">
            <div v-if="server.capabilities.tools > 0" class="capability-tag">
              <span class="cap-icon">🔧</span>
              <span>{{ server.capabilities.tools }}</span>
            </div>
            <div v-if="server.capabilities.resources > 0" class="capability-tag">
              <span class="cap-icon">📁</span>
              <span>{{ server.capabilities.resources }}</span>
            </div>
            <div v-if="server.capabilities.prompts > 0" class="capability-tag">
              <span class="cap-icon">💬</span>
              <span>{{ server.capabilities.prompts }}</span>
            </div>
          </div>
          <div class="mcp-actions">
            <button
              class="toggle-btn"
              :class="{ active: serverBindingMap[server.id]?.required !== false }"
              @click="toggleServerRequired(server.id)"
              :title="
                serverBindingMap[server.id]?.required !== false
                  ? t('agent.design.mcp.optional')
                  : t('agent.design.mcp.required')
              "
            >
              <svg
                v-if="serverBindingMap[server.id]?.required !== false"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </button>
            <button
              class="remove-btn"
              @click="removeServer(server.id)"
              :title="t('agent.design.mcp.remove')"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- MCP Selection Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <!-- Modal Header -->
            <div class="modal-header">
              <h2>{{ t('agent.design.mcp.selectTitle') }}</h2>
              <button class="close-btn" @click="closeModal">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Search & Filter -->
            <div class="modal-filter">
              <div class="search-box">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <input
                  v-model="searchKeyword"
                  type="text"
                  :placeholder="t('agent.design.mcp.search')"
                />
              </div>

              <!-- Transport Tabs -->
              <div class="transport-tabs">
                <button
                  class="transport-tab"
                  :class="{ active: transportFilter === '' }"
                  @click="transportFilter = ''"
                >
                  <span class="tab-icon">📋</span>
                  <span class="tab-label">{{ t('common.all') }}</span>
                </button>
                <button
                  class="transport-tab"
                  :class="{ active: transportFilter === 'stdio' }"
                  @click="transportFilter = 'stdio'"
                >
                  <span class="tab-icon">💻</span>
                  <span class="tab-label">{{ t('mcp.transport.local') }}</span>
                </button>
                <button
                  class="transport-tab"
                  :class="{ active: transportFilter === 'http' }"
                  @click="transportFilter = 'http'"
                >
                  <span class="tab-icon">🌐</span>
                  <span class="tab-label">{{ t('mcp.transport.remote') }}</span>
                </button>
              </div>
            </div>

            <!-- MCP Grid -->
            <div class="modal-body">
              <div v-if="loading" class="loading-state">
                <span class="spinner" />
                <span>{{ t('common.loading') }}</span>
              </div>

              <div v-else-if="filteredServers.length === 0" class="no-results">
                <span class="no-results-icon">🔍</span>
                <p>{{ t('agent.design.mcp.noResults') }}</p>
              </div>

              <div v-else class="mcp-grid">
                <div
                  v-for="server in filteredServers"
                  :key="server.id"
                  class="mcp-card"
                  :class="{
                    selected: isTempSelected(server.id),
                    already: isServerSelected(server.id)
                  }"
                  @click="!isServerSelected(server.id) && toggleTempSelection(server)"
                >
                  <div class="card-checkbox" :class="{ checked: isTempSelected(server.id) }">
                    <svg v-if="isTempSelected(server.id)" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <div class="card-icon" :class="`icon--${server.transport}`">
                    {{ getTransportIcon(server.transport) }}
                  </div>
                  <div class="card-content">
                    <div class="card-header">
                      <span class="card-name">{{ server.name }}</span>
                      <span class="card-version">v{{ server.version }}</span>
                    </div>
                    <p class="card-desc">{{ server.description }}</p>
                    <div class="card-capabilities">
                      <div v-if="server.capabilities.tools > 0" class="cap-item">
                        <span class="cap-icon">🔧</span>
                        <span>{{ server.capabilities.tools }} {{ t('mcp.tools') }}</span>
                      </div>
                      <div v-if="server.capabilities.resources > 0" class="cap-item">
                        <span class="cap-icon">📁</span>
                        <span>{{ server.capabilities.resources }} {{ t('mcp.resources') }}</span>
                      </div>
                      <div v-if="server.capabilities.prompts > 0" class="cap-item">
                        <span class="cap-icon">💬</span>
                        <span>{{ server.capabilities.prompts }} Prompts</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="isServerSelected(server.id)" class="already-badge">
                    {{ t('agent.design.mcp.alreadySelected') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <div class="selection-info">
                <span class="selection-count">
                  {{ t('agent.design.mcp.selectedCount', { count: tempSelected.length }) }}
                </span>
              </div>
              <div class="footer-actions">
                <button class="cancel-btn" @click="closeModal">
                  {{ t('common.cancel') }}
                </button>
                <button
                  class="confirm-btn"
                  :disabled="tempSelected.length === 0"
                  @click="confirmSelection"
                >
                  {{ t('agent.design.mcp.confirmAdd') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { MCPServer, MCPServerBinding } from '@/types'

  interface Props {
    bindings?: MCPServerBinding[]
  }

  const props = withDefaults(defineProps<Props>(), {
    bindings: () => []
  })

  const emit = defineEmits<{
    update: [bindings: MCPServerBinding[]]
  }>()

  const { t } = useI18n()

  // Mock MCP servers data for testing
  const mockMCPServers: MCPServer[] = [
    {
      id: 'mcp-001',
      name: 'PostgreSQL 数据库',
      uniqueId: 'postgres-db',
      version: '1.0.0',
      description: 'PostgreSQL 数据库连接与查询服务，支持复杂SQL查询',
      author: 'SmartLink',
      transport: 'stdio',
      status: 'connected',
      capabilities: { tools: 5, resources: 2, prompts: 0 },
      config: { command: 'mcp-server-postgres', args: [] },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'mcp-002',
      name: 'MySQL 数据库',
      uniqueId: 'mysql-db',
      version: '1.2.0',
      description: 'MySQL 数据库连接服务，支持数据查询与操作',
      author: 'SmartLink',
      transport: 'stdio',
      status: 'connected',
      capabilities: { tools: 4, resources: 1, prompts: 0 },
      config: { command: 'mcp-server-mysql', args: [] },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'mcp-003',
      name: '文件系统',
      uniqueId: 'filesystem',
      version: '2.0.0',
      description: '本地文件系统访问服务，支持文件读写与目录操作',
      author: 'SmartLink',
      transport: 'stdio',
      status: 'connected',
      capabilities: { tools: 8, resources: 3, prompts: 0 },
      config: { command: 'mcp-server-filesystem', args: [] },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'mcp-004',
      name: 'GitHub API',
      uniqueId: 'github-api',
      version: '1.5.0',
      description: 'GitHub API 集成服务，支持仓库、Issue、PR 操作',
      author: 'SmartLink',
      transport: 'http',
      status: 'connected',
      capabilities: { tools: 12, resources: 5, prompts: 2 },
      config: { endpoint: 'https://api.github.com/mcp' },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'mcp-005',
      name: 'Slack 集成',
      uniqueId: 'slack-integration',
      version: '1.3.0',
      description: 'Slack 消息与频道管理服务',
      author: 'SmartLink',
      transport: 'http',
      status: 'connected',
      capabilities: { tools: 6, resources: 2, prompts: 1 },
      config: { endpoint: 'https://slack.com/api/mcp' },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'mcp-006',
      name: 'Web 搜索',
      uniqueId: 'web-search',
      version: '1.0.0',
      description: '网络搜索服务，支持多搜索引擎集成',
      author: 'SmartLink',
      transport: 'http',
      status: 'connected',
      capabilities: { tools: 3, resources: 0, prompts: 0 },
      config: { endpoint: 'https://search.example.com/mcp' },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'mcp-007',
      name: 'Redis 缓存',
      uniqueId: 'redis-cache',
      version: '1.1.0',
      description: 'Redis 缓存服务，支持键值存储与过期管理',
      author: 'SmartLink',
      transport: 'stdio',
      status: 'connected',
      capabilities: { tools: 6, resources: 0, prompts: 0 },
      config: { command: 'mcp-server-redis', args: [] },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'mcp-008',
      name: '天气服务',
      uniqueId: 'weather-service',
      version: '1.0.0',
      description: '实时天气查询服务，支持全球城市天气数据',
      author: 'SmartLink',
      transport: 'http',
      status: 'connected',
      capabilities: { tools: 2, resources: 0, prompts: 0 },
      config: { endpoint: 'https://weather.example.com/mcp' },
      tools: [],
      resources: [],
      prompts: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]

  // State
  const loading = ref(false)
  const showModal = ref(false)
  const searchKeyword = ref('')
  const transportFilter = ref<string>('')
  const allServers = ref<MCPServer[]>([])
  const selectedServers = ref<MCPServer[]>([])
  const serverBindingMap = ref<Record<string, MCPServerBinding>>({})
  const tempSelected = ref<MCPServer[]>([])

  // Computed
  const filteredServers = computed(() => {
    let result = allServers.value

    if (transportFilter.value) {
      result = result.filter((server) => server.transport === transportFilter.value)
    }

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(
        (server) =>
          server.name.toLowerCase().includes(keyword) ||
          server.description.toLowerCase().includes(keyword)
      )
    }

    return result
  })

  // Methods
  function getTransportIcon(transport: 'stdio' | 'http'): string {
    return transport === 'stdio' ? '💻' : '🌐'
  }

  function getTransportLabel(transport: 'stdio' | 'http'): string {
    return transport === 'stdio' ? t('mcp.transport.local') : t('mcp.transport.remote')
  }

  function isServerSelected(serverId: string): boolean {
    return selectedServers.value.some((s) => s.id === serverId)
  }

  function isTempSelected(serverId: string): boolean {
    return tempSelected.value.some((s) => s.id === serverId)
  }

  function toggleTempSelection(server: MCPServer) {
    const index = tempSelected.value.findIndex((s) => s.id === server.id)
    if (index > -1) {
      tempSelected.value.splice(index, 1)
    } else {
      tempSelected.value.push(server)
    }
  }

  function openModal() {
    tempSelected.value = []
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    tempSelected.value = []
  }

  function confirmSelection() {
    tempSelected.value.forEach((server) => {
      if (!isServerSelected(server.id)) {
        selectedServers.value.push(server)
        serverBindingMap.value[server.id] = {
          serverId: server.id,
          required: true,
          fallbackAction: 'error'
        }
      }
    })
    emitUpdate()
    closeModal()
  }

  function removeServer(serverId: string) {
    const index = selectedServers.value.findIndex((s) => s.id === serverId)
    if (index > -1) {
      selectedServers.value.splice(index, 1)
      delete serverBindingMap.value[serverId]
      emitUpdate()
    }
  }

  function toggleServerRequired(serverId: string) {
    if (serverBindingMap.value[serverId]) {
      serverBindingMap.value[serverId].required = !serverBindingMap.value[serverId].required
      emitUpdate()
    }
  }

  function emitUpdate() {
    const bindings = Object.values(serverBindingMap.value)
    emit('update', bindings)
  }

  async function loadServers() {
    loading.value = true
    try {
      // Use mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300))
      allServers.value = mockMCPServers
    } catch (error) {
      console.error('Failed to load MCP servers:', error)
    } finally {
      loading.value = false
    }
  }

  // Initialize from props
  function initFromBindings() {
    if (!props.bindings?.length) return

    const bindingMap: Record<string, MCPServerBinding> = {}
    props.bindings.forEach((binding) => {
      bindingMap[binding.serverId] = binding
    })
    serverBindingMap.value = bindingMap

    // Find server details from mock data
    props.bindings.forEach((binding) => {
      const server = mockMCPServers.find((s) => s.id === binding.serverId)
      if (server && !isServerSelected(server.id)) {
        selectedServers.value.push(server)
      }
    })
  }

  // Watch props changes
  watch(
    () => props.bindings,
    () => {
      initFromBindings()
    },
    { deep: true }
  )

  onMounted(() => {
    loadServers()
    initFromBindings()
  })
</script>

<style scoped lang="scss">
  .mcp-selector {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  // Empty State
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    text-align: center;

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
      border-radius: 50%;
      margin-bottom: $spacing-lg;
    }

    .empty-icon {
      font-size: 40px;
      opacity: 0.8;
    }

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-sm 0;
    }

    p {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0 0 $spacing-xl 0;
      max-width: 280px;
    }
  }

  .add-mcp-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-xl;
    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    border: none;
    border-radius: $border-radius-lg;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // MCP Content
  .mcp-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .content-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-color-lighter;

    h3 {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: #10b981;
    color: #fff;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    border-radius: 10px;
  }

  .add-more-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-left: auto;
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: 1px solid #10b981;
    border-radius: $border-radius-md;
    color: #10b981;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(16, 185, 129, 0.1);
    }
  }

  .selected-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding-top: $spacing-md;
  }

  .selected-mcp-card {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    transition: all 0.2s ease;

    &:hover {
      border-color: #10b981;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
    }
  }

  .mcp-main {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .mcp-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border-radius: $border-radius-md;
    background: $bg-secondary;

    &.icon--stdio {
      background: rgba(16, 185, 129, 0.1);
    }

    &.icon--http {
      background: rgba(59, 130, 246, 0.1);
    }
  }

  .mcp-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mcp-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .mcp-meta {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .mcp-transport {
    padding: 1px 6px;
    background: $bg-secondary;
    border-radius: 4px;
  }

  .mcp-capabilities {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  .capability-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: $bg-secondary;
    border-radius: 4px;
    font-size: $font-size-xs;
    color: $text-secondary;

    .cap-icon {
      font-size: 12px;
    }
  }

  .mcp-actions {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-left: auto;
  }

  .toggle-btn,
  .remove-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: #10b981;
      color: #10b981;
    }
  }

  .toggle-btn.active {
    background: rgba(16, 185, 129, 0.1);
    border-color: $success;
    color: $success;
  }

  .remove-btn:hover {
    border-color: $error;
    color: $error;
    background: rgba(220, 38, 38, 0.05);
  }

  // Modal
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: $spacing-xl;
  }

  .modal-container {
    width: 100%;
    max-width: 800px;
    max-height: 80vh;
    background: $bg-primary;
    border-radius: $border-radius-xl;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    border-bottom: 1px solid $border-color-lighter;

    h2 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: none;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }
  }

  .modal-filter {
    padding: $spacing-md $spacing-xl;
    border-bottom: 1px solid $border-color-lighter;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-md;

    svg {
      width: 16px;
      height: 16px;
      color: $text-tertiary;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: $font-size-sm;
      color: $text-primary;
      outline: none;

      &::placeholder {
        color: $text-tertiary;
      }
    }
  }

  .transport-tabs {
    display: flex;
    gap: $spacing-xs;
    flex-wrap: wrap;
  }

  .transport-tab {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid transparent;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
      color: #10b981;
    }
  }

  .tab-icon {
    font-size: 14px;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg $spacing-xl;
  }

  .loading-state,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    color: $text-tertiary;
    gap: $spacing-sm;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid $border-color-base;
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .no-results-icon {
    font-size: 32px;
    opacity: 0.5;
  }

  .mcp-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .mcp-card {
    position: relative;
    display: flex;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(.already) {
      border-color: #10b981;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    &.selected {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }

    &.already {
      opacity: 0.6;
      cursor: default;
    }
  }

  .card-checkbox {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-sm;
    transition: all 0.2s ease;

    &.checked {
      background: #10b981;
      border-color: #10b981;
      color: #fff;
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .card-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border-radius: $border-radius-md;
    background: $bg-secondary;

    &.icon--stdio {
      background: rgba(16, 185, 129, 0.1);
    }

    &.icon--http {
      background: rgba(59, 130, 246, 0.1);
    }
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-xs;
  }

  .card-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .card-version {
    font-size: $font-size-xs;
    color: $text-tertiary;
    padding: 1px 6px;
    background: $bg-secondary;
    border-radius: 4px;
  }

  .card-desc {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin: 0 0 $spacing-sm 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-capabilities {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;

    .cap-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: $font-size-xs;
      color: $text-tertiary;

      .cap-icon {
        font-size: 12px;
      }
    }
  }

  .already-badge {
    position: absolute;
    bottom: $spacing-sm;
    right: $spacing-sm;
    padding: 2px 8px;
    background: rgba(16, 185, 129, 0.1);
    color: $success;
    font-size: $font-size-xs;
    border-radius: 4px;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-xl;
    border-top: 1px solid $border-color-lighter;
    background: $bg-secondary;
  }

  .selection-count {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .footer-actions {
    display: flex;
    gap: $spacing-sm;
  }

  .cancel-btn {
    padding: $spacing-sm $spacing-lg;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $text-tertiary;
      color: $text-primary;
    }
  }

  .confirm-btn {
    padding: $spacing-sm $spacing-lg;
    background: #10b981;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: #059669;
    }
  }

  // Transitions
  .mcp-list-enter-active,
  .mcp-list-leave-active {
    transition: all 0.2s ease;
  }

  .mcp-list-enter-from,
  .mcp-list-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.25s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;

    .modal-container {
      transform: scale(0.95) translateY(20px);
    }
  }

  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container {
    transition: all 0.25s ease;
  }
</style>
