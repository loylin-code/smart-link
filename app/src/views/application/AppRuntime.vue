<template>
  <div class="app-runtime">
    <!-- Header -->
    <div class="runtime-header">
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
      </button>
      <div class="app-info">
        <h1 class="app-name">{{ app?.name }}</h1>
        <span class="app-type">{{ getTypeLabel(app?.type) }}</span>
      </div>
      <div class="runtime-status">
        <span class="status-dot" :class="`status--${status}`"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <!-- Runtime Content -->
    <div class="runtime-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载应用中...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" class="error-icon">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            fill="currentColor"
          />
        </svg>
        <p>{{ error }}</p>
        <button @click="loadApp">重试</button>
      </div>

      <div v-else class="runtime-viewer">
        <SchemaRenderer
          :schema="schema"
          :loading="loading"
          :error="error"
          @rendered="onRendered"
          @error="onError"
          @interaction="logInteraction"
        />
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="runtime-footer">
      <div class="stat-item">
        <span class="stat-label">访问次数</span>
        <span class="stat-value">{{ runtimeStatus?.usageCount || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">运行时长</span>
        <span class="stat-value">{{ formatUptime(runtimeStatus?.uptime || 0) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">错误次数</span>
        <span class="stat-value">{{ runtimeStatus?.errorCount || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { applicationApi } from '@/services/application'
  import SchemaRenderer from '@/components/runtime/SchemaRenderer.vue'
  import type { Application, AppRuntimeStatus, PageSchema } from '@/types'
  import { AppType, AppStatus } from '@/types'

  const route = useRoute()
  const router = useRouter()

  const app = ref<Application | null>(null)
  const schema = ref<PageSchema | null>(null)
  const runtimeStatus = ref<AppRuntimeStatus | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const status = ref('running')

  const statusText = computed(() => {
    switch (status.value) {
      case 'running':
        return '运行中'
      case 'error':
        return '异常'
      case 'stopped':
        return '已停止'
      default:
        return '未知'
    }
  })

  async function loadApp() {
    const appId = route.params.id as string
    loading.value = true
    error.value = null

    try {
      const [appData, schemaData, statusData] = await Promise.all([
        applicationApi.getApplicationById(appId),
        applicationApi.getApplicationSchema(appId),
        applicationApi.getRuntimeStatus()
      ])

      app.value = appData
      schema.value = schemaData
      runtimeStatus.value = statusData.find((s) => s.appId === appId) || null

      if (!appData) {
        error.value = '应用不存在'
      } else if (appData.status !== AppStatus.PUBLISHED) {
        error.value = '应用未发布'
      }
    } catch (e) {
      error.value = '加载失败'
    } finally {
      loading.value = false
    }
  }

  function goBack() {
    router.push('/app/application/list')
  }

  function getTypeLabel(type?: AppType) {
    const labels = {
      [AppType.WORKFLOW]: '工单应用',
      [AppType.CHART]: '图表应用',
      [AppType.FORM]: '表单应用',
      [AppType.DASHBOARD]: '仪表盘',
      [AppType.CUSTOM]: '自定义应用'
    }
    return type ? labels[type] : ''
  }

  function formatUptime(seconds: number): string {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
    return `${Math.floor(seconds / 3600)}小时`
  }

  function onRendered() {
    status.value = 'running'
  }

  function onError(e: Error) {
    status.value = 'error'
    console.error('Runtime error:', e)
  }

  function logInteraction(event: any) {
    console.log('Interaction:', event)
  }

  onMounted(loadApp)
</script>

<style scoped lang="scss">
  .app-runtime {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: $bg-secondary;
    color: $text-primary;
    overflow: hidden;
  }

  // ============================================================
  // Header
  // ============================================================

  .runtime-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: rgba($primary-color, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .app-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .app-name {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
  }

  .app-type {
    padding: 4px 12px;
    background: rgba($primary-color, 0.1);
    border: 1px solid rgba($primary-color, 0.3);
    border-radius: 12px;
    font-size: 12px;
    color: $primary-color;
    font-weight: 500;
  }

  .runtime-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s infinite;

    &.status--running {
      background: $success;
      box-shadow: 0 0 8px rgba($success, 0.5);
    }

    &.status--error {
      background: $error;
      box-shadow: 0 0 8px rgba($error, 0.5);
    }

    &.status--stopped {
      background: $text-tertiary;
      box-shadow: 0 0 8px rgba($text-tertiary, 0.3);
    }
  }

  .status-text {
    font-size: 14px;
    font-weight: 500;
    color: $text-secondary;
  }

  // ============================================================
  // Content Area
  // ============================================================

  .runtime-content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 24px;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid $border-color-base;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-state p {
    font-size: 14px;
    color: $text-secondary;
    margin: 0;
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
    text-align: center;
  }

  .error-icon {
    width: 64px;
    height: 64px;
    color: $error;
  }

  .error-state p {
    font-size: 16px;
    color: $text-secondary;
    margin: 0;
    max-width: 400px;
  }

  .error-state button {
    padding: 10px 24px;
    background: $primary-color;
    color: #fff;
    border: none;
    border-radius: $border-radius-sm;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: $primary-light;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba($primary-color, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .runtime-viewer {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  // ============================================================
  // Footer Stats
  // ============================================================

  .runtime-footer {
    display: flex;
    justify-content: center;
    gap: 48px;
    padding: 16px 24px;
    background: $bg-primary;
    border-top: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: $text-tertiary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: $primary-color;
  }

  // ============================================================
  // Animations
  // ============================================================

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }

  // ============================================================
  // Responsive
  // ============================================================

  @media (max-width: 768px) {
    .runtime-header {
      padding: 12px 16px;
    }

    .app-name {
      font-size: 16px;
    }

    .app-type {
      display: none;
    }

    .runtime-footer {
      gap: 24px;
      padding: 12px 16px;
    }

    .stat-value {
      font-size: 16px;
    }
  }
</style>
