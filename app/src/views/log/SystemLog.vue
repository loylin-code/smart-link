<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useLogStore, type SystemOperationLog } from '@/store/modules/log'

  const { t } = useI18n()
  const logStore = useLogStore()

  // 选中的日志详情
  const selectedLog = ref<SystemOperationLog | null>(null)
  const showDetailDrawer = ref(false)

  // 筛选条件
  const filterUser = ref('')
  const filterOperation = ref<SystemOperationLog['operation'] | ''>('')
  const filterResourceType = ref<SystemOperationLog['resourceType'] | ''>('')
  const filterTimeRange = ref('')
  const filterResult = ref<SystemOperationLog['result'] | ''>('')
  const searchKeyword = ref('')

  // 操作类型配置
  const operationConfig = {
    login: {
      label: t('log.operation.login'),
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    logout: {
      label: t('log.operation.logout'),
      color: '#6b7280',
      bgColor: 'rgba(107, 114, 128, 0.1)'
    },
    create: {
      label: t('log.operation.create'),
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    update: {
      label: t('log.operation.update'),
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    delete: {
      label: t('log.operation.delete'),
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    publish: {
      label: t('log.operation.publish'),
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    config_change: {
      label: t('log.operation.config'),
      color: '#0284c7',
      bgColor: 'rgba(2, 132, 199, 0.1)'
    }
  }

  // 资源类型配置
  const resourceTypeConfig = {
    agent: { label: t('log.resourceType.agent'), icon: '🤖' },
    skill: { label: t('log.resourceType.skill'), icon: '🧩' },
    mcp: { label: t('log.resourceType.mcp'), icon: '🔌' },
    model: { label: t('log.resourceType.model'), icon: '🧠' },
    api: { label: t('log.resourceType.api'), icon: '🔌' },
    semantic: { label: t('log.resourceType.semantic'), icon: '📚' },
    task: { label: t('log.resourceType.task'), icon: '⏰' },
    settings: { label: t('log.resourceType.settings'), icon: '⚙️' }
  }

  // 结果状态配置
  const resultConfig = {
    success: {
      label: t('log.result.success'),
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    failed: { label: t('log.result.failed'), color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
  }

  // 统计数据
  const stats = computed(() => {
    const logs = logStore.systemLogs
    const total = logStore.pagination.total
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = logs.filter((l) => l.timestamp >= today.getTime()).length
    const failedCount = logs.filter((l) => l.result === 'failed').length

    return {
      total,
      todayCount,
      failedCount
    }
  })

  // 唯一用户列表（用于筛选）
  const uniqueUsers = computed(() => {
    const users = new Map<string, { name: string; role?: string }>()
    logStore.systemLogs.forEach((log) => {
      users.set(log.userId, { name: log.userName, role: log.userRole })
    })
    return Array.from(users.entries()).map(([id, data]) => ({ id, ...data }))
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

  // 查看详情
  function viewDetail(log: SystemOperationLog) {
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
    const data = await logStore.exportLogs('system', format)
    if (data) {
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // 应用筛选
  function applyFilters() {
    logStore.setSystemFilter({
      userId: filterUser.value || undefined,
      operation: filterOperation.value || undefined,
      resourceType: filterResourceType.value || undefined,
      keyword: searchKeyword.value || undefined
    })
    logStore.fetchSystemLogs()
  }

  // 重置筛选
  function resetFilters() {
    filterUser.value = ''
    filterOperation.value = ''
    filterResourceType.value = ''
    filterTimeRange.value = ''
    filterResult.value = ''
    searchKeyword.value = ''
    logStore.resetSystemFilter()
    logStore.fetchSystemLogs()
  }

  // 监听筛选变化
  watch([filterUser, filterOperation, filterResourceType, filterResult], () => {
    applyFilters()
  })

  onMounted(() => {
    logStore.fetchSystemLogs()
  })
</script>

<template>
  <div class="system-log">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('route.systemLog') }}</h1>
        <span class="page-desc">{{ t('log.system.description') }}</span>
      </div>
      <div class="header-right">
        <button class="export-btn" @click="exportLogs('csv')">
          <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
            <path
              d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('log.export.csv') }}</span>
        </button>
        <button class="export-btn secondary" @click="exportLogs('json')">
          <svg viewBox="0 0 24 24" fill="none" class="btn-icon">
            <path
              d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
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
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">{{ t('log.stats.totalLogs') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today">
          <svg viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M16 2v4M8 2v4M3 10h18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.todayCount }}</span>
          <span class="stat-label">{{ t('log.stats.todayOperations') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon failed">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
            <path
              d="M15 9l-6 6M9 9l6 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.failedCount }}</span>
          <span class="stat-label">{{ t('log.stats.failedOperations') }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>{{ t('log.filter.user') }}</label>
          <select v-model="filterUser" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option v-for="user in uniqueUsers" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label>{{ t('log.filter.operation') }}</label>
          <select v-model="filterOperation" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option value="login">{{ t('log.operation.login') }}</option>
            <option value="logout">{{ t('log.operation.logout') }}</option>
            <option value="create">{{ t('log.operation.create') }}</option>
            <option value="update">{{ t('log.operation.update') }}</option>
            <option value="delete">{{ t('log.operation.delete') }}</option>
            <option value="publish">{{ t('log.operation.publish') }}</option>
            <option value="config_change">{{ t('log.operation.config') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>{{ t('log.filter.resourceType') }}</label>
          <select v-model="filterResourceType" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option value="agent">{{ t('log.resourceType.agent') }}</option>
            <option value="skill">{{ t('log.resourceType.skill') }}</option>
            <option value="mcp">{{ t('log.resourceType.mcp') }}</option>
            <option value="model">{{ t('log.resourceType.model') }}</option>
            <option value="api">{{ t('log.resourceType.api') }}</option>
            <option value="semantic">{{ t('log.resourceType.semantic') }}</option>
            <option value="task">{{ t('log.resourceType.task') }}</option>
            <option value="settings">{{ t('log.resourceType.settings') }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>{{ t('log.filter.result') }}</label>
          <select v-model="filterResult" class="filter-select">
            <option value="">{{ t('common.all') }}</option>
            <option value="success">{{ t('log.result.success') }}</option>
            <option value="failed">{{ t('log.result.failed') }}</option>
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
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <button class="reset-btn" @click="resetFilters">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
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
      <div v-else-if="logStore.systemLogs.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M9 12h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <p>{{ t('log.noData') }}</p>
      </div>
      <table v-else class="log-table">
        <thead>
          <tr>
            <th class="col-time">{{ t('log.table.time') }}</th>
            <th class="col-user">{{ t('log.table.user') }}</th>
            <th class="col-operation">{{ t('log.table.operation') }}</th>
            <th class="col-resource">{{ t('log.table.resource') }}</th>
            <th class="col-result">{{ t('log.table.result') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logStore.systemLogs" :key="log.id" class="log-row">
            <td class="col-time">{{ formatTime(log.timestamp) }}</td>
            <td class="col-user">
              <div class="user-info">
                <span class="user-name">{{ log.userName }}</span>
                <span v-if="log.userRole" class="user-role">{{ log.userRole }}</span>
              </div>
            </td>
            <td class="col-operation">
              <span
                class="operation-badge"
                :style="{
                  background: operationConfig[log.operation]?.bgColor || '#f3f4f6',
                  color: operationConfig[log.operation]?.color || '#374151'
                }"
              >
                {{ operationConfig[log.operation]?.label || log.operation }}
              </span>
            </td>
            <td class="col-resource">
              <div class="resource-info">
                <span class="resource-icon">{{
                  resourceTypeConfig[log.resourceType]?.icon || '📄'
                }}</span>
                <div class="resource-text">
                  <span class="resource-type">{{
                    resourceTypeConfig[log.resourceType]?.label || log.resourceType
                  }}</span>
                  <span class="resource-name" :title="log.resourceName">{{
                    log.resourceName
                  }}</span>
                </div>
              </div>
            </td>
            <td class="col-result">
              <span
                class="result-badge"
                :style="{
                  background: resultConfig[log.result].bgColor,
                  color: resultConfig[log.result].color
                }"
              >
                <svg
                  v-if="log.result === 'success'"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="result-icon"
                >
                  <path
                    d="M5 12l5 5 9-9"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" class="result-icon">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                {{ resultConfig[log.result].label }}
              </span>
            </td>
            <td class="col-actions">
              <button class="action-btn" @click="viewDetail(log)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                {{ t('log.viewDetail') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="logStore.systemLogs.length > 0" class="pagination-section">
      <div class="pagination-info">
        {{ t('log.pagination.total', { total: totalLogs }) }}
      </div>
      <div class="pagination-controls">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
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
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <div v-if="selectedLog" class="drawer-body">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h4>{{ t('log.detail.basicInfo') }}</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.logId') }}</span>
                <span class="detail-value">{{ selectedLog.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.timestamp') }}</span>
                <span class="detail-value">{{ formatTime(selectedLog.timestamp) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.user') }}</span>
                <span class="detail-value"
                  >{{ selectedLog.userName }} ({{ selectedLog.userRole }})</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.operation') }}</span>
                <span
                  class="operation-badge"
                  :style="{
                    background: operationConfig[selectedLog.operation]?.bgColor || '#f3f4f6',
                    color: operationConfig[selectedLog.operation]?.color || '#374151'
                  }"
                >
                  {{ operationConfig[selectedLog.operation]?.label || selectedLog.operation }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.resourceType') }}</span>
                <span class="detail-value">
                  {{ resourceTypeConfig[selectedLog.resourceType]?.icon || '📄' }}
                  {{
                    resourceTypeConfig[selectedLog.resourceType]?.label || selectedLog.resourceType
                  }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.result') }}</span>
                <span
                  class="result-badge"
                  :style="{
                    background: resultConfig[selectedLog.result].bgColor,
                    color: resultConfig[selectedLog.result].color
                  }"
                >
                  {{ resultConfig[selectedLog.result].label }}
                </span>
              </div>
            </div>
          </div>

          <!-- 资源信息 -->
          <div class="detail-section">
            <h4>{{ t('log.detail.resource') }}</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.resourceId') }}</span>
                <span class="detail-value">{{ selectedLog.resourceId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.resourceName') }}</span>
                <span class="detail-value">{{ selectedLog.resourceName }}</span>
              </div>
            </div>
          </div>

          <!-- 数据对比 -->
          <div v-if="selectedLog.beforeValue || selectedLog.afterValue" class="detail-section">
            <h4>{{ t('log.detail.dataComparison') }}</h4>
            <div class="comparison-grid">
              <div v-if="selectedLog.beforeValue" class="comparison-block">
                <span class="comparison-title">{{ t('log.detail.before') }}</span>
                <pre class="comparison-content">{{
                  JSON.stringify(selectedLog.beforeValue, null, 2)
                }}</pre>
              </div>
              <div v-if="selectedLog.afterValue" class="comparison-block">
                <span class="comparison-title">{{ t('log.detail.after') }}</span>
                <pre class="comparison-content">{{
                  JSON.stringify(selectedLog.afterValue, null, 2)
                }}</pre>
              </div>
            </div>
          </div>

          <!-- 错误信息 -->
          <div v-if="selectedLog.errorMessage" class="detail-section">
            <h4>{{ t('log.detail.error') }}</h4>
            <div class="error-detail">
              <div class="error-message">{{ selectedLog.errorMessage }}</div>
            </div>
          </div>

          <!-- 请求信息 -->
          <div class="detail-section">
            <h4>{{ t('log.detail.requestInfo') }}</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">{{ t('log.detail.ip') }}</span>
                <span class="detail-value">{{ selectedLog.ip }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">{{ t('log.detail.userAgent') }}</span>
                <span class="detail-value text-wrap">{{ selectedLog.userAgent }}</span>
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

  .system-log {
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
    grid-template-columns: repeat(3, 1fr);
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

    &.today {
      background: $info-bg;
      color: $info;
    }

    &.failed {
      background: $error-bg;
      color: $error;
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
    min-width: 120px;

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
      vertical-align: middle;
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

  .col-user {
    min-width: 120px;

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    .user-role {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .col-operation {
    width: 100px;

    .operation-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: $border-radius-full;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
    }
  }

  .col-resource {
    min-width: 200px;

    .resource-info {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }

    .resource-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .resource-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .resource-type {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }

    .resource-name {
      font-weight: $font-weight-medium;
      color: $text-primary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .col-result {
    width: 100px;

    .result-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: $border-radius-full;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;

      .result-icon {
        width: 12px;
        height: 12px;
      }
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

    .detail-item.full-width {
      grid-column: 1 / -1;
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

    &.text-wrap {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  // 数据对比
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }

  .comparison-block {
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    padding: $spacing-md;
  }

  .comparison-title {
    display: block;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-tertiary;
    margin-bottom: $spacing-sm;
  }

  .comparison-content {
    font-size: $font-size-sm;
    color: $text-primary;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: $font-family-mono;
    background: $bg-primary;
    padding: $spacing-sm;
    border-radius: $border-radius-sm;
    overflow-x: auto;
  }

  // 错误详情
  .error-detail {
    padding: $spacing-md;
    background: $error-bg;
    border: 1px solid rgba($error, 0.2);
    border-radius: $border-radius-md;
  }

  .error-message {
    font-size: $font-size-sm;
    color: $error;
    line-height: 1.5;
  }
</style>
