<template>
  <div class="api-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('api.title') }}</h1>
        <span class="page-desc">{{ t('api.description') }}</span>
      </div>
      <div class="header-right">
        <button class="create-btn" @click="handleAddAPI">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ t('api.addApi') }}</span>
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
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
            <path d="M3 9h18M9 21V9" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ apiStore.stats.total }}</div>
          <div class="stat-label">{{ t('api.stats.total') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon available">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ apiStore.stats.available }}</div>
          <div class="stat-label">{{ t('api.stats.available') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon degraded">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ apiStore.stats.degraded }}</div>
          <div class="stat-label">{{ t('api.stats.degraded') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon unavailable">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path
              d="M4.93 4.93l14.14 14.14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ apiStore.stats.unavailable }}</div>
          <div class="stat-label">{{ t('api.stats.unavailable') }}</div>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-tags">
      <button
        :class="['filter-tag', { active: !apiStore.filter.category }]"
        @click="setFilter('category', undefined)"
      >
        {{ t('common.all') }}
      </button>
      <button
        v-for="cat in apiCategories"
        :key="cat.value"
        :class="['filter-tag', { active: apiStore.filter.category === cat.value }]"
        @click="setFilter('category', cat.value)"
      >
        <span class="tag-icon">{{ cat.icon }}</span>
        {{ cat.label }}
      </button>
    </div>

    <!-- 状态筛选 -->
    <div class="filter-tags">
      <button
        :class="['filter-tag', { active: !apiStore.filter.status }]"
        @click="setFilter('status', undefined)"
      >
        {{ t('common.all') }}
      </button>
      <button
        v-for="status in apiStatuses"
        :key="status.value"
        :class="['filter-tag', status.value, { active: apiStore.filter.status === status.value }]"
        @click="setFilter('status', status.value)"
      >
        <span class="status-dot" :class="status.value"></span>
        {{ status.label }}
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="section-header">
      <h2 class="section-title">
        {{ t('api.listTitle') }}<span class="title-count">({{ filteredAPIs.length }})</span>
      </h2>
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <input
          v-model="apiStore.filter.keyword"
          type="text"
          class="search-input"
          :placeholder="t('api.searchPlaceholder')"
        />
      </div>
    </div>

    <!-- API 卡片网格 -->
    <div v-if="filteredAPIs.length" class="api-grid">
      <div v-for="api in filteredAPIs" :key="api.id" class="api-card" @click="openDetail(api)">
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="api-icon">{{ getCategoryIcon(api.category) }}</div>
          <div class="card-header-info">
            <h3 class="api-name">{{ api.name }}</h3>
            <div class="api-tags">
              <span class="category-tag">{{ getCategoryLabel(api.category) }}</span>
              <span class="method-tag" :class="api.method.toLowerCase()">{{ api.method }}</span>
            </div>
          </div>
          <div class="api-status-badge" :class="api.status">
            <span class="status-dot" :class="api.status"></span>
            <span class="status-text">{{ getStatusLabel(api.status) }}</span>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <div class="info-row">
            <span class="info-label">{{ t('api.provider') }}:</span>
            <span class="info-value">{{ api.provider }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('api.endpoint') }}:</span>
            <span class="info-value endpoint">{{ api.endpoint }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ t('api.authTypeLabel') }}:</span>
            <span class="info-value">{{ getAuthTypeLabel(api.authType) }}</span>
          </div>
        </div>

        <!-- 调用统计 -->
        <div class="card-stats">
          <div class="stat-row">
            <span class="stat-label">{{ t('api.stats.totalCalls') }}:</span>
            <span class="stat-value">{{ formatNumber(api.stats.totalCalls) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">{{ t('api.stats.successRate') }}:</span>
            <span
              class="stat-value"
              :class="{
                'text-success': getSuccessRate(api) >= 95,
                'text-warning': getSuccessRate(api) >= 90 && getSuccessRate(api) < 95,
                'text-danger': getSuccessRate(api) < 90
              }"
            >
              {{ getSuccessRate(api) }}%
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">{{ t('api.stats.avgLatency') }}:</span>
            <span class="stat-value">{{ api.stats.avgLatency }}ms</span>
          </div>
          <div v-if="api.stats.lastCallTime" class="stat-row">
            <span class="stat-label">{{ t('api.lastCall') }}:</span>
            <span class="stat-value">{{ formatTime(api.stats.lastCallTime) }}</span>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="api.stats.lastError" class="card-error">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ api.stats.lastError }}</span>
        </div>

        <!-- 悬浮操作按钮 -->
        <div class="card-actions" @click.stop>
          <button class="action-btn primary" @click="handleTest(api)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
            </svg>
            <span>{{ t('api.actions.test') }}</span>
          </button>
          <button class="action-btn" @click="handleConfig(api)" :title="t('common.config')">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button class="action-btn" @click="handleDelete(api)" :title="t('common.delete')">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🔌</div>
      <p class="empty-text">{{ t('api.empty.title') }}</p>
      <p class="empty-subtext">{{ t('api.empty.subtitle') }}</p>
    </div>

    <!-- 分页 -->
    <div v-if="filteredAPIs.length > 0" class="pagination">
      <span class="pagination-info">
        {{
          t('api.pagination.showing', {
            start: 1,
            end: filteredAPIs.length,
            total: filteredAPIs.length
          })
        }}
      </span>
      <div class="pagination-controls">
        <button class="page-btn" disabled>&lt;</button>
        <button class="page-btn active">1</button>
        <button class="page-btn" v-if="filteredAPIs.length > 8">2</button>
        <button class="page-btn" disabled>&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAPIStore, type ExternalAPI } from '@/store/modules/api'

  const router = useRouter()
  const { t } = useI18n()
  const apiStore = useAPIStore()

  // API Categories
  const apiCategories = computed(() => [
    { value: '' as const, label: t('common.all'), icon: '' },
    { value: 'weather' as const, label: t('api.categories.weather'), icon: '🌤️' },
    { value: 'payment' as const, label: t('api.categories.payment'), icon: '💳' },
    { value: 'map' as const, label: t('api.categories.map'), icon: '🗺️' },
    { value: 'notification' as const, label: t('api.categories.notification'), icon: '🔔' },
    { value: 'other' as const, label: t('api.categories.other'), icon: '📦' }
  ])

  const apiStatuses = computed(() => [
    { value: 'available' as const, label: t('api.status.available') },
    { value: 'degraded' as const, label: t('api.status.degraded') },
    { value: 'unavailable' as const, label: t('api.status.unavailable') }
  ])

  // Fetch APIs on mount
  onMounted(async () => {
    await apiStore.fetchAPIs()
  })

  // Computed
  const filteredAPIs = computed(() => apiStore.filteredAPIs)

  // Methods
  const setFilter = (key: 'category' | 'status', value: any) => {
    apiStore.setFilter({ [key]: value })
  }

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      weather: '🌤️',
      payment: '💳',
      map: '🗺️',
      notification: '🔔',
      other: '📦'
    }
    return icons[category] || '📦'
  }

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      weather: t('api.categories.weather'),
      payment: t('api.categories.payment'),
      map: t('api.categories.map'),
      notification: t('api.categories.notification'),
      other: t('api.categories.other')
    }
    return labels[category] || category
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      available: t('api.status.available'),
      degraded: t('api.status.degraded'),
      unavailable: t('api.status.unavailable')
    }
    return labels[status] || status
  }

  const getAuthTypeLabel = (authType: string): string => {
    const labels: Record<string, string> = {
      none: t('api.authTypes.none'),
      apiKey: t('api.authTypes.apiKey'),
      oauth2: t('api.authTypes.oauth2'),
      basic: t('api.authTypes.basic'),
      jwt: t('api.authTypes.jwt')
    }
    return labels[authType] || authType
  }

  const getSuccessRate = (api: ExternalAPI): number => {
    if (api.stats.totalCalls === 0) return 100
    return Math.round((api.stats.successCalls / api.stats.totalCalls) * 100)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t('common.justNow')
    if (minutes < 60) return t('common.minutesAgo', { count: minutes })
    if (hours < 24) return t('common.hoursAgo', { count: hours })
    if (days < 7) return t('common.daysAgo', { count: days })
    return new Date(timestamp).toLocaleDateString()
  }

  const openDetail = (api: ExternalAPI) => {
    // Navigate to detail page (if exists)
    router.push(`/app/tool/apis/${api.id}`)
  }

  const handleAddAPI = () => {
    // TODO: Open add API dialog
    alert(t('api.addApi'))
  }

  const handleTest = async (api: ExternalAPI) => {
    const success = await apiStore.testConnection(api.id)
    if (success) {
      alert(t('api.test.success'))
    } else {
      alert(t('api.test.failed', { error: apiStore.error || 'Unknown error' }))
    }
  }

  const handleConfig = (api: ExternalAPI) => {
    openDetail(api)
  }

  const handleDelete = (api: ExternalAPI) => {
    if (confirm(t('api.delete.confirm', { name: api.name }))) {
      // TODO: Delete API
      alert(t('api.delete.success'))
    }
  }
</script>

<style scoped lang="scss">
  .api-management {
    height: 100%;
    padding: $spacing-xl;
    background: $bg-secondary;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-color-base;
      border-radius: 3px;

      &:hover {
        background: $text-tertiary;
      }
    }
  }

  // ================================
  // 页面头部
  // ================================
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .page-title {
      font-size: $font-size-3xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      margin: 0;
      text-align: left;
    }

    .page-desc {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0;
      text-align: left;
    }
  }

  .header-right {
    flex-shrink: 0;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    border: none;
    border-radius: $border-radius-lg;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
  }

  // ================================
  // 统计卡片
  // ================================
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-base;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-lg;
    flex-shrink: 0;

    svg {
      width: 28px;
      height: 28px;
    }

    &.total {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.15) 0%,
        rgba(139, 92, 246, 0.15) 100%
      );
      color: $primary-color;
    }

    &.available {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.15) 0%,
        rgba(52, 211, 153, 0.15) 100%
      );
      color: $success;
    }

    &.degraded {
      background: linear-gradient(
        135deg,
        rgba(217, 119, 6, 0.15) 0%,
        rgba(245, 158, 11, 0.15) 100%
      );
      color: $warning;
    }

    &.unavailable {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
      color: $error;
    }
  }

  .stat-content {
    .stat-value {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      line-height: 1.2;
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin-top: 4px;
    }
  }

  // ================================
  // 筛选标签
  // ================================
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-xs $spacing-md;
    background: $bg-primary;
    border: 1px solid transparent;
    border-radius: $border-radius-full;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    .tag-icon {
      font-size: 14px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.available {
        background: $success;
      }

      &.degraded {
        background: $warning;
      }

      &.unavailable {
        background: $error;
      }
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba(59, 130, 246, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // ================================
  // 区块标题（标题 + 搜索框）
  // ================================
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-lg;
    margin-top: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    .title-count {
      font-size: $font-size-base;
      font-weight: $font-weight-normal;
      color: $text-tertiary;
    }
  }

  .section-header .search-box {
    position: relative;
    width: 280px;
    flex-shrink: 0;
  }

  .search-icon {
    position: absolute;
    left: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: 40px;
    padding: $spacing-sm $spacing-md $spacing-sm 40px;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    font-size: $font-size-sm;
    color: $text-primary;
    transition: all 0.2s ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }

  // ================================
  // API Grid
  // ================================
  .api-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .api-card {
    position: relative;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);

      .card-actions {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  // ================================
  // 卡片头部
  // ================================
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $border-color-light;
  }

  .api-icon {
    font-size: 36px;
    flex-shrink: 0;
  }

  .card-header-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .api-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .api-tags {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .category-tag {
    font-size: $font-size-xs;
    color: $text-secondary;
  }

  .method-tag {
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    padding: 2px 6px;
    border-radius: $border-radius-sm;

    &.get {
      background: rgba(59, 130, 246, 0.1);
      color: $primary-color;
    }

    &.post {
      background: rgba(16, 185, 129, 0.1);
      color: $success;
    }

    &.put {
      background: rgba(245, 158, 11, 0.1);
      color: $warning;
    }

    &.delete {
      background: rgba(220, 38, 38, 0.1);
      color: $error;
    }
  }

  .api-status-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    flex-shrink: 0;

    .status-text {
      font-weight: $font-weight-medium;
    }

    &.available {
      background: rgba(16, 185, 129, 0.1);
      color: $success;
    }

    &.degraded {
      background: rgba(217, 119, 6, 0.1);
      color: $warning;
    }

    &.unavailable {
      background: rgba(220, 38, 38, 0.1);
      color: $error;
    }
  }

  // ================================
  // 卡片内容
  // ================================
  .card-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
  }

  .info-label {
    color: $text-secondary;
    flex-shrink: 0;
  }

  .info-value {
    color: $text-primary;
    font-weight: $font-weight-medium;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.endpoint {
      font-family: $font-family-mono;
      font-size: $font-size-xs;
    }
  }

  // ================================
  // 卡片统计
  // ================================
  .card-stats {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .stat-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;

    &.text-success {
      color: $success;
    }

    &.text-warning {
      color: $warning;
    }

    &.text-danger {
      color: $error;
    }
  }

  // ================================
  // 错误信息
  // ================================
  .card-error {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm;
    background: rgba(220, 38, 38, 0.05);
    border-radius: $border-radius-md;
    font-size: $font-size-xs;
    color: $error;

    .error-icon {
      flex-shrink: 0;
    }

    .error-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // ================================
  // 悬浮操作按钮
  // ================================
  .card-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-md;
    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(255, 255, 255, 0.95) 100%
    );
    border-top: 1px solid $border-color-lighter;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
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

    &.primary {
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      border-color: transparent;
      color: #fff;

      &:hover {
        background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      }
    }
  }

  // ================================
  // 空状态
  // ================================
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
  }

  .empty-text {
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin: 0 0 $spacing-xs;
  }

  .empty-subtext {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0;
  }

  // ================================
  // 分页
  // ================================
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .pagination-info {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .pagination-controls {
    display: flex;
    gap: $spacing-xs;
  }

  .page-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-primary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.active {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // ================================
  // 响应式
  // ================================
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .api-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .api-management {
      padding: $spacing-md;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;

      .header-right {
        width: 100%;

        .create-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .api-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;

      .search-box {
        width: 100%;
      }
    }

    .card-actions {
      opacity: 1;
      transform: translateY(0);
      position: static;
      background: $bg-secondary;
      backdrop-filter: none;
    }
  }

  // ================================
  // 深色模式适配
  // ================================
  [data-theme='dark'] {
    .api-card {
      background: $bg-secondary;
      border-color: $border-color-base;
    }

    .card-actions {
      background: linear-gradient(to top, rgba(30, 41, 59, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
      border-top-color: $border-color-base;
    }

    .action-btn {
      background: $bg-tertiary;
      border-color: $border-color-base;

      &.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      }
    }
  }
</style>
