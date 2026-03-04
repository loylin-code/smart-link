<template>
  <div class="app-runtime-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">应用管理</h1>
        <span class="page-desc">运行和管理已发布的应用</span>
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
          <div class="stat-label">已发布应用</div>
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
          <div class="stat-value">{{ totalVisits }}</div>
          <div class="stat-label">总访问次数</div>
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
          <div class="stat-label">总运行时长</div>
        </div>
      </div>
    </div>

    <!-- 应用列表 -->
    <div class="section-title">已发布应用</div>

    <div class="app-grid">
      <div v-for="app in publishedApps" :key="app.id" class="app-card">
        <div class="card-header">
          <div class="app-icon" :class="`type--${app.type}`">
            {{ getTypeIcon(app.type) }}
          </div>
          <div class="runtime-status">
            <span class="status-dot running"></span>
            <span class="status-text">运行中</span>
          </div>
        </div>

        <div class="card-body">
          <h3 class="app-name">{{ app.name }}</h3>
          <p class="app-desc">{{ app.description }}</p>
        </div>

        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-value">{{ getRuntimeStat(app.id, 'usageCount') }}</span>
            <span class="stat-label">访问</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatUptime(getRuntimeStat(app.id, 'uptime')) }}</span>
            <span class="stat-label">运行时长</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ getRuntimeStat(app.id, 'errorCount') }}</span>
            <span class="stat-label">错误</span>
          </div>
        </div>

        <div class="card-footer">
          <button class="action-btn primary" @click="handleRun(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
            </svg>
            运行
          </button>
          <button class="action-btn" @click="handleViewStats(app)">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M18 20V10M12 20V4M6 20v-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            统计
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="publishedApps.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <p>暂无已发布应用</p>
        <router-link to="/app/application/design" class="link-btn">前往应用设计</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { applicationApi } from '@/services/application'
  import type { Application, AppRuntimeStatus } from '@/types'
  import { AppType, AppStatus } from '@/types'

  const router = useRouter()

  // 应用列表
  const apps = ref<Application[]>([])
  const runtimeStats = ref<AppRuntimeStatus[]>([])

  // 已发布应用
  const publishedApps = computed(() => {
    return apps.value.filter((app) => app.status === AppStatus.PUBLISHED)
  })

  // 总访问次数
  const totalVisits = computed(() => {
    return runtimeStats.value.reduce((sum, stat) => sum + stat.usageCount, 0)
  })

  // 总运行时长
  const formatTotalUptime = computed(() => {
    const totalSeconds = runtimeStats.value.reduce((sum, stat) => sum + stat.uptime, 0)
    return formatUptime(totalSeconds)
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

  // 获取运行时统计
  function getRuntimeStat(appId: string, field: keyof AppRuntimeStatus): number {
    const stat = runtimeStats.value.find((s) => s.appId === appId)
    return stat ? (stat[field] as number) : 0
  }

  // 格式化运行时长
  function formatUptime(seconds: number): string {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分`
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}时${mins}分`
  }

  // 加载数据
  async function loadData() {
    const [appsResult, statsResult] = await Promise.all([
      applicationApi.getApplications({ status: AppStatus.PUBLISHED }),
      applicationApi.getRuntimeStatus()
    ])
    apps.value = appsResult.list
    runtimeStats.value = statsResult
  }

  // 运行应用
  function handleRun(app: Application) {
    router.push(`/app/application/runtime/${app.id}`)
  }

  // 查看统计
  function handleViewStats(app: Application) {
    // TODO: 显示统计详情弹窗
    console.log('查看统计:', app.name)
  }

  onMounted(loadData)
</script>

<style scoped lang="scss">
  .app-runtime-list {
    height: 100%;
    padding: $spacing-xl;
    background: $bg-secondary;
    overflow-y: auto;
  }

  .page-header {
    margin-bottom: $spacing-xl;

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

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
    box-shadow: $shadow-sm;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;

    svg {
      width: 24px;
      height: 24px;
    }

    &.apps {
      background: #e6f7ff;
      color: #1890ff;
    }
    &.visits {
      background: #f6ffed;
      color: #52c41a;
    }
    &.uptime {
      background: #fff7e6;
      color: #fa8c16;
    }
  }

  .stat-content {
    .stat-value {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
    }
    .stat-label {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: $spacing-md;
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

  .runtime-status {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.running {
        background: #52c41a;
      }
      &.stopped {
        background: $text-tertiary;
      }
      &.error {
        background: #ff4d4f;
      }
    }

    .status-text {
      font-size: $font-size-xs;
      color: $text-tertiary;
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
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-stats {
    display: flex;
    padding: $spacing-md;
    background: $bg-secondary;
    border-top: 1px solid $border-color-lighter;
    border-bottom: 1px solid $border-color-lighter;

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-value {
        font-size: $font-size-lg;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }
      .stat-label {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }
  }

  .card-footer {
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-md;
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
      background: $success;
      border-color: $success;
      color: #fff;

      &:hover {
        background: #73d13d;
      }
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
      margin: 0 0 $spacing-md 0;
      font-size: $font-size-sm;
    }

    .link-btn {
      color: $primary-color;
      text-decoration: none;
      font-size: $font-size-sm;

      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
