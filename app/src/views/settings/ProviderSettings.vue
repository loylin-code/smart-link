<template>
  <div class="provider-settings">
    <div class="settings-content">
      <div class="content-header">
        <div class="page-meta">
          <h1 class="page-name">{{ t('settings.modelProviders.title') }}</h1>
          <span class="page-type">{{ t('settings.modelProviders.subtitle') }}</span>
        </div>
        <div class="header-actions">
          <nav class="filter-nav">
            <button
              class="filter-item"
              :class="{ active: filterStatus === 'all' }"
              @click="filterStatus = 'all'"
            >
              {{ t('settings.modelProviders.filterAll') }}
            </button>
            <button
              class="filter-item"
              :class="{ active: filterStatus === 'configured' }"
              @click="filterStatus = 'configured'"
            >
              {{ t('settings.modelProviders.configured') }}
            </button>
            <button
              class="filter-item"
              :class="{ active: filterStatus === 'unconfigured' }"
              @click="filterStatus = 'unconfigured'"
            >
              {{ t('settings.modelProviders.unconfigured') }}
            </button>
          </nav>
          <button class="add-btn" @click="handleAddNew">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>{{ t('settings.modelProviders.addProvider') }}</span>
          </button>
        </div>
      </div>
      <div class="content-body">
        <div class="provider-grid">
          <div
            v-for="provider in filteredProviders"
            :key="provider.id"
            class="provider-card"
            :class="{ configured: provider.configured }"
          >
            <div class="provider-header">
              <div class="provider-icon" :class="`provider-icon--${provider.provider}`">
                <component :is="getProviderIconComponent(provider.provider)" />
              </div>
              <div class="provider-info">
                <span class="provider-name">{{ provider.name }}</span>
                <span
                  class="provider-status"
                  :class="provider.configured ? 'status--configured' : 'status--unconfigured'"
                >
                  <span class="status-dot"></span>
                  {{
                    provider.configured
                      ? t('settings.modelProviders.configured')
                      : t('settings.modelProviders.unconfigured')
                  }}
                </span>
              </div>
            </div>

            <div class="provider-body">
              <template v-if="provider.configured">
                <div class="info-item">
                  <span class="info-label">{{ t('settings.modelProviders.apiKey') }}</span>
                  <span class="info-value masked">{{ maskApiKey(provider.apiKey) }}</span>
                </div>
                <div v-if="provider.baseUrl" class="info-item">
                  <span class="info-label">{{ t('settings.modelProviders.baseUrl') }}</span>
                  <span class="info-value">{{ provider.baseUrl }}</span>
                </div>
                <div
                  v-if="provider.availableModels && provider.availableModels.length > 0"
                  class="info-item"
                >
                  <span class="info-label">{{ t('settings.modelProviders.availableModels') }}</span>
                  <div class="models-list">
                    <span
                      v-for="model in provider.availableModels.slice(0, 3)"
                      :key="model"
                      class="model-tag"
                    >
                      {{ model }}
                    </span>
                    <span
                      v-if="provider.availableModels.length > 3"
                      class="model-tag model-tag--more"
                    >
                      +{{ provider.availableModels.length - 3 }}
                    </span>
                  </div>
                </div>
              </template>
              <template v-else>
                <p class="provider-description">{{ getProviderDescription(provider.provider) }}</p>
              </template>
            </div>

            <div class="provider-actions">
              <template v-if="provider.configured">
                <button class="action-btn" @click="handleEdit(provider)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ t('common.edit') }}</span>
                </button>
                <button
                  class="action-btn"
                  :disabled="testingId === provider.id"
                  @click="handleTest(provider)"
                >
                  <svg v-if="testingId !== provider.id" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 12H18L15 21L9 3L6 12H2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span v-if="testingId === provider.id" class="spinner"></span>
                  <span>{{
                    testingId === provider.id
                      ? t('settings.modelProviders.testing')
                      : t('settings.modelProviders.testConnection')
                  }}</span>
                </button>
                <button class="action-btn action-btn--danger" @click="handleDelete(provider)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 6H5H21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ t('common.delete') }}</span>
                </button>
              </template>
              <template v-else>
                <button class="action-btn action-btn--primary" @click="handleAddConfig(provider)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ t('settings.modelProviders.addConfig') }}</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, h } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSettingsStore } from '@/store/modules/settings'
  import type { ModelProviderConfig } from '@/types'

  const { t } = useI18n()
  const settingsStore = useSettingsStore()

  const testingId = ref<string | null>(null)
  const filterStatus = ref('all')

  const configuredProviders = computed(() => settingsStore.configuredProviders)
  const unconfiguredProviders = computed(() => settingsStore.unconfiguredProviders)

  // 合并所有供应商并添加配置状态
  const allProviders = computed(() => {
    const configured = configuredProviders.value.map((p) => ({ ...p, configured: true }))
    const unconfigured = unconfiguredProviders.value.map((p) => ({ ...p, configured: false }))
    return [...configured, ...unconfigured]
  })

  // 根据筛选条件过滤
  const filteredProviders = computed(() => {
    if (filterStatus.value === 'configured') {
      return allProviders.value.filter((p) => p.configured)
    }
    if (filterStatus.value === 'unconfigured') {
      return allProviders.value.filter((p) => !p.configured)
    }
    return allProviders.value
  })

  // Provider Icon Components
  const OpenAIIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M12 2L2 7L12 12L22 7L12 2Z',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M2 17L12 22L22 17',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M2 12L12 17L22 12',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])

  const OllamaIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: '12', cy: '12', r: '9', stroke: 'currentColor', 'stroke-width': 2 }),
      h('circle', { cx: '9', cy: '10', r: '1.5', fill: 'currentColor' }),
      h('circle', { cx: '15', cy: '10', r: '1.5', fill: 'currentColor' }),
      h('path', {
        d: 'M9 15C9 15 10.5 17 12 17C13.5 17 15 15 15 15',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      })
    ])

  const AnthropicIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M6 3L12 17L18 3',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }),
      h('path', {
        d: 'M3 21H6L9 12',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      }),
      h('path', {
        d: 'M21 21H18L15 12',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      })
    ])

  const GoogleIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z',
        stroke: 'currentColor',
        'stroke-width': 2
      }),
      h('path', {
        d: 'M12 2V12L17 17',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round'
      })
    ])

  const CustomIcon = () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: '12', cy: '12', r: '3', stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', {
        d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])

  const getProviderIconComponent = (provider: string) => {
    const icons: Record<string, any> = {
      openai: OpenAIIcon,
      anthropic: AnthropicIcon,
      ollama: OllamaIcon,
      alibaba: CustomIcon,
      google: GoogleIcon,
      custom: CustomIcon
    }
    return icons[provider] || CustomIcon
  }

  const getProviderDescription = (provider: string): string => {
    const descriptions: Record<string, string> = {
      ollama: t('settings.modelProviders.descriptions.ollama') || '本地运行的开源大语言模型',
      alibaba: t('settings.modelProviders.descriptions.alibaba') || '阿里云通义千问大模型服务',
      google: t('settings.modelProviders.descriptions.google') || 'Google Gemini 大模型服务',
      custom: t('settings.modelProviders.descriptions.custom') || '自定义 OpenAI 兼容 API'
    }
    return descriptions[provider] || ''
  }

  const maskApiKey = (apiKey: string): string => {
    if (!apiKey || apiKey.length < 8) return '****'
    const prefix = apiKey.slice(0, 4)
    const suffix = apiKey.slice(-4)
    return `${prefix}****...****${suffix}`
  }

  const handleEdit = (provider: ModelProviderConfig) => {
    console.log('Edit provider:', provider)
    // TODO: Open edit modal
  }

  const handleTest = async (provider: ModelProviderConfig) => {
    testingId.value = provider.id
    try {
      const result = await settingsStore.testProviderConnection(provider.id)
      console.log('Test result:', result)
    } finally {
      testingId.value = null
    }
  }

  const handleDelete = (provider: ModelProviderConfig) => {
    if (confirm(t('settings.modelProviders.confirmDelete', { name: provider.name }))) {
      settingsStore.deleteProvider(provider.id)
    }
  }

  const handleAddConfig = (provider: ModelProviderConfig) => {
    console.log('Add config for provider:', provider)
    // TODO: Open config modal
  }

  const handleAddNew = () => {
    console.log('Add new provider')
    // TODO: Open add new provider modal
  }
</script>

<style scoped lang="scss">
  .provider-settings {
    height: 100%;
    background: $bg-secondary;
    overflow-y: auto;
    padding: $spacing-xl;
  }

  .settings-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  // ================================
  // Content Header
  // ================================
  .content-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
  }

  .page-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .page-meta h1.page-name {
    font-size: $font-size-lg !important;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .page-type {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .filter-nav {
    display: flex;
    gap: 4px;
  }

  .filter-item {
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-secondary;
      color: $text-primary;
    }

    &.active {
      background: rgba(59, 130, 246, 0.1);
      color: $primary-color;
      font-weight: $font-weight-medium;
    }
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $primary-light;
    }
  }

  // ================================
  // Content Body
  // ================================
  .content-body {
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: 12px;
    padding: $spacing-lg;
  }

  .provider-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: $spacing-lg;

    @include respond-below(md) {
      grid-template-columns: 1fr;
    }
  }

  // ================================
  // Provider Card
  // ================================
  .provider-card {
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: 12px;
    padding: $spacing-lg;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: $text-tertiary;
    }

    &.configured::before {
      background: $success;
    }

    &:hover {
      border-color: $primary-color;
    }
  }

  .provider-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }

  .provider-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.05);
    flex-shrink: 0;

    svg {
      width: 24px;
      height: 24px;
    }
    &--openai {
      background: rgba(16, 163, 127, 0.1);
      color: #10a37f;
    }
    &--anthropic {
      background: rgba(147, 51, 234, 0.1);
      color: #9333ea;
    }
    &--ollama {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    &--alibaba {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
    }
    &--google {
      background: rgba(234, 67, 53, 0.1);
      color: #ea4335;
    }
  }

  .provider-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .provider-name {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  .provider-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 20px;
    width: fit-content;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    &.status--configured {
      color: $success;
      background: $success-bg;
      .status-dot {
        background: $success;
      }
    }

    &.status--unconfigured {
      color: $text-tertiary;
      background: rgba(0, 0, 0, 0.05);
      .status-dot {
        background: $text-tertiary;
      }
    }
  }

  .provider-body {
    padding: $spacing-md 0;
    border-top: 1px solid $border-color-base;
    border-bottom: 1px solid $border-color-base;
    margin-bottom: $spacing-md;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-label {
    font-size: 12px;
    color: $text-tertiary;
    min-width: 72px;
    flex-shrink: 0;
  }

  .info-value {
    font-size: 14px;
    color: $text-primary;

    &.masked {
      font-family: monospace;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.05);
      padding: 4px 8px;
      border-radius: 4px;
    }
  }

  .models-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .model-tag {
    font-size: 12px;
    color: $text-secondary;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 8px;
    border-radius: 4px;

    &--more {
      color: $primary-color;
      background: rgba(59, 130, 246, 0.1);
    }
  }

  .provider-description {
    font-size: 14px;
    color: $text-secondary;
    margin: 0;
  }

  .provider-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid $border-color-base;
    border-radius: 6px;
    color: $text-secondary;
    font-size: 13px;
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

    &--primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
      &:hover {
        background: $primary-light;
      }
    }

    &--danger:hover {
      border-color: $error;
      color: $error;
      background: $error-bg;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid $border-color-base;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @include reduced-motion {
    .provider-card,
    .action-btn,
    .spinner {
      transition: none;
      animation: none;
    }
  }
</style>
