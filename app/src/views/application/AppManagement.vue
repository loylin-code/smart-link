<template>
  <div class="app-management">
    <div class="page-header">
      <h1 class="page-title">{{ t('application.management') }}</h1>
      <div class="header-actions">
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select" @change="handleFilterChange">
            <option value="">{{ t('application.filter.allStatus') }}</option>
            <option value="draft">{{ t('application.status.draft') }}</option>
            <option value="designing">{{ t('application.status.designing') }}</option>
            <option value="published">{{ t('application.status.published') }}</option>
          </select>
          <select v-model="typeFilter" class="filter-select" @change="handleFilterChange">
            <option value="">{{ t('application.filter.allTypes') }}</option>
            <option value="workflow">{{ t('application.type.workflow') }}</option>
            <option value="dashboard">{{ t('application.type.dashboard') }}</option>
            <option value="form">{{ t('application.type.form') }}</option>
            <option value="chart">{{ t('application.type.chart') }}</option>
            <option value="custom">{{ t('application.type.custom') }}</option>
          </select>
        </div>
        <button class="create-btn" @click="handleCreate">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('application.create') }}</span>
        </button>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ appStore.stats.total }}</span>
        <span class="stat-label">{{ t('application.stats.total') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ appStore.stats.published }}</span>
        <span class="stat-label">{{ t('application.stats.published') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ appStore.stats.designing }}</span>
        <span class="stat-label">{{ t('application.stats.designing') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ appStore.stats.draft }}</span>
        <span class="stat-label">{{ t('application.stats.draft') }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="appStore.loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="appStore.error" class="error-state">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
      <p>{{ appStore.error }}</p>
      <button class="retry-btn" @click="handleRetry">{{ t('common.retry') }}</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="applications.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
      </svg>
      <p>{{ t('application.empty.title') }}</p>
      <p class="empty-hint">{{ t('application.empty.hint') }}</p>
      <button class="create-btn" @click="handleCreate">{{ t('application.createFirst') }}</button>
    </div>

    <!-- App Grid -->
    <div v-else class="app-grid">
      <div v-for="app in applications" :key="app.id" class="app-card">
        <div class="app-card__header">
          <div class="app-card__icon">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
              <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <span class="app-card__version">v{{ app.version }}</span>
        </div>
        <h3 class="app-card__title">{{ app.name }}</h3>
        <p class="app-card__desc">{{ app.description }}</p>
        <div class="app-card__status">
          <span class="status-dot" :class="`status-dot--${app.status}`"></span>
          <span class="status-text">{{ getStatusText(app.status) }}</span>
          <span class="status-type">{{ getTypeText(app.type) }}</span>
        </div>
        <div class="app-card__actions">
          <button class="action-btn" @click="handleRun(app)" :disabled="app.status !== 'published'">
            <svg viewBox="0 0 24 24" fill="none">
              <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>{{ t('application.actions.run') }}</span>
          </button>
          <button class="action-btn" @click="handleOrchestrate(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M22 12H18L15 21L9 3L6 12H2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t('application.actions.design') }}</span>
          </button>
          <button class="action-btn" @click="handleEdit(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t('application.actions.edit') }}</span>
          </button>
          <button class="action-btn action-btn--danger" @click="handleDelete(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6H5H21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ t('application.actions.delete') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- App Form Dialog -->
    <AppFormDialog
      v-model:visible="showFormDialog"
      :app="editingApp"
      @submit="handleFormSubmit"
      @close="handleFormClose"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useApplicationStore } from '@/store/modules/application'
  import type { Application, AppStatus, AppType } from '@/types'
  import AppFormDialog from '@/components/application/AppFormDialog.vue'

  const router = useRouter()
  const { t } = useI18n()
  const appStore = useApplicationStore()

  // Filter states
  const statusFilter = ref<AppStatus | ''>('')
  const typeFilter = ref<AppType | ''>('')

  // Dialog states
  const showFormDialog = ref(false)
  const editingApp = ref<Application | null>(null)

  // Computed
  const applications = computed(() => appStore.filteredApplications)

  // Methods
  const getStatusText = (status: AppStatus): string => {
    const statusMap: Record<AppStatus, string> = {
      draft: t('application.status.draft'),
      designing: t('application.status.designing'),
      published: t('application.status.published'),
      archived: t('application.status.archived')
    }
    return statusMap[status] || status
  }

  const getTypeText = (type: AppType): string => {
    const typeMap: Record<AppType, string> = {
      workflow: t('application.type.workflow'),
      dashboard: t('application.type.dashboard'),
      form: t('application.type.form'),
      chart: t('application.type.chart'),
      custom: t('application.type.custom')
    }
    return typeMap[type] || type
  }

  // Handlers
  const handleFilterChange = () => {
    appStore.setFilter({
      status: statusFilter.value || undefined,
      type: typeFilter.value || undefined
    })
  }

  const handleCreate = () => {
    editingApp.value = null
    showFormDialog.value = true
  }

  const handleRun = (app: Application) => {
    router.push(`/app/application/runtime/${app.id}`)
  }

  const handleOrchestrate = (app: Application) => {
    router.push(`/app/application/design/edit/${app.id}`)
  }

  const handleEdit = (app: Application) => {
    editingApp.value = app
    showFormDialog.value = true
  }

  const handleDelete = async (app: Application) => {
    if (confirm(t('application.delete.confirm', { name: app.name }))) {
      try {
        await appStore.deleteApp(app.id)
      } catch (error) {
        alert(t('application.delete.failed', { error: appStore.error || 'Unknown error' }))
      }
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingApp.value) {
        await appStore.updateApp(editingApp.value.id, formData)
      } else {
        await appStore.createApp(formData)
      }
      showFormDialog.value = false
      editingApp.value = null
    } catch (error) {
      // Error is handled in the store
    }
  }

  const handleFormClose = () => {
    showFormDialog.value = false
    editingApp.value = null
  }

  const handleRetry = () => {
    appStore.fetchApplications()
  }

  // Lifecycle
  onMounted(() => {
    appStore.fetchApplications()
  })
</script>

<style scoped lang="scss">
  .app-management {
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .filter-group {
    display: flex;
    gap: $spacing-sm;
  }

  .filter-select {
    padding: $spacing-sm $spacing-md;
    padding-right: $spacing-xl;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7184' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right $spacing-sm center;

    &:focus {
      border-color: $primary-color;
      outline: none;
    }
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

  .stats-bar {
    display: flex;
    gap: $spacing-xl;
    margin-bottom: $spacing-lg;
    padding: $spacing-md $spacing-lg;
    background: $bg-secondary;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-light;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .stat-value {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
    }

    .stat-label {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    text-align: center;

    svg {
      width: 80px;
      height: 80px;
      margin-bottom: $spacing-md;
      color: $text-tertiary;
    }

    p {
      font-size: $font-size-base;
      color: $text-secondary;
    }

    .empty-hint {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin-top: $spacing-xs;
    }
  }

  .error-state {
    svg {
      color: $error;
    }
  }

  .retry-btn {
    margin-top: $spacing-md;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-sm;
    cursor: pointer;

    &:hover {
      background: $primary-light;
    }
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $border-color-light;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-lg;
  }

  .app-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    transition: all $transition-base ease;

    &:hover {
      transform: translateY(-4px);
      border-color: rgba(24, 144, 255, 0.3);
      box-shadow: $shadow-md;
    }

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: $spacing-md;
    }

    &__icon {
      width: 60px;
      height: 60px;
      background: $bg-tertiary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary-color;

      svg {
        width: 32px;
        height: 32px;
      }
    }

    &__version {
      font-size: $font-size-xs;
      color: $text-tertiary;
      background: $bg-tertiary;
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
    }

    &__title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }

    &__desc {
      font-size: $font-size-sm;
      color: $text-secondary;
      line-height: 1.6;
      margin-bottom: $spacing-md;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &__status {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      margin-bottom: $spacing-md;
    }

    &__actions {
      display: flex;
      gap: $spacing-sm;
      padding-top: $spacing-md;
      border-top: 1px solid $border-color-light;
    }
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--published {
      background: $success;
    }

    &--draft {
      background: $text-tertiary;
    }

    &--designing {
      background: $primary-color;
    }

    &--archived {
      background: $error;
    }
  }

  .status-text {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .status-type {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-left: auto;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--danger:hover {
      border-color: $error;
      color: $error;
    }
  }
</style>