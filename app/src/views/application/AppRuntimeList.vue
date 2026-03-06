<template>
  <div class="app-runtime-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('application.runtimeList.title') }}</h1>
        <span class="page-desc">{{ t('application.runtimeList.description') }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon apps">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ publishedApps.length }}</div>
          <div class="stat-label">{{ t('application.stats.published') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon visits">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
              stroke="currentColor"
              stroke-width="2"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(totalVisits) }}</div>
          <div class="stat-label">{{ t('application.stats.totalVisits') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon uptime">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatTotalUptime }}</div>
          <div class="stat-label">{{ t('application.stats.totalUptime') }}</div>
        </div>
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
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="t('application.runtimeList.searchPlaceholder')"
        />
      </div>

      <div class="filter-tags">
        <button
          v-for="type in appTypes"
          :key="type.value"
          class="filter-tag"
          :class="{ active: selectedType === type.value }"
          @click="selectType(type.value)"
        >
          <span class="tag-icon">{{ type.icon }}</span>
          <span class="tag-label">{{ type.label }}</span>
        </button>
      </div>
    </div>

    <!-- 应用列表标题 -->
    <div class="section-header">
      <h2 class="section-title">{{ t('application.runtimeList.publishedApps') }}</h2>
      <span class="app-count"
        >{{ filteredApps.length }} {{ t('application.runtimeList.apps') }}</span
      >
    </div>

    <!-- 应用卡片网格 -->
    <div v-if="paginatedApps.length > 0" class="app-grid">
      <div
        v-for="app in paginatedApps"
        :key="app.id"
        class="app-card"
        :class="{ disabled: app.isEnabled === false }"
        @click="handleCardClick(app)"
      >
        <div class="card-header">
          <div class="app-icon" :class="`type--${app.type}`">
            {{ getTypeIcon(app.type) }}
          </div>
          <div class="app-status" :class="app.isEnabled === false ? 'disabled' : 'enabled'">
            <span class="status-dot"></span>
            <span class="status-text">{{
              app.isEnabled === false
                ? t('application.status.disabled')
                : t('application.status.enabled')
            }}</span>
          </div>
        </div>

        <div class="card-body">
          <h3 class="app-name">{{ app.name }}</h3>
          <p class="app-desc">{{ app.description }}</p>
        </div>

        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-label">{{ t('application.card.type') }}:</span>
            <span class="meta-value">{{ getTypeName(app.type) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('application.card.published') }}:</span>
            <span class="meta-value">{{ formatDate(app.publishedAt) }}</span>
          </div>
        </div>

        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(getRuntimeStat(app.id, 'usageCount')) }}</span>
            <span class="stat-label">{{ t('application.card.visits') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatUptime(getRuntimeStat(app.id, 'uptime')) }}</span>
            <span class="stat-label">{{ t('application.card.uptime') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ getRuntimeStat(app.id, 'errorCount') }}</span>
            <span class="stat-label">{{ t('application.card.errors') }}</span>
          </div>
        </div>

        <div class="card-footer">
          <button class="action-btn primary" @click.stop="handleRun(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
            </svg>
            {{ t('application.card.run') }}
          </button>
          <button class="action-btn" @click.stop="handleShare(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('application.card.share') }}
          </button>
          <button class="action-btn" @click.stop="handleToggle(app)">
            <svg v-if="app.isEnabled !== false" viewBox="0 0 24 24" fill="none">
              <rect
                x="6"
                y="4"
                width="4"
                height="16"
                rx="1"
                stroke="currentColor"
                stroke-width="2"
              />
              <rect
                x="14"
                y="4"
                width="4"
                height="16"
                rx="1"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
            </svg>
            {{
              app.isEnabled !== false ? t('application.card.disable') : t('application.card.enable')
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
        <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <p>{{ t('application.runtimeList.noApps') }}</p>
      <router-link to="/app/application/design" class="link-btn">{{
        t('application.runtimeList.goToDesign')
      }}</router-link>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        v-for="page in displayedPages"
        :key="page"
        class="page-btn"
        :class="{ active: currentPage === page }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- 分享弹窗 -->
    <ShareModal v-if="showShareModal" :app="selectedApp" @close="showShareModal = false" />

    <!-- 禁用确认弹窗 -->
    <DisableConfirmModal
      v-if="showDisableModal"
      :app="selectedApp"
      @confirm="confirmDisable"
      @cancel="showDisableModal = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { applicationApi } from '@/services/application'
  import type { Application, AppRuntimeStatus } from '@/types'
  import { AppType, AppStatus } from '@/types'
  import ShareModal from './ShareModal.vue'
  import DisableConfirmModal from './DisableConfirmModal.vue'

  const { t } = useI18n()
  const router = useRouter()

  // State
  const apps = ref<Application[]>([])
  const runtimeStats = ref<AppRuntimeStatus[]>([])
  const searchQuery = ref('')
  const selectedType = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(6)
  const showShareModal = ref(false)
  const showDisableModal = ref(false)
  const selectedApp = ref<Application | null>(null)

  // 应用类型列表
  const appTypes = computed(() => [
    { value: 'all', label: t('application.types.all'), icon: '' },
    { value: AppType.WORKFLOW, label: t('application.types.workflow'), icon: '📋' },
    { value: AppType.DASHBOARD, label: t('application.types.dashboard'), icon: '📊' },
    { value: AppType.FORM, label: t('application.types.form'), icon: '📝' },
    { value: AppType.CHART, label: t('application.types.chart'), icon: '📈' },
    { value: AppType.CUSTOM, label: t('application.types.custom'), icon: '⚙️' }
  ])

  // 已发布应用
  const publishedApps = computed(() => {
    return apps.value.filter((app) => app.status === AppStatus.PUBLISHED)
  })

  // 过滤后的应用
  const filteredApps = computed(() => {
    let result = publishedApps.value

    // 类型筛选
    if (selectedType.value) {
      result = result.filter((app) => app.type === selectedType.value)
    }

    // 搜索筛选
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(query) || app.description.toLowerCase().includes(query)
      )
    }

    return result
  })

  // 总页数
  const totalPages = computed(() => Math.ceil(filteredApps.value.length / pageSize.value))

  // 当前页显示的应用
  const paginatedApps = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredApps.value.slice(start, end)
  })

  // 显示的页码
  const displayedPages = computed(() => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 5)
      } else if (current >= total - 2) {
        pages.push(total - 4, total - 3, total - 2, total - 1, total)
      } else {
        pages.push(current - 2, current - 1, current, current + 1, current + 2)
      }
    }

    return pages
  })

  // 统计数据
  const totalVisits = computed(() => {
    return runtimeStats.value.reduce((sum, stat) => sum + stat.usageCount, 0)
  })

  const formatTotalUptime = computed(() => {
    const totalSeconds = runtimeStats.value.reduce((sum, stat) => sum + stat.uptime, 0)
    return formatUptime(totalSeconds)
  })

  // Methods
  function getTypeIcon(type: AppType): string {
    const icons: Record<AppType, string> = {
      [AppType.WORKFLOW]: '📋',
      [AppType.DASHBOARD]: '📊',
      [AppType.FORM]: '📝',
      [AppType.CHART]: '📈',
      [AppType.CUSTOM]: '⚙️'
    }
    return icons[type] || '📦'
  }

  function getTypeName(type: AppType): string {
    const names: Record<AppType, string> = {
      [AppType.WORKFLOW]: t('application.types.workflow'),
      [AppType.DASHBOARD]: t('application.types.dashboard'),
      [AppType.FORM]: t('application.types.form'),
      [AppType.CHART]: t('application.types.chart'),
      [AppType.CUSTOM]: t('application.types.custom')
    }
    return names[type] || type
  }

  function getRuntimeStat(appId: string, field: keyof AppRuntimeStatus): number {
    const stat = runtimeStats.value.find((s) => s.appId === appId)
    return stat ? (stat[field] as number) : 0
  }

  function formatNumber(num: number): string {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w'
    }
    return num.toString()
  }

  function formatUptime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h${mins}m`
  }

  function formatDate(timestamp?: number): string {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }

  function selectType(type: string) {
    selectedType.value = type === 'all' ? null : type
    currentPage.value = 1
  }

  function handleCardClick(app: Application) {
    if (app.isEnabled !== false) {
      handleRun(app)
    }
  }

  function handleRun(app: Application) {
    router.push(`/app/application/runtime/${app.id}`)
  }

  function handleShare(app: Application) {
    selectedApp.value = app
    showShareModal.value = true
  }

  function handleToggle(app: Application) {
    if (app.isEnabled !== false) {
      // 禁用应用
      selectedApp.value = app
      showDisableModal.value = true
    } else {
      // 启用应用
      enableApp(app)
    }
  }

  async function confirmDisable(disableInfo: { title: string; description: string }) {
    if (!selectedApp.value) return

    // TODO: 调用 API 禁用应用
    const index = apps.value.findIndex((a) => a.id === selectedApp.value!.id)
    if (index > -1) {
      apps.value[index].isEnabled = false
    }

    showDisableModal.value = false
    selectedApp.value = null
  }

  async function enableApp(app: Application) {
    // TODO: 调用 API 启用应用
    const index = apps.value.findIndex((a) => a.id === app.id)
    if (index > -1) {
      apps.value[index].isEnabled = true
    }
  }

  async function loadData() {
    try {
      const [appsResult, statsResult] = await Promise.all([
        applicationApi.getApplications({ status: AppStatus.PUBLISHED }),
        applicationApi.getRuntimeStatus()
      ])
      apps.value = appsResult.list.map((app) => ({
        ...app,
        isEnabled: app.isEnabled !== false // 默认启用
      }))
      runtimeStats.value = statsResult
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  // 监听筛选条件变化，重置页码
  watch([searchQuery, selectedType], () => {
    currentPage.value = 1
  })

  onMounted(loadData)
</script>

<style scoped lang="scss">
  @import './AppRuntimeList.scss';
</style>
