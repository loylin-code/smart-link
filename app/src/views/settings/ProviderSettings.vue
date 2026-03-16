<template>
  <div class="provider-settings">
    <div class="settings-layout">
      <!-- Sidebar -->
      <aside class="settings-sidebar">
        <nav class="settings-nav">
          <router-link to="/app/settings/appearance" class="nav-item">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                <path
                  d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="nav-label">{{ t('settings.appearance') }}</span>
          </router-link>
          <router-link to="/app/settings/providers" class="nav-item nav-item--active">
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="20"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M8 21H16M12 17V21"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="nav-label">{{ t('settings.modelProviders.title') }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="settings-content">
        <!-- Header -->
        <div class="settings-header">
          <h1 class="settings-title">{{ t('settings.modelProviders.title') || '模型提供商' }}</h1>
          <p class="settings-subtitle">
            {{ t('settings.modelProviders.subtitle') || '管理 AI 模型提供商的 API 配置' }}
          </p>
        </div>

        <!-- Provider Stats -->
        <div class="provider-stats">
          <div class="stat-card">
            <div class="stat-icon stat-icon--configured">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ configuredProviders.length }}</span>
              <span class="stat-label">{{
                t('settings.modelProviders.configured') || '已配置'
              }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon--pending">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ unconfiguredProviders.length }}</span>
              <span class="stat-label">{{
                t('settings.modelProviders.unconfigured') || '待配置'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="content-section">
          <!-- Configured Providers -->
          <div v-if="configuredProviders.length > 0" class="provider-group">
            <h2 class="group-title">{{ t('settings.modelProviders.configured') || '已配置' }}</h2>
            <div class="provider-grid">
              <div
                v-for="provider in configuredProviders"
                :key="provider.id"
                class="provider-card configured"
              >
                <div class="provider-header">
                  <div class="provider-icon" :class="`provider-icon--${provider.provider}`">
                    <component :is="getProviderIconComponent(provider.provider)" />
                  </div>
                  <div class="provider-info">
                    <h3 class="provider-name">{{ provider.name }}</h3>
                    <span class="provider-status status--configured">
                      <span class="status-dot"></span>
                      {{ t('settings.modelProviders.configured') }}
                    </span>
                  </div>
                </div>

                <div class="provider-body">
                  <div class="info-item">
                    <span class="info-label">{{ t('settings.modelProviders.apiKey') }}</span>
                    <span class="info-value masked">{{ maskApiKey(provider.apiKey) }}</span>
                  </div>
                  <div v-if="provider.baseUrl" class="info-item">
                    <span class="info-label">{{ t('settings.modelProviders.baseUrl') }}</span>
                    <span class="info-value">{{ provider.baseUrl }}</span>
                  </div>
                  <div v-if="provider.availableModels.length > 0" class="info-item">
                    <span class="info-label">{{
                      t('settings.modelProviders.availableModels')
                    }}</span>
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
                </div>

                <div class="provider-actions">
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
                    :class="{ 'action-btn--testing': testingId === provider.id }"
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
                </div>
              </div>
            </div>
          </div>

          <!-- Unconfigured Providers -->
          <div v-if="unconfiguredProviders.length > 0" class="provider-group">
            <h2 class="group-title">
              {{ t('settings.modelProviders.available') || '可用提供商' }}
            </h2>
            <div class="provider-grid">
              <div
                v-for="provider in unconfiguredProviders"
                :key="provider.id"
                class="provider-card unconfigured"
              >
                <div class="provider-header">
                  <div class="provider-icon" :class="`provider-icon--${provider.provider}`">
                    <component :is="getProviderIconComponent(provider.provider)" />
                  </div>
                  <div class="provider-info">
                    <h3 class="provider-name">{{ provider.name }}</h3>
                    <span class="provider-status status--unconfigured">
                      <span class="status-dot"></span>
                      {{ t('settings.modelProviders.unconfigured') }}
                    </span>
                  </div>
                </div>

                <div class="provider-body">
                  <p class="provider-description">
                    {{ getProviderDescription(provider.provider) }}
                  </p>
                </div>

                <div class="provider-actions">
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
                </div>
              </div>
            </div>
          </div>

          <!-- Add New Provider -->
          <div class="add-provider-section">
            <button class="add-provider-btn" @click="handleAddNew">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ t('settings.modelProviders.addNewProvider') }}</span>
            </button>
          </div>
        </div>
      </main>
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

  const configuredProviders = computed(() => settingsStore.configuredProviders)
  const unconfiguredProviders = computed(() => settingsStore.unconfiguredProviders)

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
    overflow-y: auto;
    padding: $spacing-xl;
    background: $bg-secondary;

    @include respond-below(md) {
      padding: $spacing-md;
    }
  }

  .settings-layout {
    display: flex;
    gap: $spacing-xl;
    max-width: 1200px;
    margin: 0 auto;

    @include respond-below(lg) {
      flex-direction: column;
      gap: $spacing-lg;
    }
  }

  // ================================
  // 侧边栏导航
  // ================================
  .settings-sidebar {
    width: 220px;
    flex-shrink: 0;

    @include respond-below(lg) {
      width: 100%;
    }
  }

  .settings-nav {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    padding: $spacing-sm;

    @include respond-below(lg) {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    border-radius: $border-radius-md;
    color: $text-secondary;
    text-decoration: none;
    transition: all $transition-fast $ease-out;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &--active {
      background: $primary-surface;
      color: $primary-color;

      .nav-icon {
        color: $primary-color;
      }

      .nav-label {
        font-weight: $font-weight-semibold;
      }
    }
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .nav-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  // ================================
  // 内容区
  // ================================
  .settings-content {
    flex: 1;
    min-width: 0;
  }

  .settings-header {
    margin-bottom: $spacing-xl;
  }

  .settings-title {
    font-family: $font-family-display;
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;

    @include respond-below(md) {
      font-size: $font-size-2xl;
    }
  }

  .settings-subtitle {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0;
  }

  // ================================
  // 统计卡片
  // ================================
  .provider-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-xl;

    @include respond-below(sm) {
      grid-template-columns: 1fr;
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    transition: all $transition-fast $ease-out;

    &:hover {
      border-color: $primary-color;
      box-shadow: $shadow-card-hover;
    }
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-lg;
    flex-shrink: 0;

    svg {
      width: 24px;
      height: 24px;
    }

    &--configured {
      background: $success-bg;
      color: $success;
    }

    &--pending {
      background: $warning-bg;
      color: $warning;
    }
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    line-height: 1.2;
  }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  // ================================
  // 内容区块
  // ================================
  .content-section {
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    padding: $spacing-xl;

    @include respond-below(md) {
      padding: $spacing-lg;
    }
  }

  .provider-group {
    margin-bottom: $spacing-2xl;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .group-title {
    font-family: $font-family-display;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-lg;
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
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    transition: all $transition-fast $ease-out;
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
      transition: background $transition-fast $ease-out;
    }

    &:hover {
      border-color: $primary-color;
      box-shadow: $shadow-card-hover;
    }

    &.configured::before {
      background: $success;
    }

    &.unconfigured::before {
      background: $text-tertiary;
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
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    color: $text-primary;
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
    gap: $spacing-xs;
  }

  .provider-name {
    font-family: $font-family-display;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .provider-status {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    padding: 2px 8px;
    border-radius: $border-radius-full;
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
      background: $bg-tertiary;

      .status-dot {
        background: $text-tertiary;
      }
    }
  }

  .provider-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-md 0;
    border-top: 1px solid $border-color-base;
    border-bottom: 1px solid $border-color-base;
    margin-bottom: $spacing-md;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
  }

  .info-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    min-width: 72px;
    flex-shrink: 0;
    padding-top: 2px;
  }

  .info-value {
    font-size: $font-size-sm;
    color: $text-primary;
    word-break: break-all;

    &.masked {
      font-family: $font-family-mono;
      font-size: $font-size-xs;
      background: $bg-tertiary;
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
    }
  }

  .models-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .model-tag {
    font-size: $font-size-xs;
    color: $text-secondary;
    background: $bg-tertiary;
    padding: 2px 8px;
    border-radius: $border-radius-sm;

    &--more {
      color: $primary-color;
      background: $primary-surface;
    }
  }

  .provider-description {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin: 0;
    line-height: $line-height-base;
  }

  .provider-actions {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  // ================================
  // Action Buttons
  // ================================
  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: $bg-tertiary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

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
      color: $text-inverse;

      &:hover {
        background: $primary-dark;
        border-color: $primary-dark;
      }
    }

    &--danger:hover {
      border-color: $error;
      color: $error;
      background: $error-bg;
    }

    &--testing {
      opacity: 0.7;
      cursor: not-allowed;
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

  // ================================
  // Add Provider Section
  // ================================
  .add-provider-section {
    margin-top: $spacing-xl;
    padding-top: $spacing-xl;
    border-top: 1px solid $border-color-base;
  }

  .add-provider-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-lg;
    background: transparent;
    border: 2px dashed $border-color-base;
    border-radius: $border-radius-lg;
    color: $text-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: $primary-surface;
    }
  }

  // ================================
  // 动画减少模式
  // ================================
  @include reduced-motion {
    .stat-card,
    .provider-card,
    .action-btn,
    .add-provider-btn,
    .nav-item {
      transition: none;
    }

    .spinner {
      animation: none;
    }
  }
</style>
