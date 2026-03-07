<template>
  <div class="app-design-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('application.designList.title') }}</h1>
        <span class="page-desc">{{ t('application.designList.description') }}</span>
      </div>
      <div class="header-right">
        <button class="create-btn" @click="handleCreate">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ t('application.designList.newApp') }}</span>
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <div class="filter-item">
          <label>{{ t('application.types.all') }}</label>
          <select v-model="filter.type">
            <option value="">{{ t('application.types.all') }}</option>
            <option v-for="type in appTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label>{{ t('application.status.all') }}</label>
          <select v-model="filter.status">
            <option value="">{{ t('application.status.all') }}</option>
            <option value="draft">{{ t('application.status.draft') }}</option>
            <option value="designing">{{ t('application.status.designing') }}</option>
            <option value="published">{{ t('application.status.published') }}</option>
          </select>
        </div>
      </div>
      <div class="filter-right">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="filter.keyword"
            type="text"
            :placeholder="t('application.designList.searchPlaceholder')"
          />
        </div>
      </div>
    </div>

    <!-- 应用列表 -->
    <div class="app-grid">
      <div v-for="app in filteredApps" :key="app.id" class="app-card">
        <div class="card-header">
          <div class="app-icon" :class="`type--${app.type}`">
            {{ getTypeIcon(app.type) }}
          </div>
          <div class="app-status" :class="`status--${app.status}`">
            {{ getStatusText(app.status) }}
          </div>
        </div>
        <div class="card-body">
          <h3 class="app-name">{{ app.name }}</h3>
          <p class="app-desc">{{ app.description }}</p>
          <div class="app-meta">
            <span class="meta-item">
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
              {{ formatDate(app.updatedAt) }}
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20V10M18 20V4M6 20v-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              v{{ app.version }}
            </span>
          </div>
        </div>
        <div class="card-footer">
          <button class="action-btn primary" @click="handleEdit(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ t('application.card.edit') }}
          </button>
          <button class="action-btn" @click="handleDuplicate(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            {{ t('application.card.copy') }}
          </button>
          <button class="action-btn danger" @click="handleDelete(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ t('application.card.delete') }}
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredApps.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <p>{{ t('application.designList.noApps') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { applicationApi } from '@/services/application'
  import type { Application, AppFilter } from '@/types'
  import { AppStatus, AppType } from '@/types'

  const router = useRouter()
  const { t } = useI18n()

  // 筛选条件
  const filter = ref<AppFilter>({
    type: undefined,
    status: undefined,
    keyword: ''
  })

  // 应用列表
  const apps = ref<Application[]>([])

  // 应用类型选项
  const appTypes = [
    { value: AppType.WORKFLOW, label: t('application.types.workflow') },
    { value: AppType.CHART, label: t('application.types.chart') },
    { value: AppType.FORM, label: t('application.types.form') },
    { value: AppType.DASHBOARD, label: t('application.types.dashboard') },
    { value: AppType.CUSTOM, label: t('application.types.custom') }
  ]

  // 过滤后的应用列表
  const filteredApps = computed(() => {
    let result = [...apps.value]

    if (filter.value.type) {
      result = result.filter((app) => app.type === filter.value.type)
    }
    if (filter.value.status) {
      result = result.filter((app) => app.status === filter.value.status)
    }
    if (filter.value.keyword) {
      const keyword = filter.value.keyword.toLowerCase()
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(keyword) ||
          app.description.toLowerCase().includes(keyword)
      )
    }

    return result
  })

  // 获取类型图标
  function getTypeIcon(type: AppType): string {
    const icons: Record<AppType, string> = {
      [AppType.WORKFLOW]: '📋',
      [AppType.CHART]: '📊',
      [AppType.FORM]: '📝',
      [AppType.DASHBOARD]: '📈',
      [AppType.CUSTOM]: '⚙️'
    }
    return icons[type] || '📦'
  }

  // 获取状态文本
  function getStatusText(status: AppStatus): string {
    const statusMap: Record<AppStatus, string> = {
      [AppStatus.DRAFT]: t('application.status.draft'),
      [AppStatus.DESIGNING]: t('application.status.designing'),
      [AppStatus.PUBLISHED]: t('application.status.published'),
      [AppStatus.ARCHIVED]: t('application.status.archived')
    }
    return statusMap[status] || t('application.status.all')
  }

  // 格式化日期
  function formatDate(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // 加载应用列表
  async function loadApps() {
    const result = await applicationApi.getApplications()
    apps.value = result.list
  }

  // 新建应用
  function handleCreate() {
    router.push('/app/application/design/wizard')
  }

  // 编辑应用
  function handleEdit(app: Application) {
    router.push(`/app/application/design/wizard/${app.id}`)
  }

  // 复制应用
  async function handleDuplicate(app: Application) {
    await applicationApi.duplicateApplication(app.id)
    await loadApps()
  }

  // 删除应用
  async function handleDelete(app: Application) {
    if (confirm(t('application.designList.confirmDelete', { name: app.name }))) {
      await applicationApi.deleteApplication(app.id)
      await loadApps()
    }
  }

  onMounted(loadApps)
</script>

<style scoped lang="scss">
  .app-design-list {
    height: 100%;
    padding: $spacing-xl;
    background: $bg-secondary;
    overflow-y: auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-xl;
  }

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
      margin: 0;
    }
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background: $primary-light;
    }
  }

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
  }

  .filter-left {
    display: flex;
    gap: $spacing-md;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    label {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }

    select {
      padding: $spacing-sm $spacing-md;
      min-width: 140px;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-sm;
      background: $bg-primary;
      color: $text-primary;
      font-size: $font-size-sm;
      outline: none;

      &:focus {
        border-color: $primary-color;
      }
    }
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    background: $bg-primary;

    svg {
      width: 18px;
      height: 18px;
      color: $text-tertiary;
    }

    input {
      border: none;
      outline: none;
      background: transparent;
      color: $text-primary;
      font-size: $font-size-sm;
      width: 200px;

      &::placeholder {
        color: $text-tertiary;
      }
    }
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $spacing-lg;
  }

  .app-card {
    background: $bg-primary;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    transition: all $transition-base ease;

    &:hover {
      box-shadow: $shadow-md;
      transform: translateY(-2px);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md;
    border-bottom: 1px solid $border-color-lighter;
  }

  .app-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;
    font-size: 24px;

    &.type--workflow {
      background: #e6f7ff;
    }
    &.type--chart {
      background: #fff7e6;
    }
    &.type--form {
      background: #f6ffed;
    }
    &.type--dashboard {
      background: #f9f0ff;
    }
    &.type--custom {
      background: #f5f5f5;
    }
  }

  .app-status {
    padding: 2px 8px;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &.status--draft {
      background: #f5f5f5;
      color: $text-tertiary;
    }
    &.status--designing {
      background: #e6f7ff;
      color: #1890ff;
    }
    &.status--published {
      background: #f6ffed;
      color: #52c41a;
    }
    &.status--archived {
      background: #fff1f0;
      color: #ff4d4f;
    }
  }

  .card-body {
    padding: $spacing-md;

    .app-name {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    .app-desc {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin: 0 0 $spacing-md 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .app-meta {
    display: flex;
    gap: $spacing-md;

    .meta-item {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: $font-size-xs;
      color: $text-tertiary;

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  .card-footer {
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-md;
    border-top: 1px solid $border-color-lighter;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
      }
    }

    &.danger:hover {
      border-color: $error;
      color: $error;
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    color: $text-tertiary;

    svg {
      width: 64px;
      height: 64px;
      margin-bottom: $spacing-md;
      opacity: 0.5;
    }

    p {
      margin: 0;
      font-size: $font-size-sm;
    }
  }
</style>
