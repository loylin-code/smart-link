<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useAgentStore } from '@/store/modules/agent'
  import { useSkillsStore } from '@/store/modules/skills'
  import { useMCPStore } from '@/store/modules/mcp'
  import { useComponentsStore } from '@/store/modules/components'
  import { useModelStore } from '@/store/modules/model'
  import { useExploreStore } from '@/store/modules/explore'
  import type { Skill, MCPServer, ChatConversation, LLMModel } from '@/types'
  import StatCard from '@/components/overview/StatCard.vue'

  const { t } = useI18n()
  const agentStore = useAgentStore()
  const skillsStore = useSkillsStore()
  const mcpStore = useMCPStore()
  const componentsStore = useComponentsStore()
  const modelStore = useModelStore()
  const exploreStore = useExploreStore()

  // 统计数据
  const agentCount = computed(() => agentStore.agents.length)
  const skillsCount = computed(() => skillsStore.skills?.length || 0)
  const mcpCount = computed(() => mcpStore.servers?.length || 0)
  const componentsCount = computed(() => componentsStore.staticComponents?.length || 0)
  const modelCount = computed(() => modelStore.models?.length || 0)
  const availableModelCount = computed(() => {
    return modelStore.models?.filter((m: LLMModel) => m.status === 'available').length || 0
  })

  // 技能成功率
  const skillsSuccessRate = computed(() => {
    if (!skillsStore.skills?.length) return 0
    const enabledSkills = skillsStore.skills.filter((s: Skill) => s.stats?.successRate)
    if (!enabledSkills.length) return 0
    const totalRate = enabledSkills.reduce(
      (sum: number, s: Skill) => sum + (s.stats?.successRate || 0),
      0
    )
    return (totalRate / enabledSkills.length).toFixed(1)
  })

  // MCP 连接数
  const mcpConnected = computed(() => {
    return mcpStore.servers?.filter((s: MCPServer) => s.status === 'connected').length || 0
  })

  // 会话统计数据（从 exploreStore 获取）
  const sessionStats = computed(() => {
    const conversations = exploreStore.conversations || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todayCount = conversations.filter(
      (c: ChatConversation) => c.updatedAt >= today.getTime()
    ).length
    const weekCount = conversations.filter(
      (c: ChatConversation) => c.updatedAt >= weekAgo.getTime()
    ).length
    const monthCount = conversations.filter(
      (c: ChatConversation) => c.updatedAt >= monthAgo.getTime()
    ).length

    return {
      today: todayCount,
      week: weekCount,
      month: monthCount,
      total: conversations.length
    }
  })

  // 快捷入口
  const quickActions = [
    {
      key: 'createAgent',
      label: t('overview.quickActions.createAgent'),
      icon: '🤖',
      route: '/app/agent'
    },
    {
      key: 'createSkill',
      label: t('overview.quickActions.createSkill'),
      icon: '🧩',
      route: '/app/tool/skills'
    },
    {
      key: 'configMcp',
      label: t('overview.quickActions.configMcp'),
      icon: '🔌',
      route: '/app/tool/mcp'
    },
    {
      key: 'addApi',
      label: t('overview.quickActions.addApi'),
      icon: '🔌',
      route: '/app/resource/api'
    },
    {
      key: 'manageSemantic',
      label: t('overview.quickActions.manageSemantic'),
      icon: '📚',
      route: '/app/semantic/vocabulary'
    },
    {
      key: 'viewLogs',
      label: t('overview.quickActions.viewLogs'),
      icon: '📋',
      route: '/app/log/operation'
    }
  ]

  // 刷新数据
  const refreshData = async () => {
    await Promise.all([
      agentStore.fetchAgents(),
      skillsStore.fetchSkills(),
      mcpStore.fetchServers()
    ])
  }
</script>

<template>
  <div class="overview-dashboard">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">{{ t('route.overview') }}</h1>
      <div class="dashboard-actions">
        <select class="time-range-select">
          <option value="today">{{ t('overview.timeRange.today') }}</option>
          <option value="week">{{ t('overview.timeRange.week') }}</option>
          <option value="month">{{ t('overview.timeRange.month') }}</option>
        </select>
        <button class="refresh-btn" @click="refreshData">
          <span class="icon">🔄</span>
          {{ t('overview.refresh') }}
        </button>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <StatCard
        :title="t('overview.stats.agents')"
        :value="agentCount"
        icon="🤖"
        :trend="2"
        :trend-label="t('overview.stats.todayIncrease')"
        status="success"
      />
      <StatCard
        :title="t('overview.stats.skills')"
        :value="skillsCount"
        icon="🧩"
        :trend-label="`${skillsSuccessRate}% ${t('overview.stats.successRate')}`"
      />
      <StatCard
        :title="t('overview.stats.mcp')"
        :value="mcpCount"
        icon="🔌"
        :trend-label="`${mcpConnected} ${t('overview.stats.connected')}`"
      />
      <StatCard :title="t('overview.stats.components')" :value="componentsCount" icon="🎨" />
      <StatCard
        :title="t('overview.stats.models')"
        :value="modelCount"
        icon="🧠"
        :trend-label="`${availableModelCount} ${t('overview.stats.available')}`"
      />
    </div>

    <!-- 会话统计和 Token 消耗区域 -->
    <div class="dashboard-row">
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">{{ t('overview.stats.sessions') }}</h3>
        </div>
        <div class="card-content">
          <div class="stats-list">
            <div class="stat-item">
              <span class="stat-label">{{ t('overview.session.today') }}</span>
              <span class="stat-value">{{ sessionStats.today }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('overview.session.week') }}</span>
              <span class="stat-value">{{ sessionStats.week }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t('overview.session.month') }}</span>
              <span class="stat-value">{{ sessionStats.month }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">{{ t('overview.stats.tokens') }}</h3>
        </div>
        <div class="card-content">
          <div class="token-placeholder">
            <div class="placeholder-text">{{ t('overview.tokens.placeholder') }}</div>
            <div class="placeholder-subtext">{{ t('overview.tokens.comingSoon') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 定时任务和系统状态区域 -->
    <div class="dashboard-row">
      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">{{ t('overview.stats.tasks') }}</h3>
        </div>
        <div class="card-content">
          <div class="task-placeholder">
            <div class="placeholder-text">{{ t('overview.tasks.placeholder') }}</div>
            <router-link to="/app/task" class="view-all-link">
              {{ t('overview.tasks.viewAll') }} →
            </router-link>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h3 class="card-title">{{ t('overview.stats.systemStatus') }}</h3>
        </div>
        <div class="card-content">
          <div class="system-status-list">
            <div class="status-item">
              <span class="status-dot status--success"></span>
              <span class="status-label">{{ t('overview.system.llmProvider') }}</span>
              <span class="status-value">{{ t('overview.system.normal') }}</span>
            </div>
            <div class="status-item">
              <span class="status-dot status--success"></span>
              <span class="status-label">{{ t('overview.system.mcpServers') }}</span>
              <span class="status-value">{{ mcpConnected }}/{{ mcpCount }}</span>
            </div>
            <div class="status-item">
              <span class="status-dot status--warning"></span>
              <span class="status-label">{{ t('overview.system.skills') }}</span>
              <span class="status-value">{{ t('overview.system.highRisk') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口区域 -->
    <div class="dashboard-card quick-actions-card">
      <div class="card-header">
        <h3 class="card-title">{{ t('overview.quickActions.title') }}</h3>
      </div>
      <div class="card-content">
        <div class="quick-actions-grid">
          <router-link
            v-for="action in quickActions"
            :key="action.key"
            :to="action.route"
            class="quick-action-btn"
          >
            <span class="action-icon">{{ action.icon }}</span>
            <span class="action-label">{{ action.label }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/assets/styles/variables' as *;

  .overview-dashboard {
    padding: $spacing-xl;
    max-width: 1400px;
    margin: 0 auto;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;

    @include respond-below(md) {
      flex-direction: column;
      gap: $spacing-md;
      align-items: flex-start;
    }
  }

  .dashboard-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0;
  }

  .dashboard-actions {
    display: flex;
    gap: $spacing-md;
    align-items: center;

    @include respond-below(sm) {
      flex-direction: column;
      width: 100%;
    }
  }

  .time-range-select {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    background: $bg-surface;
    color: $text-primary;
    font-size: $font-size-sm;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: $border-focus;
    }
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    background: $bg-surface;
    color: $text-primary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    &:hover {
      background: $bg-secondary;
      border-color: $primary-color;
    }

    &:active {
      transform: scale(0.98);
    }

    .icon {
      font-size: $font-size-base;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .dashboard-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }

  .dashboard-card {
    background: $bg-surface;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-card;
    overflow: hidden;
  }

  .card-header {
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $border-color-light;
    background: $bg-secondary;
  }

  .card-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .card-content {
    padding: $spacing-lg;
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm 0;
    border-bottom: 1px solid $border-color-lighter;

    &:last-child {
      border-bottom: none;
    }
  }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .stat-value {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .token-placeholder,
  .task-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    text-align: center;
  }

  .placeholder-text {
    font-size: $font-size-base;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }

  .placeholder-subtext {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .view-all-link {
    color: $primary-color;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;

    &:hover {
      text-decoration: underline;
    }
  }

  .system-status-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: $border-radius-full;
    flex-shrink: 0;

    &.status--success {
      background: $success;
    }

    &.status--warning {
      background: $warning;
    }

    &.status--error {
      background: $error;
    }
  }

  .status-label {
    flex: 1;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .status-value {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .quick-actions-card {
    margin-bottom: $spacing-xl;
  }

  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: $spacing-md;

    @include respond-below(sm) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .quick-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-lg;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    background: $bg-surface;
    text-decoration: none;
    transition: all $transition-base $ease-out;

    &:hover {
      border-color: $primary-color;
      box-shadow: $shadow-hover;
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: $font-size-2xl;
    }

    .action-label {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-primary;
      text-align: center;
    }
  }
</style>
