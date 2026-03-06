<template>
  <div class="mcp-detail-page">
    <!-- 顶部导航栏 -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ t('mcp.backToList') }}</span>
      </button>
      <div class="server-title">
        <span class="status-indicator" :class="`status-indicator--${server.status}`">●</span>
        <h1 class="page-title">{{ server.name }}</h1>
      </div>
      <button class="save-btn" @click="saveChanges">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        <span>{{ t('common.save') }}</span>
      </button>
    </div>

    <div class="detail-content">
      <!-- 左侧：详细信息 -->
      <div class="detail-left">
        <!-- 基本信息 -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('mcp.basicInfo') }}</h2>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">{{ t('mcp.serverName') }}</span>
              <span class="info-value">{{ server.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('mcp.uniqueId') }}</span>
              <span class="info-value code">{{ server.uniqueId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('mcp.version') }}</span>
              <span class="info-value">v{{ server.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('mcp.description') }}</span>
              <span class="info-value">{{ server.description }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('mcp.author') }}</span>
              <span class="info-value">{{ server.author }}</span>
            </div>
            <div v-if="server.homepage" class="info-item">
              <span class="info-label">{{ t('mcp.documentation') }}</span>
              <a :href="server.homepage" target="_blank" class="info-link">
                {{ t('mcp.viewDocs') }}
              </a>
            </div>
          </div>
          <div class="section-actions">
            <button class="action-btn secondary">{{ t('mcp.edit') }}</button>
            <button class="action-btn secondary">{{ t('mcp.viewDocs') }}</button>
            <button class="action-btn secondary">{{ t('mcp.reportIssue') }}</button>
          </div>
        </section>

        <!-- 连接配置 -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('mcp.connectionConfig') }}</h2>
          <div class="config-form">
            <div class="form-group">
              <label class="form-label">{{ t('mcp.transportType') }}</label>
              <div class="transport-options">
                <label class="transport-option" :class="{ active: server.transport === 'stdio' }">
                  <input v-model="server.transport" type="radio" value="stdio" />
                  <span>{{ t('mcp.localStdio') }}</span>
                </label>
                <label class="transport-option" :class="{ active: server.transport === 'http' }">
                  <input v-model="server.transport" type="radio" value="http" />
                  <span>{{ t('mcp.remoteHttp') }}</span>
                </label>
              </div>
            </div>

            <template v-if="server.transport === 'stdio'">
              <div class="form-group">
                <label class="form-label">{{ t('mcp.command') }}</label>
                <input v-model="server.config.command" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('mcp.args') }}</label>
                <textarea v-model="argsText" class="form-textarea" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('mcp.workingDir') }}</label>
                <input v-model="server.config.workingDir" type="text" class="form-input" />
              </div>
            </template>

            <template v-else>
              <div class="form-group">
                <label class="form-label">{{ t('mcp.endpoint') }}</label>
                <input v-model="server.config.endpoint" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('mcp.timeout') }} (ms)</label>
                <input v-model.number="server.config.timeout" type="number" class="form-input" />
              </div>
            </template>

            <div class="form-group">
              <label class="form-label">{{ t('mcp.envVars') }}</label>
              <div class="env-vars-list">
                <div v-for="(value, key) in server.config.env" :key="key" class="env-var-item">
                  <input :value="key" type="text" class="env-key" placeholder="Key" readonly />
                  <input
                    :value="value"
                    type="text"
                    class="env-value"
                    placeholder="Value"
                    readonly
                  />
                  <button class="env-delete" @click="removeEnvVar(key)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <button class="add-env-btn" @click="showAddEnvDialog = true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {{ t('mcp.addEnvVar') }}
              </button>
            </div>
          </div>
          <div class="section-actions">
            <button class="action-btn primary" @click="testConnection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {{ t('mcp.testConnection') }}
            </button>
            <button class="action-btn secondary">{{ t('mcp.restoreDefault') }}</button>
          </div>
        </section>

        <!-- 能力详情 -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('mcp.capabilities') }}</h2>

          <!-- Tools -->
          <div class="capability-group">
            <button class="capability-header" @click="toggleSection('tools')">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="toggle-icon"
                :class="{ expanded: expandedSections.tools }"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span class="capability-icon">🔧</span>
              <span class="capability-title"
                >{{ t('mcp.tools') }} ({{ server.capabilities.tools }})</span
              >
            </button>
            <div v-show="expandedSections.tools" class="capability-list">
              <div v-for="tool in server.tools" :key="tool.name" class="capability-item">
                <div class="capability-item-header">
                  <span class="capability-name">{{ tool.name }}</span>
                  <div class="capability-actions">
                    <button class="capability-action">{{ t('mcp.viewSchema') }}</button>
                    <button class="capability-action">{{ t('mcp.testTool') }}</button>
                  </div>
                </div>
                <p class="capability-desc">{{ tool.description }}</p>
                <div class="capability-params">
                  <span class="params-label">{{ t('mcp.input') }}:</span>
                  <span class="params-value">{{ formatSchema(tool.inputSchema) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Resources -->
          <div class="capability-group">
            <button class="capability-header" @click="toggleSection('resources')">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="toggle-icon"
                :class="{ expanded: expandedSections.resources }"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span class="capability-icon">📁</span>
              <span class="capability-title"
                >{{ t('mcp.resources') }} ({{ server.capabilities.resources }})</span
              >
            </button>
            <div v-show="expandedSections.resources" class="capability-list">
              <div v-for="resource in server.resources" :key="resource.uri" class="capability-item">
                <div class="capability-item-header">
                  <span class="capability-name">{{ resource.name }}</span>
                </div>
                <p class="capability-desc">{{ resource.description || resource.uri }}</p>
                <div v-if="resource.mimeType" class="capability-meta">
                  <span class="meta-label">MIME:</span>
                  <span class="meta-value">{{ resource.mimeType }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Prompts -->
          <div v-if="server.capabilities.prompts > 0" class="capability-group">
            <button class="capability-header" @click="toggleSection('prompts')">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="toggle-icon"
                :class="{ expanded: expandedSections.prompts }"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span class="capability-icon">💬</span>
              <span class="capability-title"
                >{{ t('mcp.prompts') }} ({{ server.capabilities.prompts }})</span
              >
            </button>
            <div v-show="expandedSections.prompts" class="capability-list">
              <div v-for="prompt in server.prompts" :key="prompt.name" class="capability-item">
                <div class="capability-item-header">
                  <span class="capability-name">{{ prompt.name }}</span>
                </div>
                <p class="capability-desc">{{ prompt.description }}</p>
                <div v-if="prompt.arguments?.length" class="capability-params">
                  <span class="params-label">{{ t('mcp.params') }}:</span>
                  <span class="params-value">{{
                    prompt.arguments
                      .map((a) => `${a.name}${a.required ? '(required)' : ''}`)
                      .join(', ')
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 使用统计 -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('mcp.usageStats') }} ({{ t('mcp.last30Days') }})</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">{{ formatNumber(12450) }}</span>
              <span class="stat-label">{{ t('mcp.totalCalls') }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">99.2%</span>
              <span class="stat-label">{{ t('mcp.successRate') }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">15ms</span>
              <span class="stat-label">{{ t('mcp.avgLatency') }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ formatNumber(1200000) }}</span>
              <span class="stat-label">{{ t('mcp.tokenInput') }}</span>
            </div>
          </div>
          <button class="action-btn secondary full-width">{{ t('mcp.viewDetailedStats') }}</button>
        </section>
      </div>

      <!-- 右侧：连接监控 -->
      <div class="detail-right">
        <div class="monitoring-card">
          <h3 class="monitoring-title">📱 {{ t('mcp.connectionMonitor') }}</h3>

          <div class="monitor-status">
            <span class="monitor-label">{{ t('mcp.statusLabel') }}</span>
            <div class="status-display" :class="`status-display--${server.status}`">
              <span class="status-dot">●</span>
              <span class="status-text">{{ t(`mcp.status.${server.status}`) }}</span>
            </div>
          </div>

          <div class="monitor-metrics">
            <div class="metric-item">
              <span class="metric-label">{{ t('mcp.latency') }}</span>
              <span
                class="metric-value"
                :class="{ 'text-error': (server.responseTime || 0) > 1000 }"
              >
                {{ server.responseTime ? `${server.responseTime}ms` : '-' }}
              </span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ t('mcp.uptime') }}</span>
              <span class="metric-value">{{ formatUptime(server) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">{{ t('mcp.errorRate') }}</span>
              <span class="metric-value">{{ formatErrorRate(server) }}</span>
            </div>
          </div>
        </div>

        <div class="monitoring-card">
          <h3 class="monitoring-title">📝 {{ t('mcp.activityLog') }}</h3>
          <div class="activity-list">
            <div v-for="(activity, index) in mockActivities" :key="index" class="activity-item">
              <span class="activity-time">{{ activity.time }}</span>
              <span
                class="activity-status"
                :class="{ success: activity.success, error: !activity.success }"
              >
                {{ activity.success ? '✅' : '❌' }}
              </span>
              <span class="activity-name">{{ activity.name }}</span>
              <span v-if="activity.error" class="activity-error">{{ activity.error }}</span>
            </div>
          </div>
          <div class="monitoring-actions">
            <button class="action-btn secondary" @click="stopConnection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              {{ t('mcp.stop') }}
            </button>
            <button class="action-btn primary" @click="restartConnection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {{ t('mcp.restart') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加环境变量弹窗 -->
    <div v-if="showAddEnvDialog" class="dialog-overlay" @click="showAddEnvDialog = false">
      <div class="dialog" @click.stop>
        <h3 class="dialog-title">{{ t('mcp.addEnvVar') }}</h3>
        <div class="dialog-body">
          <div class="form-group">
            <label class="form-label">Key</label>
            <input v-model="newEnvKey" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Value</label>
            <input v-model="newEnvValue" type="text" class="form-input" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-btn secondary" @click="showAddEnvDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button class="action-btn primary" @click="addEnvVar">{{ t('common.confirm') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useMCPStore } from '@/store/modules/mcp'
  import type { MCPServer } from '@/types'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const mcpStore = useMCPStore()

  const serverId = route.params.id as string
  const server = computed<MCPServer>(() => {
    const found = mcpStore.getServerById(serverId)
    return found || mcpStore.servers[0]
  })

  // 展开/折叠状态
  const expandedSections = reactive({
    tools: true,
    resources: false,
    prompts: false
  })

  const toggleSection = (section: 'tools' | 'resources' | 'prompts') => {
    expandedSections[section] = !expandedSections[section]
  }

  // args 格式化
  const argsText = computed({
    get() {
      return server.value.config.args?.join('\n') || ''
    },
    set(value: string) {
      server.value.config.args = value.split('\n').filter(Boolean)
    }
  })

  // 环境变量弹窗
  const showAddEnvDialog = ref(false)
  const newEnvKey = ref('')
  const newEnvValue = ref('')

  const addEnvVar = () => {
    if (newEnvKey.value && newEnvValue.value) {
      if (!server.value.config.env) {
        server.value.config.env = {}
      }
      server.value.config.env[newEnvKey.value] = newEnvValue.value
      newEnvKey.value = ''
      newEnvValue.value = ''
      showAddEnvDialog.value = false
    }
  }

  const removeEnvVar = (key: string) => {
    if (server.value.config.env) {
      delete server.value.config.env[key]
    }
  }

  // Mock activity log
  const mockActivities = [
    { time: '10:30:25', name: 'read_file', success: true },
    { time: '10:28:12', name: 'list_directory', success: true },
    { time: '10:25:00', name: 'write_file', success: false, error: 'Permission denied' },
    { time: '10:20:15', name: 'read_file', success: true },
    { time: '10:15:30', name: 'list_directory', success: true }
  ]

  // Actions
  const goBack = () => {
    router.push('/app/tool/mcp')
  }

  const saveChanges = () => {
    mcpStore.updateServer(serverId, server.value)
  }

  const testConnection = async () => {
    await mcpStore.testConnection(serverId)
  }

  const stopConnection = () => {
    mcpStore.updateServer(serverId, { status: 'disconnected' })
  }

  const restartConnection = async () => {
    await mcpStore.refreshServerStatus(serverId)
  }

  // Helpers
  const formatSchema = (schema: Record<string, any>): string => {
    if (!schema || !schema.properties) return ''
    const props = Object.entries(schema.properties).map(([key, val]: [string, any]) => {
      const required = schema.required?.includes(key) ? '(required)' : ''
      return `${key} (${val.type})${required}`
    })
    return props.join(', ')
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatUptime = (server: MCPServer): string => {
    if (!server.lastActive) return '-'
    const diff = Date.now() - server.lastActive
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return '< 1h'
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }

  const formatErrorRate = (server: MCPServer): string => {
    const errorCount = server.errorCount || 0
    if (errorCount === 0) return '0%'
    return `${(errorCount / 100).toFixed(2)}%`
  }
</script>

<style scoped lang="scss">
  .mcp-detail-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-primary;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg $spacing-xl;
    background: $bg-secondary;
    border-bottom: 1px solid $border-color-light;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .server-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .status-indicator {
    font-size: 12px;
    line-height: 1;

    &--connected {
      color: $success;
    }
    &--connecting {
      color: $warning;
    }
    &--disconnected {
      color: $error;
    }
    &--degraded {
      color: $warning-dark;
    }
  }

  .page-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0;
  }

  .save-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $primary-color;
    border: 1px solid $primary-color;
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $primary-light;
      border-color: $primary-light;
    }
  }

  .detail-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: $spacing-xl;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .detail-left {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .detail-right {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .detail-section {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color-light;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .info-item {
    display: flex;
    gap: $spacing-md;
    align-items: flex-start;
  }

  .info-label {
    min-width: 100px;
    color: $text-tertiary;
    font-size: $font-size-sm;
    flex-shrink: 0;
  }

  .info-value {
    flex: 1;
    color: $text-primary;
    font-size: $font-size-sm;
    word-break: break-all;

    &.code {
      font-family: monospace;
      background: $bg-tertiary;
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
    }
  }

  .info-link {
    color: $primary-color;
    text-decoration: none;
    font-size: $font-size-sm;

    &:hover {
      text-decoration: underline;
    }
  }

  .section-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-lg;
    padding-top: $spacing-md;
    border-top: 1px solid $border-color-light;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &.primary {
      background: $primary-color;
      border: 1px solid $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
        border-color: $primary-light;
      }
    }

    &.secondary {
      background: $bg-tertiary;
      border: 1px solid $border-color-base;
      color: $text-secondary;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }

    &.full-width {
      width: 100%;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }

  .config-form {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .form-label {
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  .form-input,
  .form-textarea {
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;
    transition: all $transition-base ease;

    &:focus {
      border-color: $primary-color;
    }
  }

  .form-textarea {
    resize: vertical;
    font-family: monospace;
  }

  .transport-options {
    display: flex;
    gap: $spacing-md;
  }

  .transport-option {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;

    input {
      cursor: pointer;
    }

    span {
      font-size: $font-size-sm;
      color: $text-secondary;
    }

    &.active {
      border-color: $primary-color;
      background: rgba(24, 144, 255, 0.05);

      span {
        color: $primary-color;
      }
    }

    &:hover {
      border-color: $primary-color;
    }
  }

  .env-vars-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .env-var-item {
    display: flex;
    gap: $spacing-sm;
    align-items: center;
  }

  .env-key,
  .env-value {
    flex: 1;
    padding: $spacing-xs $spacing-sm;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-primary;
    font-size: $font-size-xs;
    font-family: monospace;
  }

  .env-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    border-radius: $border-radius-sm;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      color: $error;
      background: rgba(245, 34, 45, 0.1);
    }
  }

  .add-env-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-sm;
    background: transparent;
    border: 1px dashed $border-color-base;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .capability-group {
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-md;
    overflow: hidden;
  }

  .capability-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-md;
    background: $bg-tertiary;
    border: none;
    color: $text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: background $transition-base ease;

    &:hover {
      background: $border-color-light;
    }
  }

  .toggle-icon {
    width: 16px;
    height: 16px;
    transition: transform $transition-base ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  .capability-icon {
    font-size: $font-size-base;
  }

  .capability-title {
    flex: 1;
  }

  .capability-list {
    background: $bg-primary;
  }

  .capability-item {
    padding: $spacing-md;
    border-bottom: 1px solid $border-color-light;

    &:last-child {
      border-bottom: none;
    }
  }

  .capability-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xs;
  }

  .capability-name {
    font-family: monospace;
    font-size: $font-size-sm;
    color: $text-primary;
  }

  .capability-actions {
    display: flex;
    gap: $spacing-sm;
  }

  .capability-action {
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    border: none;
    color: $primary-color;
    font-size: $font-size-xs;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .capability-desc {
    color: $text-secondary;
    font-size: $font-size-xs;
    margin: 0 0 $spacing-xs 0;
  }

  .capability-params,
  .capability-meta {
    display: flex;
    gap: $spacing-xs;
    align-items: center;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .params-label,
  .meta-label {
    color: $text-secondary;
  }

  .params-value,
  .meta-value {
    font-family: monospace;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    text-align: center;
  }

  .stat-number {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $primary-color;
    margin-bottom: $spacing-xs;
  }

  .stat-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .monitoring-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .monitoring-title {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
  }

  .monitor-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
  }

  .monitor-label {
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  .status-display {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    &--connected {
      color: $success;
    }
    &--connecting {
      color: $warning;
    }
    &--disconnected {
      color: $error;
    }
    &--degraded {
      color: $warning-dark;
    }
  }

  .status-dot {
    font-size: 10px;
  }

  .status-text {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .monitor-metrics {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-lg;
  }

  .metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .metric-label {
    color: $text-tertiary;
    font-size: $font-size-sm;
  }

  .metric-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;

    &.text-error {
      color: $error;
    }
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: $spacing-lg;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-primary;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
  }

  .activity-time {
    color: $text-tertiary;
    font-family: monospace;
    min-width: 60px;
  }

  .activity-status {
    font-size: 12px;
  }

  .activity-name {
    flex: 1;
    color: $text-primary;
    font-family: monospace;
  }

  .activity-error {
    color: $error;
  }

  .monitoring-actions {
    display: flex;
    gap: $spacing-sm;
  }

  .dialog-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .dialog {
    background: $bg-secondary;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    min-width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .dialog-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
  }

  @media (max-width: 1024px) {
    .detail-content {
      grid-template-columns: 1fr;
    }

    .detail-right {
      order: -1;
    }
  }
</style>
