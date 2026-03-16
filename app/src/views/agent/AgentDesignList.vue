<template>
  <div class="agent-design-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('agent.designList.title') }}</h1>
        <span class="page-desc">{{ t('agent.designList.description') }}</span>
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
          <span>{{ t('agent.designList.newAgent') }}</span>
        </button>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tags">
      <button class="filter-tag" :class="{ active: !filter.type }" @click="filter.type = ''">
        <span class="tag-label">{{ t('agent.type.all') }}</span>
      </button>
      <button
        v-for="type in agentTypes"
        :key="type.value"
        class="filter-tag"
        :class="{ active: filter.type === type.value }"
        @click="filter.type = type.value"
      >
        <span class="tag-label">{{ type.label }}</span>
      </button>
    </div>

    <div class="filter-tags status-tags">
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

    <!-- 智能体列表标题 + 搜索框 -->
    <div class="section-header">
      <h2 class="section-title">
        {{ t('agent.designList.agentList')
        }}<span class="title-count">({{ agentStore.agents.length }})</span>
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
          v-model="filter.keyword"
          type="text"
          class="search-input"
          :placeholder="t('agent.designList.searchPlaceholder')"
        />
      </div>
    </div>

    <!-- 智能体列表 -->
    <div class="agent-grid">
      <div v-for="agent in filteredAgents" :key="agent.id" class="agent-card">
        <div class="card-header">
          <div class="header-left">
            <div class="agent-avatar">
              {{ agent.identity.avatar || agent.identity.name.charAt(0) }}
            </div>
            <h3 class="agent-name">{{ agent.identity.name }}</h3>
          </div>
          <div class="agent-status" :class="`status--${agent.status}`">
            {{ getStatusText(agent.status) }}
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
        </div>
        <div class="card-actions">
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
          </button>
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
        <p>{{ t('agent.designList.noAgents') }}</p>
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
  import { AgentStatus, AgentType } from '@/types'
  import AgentBasicInfoModal from '@/components/agent/AgentBasicInfoModal.vue'

  const router = useRouter()
  const { t } = useI18n()
  const agentStore = useAgentStore()

  // Modal state
  const showCreateModal = ref(false)

  // 筛选条件 - 默认选中"全部"
  const filter = ref<AgentFilter>({
    type: '',
    status: '',
    keyword: ''
  })

  // 过滤后的智能体列表 - from store
  const filteredAgents = computed(() => {
    let result = [...agentStore.agents]

    if (filter.value.type) {
      result = result.filter((agent) => agent.type === filter.value.type)
    }
    if (filter.value.status) {
      result = result.filter((agent) => agent.status === filter.value.status)
    }
    if (filter.value.keyword) {
      const keyword = filter.value.keyword.toLowerCase()
      result = result.filter(
        (agent) =>
          agent.identity.name.toLowerCase().includes(keyword) ||
          agent.identity.description.toLowerCase().includes(keyword)
      )
    }

    return result
  })

  // 智能体类型选项
  const agentTypes = [
    { value: AgentType.SYSTEM, label: t('agent.types.system') },
    { value: AgentType.CUSTOM, label: t('agent.types.custom') },
    { value: AgentType.TEMPLATE, label: t('agent.types.template') }
  ]

  // 获取状态文本
  function getStatusText(status: AgentStatus): string {
    const statusMap: Record<AgentStatus, string> = {
      [AgentStatus.DRAFT]: t('agent.status.draft'),
      [AgentStatus.ACTIVE]: t('agent.status.active'),
      [AgentStatus.PAUSED]: t('agent.status.paused'),
      [AgentStatus.DEPRECATED]: t('agent.status.deprecated')
    }
    return statusMap[status] || t('agent.status.all')
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

  // 加载智能体列表
  async function loadAgents() {
    await agentStore.fetchAgents()
  }

  // 新建智能体 - 打开弹窗
  function handleCreate() {
    showCreateModal.value = true
  }

  // 创建智能体并跳转到设计页面
  async function handleCreateSubmit(formData: {
    name: string
    code: string
    description: string
    avatar: string
    category: string
    tags: string[]
  }) {
    const newAgent = await agentStore.createAgent({
      name: formData.name,
      code: formData.code,
      description: formData.description,
      avatar: formData.avatar,
      category: formData.category,
      tags: formData.tags
    })
    showCreateModal.value = false
    if (newAgent) {
      // 跳转到设计页面
      router.push(`/app/agent/design/edit/${newAgent.id}`)
    }
  }

  // 编辑智能体 - 直接跳转到设计页面
  function handleEdit(agent: Agent) {
    router.push(`/app/agent/design/edit/${agent.id}`)
  }

  // 复制智能体
  async function handleDuplicate(agent: Agent) {
    await agentStore.duplicateAgent(agent.id)
    await loadAgents()
  }

  // 删除智能体
  async function handleDelete(agent: Agent) {
    if (confirm(t('agent.designList.confirmDelete', { name: agent.identity.name }))) {
      await agentStore.deleteAgent(agent.id)
      await loadAgents()
    }
  }

  onMounted(loadAgents)
</script>

<style scoped lang="scss">
  .agent-design-list {
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

    .header-left {
      flex: 1;

      .page-title {
        display: block;
        font-size: $font-size-3xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin: 0 0 $spacing-xs 0;
        text-align: left;
      }

      .page-desc {
        display: block;
        font-size: $font-size-sm;
        color: $text-tertiary;
        margin: 0;
        text-align: left;
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

  // ================================
  // 筛选标签
  // ================================
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  .status-tags {
    padding-top: $spacing-xs;
    border-top: 1px solid $border-color-lighter;
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
  // 卡片头部 - 头像 + 名称
  // ================================
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

    &.status--draft {
      background: $bg-secondary;
      color: $text-tertiary;
    }

    &.status--active {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    &.status--paused {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    &.status--deprecated {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  // ================================
  // 卡片内容
  // ================================
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

    &.danger:hover {
      border-color: $error;
      color: $error;
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

  // ================================
  // 响应式
  // ================================
  @media (max-width: 1200px) {
    .agent-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .agent-design-list {
      padding: $spacing-md;
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
