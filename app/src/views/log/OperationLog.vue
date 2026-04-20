<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLogStore, type AgentExecutionLog, type CallChainItem } from '@/store/modules/log'

  const { t } = useI18n()
  const logStore = useLogStore()

  // 选中的日志详情
  const selectedLog = ref<AgentExecutionLog | null>(null)
  const showDetailDrawer = ref(false)

  // 筛选条件
  const filterAgent = ref('')
  const filterStatus = ref<AgentExecutionLog['status'] | ''>('')
  const filterSource = ref<AgentExecutionLog['metadata']['source'] | ''>('')
  const filterTimeRange = ref('')
  const searchKeyword = ref('')

  // 状态配置
  const statusConfig = {
    success: { label: t('log.status.success'), color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    failed: { label: t('log.status.failed'), color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    timeout: { label: t('log.status.timeout'), color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
    cancelled: { label: t('log.status.cancelled'), color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' }
  }

  // 来源配置
  const sourceConfig = {
    web: { label: t('log.source.web'), icon: '🌐' },
    api: { label: t('log.source.api'), icon: '🔌' },
    schedule: { label: t('log.source.schedule'), icon: '⏰' }
  }

  // 统计数据
  const stats = computed(() => {
    const logs = logStore.agentLogs
    const total = logStore.pagination.total
    const successCount = logs.filter((l) => l.status === 'success').length
    const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0
    const avgDuration = logs.length > 0
      ? Math.round(logs.reduce((sum, l) => sum + l.duration, 0) / logs.length)
      : 0
    const totalTokens = logs.reduce((sum, l) => sum + l.tokens.total, 0)

    return {
      total,
      successRate,
      avgDuration,
      totalTokens
    }
  })

  // 唯一Agent列表（用于筛选）
  const uniqueAgents = computed(() => {
    const agents = new Map<string, string>()
    logStore.agentLogs.forEach((log) => {
      agents.set(log.agentId, log.agentName)
    })
    return Array.from(agents.entries()).map(([id, name]) => ({ id, name }))
  })

  // 分页处理
  const currentPage = computed({
    get: () => logStore.pagination.page,
    set: (val) => logStore.setPage(val)
  })

  const pageSize = computed({
    get: () => logStore.pagination.pageSize,
    set: (val) => logStore.setPageSize(val)
  })

  const totalLogs = computed(() => logStore.pagination.total)

  // 格式化时间
  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 格式化持续时间
  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  // 格式化Token数量
  function formatTokens(tokens: number): string {
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`
    return tokens.toString()
  }

  // 查看详情
  function viewDetail(log: AgentExecutionLog) {
    selectedLog.value = log
    showDetailDrawer.value = true
  }

  // 关闭详情
  function closeDetail() {
    showDetailDrawer.value = false
    selectedLog.value = null
  }

  // 导出日志
  async function exportLogs(format: 'csv' | 'json') {
    const data = await logStore.exportLogs('agent', format)
    if (data) {
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `agent-logs-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // 应用筛选
  function applyFilters() {
    logStore.setAgentFilter({
      agentId: filterAgent.value || undefined,
      status: filterStatus.value || undefined,
      source: filterSource.value || undefined,
      keyword: searchKeyword.value || undefined
    })
    logStore.fetchAgentLogs()
  }

  // 重置筛选
  function resetFilters() {
    filterAgent.value = ''
    filterStatus.value = ''
    filterSource.value = ''
    filterTimeRange.value = ''
    searchKeyword.value = ''
    logStore.resetAgentFilter()
    logStore.fetchAgentLogs()
  }

  // 获取调用链步骤类型样式
  function getStepTypeStyle(type: CallChainItem['type']) {
    const styles = {
      llm: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', label: 'LLM' },
      mcp: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'MCP' },
      skill: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Skill' },
      api: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'API' },
      tool: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', label: 'Tool' }
    }
    return styles[type] || styles.tool
  }

  // 监听筛选变化
  watch([filterAgent, filterStatus, filterSource], () => {
    applyFilters()
  })

  onMounted(() => {
    logStore.fetchAgentLogs()
  })
</script>

<template>
  <div class="operation-log">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('route.agentLog') }}</h1>
        <span class="page-desc">{{ t('log.agent.description') }}</span>
      </div>
      <div class="header-right">
        <button class="export-btn" @click="exportLogs('csv')">
          <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
            <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('log.export.csv') }}</span>
        </button>
        <button class="export-btn secondary" @click="exportLogs('json')">
          <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
            <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('log.export.json') }}</span>
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">{{ t('log.stats.totalLogs') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.successRate }}%</span>
          <span class="stat-label">{{ t('log.stats.successRate') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon time">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ formatDuration(stats.avgDuration) }}</span>
          <span class="stat-label">{{ t('log.stats.avgDuration') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon token">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ formatTokens(stats.totalTokens) }}</span>
          <span class="stat-label">{{ t('log.stats.totalTokens') }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>{{ t('log.filter.agent') }}</label>
          <select v-model="filterAgent" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option v-for="agent in uniqueAgents" :key="agent.id" :value="agent.id">
              {{ agent.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>{{ t('log.filter.status') }}</label>
          <select v-model="filterStatus" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option value="success">{{ t('log.status.success') }}</option>
            <option value="failed">{{ t('log.status.failed') }}</option>
            <option value="timeout">{{ t('log.status.timeout') }}</option>
            <option value="cancelled">{{ t('log.status.cancelled') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>{{ t('log.filter.source') }}</label>
          <select v-model="filterSource" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option value="web">{{ t('log.source.web') }}</option>
            <option value="api">{{ t('log.source.api') }}</option>
            <option value="schedule">{{ t('log.source.schedule') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>{{ t('log.filter.timeRange') }}</label>
          <select v-model="filterTimeRange" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option value="1h">{{ t('log.timeRange.lastHour') }}</option>
            <option value="24h">{{ t('log.timeRange.last24h') }}</option>
            <option value="7d">{{ t('log.timeRange.last7d') }}</option>
            <option value="30d">{{ t('log.timeRange.last30d') }}</option>
          </select>
        </div>
        <div class="filter-group search-group">
          <input
            v-model="searchKeyword"
            type="text"
            class="filter-input"
            :placeholder="t('log.filter.searchPlaceholder')"
            @keyup.enter="applyFilters"
          />
          <button class="search-btn" @click="applyFilters">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <button class="reset-btn" @click="resetFilters">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ t('common.reset') }}
        </button>
      </div>
    </div>

    <!-- 日志表格 -->
    <div class="table-section">
      <div v-if="logStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>
      <div v-else-if="logStore.agentLogs.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>{{ t('log.noData') }}</p>
      </div>
      <table v-else class="log-table">
        <thead>
          <tr>
            <th class="col-time">{{ t('log.table.time') }}</th>
            <th class="col-agent">{{ t('log.table.agent') }}</th>
            <th class="col-status">{{ t('log.table.status') }}</th>
            <th class="col-io">{{ t('log.table.io') }}</th>
            <th class="col-duration">{{ t('log.table.duration') }}</th>
            <th class="col-tokens">{{ t('log.table.tokens') }}</th>
            <th class="col-source">{{ t('log.table.source') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logStore.agentLogs" :key="log.id" class="log-row">
            <td class="col-time">{{ formatTime(log.startTime) }}</td>
            <td class="col-agent">
              <div class="agent-info">
                <span class="agent-name">{{ log.agentName }}</span>
                <span class="model-used">{{ log.modelUsed }}</span>
              </div>
            </td>
            <td class="col-status">
              <span
                class="status-badge"
                :style="{
                  background: statusConfig[log.status].bgColor,
                  color: statusConfig[log.status].color
                }"
              >
                {{ statusConfig[log.status].label }}
              </span>
            </td>
            <td class="col-io">
              <div class="io-summary">
                <div class="io-item">
                  <span class="io-label">{{ t('log.table.input') }}:</span>
                  <span class="io-value" :title="log.inputMessage">{{ log.inputMessage.slice(0, 50) }}{{ log.inputMessage.length > 50 ? '...' : '' }}</span>
                </div>
                <div v-if="log.outputMessage" class="io-item">
                  <span class="io-label">{{ t('log.table.output') }}:</span>
                  <span class="io-value" :title="log.outputMessage">{{ log.outputMessage.slice(0, 50) }}{{ log.outputMessage.length > 50 ? '...' : '' }}</span>
                </div>
              </div>
            </td>
            <td class="col-duration">{{ formatDuration(log.duration) }}</td>
            <td class="col-tokens">
              <div class="token-info">
                <span class="token-total">{{ log.tokens.total }}</span>
                <span class="token-detail">{{ log.tokens.input }}/{{ log.tokens.output }}</span>
              </div>
            </td>
            <td class="col-source">
              <span class="source-tag">
                <span class="source-icon">{{ sourceConfig[log.metadata.source]?.icon || '📌' }}</span>
                <span>{{ sourceConfig[log.metadata.source]?.label || log.metadata.source }}</span>
              </span>
            </td>
            <td class="col-actions">
              <button class="action-btn" @click="viewDetail(log)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ t('log.viewDetail') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="logStore.agentLogs.length > 0" class="pagination-section">
      <div class="pagination-info">
        {{ t('log.pagination.total', { total: totalLogs }) }}
      </div>
      <div class="pagination-controls">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          {{ t('log.pagination.prev') }}
        </button>
        <span class="page-info">{{ currentPage }} / {{ Math.ceil(totalLogs / pageSize) }}</span>
        <button
          class="page-btn"
          :disabled="currentPage >= Math.ceil(totalLogs / pageSize)"
          @click="currentPage++"
        >
          {{ t('log.pagination.next') }}
        </button>
      </div>
      <select v-model="pageSize" class="page-size-select">
        <option :value="10">10 {{ t('log.pagination.perPage') }}</option>
        <option :value="20">20 {{ t('log.pagination.perPage') }}</option>
        <option :value="50">50 {{ t('log.pagination.perPage') }}</option>
      </select>
    </div>

    <!-- 详情抽屉 -->
    <div v-if="showDetailDrawer" class="detail-drawer" @click.self="closeDetail">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>{{ t('log.detail.title') }}</h3>
          <button class="close-btn" @click="closeDetail">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div v-if="selectedLog" class="drawer-body">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h4>{{ t('log.detail.basicInfo') }}</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.sessionId') }}</span>
                <span class="detail-value">{{ selectedLog.sessionId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.agent') }}</span>
                <span class="detail-value">{{ selectedLog.agentName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.status') }}</span>
                <span
                  class="status-badge"
                  :style="{
                    background: statusConfig[selectedLog.status].bgColor,
                    color: statusConfig[selectedLog.status].color
                  }"
                >
                  {{ statusConfig[selectedLog.status].label }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.model') }}</span>
                <span class="detail-value">{{ selectedLog.modelUsed }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.duration') }}</span>
                <span class="detail-value">{{ formatDuration(selectedLog.duration) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.tokens') }}</span>
                <span class="detail-value">{{ selectedLog.tokens.total }} ({{ selectedLog.tokens.input }} / {{ selectedLog.tokens.output }})</span>
              </div>
            </div>
          </div>

          <!-- 输入输出 -->
          <div class="detail-section">
            <h4>{{ t('log.detail.io') }}</h4>
            <div class="io-detail">
              <div class="io-block">
                <span class="io-title">{{ t('log.detail.input') }}</span>
                <pre class="io-content">{{ selectedLog.inputMessage }}</pre>
              </div>
              <div v-if="selectedLog.outputMessage" class="io-block">
                <span class="io-title">{{ t('log.detail.output') }}</span>
                <pre class="io-content">{{ selectedLog.outputMessage }}</pre>
              </div>
            </div>
          </div>

          <!-- 调用链路 -->
          <div class="detail-section">
            <h4>{{ t('log.detail.callChain') }}</h4>
            <div class="call-chain">
              <div
                v-for="(step, index) in selectedLog.callChain"
                :key="index"
                class="chain-item"
              >
                <div class="chain-step">{{ step.step }}</div>
                <div class="chain-content">
                  <div class="chain-header">
                    <span
                      class="chain-type"
                      :style="{
                        background: getStepTypeStyle(step.type).bg,
                        color: getStepTypeStyle(step.type).color
                      }"
                    >
                      {{ getStepTypeStyle(step.type).label }}
                    </span>
                    <span class="chain-name">{{ step.name }}</span>
                    <span
                      class="chain-status"
                      :class="`status-${step.status}`"
                    >
                      {{ step.status }}
                    </span>
                  </div>
                  <div class="chain-meta">
                    <span>{{ formatDuration(step.duration) }}</span>
                    <span v-if="step.tokens">{{ step.tokens.input }} / {{ step.tokens.output }} tokens</span>
                  </div>
                  <div v-if="step.error" class="chain-error">
                    {{ step.error }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="selectedLog.error" class="detail-section">
            <h4>{{ t('log.detail.error') }}</h4>
            <div class="error-detail">
              <div class="error-code">{{ selectedLog.error.code }}</div>
              <div class="error-message">{{ selectedLog.error.message }}</div>
              <pre v-if="selectedLog.error.stack" class="error-stack">{{ selectedLog.error.stack }}</pre>
            </div>
          </div>

          <!-- 元数据 -->
          <div class="detail-section">
            <h4>{{ t('log.detail.metadata') }}</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.source') }}</span>
                <span class="detail-value">{{ sourceConfig[selectedLog.metadata.source]?.label || selectedLog.metadata.source }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.ip') }}</span>
                <span class="detail-value">{{ selectedLog.metadata.ip }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.userAgent') }}</span>
                <span class="detail-value text-truncate">{{ selectedLog.metadata.userAgent }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/assets/styles/variables' as *;

  .operation-log {
    height: 100%;
    padding: $spacing-xl;
    background: $bg-secondary;
    overflow-y: auto;
  }

  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-xl;

    .header-left {
      .page-title {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin: 0 0 $spacing-xs 0;
      }

      .page-desc {
        font-size: $font-size-sm;
        color: $text-tertiary;
      }
    }

    .header-right {
      display: flex;
      gap: $spacing-sm;
    }
  }

  .export-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    color: white;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base $ease-out;

    .btn-icon {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $primary-light;
      transform: translateY(-1px);
    }

    &.secondary {
      background: $bg-tertiary;
      color: $text-secondary;
      border: 1px solid $border-color-base;

      &:hover {
        background: $bg-elevated;
      }
    }
  }

  // 统计卡片
  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;

    @include respond-below(md) {
      grid-template-columns: repeat(2, 1fr);
    }

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: $bg-surface;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-card;
    transition: all $transition-base $ease-out;

    &:hover {
      box-shadow: $shadow-card-hover;
      transform: translateY(-2px);
    }
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;
    flex-shrink: 0;

    svg {
      width: 24px;
      height: 24px;
    }

    &.total {
      background: $primary-muted;
      color: $primary-color;
    }

    &.success {
      background: $success-bg;
      color: $success;
    }

    &.time {
      background: $warning-bg;
      color: $warning;
    }

    &.token {
      background: $info-bg;
      color: $info;
    }
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .stat-value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    line-height: 1.2;
  }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  // 筛选区域
  .filter-section {
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background: $bg-surface;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: $spacing-md;

    @include respond-below(md) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    min-width: 140px;

    label {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      color: $text-secondary;
    }

    &.search-group {
      flex: 1;
      min-width: 200px;
      position: relative;

      .search-btn {
        position: absolute;
        right: $spacing-xs;
        bottom: 6px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $primary-color;
        border: none;
        border-radius: $border-radius-sm;
        color: white;
        cursor: pointer;
        transition: all $transition-fast;

        svg {
          width: 14px;
          height: 14px;
        }

        &:hover {
          background: $primary-light;
        }
      }
    }
  }

  .filter-select,
  .filter-input {
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    transition: all $transition-fast;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: $border-focus;
    }
  }

  .filter-select {
    cursor: pointer;
  }

  .filter-input {
    padding-right: 40px;
    width: 100%;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // 表格区域
  .table-section {
    background: $bg-surface;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    overflow: hidden;
    margin-bottom: $spacing-lg;
  }

  .log-table {
    width: 100%;
    border-collapse: collapse;
    font-size: $font-size-sm;

    th {
      padding: $spacing-md;
      text-align: left;
      font-weight: $font-weight-semibold;
      color: $text-secondary;
      background: $bg-secondary;
      border-bottom: 1px solid $border-color-base;
      white-space: nowrap;
    }

    td {
      padding: $spacing-md;
      border-bottom: 1px solid $border-color-light;
      vertical-align: top;
    }

    .log-row {
      transition: background $transition-fast;

      &:hover {
        background: $bg-secondary;
      }

      &:last-child td {
        border-bottom: none;
      }
    }
  }

  .col-time {
    width: 140px;
    white-space: nowrap;
    color: $text-tertiary;
    font-size: $font-size-xs;
  }

  .col-agent {
    min-width: 160px;

    .agent-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .agent-name {
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    .model-used {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .col-status {
    width: 100px;

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: $border-radius-full;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
    }
  }

  .col-io {
    min-width: 240px;
    max-width: 400px;

    .io-summary {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
    }

    .io-item {
      display: flex;
      gap: $spacing-sm;
      font-size: $font-size-xs;
      line-height: 1.4;
    }

    .io-label {
      color: $text-tertiary;
      flex-shrink: 0;
    }

    .io-value {
      color: $text-secondary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .col-duration {
    width: 100px;
    white-space: nowrap;
    color: $text-secondary;
  }

  .col-tokens {
    width: 100px;

    .token-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .token-total {
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    .token-detail {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .col-source {
    width: 100px;

    .source-tag {
      display: inline-flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-xs;
      color: $text-secondary;
    }

    .source-icon {
      font-size: 14px;
    }
  }

  .col-actions {
    width: 100px;

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: $spacing-xs $spacing-sm;
      background: $primary-muted;
      border: none;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      color: $primary-color;
      cursor: pointer;
      transition: all $transition-fast;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: $primary-color;
        color: white;
      }
    }
  }

  // 加载和空状态
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    gap: $spacing-md;
    color: $text-tertiary;

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 2px solid $border-color-base;
      border-top-color: $primary-color;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
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
      width: 48px;
      height: 48px;
      margin-bottom: $spacing-md;
      opacity: 0.5;
    }

    p {
      font-size: $font-size-sm;
    }
  }

  // 分页
  .pagination-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    background: $bg-surface;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;

    @include respond-below(md) {
      flex-direction: column;
      gap: $spacing-md;
    }
  }

  .pagination-info {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .page-btn {
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .page-info {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .page-size-select {
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    cursor: pointer;
  }

  // 详情抽屉
  .detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 600px;
    max-width: 90vw;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: flex-end;

    @include respond-below(md) {
      width: 100%;
      max-width: 100%;
    }
  }

  .drawer-content {
    width: 100%;
    background: $bg-surface;
    box-shadow: $shadow-xl;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color-base;

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: $border-radius-md;
      color: $text-tertiary;
      cursor: pointer;
      transition: all $transition-fast;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover {
        background: $bg-secondary;
        color: $text-primary;
      }
    }
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg;
  }

  .detail-section {
    margin-bottom: $spacing-xl;

    h4 {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-md 0;
      padding-bottom: $spacing-sm;
      border-bottom: 1px solid $border-color-light;
    }
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .detail-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .detail-value {
    font-size: $font-size-sm;
    color: $text-primary;
    word-break: break-all;

    &.text-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 输入输出详情
  .io-detail {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .io-block {
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    padding: $spacing-md;
  }

  .io-title {
    display: block;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-tertiary;
    margin-bottom: $spacing-sm;
  }

  .io-content {
    font-size: $font-size-sm;
    color: $text-primary;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: $font-family-mono;
    background: transparent;
    padding: 0;
  }

  // 调用链
  .call-chain {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .chain-item {
    display: flex;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
  }

  .chain-step {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary-color;
    color: white;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    border-radius: $border-radius-full;
    flex-shrink: 0;
  }

  .chain-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .chain-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  .chain-type {
    padding: 2px 8px;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  .chain-name {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .chain-status {
    padding: 2px 8px;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;

    &.status-success {
      background: $success-bg;
      color: $success;
    }

    &.status-failed {
      background: $error-bg;
      color: $error;
    }

    &.status-skipped {
      background: $bg-tertiary;
      color: $text-tertiary;
    }
  }

  .chain-meta {
    display: flex;
    gap: $spacing-md;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .chain-error {
    padding: $spacing-sm;
    background: $error-bg;
    border: 1px solid rgba($error, 0.2);
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $error;
  }

  // 错误详情
  .error-detail {
    padding: $spacing-md;
    background: $error-bg;
    border: 1px solid rgba($error, 0.2);
    border-radius: $border-radius-md;
  }

  .error-code {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $error;
    margin-bottom: $spacing-xs;
  }

  .error-message {
    font-size: $font-size-sm;
    color: $error;
    margin-bottom: $spacing-sm;
  }

  .error-stack {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin: 0;
    white-space: pre-wrap;
    font-family: $font-family-mono;
    background: $bg-primary;
    padding: $spacing-sm;
    border-radius: $border-radius-sm;
    overflow-x: auto;
  }
</style>
