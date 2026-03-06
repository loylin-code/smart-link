<template>
  <div class="provider-settings">
    <div class="page-header">
      <h1 class="page-title">{{ t('settings.modelProviders.title') }}</h1>
    </div>

    <div class="settings-layout">
      <!-- Sidebar -->
      <aside class="settings-sidebar">
        <nav class="settings-nav">
          <router-link to="/app/settings/appearance" class="nav-item">
            <span class="nav-icon">🎨</span>
            <span class="nav-label">{{ t('settings.appearance.title') }}</span>
          </router-link>
          <router-link to="/app/settings/providers" class="nav-item active">
            <span class="nav-icon">🤖</span>
            <span class="nav-label">{{ t('settings.modelProviders.title') }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="settings-content">
        <div class="content-section">
          <h2 class="section-title">{{ t('settings.modelProviders.sectionTitle') }}</h2>

          <!-- Provider List -->
          <div class="provider-list">
            <!-- Configured Providers -->
            <div
              v-for="provider in configuredProviders"
              :key="provider.id"
              class="provider-card configured"
            >
              <div class="provider-header">
                <div class="provider-info">
                  <div class="provider-icon" :class="`provider-icon--${provider.provider}`">
                    {{ getProviderIcon(provider.provider) }}
                  </div>
                  <div class="provider-details">
                    <h3 class="provider-name">{{ provider.name }}</h3>
                    <span class="provider-status configured">{{
                      t('settings.modelProviders.configured')
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="provider-body">
                <div class="info-row">
                  <span class="info-label">{{ t('settings.modelProviders.apiKey') }}</span>
                  <span class="info-value masked">{{ maskApiKey(provider.apiKey) }}</span>
                </div>
                <div v-if="provider.baseUrl" class="info-row">
                  <span class="info-label">{{ t('settings.modelProviders.baseUrl') }}</span>
                  <span class="info-value">{{ provider.baseUrl }}</span>
                </div>
                <div v-if="provider.availableModels.length > 0" class="info-row">
                  <span class="info-label">{{ t('settings.modelProviders.availableModels') }}</span>
                  <div class="models-list">
                    <span v-for="model in provider.availableModels" :key="model" class="model-tag">
                      {{ model }}
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
                  :class="{ testing: testingId === provider.id }"
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
                <button class="action-btn danger" @click="handleDelete(provider)">
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

            <!-- Unconfigured Providers -->
            <div
              v-for="provider in unconfiguredProviders"
              :key="provider.id"
              class="provider-card unconfigured"
            >
              <div class="provider-header">
                <div class="provider-info">
                  <div class="provider-icon" :class="`provider-icon--${provider.provider}`">
                    {{ getProviderIcon(provider.provider) }}
                  </div>
                  <div class="provider-details">
                    <h3 class="provider-name">{{ provider.name }}</h3>
                    <span class="provider-status unconfigured">{{
                      t('settings.modelProviders.unconfigured')
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="provider-body">
                <p class="provider-description">{{ getProviderDescription(provider.provider) }}</p>
              </div>

              <div class="provider-actions">
                <button class="action-btn primary" @click="handleAddConfig(provider)">
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

          <!-- Add New Provider Button -->
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
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSettingsStore } from '@/store/modules/settings'
  import type { ModelProviderConfig } from '@/types'

  const { t } = useI18n()
  const settingsStore = useSettingsStore()

  const testingId = ref<string | null>(null)

  const configuredProviders = computed(() => settingsStore.configuredProviders)
  const unconfiguredProviders = computed(() => settingsStore.unconfiguredProviders)

  const getProviderIcon = (provider: string): string => {
    const icons: Record<string, string> = {
      openai: '🟢',
      anthropic: '🟣',
      ollama: '🔵',
      alibaba: '🟠',
      google: '🔴',
      custom: '⚙️'
    }
    return icons[provider] || '🤖'
  }

  const getProviderDescription = (provider: string): string => {
    const descriptions: Record<string, string> = {
      ollama: t('settings.modelProviders.descriptions.ollama'),
      alibaba: t('settings.modelProviders.descriptions.alibaba'),
      google: t('settings.modelProviders.descriptions.google'),
      custom: t('settings.modelProviders.descriptions.custom')
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
      // Show result notification (would integrate with notification system)
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
  }

  .page-header {
    padding: $spacing-xl $spacing-xl 0;
  }

  .page-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0;
  }

  .settings-layout {
    display: flex;
    gap: $spacing-xl;
    padding: $spacing-xl;
  }

  .settings-sidebar {
    width: 200px;
    flex-shrink: 0;
  }

  .settings-nav {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    color: $text-secondary;
    text-decoration: none;
    transition: all $transition-base ease;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
    }
  }

  .nav-icon {
    font-size: $font-size-lg;
  }

  .nav-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .settings-content {
    flex: 1;
    min-width: 0;
  }

  .content-section {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-xl;
  }

  .section-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-lg;
  }

  .provider-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  .provider-card {
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    transition: all $transition-base ease;

    &:hover {
      border-color: rgba($primary-color, 0.3);
      box-shadow: $shadow-sm;
    }

    &.configured {
      border-left: 4px solid $success;
    }

    &.unconfigured {
      border-left: 4px solid $text-tertiary;
      opacity: 0.8;
    }
  }

  .provider-header {
    margin-bottom: $spacing-md;
  }

  .provider-info {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .provider-icon {
    width: 48px;
    height: 48px;
    border-radius: $border-radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: $bg-tertiary;

    &--openai {
      background: rgba(25, 195, 125, 0.1);
    }

    &--anthropic {
      background: rgba(155, 89, 182, 0.1);
    }

    &--ollama {
      background: rgba(52, 152, 219, 0.1);
    }

    &--alibaba {
      background: rgba(255, 107, 53, 0.1);
    }
  }

  .provider-details {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .provider-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .provider-status {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    padding: 2px 8px;
    border-radius: $border-radius-sm;

    &.configured {
      color: $success;
      background: rgba($success, 0.1);
    }

    &.unconfigured {
      color: $text-tertiary;
      background: $bg-tertiary;
    }
  }

  .provider-body {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding: $spacing-md 0;
    border-top: 1px solid $border-color-light;
    border-bottom: 1px solid $border-color-light;
    margin-bottom: $spacing-md;
  }

  .info-row {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
  }

  .info-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    min-width: 80px;
    flex-shrink: 0;
  }

  .info-value {
    font-size: $font-size-sm;
    color: $text-primary;
    word-break: break-all;

    &.masked {
      font-family: monospace;
      background: $bg-tertiary;
      padding: 2px 8px;
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
  }

  .provider-description {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin: 0;
  }

  .provider-actions {
    display: flex;
    gap: $spacing-sm;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
        border-color: $primary-light;
      }
    }

    &.danger:hover {
      border-color: $error;
      color: $error;
    }

    &.testing {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid $border-color-base;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .add-provider-section {
    margin-top: $spacing-xl;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .add-provider-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-md;
    background: transparent;
    border: 2px dashed $border-color-base;
    border-radius: $border-radius-lg;
    color: $text-secondary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: rgba($primary-color, 0.02);
    }
  }
</style>
