<template>
  <div class="agent-runner">
    <ParticleBackground :particle-count="60" :connection-distance="100" />
    <header class="runner-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('agent.runtime.backToList') }}</span>
        </button>
      </div>
      <div class="header-center">
        <h1 class="agent-name">{{ agent?.identity.name }}</h1>
        <span v-if="activeFunction" class="function-badge">{{ activeFunction.label }}</span>
      </div>
      <div class="header-right">
        <div class="runtime-status">
          <span class="status-dot status--running"></span>
          <span class="status-text">{{ t('agent.runtime.running') }}</span>
        </div>
        <button class="share-btn" @click="shareAgent">
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
    </header>

    <main
      class="runner-content"
      :class="{ 'has-function': !!activeFunction, 'chat-collapsed': chatCollapsed }"
    >
      <aside class="chat-panel" :class="{ collapsed: chatCollapsed }">
        <div v-show="!chatCollapsed" class="chat-inner">
          <!-- 聊天面板标题 -->
          <div class="panel-header">
            <div class="panel-title">
              <svg viewBox="0 0 24 24" fill="none" class="panel-icon">
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>AI 对话</span>
            </div>
            <button class="collapse-btn-inline" @click="chatCollapsed = true" title="收起侧边栏">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 19L5 12L11 5M19 19L13 12L19 5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <div ref="messagesRef" class="chat-messages">
            <div v-if="messages.length === 0" class="welcome-area">
              <div class="welcome-header">
                <div class="welcome-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                    <path
                      d="M8 14s1.5 2 4 2 4-2 4-2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <line
                      x1="9"
                      y1="9"
                      x2="9.01"
                      y2="9"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                    <line
                      x1="15"
                      y1="9"
                      x2="15.01"
                      y2="9"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
                <h2 class="welcome-title">你好，我是资源规划助手</h2>
                <p class="welcome-subtitle">
                  我可以帮您进行数据中心资源容量规划，请选择一个功能开始
                </p>
              </div>
              <div class="function-cards">
                <button
                  v-for="fn in functions"
                  :key="fn.id"
                  class="function-card"
                  @click="selectFunction(fn)"
                >
                  <div class="card-icon" :class="fn.id">
                    <svg v-if="fn.id === 'demand'" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <svg v-else-if="fn.id === 'capacity'" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <svg v-else-if="fn.id === 'replenish'" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <svg v-else-if="fn.id === 'recycle'" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div class="card-content">
                    <span class="card-title">{{ fn.label }}</span>
                    <span class="card-desc">{{ fn.description }}</span>
                  </div>
                  <svg class="card-arrow" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <template v-else>
              <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
                <div class="message-avatar">
                  <span v-if="msg.role === 'user'">我</span>
                  <svg v-else viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                    <path
                      d="M8 14s1.5 2 4 2 4-2 4-2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <line
                      x1="9"
                      y1="9"
                      x2="9.01"
                      y2="9"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                    <line
                      x1="15"
                      y1="9"
                      x2="15.01"
                      y2="9"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
                <div class="message-content">
                  <div class="message-text">{{ msg.content }}</div>
                  <div v-if="msg.status === 'pending'" class="message-status">
                    <span class="loading-dot"></span><span class="loading-dot"></span
                    ><span class="loading-dot"></span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div v-if="activeFunction && messages.length > 0" class="function-switcher">
            <div class="switcher-chips">
              <button
                v-for="fn in visibleFunctions"
                :key="fn.id"
                class="switcher-chip"
                :class="{ active: activeFunction?.id === fn.id }"
                @click="selectFunction(fn)"
              >
                {{ fn.label }}
              </button>
              <button
                v-if="functions.length > maxVisibleFunctions"
                class="switcher-chip more-btn"
                @click="showMoreFunctions = !showMoreFunctions"
              >
                更多<svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div v-if="showMoreFunctions" class="more-functions">
              <button
                v-for="fn in hiddenFunctions"
                :key="fn.id"
                class="more-item"
                :class="{ active: activeFunction?.id === fn.id }"
                @click="handleMoreFunctionClick(fn)"
              >
                {{ fn.label }}
              </button>
            </div>
          </div>

          <div class="chat-input">
            <textarea
              v-model="inputText"
              placeholder="请输入您的问题或指令..."
              @keydown.enter.prevent="sendMessage"
            />
            <button class="send-btn" :disabled="!inputText.trim()" @click="sendMessage">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="chatCollapsed && activeFunction" class="collapsed-functions">
          <div class="collapsed-header">
            <svg viewBox="0 0 24 24" fill="none" class="collapsed-icon">
              <path
                d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <button
            v-for="fn in visibleFunctions"
            :key="fn.id"
            class="collapsed-chip"
            :class="{ active: activeFunction?.id === fn.id }"
            :title="fn.label"
            @click="selectFunction(fn)"
          >
            {{ fn.label.slice(0, 2) }}
          </button>
          <button
            v-if="hiddenFunctions.length > 0"
            class="collapsed-chip more"
            title="更多功能"
            @click="chatCollapsed = false"
          >
            ...
          </button>
          <button class="collapsed-chip expand" title="展开侧边栏" @click="chatCollapsed = false">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M13 5L19 12L13 19M5 5L11 12L5 19"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </aside>

      <section v-if="activeFunction" class="workspace">
        <!-- 中间区域标题 -->
        <div class="panel-header">
          <div class="panel-title">
            <svg viewBox="0 0 24 24" fill="none" class="panel-icon">
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                stroke-width="2"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                stroke-width="2"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                stroke-width="2"
              />
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
            <span>{{ activeFunction.label }}列表</span>
          </div>
        </div>

        <div class="workspace-header">
          <div class="filter-actions">
            <select v-model="statusFilter" class="filter-select">
              <option value="">全部状态</option>
              <option value="pending">待审批</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
              <option value="processing">处理中</option>
            </select>
            <select v-model="typeFilter" class="filter-select">
              <option value="">全部类型</option>
              <option value="cpu">CPU</option>
              <option value="memory">内存</option>
              <option value="storage">存储</option>
              <option value="network">网络</option>
            </select>
          </div>
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" class="search-icon">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索任务..."
              class="search-input"
            />
          </div>
        </div>
        <div class="task-table">
          <table>
            <thead>
              <tr>
                <th>任务ID</th>
                <th>资源类型</th>
                <th>需求类型</th>
                <th>数量</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in filteredTasks" :key="task.id">
                <td class="task-id">{{ task.id }}</td>
                <td>
                  <span class="resource-tag" :class="task.resourceType">{{
                    getResourceTypeLabel(task.resourceType)
                  }}</span>
                </td>
                <td>{{ getDemandTypeLabel(task.demandType) }}</td>
                <td>{{ task.quantity }} {{ task.unit }}</td>
                <td>
                  <span class="status-tag" :class="task.status">{{
                    getStatusLabel(task.status)
                  }}</span>
                </td>
                <td>{{ formatDate(task.createdAt) }}</td>
                <td>
                  <button class="action-btn" @click="viewTask(task)">查看</button
                  ><button class="action-btn primary" @click="approveTask(task)">审批</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <span class="total-info">共 {{ totalTasks }} 条</span>
        </div>
      </section>

      <aside v-if="activeFunction" class="todo-panel">
        <!-- 待办任务标题 -->
        <div class="panel-header">
          <div class="panel-title">
            <svg viewBox="0 0 24 24" fill="none" class="panel-icon">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>待办任务</span>
          </div>
        </div>

        <div class="todo-tabs">
          <button
            v-for="tab in todoTabs"
            :key="tab.key"
            class="todo-tab"
            :class="{ active: activeTodoTab === tab.key }"
            @click="activeTodoTab = tab.key"
          >
            {{ tab.label }}<span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <div class="todo-list">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="todo-item"
            @click="handleTodoClick(todo)"
          >
            <div class="todo-checkbox">
              <input type="checkbox" :checked="todo.status === 'done'" readonly />
            </div>
            <div class="todo-content">
              <div class="todo-title">{{ todo.title }}</div>
              <div class="todo-meta">
                <span class="todo-id">{{ todo.id }}</span
                ><span class="todo-date">{{ formatDate(todo.createdAt) }}</span>
              </div>
            </div>
            <div class="todo-priority" :class="todo.priority"></div>
          </div>
        </div>
      </aside>
    </main>

    <footer class="runner-footer">
      <div class="stat-item">
        <div class="stat-icon">
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
          <span class="stat-value">{{ stats.sessions }}</span
          ><span class="stat-label">{{ t('agent.runtime.sessions') }}</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ formatTokens(stats.tokens) }}</span
          ><span class="stat-label">{{ t('agent.runtime.tokens') }}</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon latency">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.latency }}s</span
          ><span class="stat-label">{{ t('agent.runtime.latency') }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import ParticleBackground from '@/components/common/ParticleBackground.vue'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  interface AgentFunction {
    id: string
    label: string
    description: string
    prompt: string
  }
  interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    status?: 'pending' | 'success'
  }
  interface Task {
    id: string
    resourceType: 'cpu' | 'memory' | 'storage' | 'network'
    demandType: 'expand' | 'new' | 'optimize'
    quantity: number
    unit: string
    status: 'pending' | 'approved' | 'rejected' | 'processing'
    createdAt: Date
  }
  interface Todo {
    id: string
    title: string
    status: 'pending' | 'done'
    priority: 'high' | 'medium' | 'low'
    createdAt: Date
  }

  const agent = ref({ id: 'agent-001', identity: { name: '数据中心资源容量规划' } })
  const functions = ref<AgentFunction[]>([
    {
      id: 'demand',
      label: '需求申报推荐',
      description: '分析资源需求，生成申报建议',
      prompt: '请帮我分析当前资源需求并生成申报推荐'
    },
    {
      id: 'capacity',
      label: '资源容量操盘',
      description: '查看资源使用趋势与容量分析',
      prompt: '请帮我分析当前资源容量使用情况'
    },
    {
      id: 'replenish',
      label: '补货计划推荐',
      description: '生成资源补货计划建议',
      prompt: '请帮我生成补货计划推荐'
    },
    {
      id: 'recycle',
      label: '闲置利旧发现',
      description: '发现可利旧的闲置资源',
      prompt: '请帮我发现可利旧的闲置资源'
    }
  ])
  const activeFunction = ref<AgentFunction | null>(null)
  const messagesRef = ref<HTMLElement | null>(null)
  const inputText = ref('')
  const messages = ref<ChatMessage[]>([])
  const chatCollapsed = ref(false)
  const showMoreFunctions = ref(false)
  const maxVisibleFunctions = 2
  const searchKeyword = ref('')
  const statusFilter = ref('')
  const typeFilter = ref('')
  const currentPage = ref(1)
  const pageSize = 10

  const tasks = ref<Task[]>([
    {
      id: 'T-001',
      resourceType: 'cpu',
      demandType: 'expand',
      quantity: 32,
      unit: '核',
      status: 'pending',
      createdAt: new Date('2024-03-16')
    },
    {
      id: 'T-002',
      resourceType: 'memory',
      demandType: 'new',
      quantity: 128,
      unit: 'GB',
      status: 'approved',
      createdAt: new Date('2024-03-15')
    },
    {
      id: 'T-003',
      resourceType: 'storage',
      demandType: 'expand',
      quantity: 2,
      unit: 'TB',
      status: 'processing',
      createdAt: new Date('2024-03-14')
    },
    {
      id: 'T-004',
      resourceType: 'network',
      demandType: 'optimize',
      quantity: 10,
      unit: 'Gbps',
      status: 'pending',
      createdAt: new Date('2024-03-13')
    },
    {
      id: 'T-005',
      resourceType: 'cpu',
      demandType: 'new',
      quantity: 64,
      unit: '核',
      status: 'rejected',
      createdAt: new Date('2024-03-12')
    },
    {
      id: 'T-006',
      resourceType: 'memory',
      demandType: 'expand',
      quantity: 256,
      unit: 'GB',
      status: 'pending',
      createdAt: new Date('2024-03-11')
    },
    {
      id: 'T-007',
      resourceType: 'storage',
      demandType: 'new',
      quantity: 5,
      unit: 'TB',
      status: 'approved',
      createdAt: new Date('2024-03-10')
    },
    {
      id: 'T-008',
      resourceType: 'network',
      demandType: 'expand',
      quantity: 20,
      unit: 'Gbps',
      status: 'processing',
      createdAt: new Date('2024-03-09')
    },
    {
      id: 'T-009',
      resourceType: 'cpu',
      demandType: 'optimize',
      quantity: 16,
      unit: '核',
      status: 'pending',
      createdAt: new Date('2024-03-08')
    },
    {
      id: 'T-010',
      resourceType: 'memory',
      demandType: 'new',
      quantity: 512,
      unit: 'GB',
      status: 'approved',
      createdAt: new Date('2024-03-07')
    },
    {
      id: 'T-011',
      resourceType: 'storage',
      demandType: 'expand',
      quantity: 10,
      unit: 'TB',
      status: 'pending',
      createdAt: new Date('2024-03-06')
    },
    {
      id: 'T-012',
      resourceType: 'network',
      demandType: 'new',
      quantity: 40,
      unit: 'Gbps',
      status: 'pending',
      createdAt: new Date('2024-03-05')
    }
  ])

  const activeTodoTab = ref('pending')
  const todos = ref<Todo[]>([
    {
      id: 'RQ-2024-001',
      title: 'CPU扩容申请',
      status: 'pending',
      priority: 'high',
      createdAt: new Date('2024-03-16')
    },
    {
      id: 'RQ-2024-002',
      title: '存储扩容申请',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date('2024-03-15')
    },
    {
      id: 'RQ-2024-003',
      title: '网络优化申请',
      status: 'pending',
      priority: 'low',
      createdAt: new Date('2024-03-14')
    },
    {
      id: 'RQ-2024-004',
      title: '内存扩容申请',
      status: 'done',
      priority: 'high',
      createdAt: new Date('2024-03-13')
    },
    {
      id: 'RQ-2024-005',
      title: '存储扩容申请',
      status: 'done',
      priority: 'medium',
      createdAt: new Date('2024-03-12')
    }
  ])
  const stats = ref({ sessions: 128, tokens: 45200, latency: 1.2 })

  const visibleFunctions = computed(() => functions.value.slice(0, maxVisibleFunctions))
  const hiddenFunctions = computed(() => functions.value.slice(maxVisibleFunctions))
  const filteredTasks = computed(() => {
    let result = tasks.value
    if (searchKeyword.value)
      result = result.filter((t) => t.id.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    if (statusFilter.value) result = result.filter((t) => t.status === statusFilter.value)
    if (typeFilter.value) result = result.filter((t) => t.resourceType === typeFilter.value)
    return result
  })
  const totalTasks = computed(() => filteredTasks.value.length)
  const totalPages = computed(() => Math.ceil(totalTasks.value / pageSize))
  const filteredTodos = computed(() => todos.value.filter((t) => t.status === activeTodoTab.value))
  const todoTabs = computed(() => [
    {
      key: 'pending',
      label: '待处理',
      count: todos.value.filter((t) => t.status === 'pending').length
    },
    { key: 'done', label: '已处理', count: todos.value.filter((t) => t.status === 'done').length }
  ])

  function selectFunction(fn: AgentFunction) {
    if (activeFunction.value?.id === fn.id) return
    activeFunction.value = fn
    chatCollapsed.value = false
    showMoreFunctions.value = false

    // 发送用户消息到聊天框
    messages.value.push({ id: `msg-${Date.now()}`, role: 'user', content: fn.prompt })

    // AI响应
    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      status: 'pending'
    }
    messages.value.push(aiMsg)
    setTimeout(() => {
      aiMsg.content = `好的，我已为您生成${fn.label}列表，请在右侧区域查看详情。`
      aiMsg.status = 'success'
      scrollToBottom()
    }, 1500)
    scrollToBottom()
  }

  function handleMoreFunctionClick(fn: AgentFunction) {
    showMoreFunctions.value = false
    selectFunction(fn)
  }

  function sendChatMessage(content: string) {
    messages.value.push({ id: `msg-${Date.now()}`, role: 'user', content })
    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      status: 'pending'
    }
    messages.value.push(aiMsg)
    setTimeout(() => {
      aiMsg.content = '好的，正在为您处理...'
      aiMsg.status = 'success'
      scrollToBottom()
    }, 800)
    scrollToBottom()
  }

  function sendMessage() {
    if (!inputText.value.trim()) return
    sendChatMessage(inputText.value.trim())
    inputText.value = ''
  }

  function scrollToBottom() {
    nextTick(() => {
      if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    })
  }
  function goBack() {
    router.push('/app/agent/list')
  }
  function shareAgent() {
    console.log('Share agent')
  }
  function getResourceTypeLabel(type: string) {
    const l: Record<string, string> = {
      cpu: 'CPU',
      memory: '内存',
      storage: '存储',
      network: '网络'
    }
    return l[type] || type
  }
  function getDemandTypeLabel(type: string) {
    const l: Record<string, string> = { expand: '扩容', new: '新增', optimize: '优化' }
    return l[type] || type
  }
  function getStatusLabel(status: string) {
    const l: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝',
      processing: '处理中'
    }
    return l[status] || status
  }
  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  }
  function formatTokens(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }
  function viewTask(task: Task) {
    sendChatMessage(`请帮我查看任务 ${task.id} 的详细信息`)
  }
  function approveTask(task: Task) {
    sendChatMessage(
      `请帮我审批任务 ${task.id}（${getResourceTypeLabel(task.resourceType)} ${task.quantity}${task.unit}）`
    )
  }
  function handleTodoClick(todo: Todo) {
    sendChatMessage(`请帮我处理待办事项：${todo.title}`)
  }
</script>

<style scoped lang="scss">
  @import './AgentRunner.scss';
</style>
