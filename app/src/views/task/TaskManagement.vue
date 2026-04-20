<template>
  <div class="task-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">{{ t('task.management') }}</h1>
      <div class="header-actions">
        <button class="action-btn action-btn--secondary" @click="handleRefresh">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('common.refresh') }}</span>
        </button>
        <button class="action-btn action-btn--primary" @click="handleCreate">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('task.create') }}</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon stat-icon--total">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ taskStore.stats.total }}</span>
          <span class="stat-label">{{ t('task.stats.total') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--running">
          <svg viewBox="0 0 24 24" fill="none">
            <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ taskStore.stats.running }}</span>
          <span class="stat-label">{{ t('task.stats.running') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--paused">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ taskStore.stats.paused }}</span>
          <span class="stat-label">{{ t('task.stats.paused') }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon--pending">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ taskStore.stats.pending }}</span>
          <span class="stat-label">{{ t('task.stats.pending') }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">{{ t('task.filter.status') }}:</label>
        <select v-model="statusFilter" class="filter-select" @change="handleFilterChange">
          <option value="">{{ t('task.status.all') }}</option>
          <option value="running">{{ t('task.status.running') }}</option>
          <option value="paused">{{ t('task.status.paused') }}</option>
          <option value="completed">{{ t('task.status.completed') }}</option>
          <option value="failed">{{ t('task.status.failed') }}</option>
        </select>
      </div>
      <div class="filter-group">
        <input
          v-model="keywordFilter"
          type="text"
          class="filter-input"
          :placeholder="t('task.filter.searchPlaceholder')"
          @input="handleFilterChange"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="taskStore.loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="taskStore.error" class="error-state">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      <p>{{ taskStore.error }}</p>
      <button class="retry-btn" @click="handleRefresh">{{ t('common.retry') }}</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
      </svg>
      <p>{{ t('task.empty.title') }}</p>
      <p class="empty-hint">{{ t('task.empty.hint') }}</p>
      <button class="create-btn" @click="handleCreate">{{ t('task.createFirst') }}</button>
    </div>

    <!-- Task Table -->
    <div v-else class="task-table-container">
      <table class="task-table">
        <thead>
          <tr>
            <th class="col-status">{{ t('task.table.status') }}</th>
            <th class="col-name">{{ t('task.table.name') }}</th>
            <th class="col-agent">{{ t('task.table.agent') }}</th>
            <th class="col-schedule">{{ t('task.table.schedule') }}</th>
            <th class="col-next-run">{{ t('task.table.nextRun') }}</th>
            <th class="col-stats">{{ t('task.table.stats') }}</th>
            <th class="col-actions">{{ t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id" class="task-row">
            <td class="col-status">
              <span class="status-badge" :class="`status-badge--${task.status}`">
                <span class="status-dot"></span>
                {{ getStatusText(task.status) }}
              </span>
            </td>
            <td class="col-name">
              <span class="task-name">{{ task.name }}</span>
            </td>
            <td class="col-agent">
              <span class="agent-name">{{ task.agentName }}</span>
            </td>
            <td class="col-schedule">
              <span class="schedule-text">{{ formatSchedule(task) }}</span>
            </td>
            <td class="col-next-run">
              <span class="next-run-text">{{ formatNextRun(task.nextRunTime) }}</span>
            </td>
            <td class="col-stats">
              <div class="task-stats">
                <span class="stat-item">{{ task.runCount }}{{ t('task.stats.times') }}</span>
                <span v-if="task.runCount > 0" class="stat-rate" :class="getSuccessRateClass(task)">
                  {{ getSuccessRate(task) }}%
                </span>
              </div>
            </td>
            <td class="col-actions">
              <div class="action-group">
                <button class="icon-btn" :title="t('task.actions.execute')" @click="handleExecute(task)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="icon-btn" :title="t('task.actions.history')" @click="handleViewHistory(task)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="icon-btn" :title="t('common.edit')" @click="handleEdit(task)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button v-if="task.status === 'running'" class="icon-btn" :title="t('task.actions.pause')" @click="handlePause(task)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                    <rect x="14" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button v-else class="icon-btn" :title="t('task.actions.start')" @click="handleStart(task)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="icon-btn icon-btn--danger" :title="t('common.delete')" @click="handleDelete(task)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTaskStore, type ScheduledTask } from '@/store/modules/task'

const router = useRouter()
const { t } = useI18n()
const taskStore = useTaskStore()

// Filter states
const statusFilter = ref<ScheduledTask['status'] | ''>('')
const keywordFilter = ref('')

// Computed
const filteredTasks = computed(() => {
  let tasks = [...taskStore.filteredTasks]

  // Apply status filter
  if (statusFilter.value) {
    tasks = tasks.filter(task => task.status === statusFilter.value)
  }

  // Apply keyword filter
  if (keywordFilter.value) {
    const keyword = keywordFilter.value.toLowerCase()
    tasks = tasks.filter(task =>
      task.name.toLowerCase().includes(keyword) ||
      task.agentName.toLowerCase().includes(keyword)
    )
  }

  return tasks
})

// Methods
const getStatusText = (status: ScheduledTask['status']): string => {
  const statusMap: Record<ScheduledTask['status'], string> = {
    running: t('task.status.running'),
    paused: t('task.status.paused'),
    completed: t('task.status.completed'),
    failed: t('task.status.failed')
  }
  return statusMap[status] || status
}

const formatSchedule = (task: ScheduledTask): string => {
  if (task.scheduleType === 'once') {
    return t('task.scheduleDisplay.once')
  } else if (task.scheduleType === 'manual') {
    return t('task.scheduleDisplay.manual')
  } else if (task.schedule) {
    // Simplified cron display
    const parts = task.schedule.split(' ')
    if (parts.length === 5) {
      const [minute, hour, , , dayOfWeek] = parts
      if (dayOfWeek !== '*') {
        const days = ['日', '一', '二', '三', '四', '五', '六']
        return t('task.scheduleDisplay.weekly', { day: days[parseInt(dayOfWeek)], hour, minute })
      } else if (hour !== '*') {
        return t('task.scheduleDisplay.daily', { hour, minute })
      }
    }
    return task.schedule
  }
  return '-'
}

const formatNextRun = (timestamp: number): string => {
  if (!timestamp || timestamp <= 0) {
    return t('task.nextRunDisplay.none')
  }

  const now = Date.now()
  const diff = timestamp - now

  if (diff < 0) {
    return t('task.nextRunDisplay.overdue')
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return t('task.nextRunDisplay.days', { days, hours })
  } else if (hours > 0) {
    return t('task.nextRunDisplay.hours', { hours, minutes })
  } else {
    return t('task.nextRunDisplay.minutes', { minutes })
  }
}

const getSuccessRate = (task: ScheduledTask): number => {
  if (task.runCount === 0) return 0
  return Math.round((task.successCount / task.runCount) * 100)
}

const getSuccessRateClass = (task: ScheduledTask): string => {
  const rate = getSuccessRate(task)
  if (rate >= 90) return 'rate-high'
  if (rate >= 70) return 'rate-medium'
  return 'rate-low'
}

// Handlers
const handleFilterChange = () => {
  taskStore.setFilter({
    status: statusFilter.value || undefined,
    keyword: keywordFilter.value || undefined
  })
}

const handleRefresh = () => {
  taskStore.fetchTasks()
}

const handleCreate = () => {
  // TODO: Navigate to create task page
  console.log('Create task')
}

const handleExecute = (task: ScheduledTask) => {
  // TODO: Execute task immediately
  console.log('Execute task:', task.id)
}

const handleViewHistory = (task: ScheduledTask) => {
  // TODO: Navigate to task history page
  console.log('View history:', task.id)
}

const handleEdit = (task: ScheduledTask) => {
  // TODO: Navigate to edit task page
  console.log('Edit task:', task.id)
}

const handleStart = async (task: ScheduledTask) => {
  try {
    await taskStore.startTask(task.id)
  } catch (error) {
    console.error('Failed to start task:', error)
  }
}

const handlePause = async (task: ScheduledTask) => {
  try {
    await taskStore.pauseTask(task.id)
  } catch (error) {
    console.error('Failed to pause task:', error)
  }
}

const handleDelete = async (task: ScheduledTask) => {
  if (confirm(t('task.delete.confirm', { name: task.name }))) {
    try {
      await taskStore.deleteTask(task.id)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }
}

// Watch for filter changes
watch([statusFilter, keywordFilter], () => {
  handleFilterChange()
})

// Lifecycle
onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as *;

.task-management {
  height: 100%;
  padding: $spacing-2xl;
  overflow-y: auto;
  background: $bg-primary;
}

// Page Header
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-2xl;
}

.page-title {
  font-family: $font-family-display;
  font-size: $font-size-3xl;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  letter-spacing: $letter-spacing-tight;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-base;

  svg {
    width: 16px;
    height: 16px;
  }

  &--primary {
    background: $primary-color;
    color: $text-inverse;

    &:hover {
      background: $primary-dark;
      box-shadow: $shadow-primary;
    }
  }

  &--secondary {
    background: $bg-tertiary;
    color: $text-secondary;
    border: 1px solid $border-color-base;

    &:hover {
      background: $bg-elevated;
      color: $text-primary;
    }
  }
}

// Stats Cards
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;
  margin-bottom: $spacing-2xl;

  @include respond-below(lg) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-below(md) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-surface;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-card;
  transition: box-shadow $transition-base;

  &:hover {
    box-shadow: $shadow-card-hover;
  }
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: $border-radius-md;

  svg {
    width: 24px;
    height: 24px;
  }

  &--total {
    background: $primary-muted;
    color: $primary-color;
  }

  &--running {
    background: $success-bg;
    color: $success;
  }

  &--paused {
    background: $warning-bg;
    color: $warning;
  }

  &--pending {
    background: $info-bg;
    color: $info;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
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
  margin-top: $spacing-xs;
}

// Filter Bar
.filter-bar {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
  padding: $spacing-md $spacing-lg;
  background: $bg-secondary;
  border-radius: $border-radius-md;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.filter-label {
  font-size: $font-size-sm;
  color: $text-secondary;
  font-weight: $font-weight-medium;
}

.filter-select {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  color: $text-primary;
  background: $bg-surface;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: border-color $transition-base;

  &:hover {
    border-color: $primary-color;
  }

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: $border-focus;
  }
}

.filter-input {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-sm;
  color: $text-primary;
  background: $bg-surface;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-sm;
  width: 240px;
  transition: border-color $transition-base;

  &:hover {
    border-color: $primary-color;
  }

  &:focus {
    outline: none;
    border-color: $primary-color;
    box-shadow: $border-focus;
  }
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  color: $text-tertiary;

  p {
    margin-top: $spacing-md;
    font-size: $font-size-sm;
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

// Error State
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  color: $error;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: $spacing-md;
  }

  p {
    margin-bottom: $spacing-lg;
    font-size: $font-size-base;
  }
}

.retry-btn {
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-inverse;
  background: $primary-color;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    background: $primary-dark;
    box-shadow: $shadow-primary;
  }
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  color: $text-tertiary;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: $spacing-lg;
    opacity: 0.5;
  }

  p {
    font-size: $font-size-lg;
    color: $text-secondary;
  }

  .empty-hint {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin-top: $spacing-xs;
    margin-bottom: $spacing-lg;
  }
}

.create-btn {
  padding: $spacing-sm $spacing-xl;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-inverse;
  background: $primary-color;
  border: none;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    background: $primary-dark;
    box-shadow: $shadow-primary;
  }
}

// Task Table
.task-table-container {
  background: $bg-surface;
  border-radius: $border-radius-lg;
  box-shadow: $shadow-card;
  overflow: hidden;
}

.task-table {
  width: 100%;
  border-collapse: collapse;

  th {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-secondary;
    text-align: left;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-base;
    white-space: nowrap;
  }

  td {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-sm;
    color: $text-primary;
    border-bottom: 1px solid $border-color-light;
    vertical-align: middle;
  }
}

.task-row {
  transition: background-color $transition-fast;

  &:hover {
    background: $bg-secondary;
  }

  &:last-child td {
    border-bottom: none;
  }
}

// Status Badge
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  border-radius: $border-radius-full;
  white-space: nowrap;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &--running {
    background: $success-bg;
    color: $success;

    .status-dot {
      background: $success;
    }
  }

  &--paused {
    background: $warning-bg;
    color: $warning;

    .status-dot {
      background: $warning;
    }
  }

  &--completed {
    background: $info-bg;
    color: $info;

    .status-dot {
      background: $info;
    }
  }

  &--failed {
    background: $error-bg;
    color: $error;

    .status-dot {
      background: $error;
    }
  }
}

// Task Name
.task-name {
  font-weight: $font-weight-medium;
  color: $text-primary;
}

// Agent Name
.agent-name {
  color: $text-secondary;
}

// Schedule
.schedule-text {
  font-family: $font-family-mono;
  font-size: $font-size-xs;
  color: $text-tertiary;
}

// Next Run
.next-run-text {
  font-size: $font-size-xs;
  color: $text-secondary;
}

// Task Stats
.task-stats {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.stat-item {
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.stat-rate {
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;

  &.rate-high {
    background: $success-bg;
    color: $success;
  }

  &.rate-medium {
    background: $warning-bg;
    color: $warning;
  }

  &.rate-low {
    background: $error-bg;
    color: $error;
  }
}

// Action Group
.action-group {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  color: $text-tertiary;
  transition: all $transition-fast;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: $bg-tertiary;
    color: $primary-color;
  }

  &--danger:hover {
    background: $error-bg;
    color: $error;
  }
}

// Column widths
.col-status {
  width: 100px;
}

.col-name {
  min-width: 150px;
}

.col-agent {
  min-width: 120px;
}

.col-schedule {
  width: 140px;
}

.col-next-run {
  width: 120px;
}

.col-stats {
  width: 120px;
}

.col-actions {
  width: 180px;
}
</style>
