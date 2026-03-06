<template>
  <div class="app-runtime">
    <!-- Particle Background -->
    <ParticleBackground :particle-count="60" :connection-distance="100" />

    <!-- Header -->
    <div class="runtime-header">
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
          <span>{{ t('application.runtime.backToList') }}</span>
        </button>
      </div>

      <div class="header-center">
        <h1 class="app-name">{{ app?.name }}</h1>
        <span class="app-type-badge">{{ getTypeLabel(app?.type) }}</span>
      </div>

      <div class="header-right">
        <div class="runtime-status">
          <span class="status-dot" :class="`status--${status}`"></span>
          <span class="status-text">{{ statusText }}</span>
        </div>
        <button class="share-btn" @click="openShare">
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
          <span>{{ t('application.card.share') }}</span>
        </button>
      </div>
    </div>

    <!-- Runtime Content -->
    <div class="runtime-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.25" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <p class="loading-text">{{ t('application.runtime.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path
              d="M12 8v4M12 16h.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <h3 class="error-title">{{ t('application.runtime.loadFailed') }}</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadApp">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M1 4v6h6M23 20v-6h-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ t('application.runtime.retry') }}
        </button>
      </div>

      <!-- Disabled State -->
      <div v-else-if="app?.isEnabled === false" class="disabled-state">
        <div class="disabled-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h3 class="disabled-title">{{ t('application.runtime.appDisabled') }}</h3>
        <p class="disabled-message">{{ t('application.runtime.appDisabledDesc') }}</p>
        <button class="back-to-list-btn" @click="goBack">
          {{ t('application.runtime.backToList') }}
        </button>
      </div>

      <!-- Normal Runtime -->
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
          <span class="stat-value">{{ formatNumber(runtimeStatus?.usageCount || 0) }}</span>
          <span class="stat-label">{{ t('application.runtime.visits') }}</span>
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
          <span class="stat-value">{{ formatUptime(runtimeStatus?.uptime || 0) }}</span>
          <span class="stat-label">{{ t('application.runtime.uptime') }}</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon error">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v2M12 15h.01"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value" :class="{ error: runtimeStatus?.errorCount }">{{
            runtimeStatus?.errorCount || 0
          }}</span>
          <span class="stat-label">{{ t('application.runtime.errors') }}</span>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <ShareModal v-if="showShareModal" :app="app" @close="showShareModal = false" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { applicationApi } from '@/services/application'
  import SchemaRenderer from '@/components/runtime/SchemaRenderer.vue'
  import ShareModal from './ShareModal.vue'
  import ParticleBackground from '@/components/common/ParticleBackground.vue'
  import type { Application, AppRuntimeStatus, PageSchema } from '@/types'
  import { AppType, AppStatus } from '@/types'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  const app = ref<Application | null>(null)
  const schema = ref<PageSchema | null>(null)
  const runtimeStatus = ref<AppRuntimeStatus | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const status = ref('running')
  const showShareModal = ref(false)

  const statusText = computed(() => {
    switch (status.value) {
      case 'running':
        return t('application.runtime.running')
      case 'error':
        return t('application.runtime.error')
      case 'stopped':
        return t('application.runtime.stopped')
      default:
        return t('application.runtime.unknown')
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
        error.value = t('application.runtime.appNotFound')
      } else if (appData.status !== AppStatus.PUBLISHED) {
        error.value = t('application.runtime.appNotPublished')
      }
    } catch (e) {
      error.value = t('application.runtime.loadFailed')
    } finally {
      loading.value = false
    }
  }

  function goBack() {
    router.push('/app/application/list')
  }

  function openShare() {
    showShareModal.value = true
  }

  function getTypeLabel(type?: AppType) {
    const labels = {
      [AppType.WORKFLOW]: t('application.types.workflow'),
      [AppType.CHART]: t('application.types.chart'),
      [AppType.FORM]: t('application.types.form'),
      [AppType.DASHBOARD]: t('application.types.dashboard'),
      [AppType.CUSTOM]: t('application.types.custom')
    }
    return type ? labels[type] : ''
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
  @import './AppRuntime.scss';
</style>
