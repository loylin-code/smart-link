<template>
  <div class="mcp-management">
    <div class="page-header">
      <h1 class="page-title">{{ t('resource.mcpManagement') }}</h1>
      <button class="create-btn" @click="showAddDialog = true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ t('resource.createMCP') }}</span>
      </button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" class="search-icon">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
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
        class="search-input"
        :placeholder="t('resource.searchMCP')"
        @input="handleSearch"
      />
    </div>

    <!-- 状态筛选 -->
    <div class="filter-section">
      <span class="filter-label">{{ t('resource.filterByStatus') }}：</span>
      <div class="filter-tags">
        <button
          :class="['filter-tag', { active: statusFilter === undefined }]"
          @click="setStatusFilter(undefined)"
        >
          {{ t('common.all') }}
          <span class="tag-count">{{ mcpStore.stats.total }}</span>
        </button>
        <button
          :class="['filter-tag', { active: statusFilter === 'connected' }]"
          @click="setStatusFilter('connected')"
        >
          <span class="status-dot status-dot--connected"></span>
          {{ t('mcp.status.connected') }}
          <span class="tag-count">{{ mcpStore.stats.connected }}</span>
        </button>
        <button
          :class="['filter-tag', { active: statusFilter === 'connecting' }]"
          @click="setStatusFilter('connecting')"
        >
          <span class="status-dot status-dot--connecting"></span>
          {{ t('mcp.status.connecting') }}
          <span class="tag-count">{{ mcpStore.stats.connecting }}</span>
        </button>
        <button
          :class="['filter-tag', { active: statusFilter === 'disconnected' }]"
          @click="setStatusFilter('disconnected')"
        >
          <span class="status-dot status-dot--disconnected"></span>
          {{ t('mcp.status.disconnected') }}
          <span class="tag-count">{{ mcpStore.serversByStatus.disconnected.length }}</span>
        </button>
      </div>
    </div>

    <!-- 传输类型筛选 -->
    <div class="filter-section">
      <span class="filter-label">{{ t('resource.filterByTransport') }}：</span>
      <div class="filter-tags">
        <button
          :class="['filter-tag', { active: transportFilter === undefined }]"
          @click="setTransportFilter(undefined)"
        >
          {{ t('common.all') }}
        </button>
        <button
          :class="['filter-tag', { active: transportFilter === 'stdio' }]"
          @click="setTransportFilter('stdio')"
        >
          {{ t('mcp.transport.local') }} stdio
        </button>
        <button
          :class="['filter-tag', { active: transportFilter === 'http' }]"
          @click="setTransportFilter('http')"
        >
          {{ t('mcp.transport.remote') }} HTTP
        </button>
      </div>
    </div>

    <!-- MCP服务器卡片网格 -->
    <div v-if="filteredServers.length" class="server-grid">
      <div
        v-for="server in filteredServers"
        :key="server.id"
        class="server-card"
        @click="openDetail(server)"
      >
        <div class="card-header">
          <span :class="['status-indicator', `status-indicator--${server.status}`]"></span>
          <h3 class="server-name" :title="server.name">{{ server.name }}</h3>
        </div>

        <div class="card-divider"></div>

        <div class="card-body">
          <div class="info-row">
            <span class="info-label">{{ t('mcp.transportType') }}:</span>
            <span class="info-value">
              {{
                server.transport === 'stdio' ? t('mcp.transport.local') : t('mcp.transport.remote')
              }}
              {{ server.transport }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('mcp.responseTime') }}:</span>
            <span
              v-if="server.status === 'connected'"
              class="info-value"
              :class="{ 'text-error': (server.responseTime || 0) > 1000 }"
            >
              {{ server.responseTime }}ms
            </span>
            <span v-else-if="server.status === 'connecting'" class="info-value text-muted">
              {{ t('mcp.connecting') }}
            </span>
            <span v-else class="info-value text-error">
              {{ server.lastError || t('mcp.disconnected') }}
            </span>
          </div>
        </div>

        <div class="card-divider"></div>

        <div class="capabilities-row">
          <div class="capability-item" v-if="server.capabilities.tools > 0">
            <span class="capability-icon">🔧</span>
            <span class="capability-count">{{ server.capabilities.tools }}</span>
            <span class="capability-label">{{ t('mcp.tools') }}</span>
          </div>
          <div class="capability-item" v-if="server.capabilities.resources > 0">
            <span class="capability-icon">📁</span>
            <span class="capability-count">{{ server.capabilities.resources }}</span>
            <span class="capability-label">{{ t('mcp.resources') }}</span>
          </div>
          <div class="capability-item" v-if="server.capabilities.prompts > 0">
            <span class="capability-icon">💬</span>
            <span class="capability-count">{{ server.capabilities.prompts }}</span>
            <span class="capability-label">Prompts</span>
          </div>
        </div>

        <div class="last-active">
          {{ t('mcp.lastActive') }}: {{ formatTime(server.lastActive) }}
        </div>

        <div class="card-actions" @click.stop>
          <button
            v-if="server.status === 'connected'"
            class="action-btn"
            @click="testConnection(server)"
            :disabled="testingIds.has(server.id)"
          >
            <span v-if="testingIds.has(server.id)">⏳</span>
            <span v-else>🧪</span>
            {{ t('common.test') }}
          </button>
          <button
            v-else
            class="action-btn"
            @click="startServer(server)"
            :disabled="testingIds.has(server.id)"
          >
            <span v-if="testingIds.has(server.id)">⏳</span>
            <span v-else>▶</span>
            {{ t('common.start') }}
          </button>
          <button class="action-btn" @click="editServer(server)">
            ✏️ {{ t('common.config') }}
          </button>
          <button class="action-btn action-btn--danger" @click="deleteServer(server)">
            🗑️ {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 6V12L16 14"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p>{{ t('resource.noMCP') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useMCPStore } from '@/store/modules/mcp'
  import type { MCPServer, MCPServerStatus } from '@/types'

  const { t } = useI18n()
  const router = useRouter()
  const mcpStore = useMCPStore()

  const searchKeyword = ref('')
  const statusFilter = ref<MCPServerStatus | undefined>(undefined)
  const transportFilter = ref<'stdio' | 'http' | undefined>(undefined)
  const testingIds = ref<Set<string>>(new Set())
  const showAddDialog = ref(false)

  const filteredServers = computed(() => {
    return mcpStore.filteredServers
  })

  const handleSearch = () => {
    mcpStore.setFilter({ keyword: searchKeyword.value })
  }

  const setStatusFilter = (status: MCPServerStatus | undefined) => {
    statusFilter.value = status
    mcpStore.setFilter({ status })
  }

  const setTransportFilter = (transport: 'stdio' | 'http' | undefined) => {
    transportFilter.value = transport
    mcpStore.setFilter({ transport })
  }

  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return t('common.never')

    const now = Date.now()
    const diff = now - timestamp

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) return t('common.justNow')
    if (diff < hour) return `${Math.floor(diff / minute)}${t('common.minutesAgo')}`
    if (diff < day) return `${Math.floor(diff / hour)}${t('common.hoursAgo')}`
    return `${Math.floor(diff / day)}${t('common.daysAgo')}`
  }

  const openDetail = (server: MCPServer) => {
    router.push(`/app/resource/mcp/${server.id}`)
  }

  const testConnection = async (server: MCPServer) => {
    testingIds.value.add(server.id)
    try {
      await mcpStore.testConnection(server.id)
    } finally {
      testingIds.value.delete(server.id)
    }
  }

  const startServer = async (server: MCPServer) => {
    testingIds.value.add(server.id)
    try {
      await mcpStore.refreshServerStatus(server.id)
    } finally {
      testingIds.value.delete(server.id)
    }
  }

  const editServer = (server: MCPServer) => {
    // TODO: 打开编辑对话框
    console.log('Edit server:', server.id)
  }

  const deleteServer = (server: MCPServer) => {
    if (confirm(t('mcp.confirmDelete', { name: server.name }))) {
      mcpStore.deleteServer(server.id)
    }
  }
</script>

<style scoped lang="scss">
  @use '@/assets/styles/variables.scss' as *;

  .mcp-management {
    height: 100%;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
  }

  .page-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: 1px solid $primary-color;
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: $primary-light;
      border-color: $primary-light;
    }
  }

  .search-bar {
    position: relative;
    margin-bottom: $spacing-lg;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: $text-tertiary;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: $spacing-sm $spacing-md $spacing-sm 40px;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;
    transition: all $transition-base ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .filter-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }

  .filter-tags {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-full;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $text-primary;
    }

    &.active {
      background: rgba(24, 144, 255, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--connected {
      background: #52c41a;
    }

    &--connecting {
      background: #faad14;
    }

    &--disconnected {
      background: #f5222d;
    }

    &--degraded {
      background: #fa8c16;
    }
  }

  .tag-count {
    font-size: $font-size-xs;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
    padding: 0 6px;
    border-radius: $border-radius-full;
    color: $text-tertiary;
  }

  .filter-tag.active .tag-count {
    background: rgba(24, 144, 255, 0.2);
    border-color: rgba(24, 144, 255, 0.3);
    color: $primary-color;
  }

  .server-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $spacing-lg;
    margin-top: $spacing-xl;
  }

  .server-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;

    &--connected {
      background: #52c41a;
      box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.2);
    }

    &--connecting {
      background: #faad14;
      animation: pulse 1.5s infinite;
    }

    &--disconnected {
      background: #f5222d;
    }

    &--degraded {
      background: #fa8c16;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .server-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-divider {
    height: 1px;
    background: $border-color-light;
    margin: $spacing-md 0;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .info-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;

    &.text-error {
      color: $error;
    }

    &.text-muted {
      color: $text-tertiary;
    }
  }

  .capabilities-row {
    display: flex;
    gap: $spacing-md;
    flex-wrap: wrap;
  }

  .capability-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .capability-icon {
    font-size: 14px;
  }

  .capability-count {
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .capability-label {
    font-size: $font-size-xs;
  }

  .last-active {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: $spacing-sm;
  }

  .card-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $border-color-light;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: $spacing-xs $spacing-sm;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover:not(:disabled) {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--danger:hover:not(:disabled) {
      background: $error;
      border-color: $error;
      color: #fff;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    color: $text-tertiary;

    svg {
      width: 80px;
      height: 80px;
      margin-bottom: $spacing-md;
    }

    p {
      font-size: $font-size-base;
    }
  }
</style>
