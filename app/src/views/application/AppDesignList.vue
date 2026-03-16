<template>
  <div class="app-design-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('application.designList.title') }}</h1>
        <span class="page-desc">{{ t('application.designList.description') }}</span>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
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
          v-model="filter.keyword"
          type="text"
          class="search-input"
          :placeholder="t('application.designList.searchPlaceholder')"
        />
      </div>

      <div class="filter-tags">
        <button
          class="filter-tag"
          :class="{ active: !filter.type }"
          @click="filter.type = undefined"
        >
          <span class="tag-label">{{ t('application.types.all') }}</span>
        </button>
        <button
          v-for="type in appTypes"
          :key="type.value"
          class="filter-tag"
          :class="{ active: filter.type === type.value }"
          @click="filter.type = type.value"
        >
          <span class="tag-label">{{ type.label }}</span>
        </button>
      </div>
    </div>

    <!-- 应用列表 -->
    <div class="app-grid">
      <div
        v-for="app in filteredApps"
        :key="app.id"
        class="app-card"
        :class="{ disabled: app.status === AppStatus.ARCHIVED }"
      >
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

        <!-- 悬浮操作按钮 -->
        <div class="card-actions" @click.stop>
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
            <span>{{ t('application.card.edit') }}</span>
          </button>
          <button
            class="action-btn"
            @click="handleDuplicate(app)"
            :title="t('application.card.copy')"
          >
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
          </button>
          <button
            class="action-btn"
            @click="handleDelete(app)"
            :title="t('application.card.delete')"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredApps.length === 0" class="empty-state">
        <div class="empty-icon-wrapper">
          <span class="empty-icon">📦</span>
        </div>
        <h3>{{ t('application.designList.noApps') }}</h3>
        <p>{{ t('application.designList.noAppsDesc') }}</p>
        <button class="link-btn" @click="handleCreate">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          {{ t('application.designList.newApp') }}
        </button>
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
    margin-bottom: $spacing-xl;
  }

  .header-left {
    .page-title {
      font-size: $font-size-3xl;
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

  // ================================
  // 搜索和筛选
  // ================================
  .filter-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .search-box {
    position: relative;
    width: 100%;
    max-width: 500px;
  }

  .search-icon {
    position: absolute;
    left: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: $text-tertiary;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: $spacing-sm $spacing-md $spacing-sm 44px;
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

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
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
  // 应用卡片网格
  // ================================
  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $spacing-lg;
  }

  .app-card {
    position: relative;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-base;
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

    &.disabled {
      opacity: 0.6;
      pointer-events: none;
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
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      border-color: transparent;
      color: #fff;

      &:hover {
        background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      }
    }
  }

  // ================================
  // 空状态
  // ================================
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    text-align: center;

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
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
    }
  }

  .link-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-xl;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    border: none;
    border-radius: $border-radius-lg;
    color: #fff;
    text-decoration: none;
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
  // 响应式
  // ================================
  @media (max-width: 1200px) {
    .app-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .app-design-list {
      padding: $spacing-md;
    }

    .app-grid {
      grid-template-columns: 1fr;
    }

    .card-actions {
      opacity: 1;
      transform: translateY(0);
      position: static;
      background: $bg-secondary;
      backdrop-filter: none;
    }
  }
</style>
