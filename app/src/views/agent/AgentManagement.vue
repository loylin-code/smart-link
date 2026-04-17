<template>
  <div class="agent-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('agent.management.title') }}</h1>
        <span class="page-desc">{{ t('agent.management.description') }}</span>
      </div>
      <div class="header-right">
        <button class="create-btn" @click="showCreateModal = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ t('agent.management.newAgent') }}</span>
        </button>
      </div>
    </div>

    <!-- 统计卡片区域 - 按领域统计 -->
    <div class="stats-section">
      <div class="stats-card" @click="filter.domain = ''" :class="{ active: !filter.domain }">
        <div class="stats-icon total">
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
              d="M12 8v8M8 12h8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ agentStore.pagination.total }}</span>
          <span class="stats-label">{{ t('agent.stats.total') }}</span>
        </div>
      </div>
      <div
        class="stats-card"
        @click="filter.domain = AgentDomain.RESOURCE"
        :class="{ active: filter.domain === AgentDomain.RESOURCE }"
      >
        <div class="stats-icon resource">
          <span class="domain-emoji">📊</span>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ agentStore.stats.resource }}</span>
          <span class="stats-label">{{ t('agent.stats.resource') }}</span>
        </div>
      </div>
      <div
        class="stats-card"
        @click="filter.domain = AgentDomain.ASSET"
        :class="{ active: filter.domain === AgentDomain.ASSET }"
      >
        <div class="stats-icon asset">
          <span class="domain-emoji">💰</span>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ agentStore.stats.asset }}</span>
          <span class="stats-label">{{ t('agent.stats.asset') }}</span>
        </div>
      </div>
      <div
        class="stats-card"
        @click="filter.domain = AgentDomain.OPERATION"
        :class="{ active: filter.domain === AgentDomain.OPERATION }"
      >
        <div class="stats-icon operation">
          <span class="domain-emoji">🔧</span>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ agentStore.stats.operation }}</span>
          <span class="stats-label">{{ t('agent.stats.operation') }}</span>
        </div>
      </div>
      <div
        class="stats-card"
        @click="filter.domain = AgentDomain.INFRASTRUCTURE"
        :class="{ active: filter.domain === AgentDomain.INFRASTRUCTURE }"
      >
        <div class="stats-icon infrastructure">
          <span class="domain-emoji">🏗️</span>
        </div>
        <div class="stats-content">
          <span class="stats-value">{{ agentStore.stats.infrastructure }}</span>
          <span class="stats-label">{{ t('agent.stats.infrastructure') }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-tags">
        <button class="filter-tag" :class="{ active: !filter.status }" @click="filter.status = ''">
          <span class="tag-label">{{ t('agent.status.all') }}</span>
        </button>
        <button
          class="filter-tag"
          :class="{ active: filter.status === AgentStatus.DRAFT }"
          @click="filter.status = AgentStatus.DRAFT"
        >
          <span class="tag-label">{{ t('agent.status.draft') }}</span>
        </button>
        <button
          class="filter-tag"
          :class="{ active: filter.status === AgentStatus.ACTIVE }"
          @click="filter.status = AgentStatus.ACTIVE"
        >
          <span class="tag-label">{{ t('agent.status.active') }}</span>
        </button>
        <button
          class="filter-tag"
          :class="{ active: filter.status === AgentStatus.PAUSED }"
          @click="filter.status = AgentStatus.PAUSED"
        >
          <span class="tag-label">{{ t('agent.status.paused') }}</span>
        </button>
      </div>
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
          :placeholder="t('agent.management.searchPlaceholder')"
        />
      </div>
    </div>

    <!-- 智能体卡片网格 -->
    <div class="agent-grid">
      <div v-for="agent in filteredAgents" :key="agent.id" class="agent-card">
        <div class="card-header">
          <div class="header-left">
            <div class="agent-avatar">
              {{ agent.identity.avatar || agent.identity.name.charAt(0) }}
            </div>
            <div class="agent-info">
              <h3 class="agent-name">{{ agent.identity.name }}</h3>
              <span class="agent-code">{{ agent.identity.code }}</span>
            </div>
          </div>
          <div class="header-right">
            <span
              class="agent-domain"
              :style="{
                background: `${getDomainColor(agent.domain)}15`,
                color: getDomainColor(agent.domain)
              }"
            >
              {{ AgentDomainConfig[agent.domain]?.icon }} {{ getDomainLabel(agent.domain) }}
            </span>
            <div class="agent-status" :class="`status--${agent.status}`">
              {{ getStatusText(agent.status) }}
            </div>
          </div>
        </div>
        <div class="card-body">
          <p class="agent-desc">{{ agent.identity.description }}</p>
          <div class="agent-meta">
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
              {{ formatDate(agent.updatedAt) }}
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
              v{{ agent.version }}
            </span>
          </div>
          <!-- 能力标签 -->
          <div class="capability-tags">
            <span v-if="agent.capabilities.mcpServers.length" class="capability-tag mcp"
              >MCP {{ agent.capabilities.mcpServers.length }}</span
            >
            <span v-if="agent.capabilities.skills.length" class="capability-tag skill"
              >Skills {{ agent.capabilities.skills.length }}</span
            >
          </div>
        </div>
        <div class="card-actions">
          <!-- 编辑按钮 -->
          <button
            class="action-btn primary"
            @click="handleEdit(agent)"
            :title="t('agent.card.edit')"
          >
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
            <span>{{ t('agent.card.edit') }}</span>
          </button>
          <!-- 运行按钮 -->
          <button
            v-if="agent.status === AgentStatus.ACTIVE"
            class="action-btn"
            @click="handleRun(agent)"
            :title="t('agent.card.run')"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <polygon points="5,3 19,12 5,21" fill="currentColor" />
            </svg>
            <span>{{ t('agent.card.run') }}</span>
          </button>
          <!-- 激活按钮 -->
          <button
            v-if="agent.status === AgentStatus.DRAFT || agent.status === AgentStatus.PAUSED"
            class="action-btn success"
            @click="handleActivate(agent)"
            :title="t('agent.card.activate')"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
              <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span>{{ t('agent.card.activate') }}</span>
          </button>
          <!-- 暂停按钮 -->
          <button
            v-if="agent.status === AgentStatus.ACTIVE"
            class="action-btn warning"
            @click="handlePause(agent)"
            :title="t('agent.card.pause')"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
              <path
                d="M10 9v6M14 9v6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>{{ t('agent.card.pause') }}</span>
          </button>
          <!-- 复制按钮 -->
          <button class="action-btn" @click="handleDuplicate(agent)" :title="t('agent.card.copy')">
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
          <!-- 删除按钮 -->
          <button
            class="action-btn danger"
            @click="handleDelete(agent)"
            :title="t('agent.card.delete')"
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
      <div v-if="filteredAgents.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <p>{{ t('agent.management.noAgents') }}</p>
      </div>
    </div>

    <!-- Create Agent Modal -->
    <AgentBasicInfoModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @submit="handleCreateSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAgentStore } from '@/store/modules/agent'
  import type { Agent, AgentFilter } from '@/types'
  import { AgentStatus, AgentDomain, AgentDomainConfig } from '@/types'
  import AgentBasicInfoModal from '@/components/agent/AgentBasicInfoModal.vue'

  const router = useRouter()
  const { t } = useI18n()
  const agentStore = useAgentStore()

  const showCreateModal = ref(false)
  const filter = ref<AgentFilter>({ status: '', domain: '', keyword: '' })

  const filteredAgents = computed(() => {
    let result = [...agentStore.agents]
    if (filter.value.status) result = result.filter((a) => a.status === filter.value.status)
    if (filter.value.domain) result = result.filter((a) => a.domain === filter.value.domain)
    if (filter.value.keyword) {
      const kw = filter.value.keyword.toLowerCase()
      result = result.filter(
        (a) =>
          a.identity.name.toLowerCase().includes(kw) ||
          a.identity.description.toLowerCase().includes(kw) ||
          a.identity.code.toLowerCase().includes(kw)
      )
    }
    return result
  })

  function getStatusText(status: AgentStatus): string {
    const map: Record<AgentStatus, string> = {
      [AgentStatus.DRAFT]: t('agent.status.draft'),
      [AgentStatus.ACTIVE]: t('agent.status.active'),
      [AgentStatus.PAUSED]: t('agent.status.paused'),
      [AgentStatus.DEPRECATED]: t('agent.status.deprecated')
    }
    return map[status] || t('agent.status.all')
  }

  function getDomainLabel(domain: AgentDomain): string {
    const map: Record<AgentDomain, string> = {
      [AgentDomain.RESOURCE]: t('agent.domain.resource'),
      [AgentDomain.ASSET]: t('agent.domain.asset'),
      [AgentDomain.OPERATION]: t('agent.domain.operation'),
      [AgentDomain.INFRASTRUCTURE]: t('agent.domain.infrastructure')
    }
    return map[domain] || ''
  }

  function getDomainColor(domain: AgentDomain): string {
    return AgentDomainConfig[domain]?.color || '#3b82f6'
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  async function loadAgents() {
    await agentStore.fetchAgents()
  }

  async function handleCreateSubmit(formData: {
    name: string
    code: string
    description: string
    avatar: string
    category: string
    domain: AgentDomain
    tags: string[]
  }) {
    const newAgent = await agentStore.createAgent({
      name: formData.name,
      code: formData.code,
      description: formData.description,
      avatar: formData.avatar,
      category: formData.category,
      domain: formData.domain,
      tags: formData.tags
    })
    showCreateModal.value = false
    if (newAgent) router.push(`/app/agent/edit/${newAgent.id}`)
  }

  function handleEdit(agent: Agent) {
    router.push(`/app/agent/edit/${agent.id}`)
  }

  function handleRun(agent: Agent) {
    router.push(`/app/agent/runtime/${agent.id}`)
  }

  async function handleActivate(agent: Agent) {
    await agentStore.activateAgent(agent.id)
    await loadAgents()
  }

  async function handlePause(agent: Agent) {
    await agentStore.pauseAgent(agent.id)
    await loadAgents()
  }

  async function handleDuplicate(agent: Agent) {
    await agentStore.duplicateAgent(agent.id)
    await loadAgents()
  }

  async function handleDelete(agent: Agent) {
    if (confirm(t('agent.management.confirmDelete', { name: agent.identity.name }))) {
      await agentStore.deleteAgent(agent.id)
      await loadAgents()
    }
  }

  onMounted(loadAgents)
</script>

<style scoped lang="scss">
  .agent-management {
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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
    .header-left {
      flex: 1;
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
    .header-right {
      flex-shrink: 0;
    }
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

  .stats-section {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
  }
  .stats-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-lighter;
    transition: all 0.2s ease;
    cursor: pointer;
    &:hover {
      border-color: $primary-color;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }
    &.active {
      border-color: $primary-color;
      background: rgba(59, 130, 246, 0.05);
    }
  }
  .stats-icon {
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
      background: rgba(59, 130, 246, 0.1);
      color: $primary-color;
    }
    &.resource {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.asset {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    &.operation {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    &.infrastructure {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
  }
  .domain-emoji {
    font-size: 24px;
  }
  .stats-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }
  .stats-value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }
  .stats-label {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
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
  .search-box {
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

  .agent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $spacing-lg;
  }
  .agent-card {
    position: relative;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-base;
    transition: all 0.2s ease;
    overflow: hidden;
    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
    }
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: $spacing-lg;
    gap: $spacing-md;
    .header-left {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      flex: 1;
      min-width: 0;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      flex-shrink: 0;
    }
  }
  .agent-domain {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-xs;
    padding: 2px 8px;
    border-radius: $border-radius-full;
    white-space: nowrap;
  }
  .agent-avatar {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    color: #fff;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    flex-shrink: 0;
  }
  .agent-info {
    flex: 1;
    min-width: 0;
    .agent-name {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .agent-code {
      font-size: $font-size-xs;
      color: $text-tertiary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .agent-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-xs;
    padding: 2px 8px;
    border-radius: $border-radius-full;
    flex-shrink: 0;
    &.status--draft {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    &.status--active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    &.status--paused {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    &.status--deprecated {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  .card-body {
    padding: 0 $spacing-lg $spacing-lg;
  }
  .agent-desc {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin: 0 0 $spacing-md 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .agent-meta {
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
  .capability-tags {
    display: flex;
    gap: $spacing-xs;
    margin-top: $spacing-sm;
    .capability-tag {
      display: inline-flex;
      padding: 2px 6px;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      &.mcp {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      &.skill {
        background: rgba(59, 130, 246, 0.1);
        color: $primary-color;
      }
    }
  }

  .card-actions {
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-lg;
    background: $bg-secondary;
    border-top: 1px solid $border-color-lighter;
  }
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: $spacing-xs $spacing-sm;
    background: $bg-primary;
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
      padding: $spacing-xs $spacing-md;
      &:hover {
        background: $primary-light;
      }
    }
    &.success:hover {
      border-color: #10b981;
      color: #10b981;
    }
    &.warning:hover {
      border-color: #f59e0b;
      color: #f59e0b;
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
    svg {
      width: 64px;
      height: 64px;
      margin-bottom: $spacing-md;
      color: $text-tertiary;
      opacity: 0.5;
    }
    p {
      margin: 0;
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  @media (max-width: 1200px) {
    .stats-section {
      grid-template-columns: repeat(3, 1fr);
    }
    .agent-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }
  @media (max-width: 768px) {
    .agent-management {
      padding: $spacing-md;
    }
    .stats-section {
      grid-template-columns: repeat(2, 1fr);
    }
    .agent-grid {
      grid-template-columns: 1fr;
    }
    .filter-section {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;
      .search-box {
        width: 100%;
      }
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
  }
</style>
