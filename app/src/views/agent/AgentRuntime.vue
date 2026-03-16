<template>
  <div class="agent-runtime">
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
          <span>{{ t('agent.runtime.backToList') }}</span>
        </button>
      </div>

      <div class="header-center">
        <h1 class="agent-name">{{ agent?.identity.name }}</h1>
        <span class="agent-type-badge">{{ getTypeLabel(agent?.type) }}</span>
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
          <span>{{ t('agent.card.share') }}</span>
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
        <p class="loading-text">{{ t('agent.runtime.loading') }}</p>
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
        <h3 class="error-title">{{ t('agent.runtime.loadFailed') }}</h3>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="loadAgent">
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
          {{ t('agent.runtime.retry') }}
        </button>
      </div>

      <!-- Disabled State -->
      <div v-else-if="agent?.status !== AgentStatus.ACTIVE" class="disabled-state">
        <div class="disabled-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h3 class="disabled-title">{{ t('agent.runtime.agentDisabled') }}</h3>
        <p class="disabled-message">{{ t('agent.runtime.agentDisabledDesc') }}</p>
        <button class="back-to-list-btn" @click="goBack">
          {{ t('agent.runtime.backToList') }}
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
          <span class="stat-value">{{ formatNumber(runtimeStatus?.sessionCount || 0) }}</span>
          <span class="stat-label">{{ t('agent.runtime.sessions') }}</span>
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
          <span class="stat-value">{{ formatTokens(runtimeStatus?.tokensConsumed || 0) }}</span>
          <span class="stat-label">{{ t('agent.runtime.tokens') }}</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon latency">
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
          <span class="stat-value">{{ runtimeStatus?.avgLatency || 0 }}ms</span>
          <span class="stat-label">{{ t('agent.runtime.latency') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { agentApi } from '@/services/agent'
  import SchemaRenderer from '@/components/runtime/SchemaRenderer.vue'
  import ParticleBackground from '@/components/common/ParticleBackground.vue'
  import type { Agent, AgentRuntimeStatus, PageSchema } from '@/types'
  import { AgentType, AgentStatus } from '@/types'

  const { t } = useI18n()
  const route = useRoute()
  const router = useRouter()

  const agent = ref<Agent | null>(null)
  const schema = ref<PageSchema | null>(null)
  const runtimeStatus = ref<AgentRuntimeStatus | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const status = ref('running')

  const statusText = computed(() => {
    switch (status.value) {
      case 'running':
        return t('agent.runtime.running')
      case 'error':
        return t('agent.runtime.error')
      case 'stopped':
        return t('agent.runtime.stopped')
      default:
        return t('agent.runtime.unknown')
    }
  })

  async function loadAgent() {
    const agentId = route.params.id as string
    loading.value = true
    error.value = null

    try {
      const [agentData, schemaData, statusData] = await Promise.all([
        agentApi.getAgentById(agentId),
        agentApi.getAgentSchema(agentId),
        agentApi.getRuntimeStatus()
      ])

      agent.value = agentData
      schema.value = schemaData as unknown as PageSchema
      runtimeStatus.value = statusData.find((s) => s.agentId === agentId) || null

      if (!agentData) {
        error.value = t('agent.runtime.agentNotFound')
      } else if (agentData.status !== AgentStatus.ACTIVE) {
        error.value = t('agent.runtime.agentNotActive')
      }
    } catch (e) {
      error.value = t('agent.runtime.loadFailed')
    } finally {
      loading.value = false
    }
  }

  function goBack() {
    router.push('/app/agent/list')
  }

  function openShare() {
    // TODO: implement share modal
    console.log('Open share modal')
  }

  function getTypeLabel(type?: AgentType) {
    const labels = {
      [AgentType.SYSTEM]: t('agent.types.system'),
      [AgentType.CUSTOM]: t('agent.types.custom'),
      [AgentType.TEMPLATE]: t('agent.types.template')
    }
    return type ? labels[type] : ''
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

  onMounted(loadAgent)
</script>

<style scoped lang="scss">
  @import './AgentRuntime.scss';
</style>
