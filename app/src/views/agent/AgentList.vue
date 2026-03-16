<template>
  <div class="agent-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('agent.list.title') }}</h1>
        <span class="page-desc">{{ t('agent.list.description') }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon agents">
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
          <div class="stat-value">{{ activeAgents.length }}</div>
          <div class="stat-label">{{ t('agent.stats.active') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sessions">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(totalSessions) }}</div>
          <div class="stat-label">{{ t('agent.stats.totalSessions') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon tokens">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatTokens(totalTokens) }}</div>
          <div class="stat-label">{{ t('agent.stats.totalTokens') }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tags">
      <button
        v-for="type in agentTypes"
        :key="type.value"
        class="filter-tag"
        :class="{ active: type.value === 'all' ? !selectedType : selectedType === type.value }"
        @click="selectType(type.value)"
      >
        <span v-if="type.icon" class="tag-icon">{{ type.icon }}</span>
        <span class="tag-label">{{ type.label }}</span>
      </button>
    </div>

    <!-- 智能体列表标题 + 搜索框 -->
    <div class="section-header">
      <h2 class="section-title">
        {{ t('agent.list.activeAgents')
        }}<span class="title-count">({{ activeAgents.length }})</span>
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
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="t('agent.list.searchPlaceholder')"
        />
      </div>
    </div>

    <!-- 智能体卡片网格 -->
    <div v-if="paginatedAgents.length > 0" class="agent-grid">
      <div
        v-for="agent in paginatedAgents"
        :key="agent.id"
        class="agent-card"
        :class="{ disabled: agent.status !== AgentStatus.ACTIVE }"
        @click="handleCardClick(agent)"
      >
        <!-- 卡片头部 - 头像 + 名称信息 -->
        <div class="card-header">
          <div class="agent-avatar" :class="`avatar--${agent.category}`">
            {{ agent.identity.avatar || agent.identity.name.charAt(0) }}
          </div>
          <div class="agent-meta">
            <div class="meta-top">
              <h3 class="agent-name">{{ agent.identity.name }}</h3>
              <span class="agent-status" :class="getStatusClass(agent.status)">
                <span class="status-dot"></span>
                {{ getStatusText(agent.status) }}
              </span>
            </div>
            <p class="agent-desc">
              {{ agent.identity.description || t('agent.list.noDescription') }}
            </p>
          </div>
        </div>

        <!-- 能力标签 -->
        <div class="card-capabilities">
          <span v-if="agent.capabilities.mcpServers.length > 0" class="cap-tag mcp">
            <span class="cap-icon">🔌</span>
            <span>{{ agent.capabilities.mcpServers.length }} MCP</span>
          </span>
          <span v-if="agent.capabilities.skills.length > 0" class="cap-tag skill">
            <span class="cap-icon">🎯</span>
            <span>{{ agent.capabilities.skills.length }} Skills</span>
          </span>
          <span v-if="agent.capabilities.tools.length > 0" class="cap-tag tool">
            <span class="cap-icon">🔧</span>
            <span>{{ agent.capabilities.tools.length }} Tools</span>
          </span>
          <span v-if="hasViews(agent)" class="cap-tag view">
            <span class="cap-icon">🎨</span>
            <span>{{ getViewsCount(agent) }} Views</span>
          </span>
          <span v-if="!hasAnyCapability(agent)" class="cap-tag empty">
            {{ t('agent.list.noCapabilities') }}
          </span>
        </div>

        <!-- 统计数据 -->
        <div class="card-stats">
          <div class="stats-item">
            <span class="stats-value">{{
              formatNumber(getRuntimeStat(agent.id, 'sessionCount'))
            }}</span>
            <span class="stats-label">{{ t('agent.card.sessions') }}</span>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-item">
            <span class="stats-value">{{
              formatTokens(getRuntimeStat(agent.id, 'tokensConsumed'))
            }}</span>
            <span class="stats-label">{{ t('agent.card.tokens') }}</span>
          </div>
          <div class="stats-divider"></div>
          <div class="stats-item">
            <span class="stats-value"
              >{{ getRuntimeStat(agent.id, 'avgLatency') }}<small>ms</small></span
            >
            <span class="stats-label">{{ t('agent.card.latency') }}</span>
          </div>
        </div>

        <!-- 悬浮操作按钮 -->
        <div class="card-actions" @click.stop>
          <button class="action-btn primary" @click="handleRun(agent)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
            </svg>
            <span>{{ t('agent.card.run') }}</span>
          </button>
          <button
            class="action-btn"
            @click="handleToggle(agent)"
            :title="
              agent.status === AgentStatus.ACTIVE ? t('agent.card.pause') : t('agent.card.activate')
            "
          >
            <svg v-if="agent.status === AgentStatus.ACTIVE" viewBox="0 0 24 24" fill="none">
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
            <span>{{
              agent.status === AgentStatus.ACTIVE ? t('agent.card.disable') : t('agent.card.enable')
            }}</span>
          </button>
          <button class="action-btn" @click="handleShare(agent)" :title="t('agent.card.share')">
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
            <span>{{ t('agent.card.share') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon-wrapper">
        <span class="empty-icon">🤖</span>
      </div>
      <h3>{{ t('agent.list.noAgents') }}</h3>
      <p>{{ t('agent.list.noAgentsDesc') }}</p>
      <router-link to="/app/agent/design" class="link-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ t('agent.list.goToDesign') }}
      </router-link>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAgentStore } from '@/store/modules/agent'
  import type { Agent, AgentRuntimeStatus } from '@/types'
  import { AgentStatus, AgentType } from '@/types'

  const { t } = useI18n()
  const router = useRouter()
  const agentStore = useAgentStore()

  // State
  const searchQuery = ref('')
  const selectedType = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(6)

  // 智能体类型列表
  const agentTypes = computed(() => [
    { value: 'all', label: t('agent.types.all'), icon: '' },
    { value: AgentType.SYSTEM, label: t('agent.types.system'), icon: '🤖' },
    { value: AgentType.CUSTOM, label: t('agent.types.custom'), icon: '🎨' },
    { value: AgentType.TEMPLATE, label: t('agent.types.template'), icon: '📋' }
  ])

  // 活跃智能体 - from store
  const activeAgents = computed(() => {
    return agentStore.agents.filter((agent) => agent.status === AgentStatus.ACTIVE)
  })

  // 过滤后的智能体
  const filteredAgents = computed(() => {
    let result = activeAgents.value

    // 类型筛选
    if (selectedType.value) {
      result = result.filter((agent) => agent.type === selectedType.value)
    }

    // 搜索筛选
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (agent) =>
          agent.identity.name.toLowerCase().includes(query) ||
          agent.identity.description.toLowerCase().includes(query)
      )
    }

    return result
  })

  // 总页数
  const totalPages = computed(() => Math.ceil(filteredAgents.value.length / pageSize.value))

  // 当前页显示的智能体
  const paginatedAgents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredAgents.value.slice(start, end)
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

  // 统计数据 - from store
  const totalSessions = computed(() => {
    return agentStore.runtimeAgents.reduce((sum, stat) => sum + stat.sessionCount, 0)
  })

  const totalTokens = computed(() => {
    return agentStore.runtimeAgents.reduce((sum, stat) => sum + stat.tokensConsumed, 0)
  })

  // Methods
  function getStatusClass(status: AgentStatus): string {
    const classes: Record<AgentStatus, string> = {
      [AgentStatus.DRAFT]: 'draft',
      [AgentStatus.ACTIVE]: 'active',
      [AgentStatus.PAUSED]: 'paused',
      [AgentStatus.DEPRECATED]: 'deprecated'
    }
    return classes[status] || 'draft'
  }

  function getStatusText(status: AgentStatus): string {
    const texts: Record<AgentStatus, string> = {
      [AgentStatus.DRAFT]: t('agent.status.draft'),
      [AgentStatus.ACTIVE]: t('agent.status.active'),
      [AgentStatus.PAUSED]: t('agent.status.paused'),
      [AgentStatus.DEPRECATED]: t('agent.status.deprecated')
    }
    return texts[status] || status
  }

  function hasViews(agent: Agent): boolean {
    const views = (agent as Agent & { views?: unknown[] }).views
    return Array.isArray(views) && views.length > 0
  }

  function getViewsCount(agent: Agent): number {
    const views = (agent as Agent & { views?: unknown[] }).views
    return Array.isArray(views) ? views.length : 0
  }

  function hasAnyCapability(agent: Agent): boolean {
    return (
      agent.capabilities.mcpServers.length > 0 ||
      agent.capabilities.skills.length > 0 ||
      agent.capabilities.tools.length > 0 ||
      hasViews(agent)
    )
  }

  function getRuntimeStat(agentId: string, field: keyof AgentRuntimeStatus): number {
    const stat = agentStore.runtimeAgents.find((s) => s.agentId === agentId)
    return stat ? (stat[field] as number) : 0
  }

  function formatNumber(num: number): string {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w'
    }
    return num.toString()
  }

  function formatTokens(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  function selectType(type: string) {
    selectedType.value = type === 'all' ? null : type
    currentPage.value = 1
  }

  function handleCardClick(agent: Agent) {
    if (agent.status === AgentStatus.ACTIVE) {
      handleRun(agent)
    }
  }

  function handleRun(agent: Agent) {
    router.push(`/app/agent/run/${agent.id}`)
  }

  async function handleToggle(agent: Agent) {
    if (agent.status === AgentStatus.ACTIVE) {
      await agentStore.pauseAgent(agent.id)
    } else if (agent.status === AgentStatus.PAUSED) {
      await agentStore.activateAgent(agent.id)
    }
  }

  function handleShare(agent: Agent) {
    // 复制分享链接到剪贴板
    const shareUrl = `${window.location.origin}/app/agent/run/${agent.id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      // 可以添加提示消息
      console.log('Share link copied:', shareUrl)
    })
  }

  async function loadData() {
    await Promise.all([agentStore.fetchAgents(), agentStore.fetchRuntimeStatus()])
  }

  // 监听筛选条件变化，重置页码
  watch([searchQuery, selectedType], () => {
    currentPage.value = 1
  })

  onMounted(loadData)
</script>

<style scoped lang="scss">
  .agent-list {
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
  // 统计卡片
  // ================================
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

    &.agents {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.15) 0%,
        rgba(139, 92, 246, 0.15) 100%
      );
      color: $primary-color;
    }

    &.sessions {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.15) 0%,
        rgba(59, 130, 246, 0.15) 100%
      );
      color: #10b981;
    }

    &.tokens {
      background: linear-gradient(
        135deg,
        rgba(245, 158, 11, 0.15) 0%,
        rgba(239, 68, 68, 0.15) 100%
      );
      color: #f59e0b;
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
    margin-bottom: $spacing-lg;
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

  .section-header .search-icon {
    position: absolute;
    left: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    pointer-events: none;
  }

  .section-header .search-input {
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
  // 智能体卡片网格
  // ================================
  .agent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .agent-card {
    position: relative;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-base;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;

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

  // ================================
  // 卡片头部 - 头像 + 名称
  // ================================
  .card-header {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    padding: $spacing-lg;
  }

  .agent-avatar {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    flex-shrink: 0;

    &.avatar--conversational {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    }

    &.avatar--workflow {
      background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    }

    &.avatar--automation {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    }
  }

  .agent-meta {
    flex: 1;
    min-width: 0;
  }

  .meta-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
    margin-bottom: $spacing-xs;
  }

  .agent-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .agent-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-xs;
    padding: 2px 8px;
    border-radius: $border-radius-full;
    flex-shrink: 0;

    .status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }

    &.active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;

      .status-dot {
        background: #10b981;
      }
    }

    &.draft {
      background: $bg-secondary;
      color: $text-tertiary;

      .status-dot {
        background: $text-tertiary;
      }
    }

    &.paused {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;

      .status-dot {
        background: #f59e0b;
      }
    }

    &.deprecated {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;

      .status-dot {
        background: #ef4444;
      }
    }
  }

  .agent-desc {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  // ================================
  // 能力标签
  // ================================
  .card-capabilities {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
    padding: 0 $spacing-lg $spacing-md;
  }

  .cap-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    .cap-icon {
      font-size: 11px;
    }

    &.mcp {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    &.skill {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    &.tool {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    &.view {
      background: rgba(168, 85, 247, 0.1);
      color: #a855f7;
    }

    &.empty {
      background: $bg-secondary;
      color: $text-tertiary;
    }
  }

  // ================================
  // 统计数据
  // ================================
  .card-stats {
    display: flex;
    align-items: center;
    padding: $spacing-md $spacing-lg;
    background: linear-gradient(180deg, $bg-secondary 0%, rgba($bg-tertiary, 0.6) 100%);
    border-top: 1px solid $border-color-lighter;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
    margin-top: auto;
  }

  .stats-item {
    flex: 1;
    text-align: center;
    padding: $spacing-sm $spacing-xs;
    margin: 0 $spacing-xs;
    background: rgba($bg-primary, 0.7);
    border-radius: $border-radius-md;
    border: 1px solid $border-color-lighter;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($bg-primary, 0.9);
      box-shadow: $shadow-sm;
    }
  }

  .stats-divider {
    width: 1px;
    height: 24px;
    background: linear-gradient(180deg, transparent 0%, $border-color-base 50%, transparent 100%);
    opacity: 0.6;
  }

  .stats-value {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;

    small {
      font-size: $font-size-xs;
      font-weight: $font-weight-normal;
      color: $text-tertiary;
      margin-left: 2px;
    }
  }

  .stats-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: 2px;
    display: block;
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
      background: $primary-color;
      border-color: transparent;
      color: #fff;

      &:hover {
        background: $primary-light;
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
    border-radius: $border-radius-lg;
    color: #fff;
    text-decoration: none;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
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
  // 分页
  // ================================
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-xs;
    margin-top: $spacing-xl;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

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

    .agent-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .agent-list {
      padding: $spacing-md;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .agent-grid {
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
</style>
