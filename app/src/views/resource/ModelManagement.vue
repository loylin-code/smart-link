<template>
  <div class="model-management">
    <div class="page-header">
      <div class="header-left">
        <span class="header-icon">🤖</span>
        <h1 class="page-title">{{ t('model.management.title') }}</h1>
      </div>
      <button class="add-btn" @click="handleAddModel">
        <span class="btn-icon">➕</span>
        <span>{{ t('model.management.addModel') }}</span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" class="search-icon">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
          <path
            d="M21 21L16.65 16.65"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <input
          v-model="modelStore.filter.keyword"
          type="text"
          class="search-input"
          :placeholder="t('model.management.searchPlaceholder')"
        />
      </div>
    </div>

    <!-- Provider Filter -->
    <div class="filter-section">
      <div class="filter-label">{{ t('model.management.filterByProvider') }}</div>
      <div class="filter-tags">
        <button
          :class="['filter-tag', { active: !modelStore.filter.provider }]"
          @click="setFilter('provider', undefined)"
        >
          {{ t('model.filters.all') }}
          <span v-if="!modelStore.filter.provider" class="tag-indicator">●</span>
        </button>
        <button
          v-for="provider in providers"
          :key="provider.value"
          :class="['filter-tag', { active: modelStore.filter.provider === provider.value }]"
          @click="setFilter('provider', provider.value)"
        >
          {{ provider.label }}
          <span class="tag-count">{{ getProviderCount(provider.value) }}</span>
          <span v-if="modelStore.filter.provider === provider.value" class="tag-indicator">●</span>
        </button>
      </div>
    </div>

    <!-- Type Filter -->
    <div class="filter-section">
      <div class="filter-label">{{ t('model.management.filterByType') }}</div>
      <div class="filter-tags">
        <button
          :class="['filter-tag', { active: !modelStore.filter.type }]"
          @click="setFilter('type', undefined)"
        >
          {{ t('model.filters.all') }}
          <span v-if="!modelStore.filter.type" class="tag-indicator">●</span>
        </button>
        <button
          v-for="type in modelTypes"
          :key="type.value"
          :class="['filter-tag', { active: modelStore.filter.type === type.value }]"
          @click="setFilter('type', type.value)"
        >
          <span class="type-icon">{{ type.icon }}</span>
          {{ type.label }}
          <span class="tag-count">{{ getTypeCount(type.value) }}</span>
          <span v-if="modelStore.filter.type === type.value" class="tag-indicator">●</span>
        </button>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="filter-section">
      <div class="filter-label">{{ t('model.management.filterByStatus') }}</div>
      <div class="filter-tags">
        <button
          :class="['filter-tag', { active: !modelStore.filter.status }]"
          @click="setFilter('status', undefined)"
        >
          {{ t('model.filters.all') }}
          <span v-if="!modelStore.filter.status" class="tag-indicator">●</span>
        </button>
        <button
          v-for="status in modelStatuses"
          :key="status.value"
          :class="[
            'filter-tag',
            status.value,
            { active: modelStore.filter.status === status.value }
          ]"
          @click="setFilter('status', status.value)"
        >
          <span class="status-dot" :class="status.value"></span>
          {{ status.label }}
          <span class="tag-count">{{ getStatusCount(status.value) }}</span>
          <span v-if="modelStore.filter.status === status.value" class="tag-indicator">●</span>
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="section-divider">
      <span class="divider-text">
        {{ t('model.management.models') }} ({{
          t('model.management.total', { count: filteredModels.length })
        }})
      </span>
    </div>

    <!-- Model Cards Grid -->
    <div v-if="filteredModels.length" class="model-grid">
      <div
        v-for="model in filteredModels"
        :key="model.id"
        class="model-card"
        @click="openDetail(model)"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="model-status">
            <span class="status-indicator" :class="model.status"></span>
          </div>
          <h3 class="model-name">{{ model.name }}</h3>
        </div>

        <!-- Card Divider -->
        <div class="card-divider"></div>

        <!-- Provider & Series -->
        <div class="model-meta">
          <div class="provider-info">
            <span class="provider-icon" :class="model.provider">{{
              getProviderIcon(model.provider)
            }}</span>
            <span class="provider-name">{{ getProviderLabel(model.provider) }}</span>
            <span class="meta-separator">·</span>
            <span class="series-name">{{ model.series }} {{ t('model.card.series') }}</span>
          </div>
          <div class="type-info">
            <span class="type-icon">{{ getTypeIcon(model.type) }}</span>
            <span class="type-name">{{ getTypeLabel(model.type) }}</span>
            <span v-if="hasMultimodal(model)" class="meta-separator">·</span>
            <span v-if="hasMultimodal(model)" class="feature-tag">{{
              t('model.card.multimodal')
            }}</span>
          </div>
        </div>

        <!-- Card Divider -->
        <div class="card-divider"></div>

        <!-- Context & Output -->
        <div class="model-specs">
          <div class="spec-item">
            <span class="spec-label">{{ t('model.card.context') }}:</span>
            <span class="spec-value">{{ formatTokens(model.contextWindow) }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">{{ t('model.card.maxOutput') }}:</span>
            <span class="spec-value">{{ formatTokens(model.maxOutput) }}</span>
          </div>
        </div>

        <!-- Card Divider -->
        <div class="card-divider"></div>

        <!-- Pricing -->
        <div class="model-pricing">
          <div class="pricing-row">
            <span class="pricing-icon">💰</span>
            <span class="pricing-value">
              {{ formatPricing(model.pricing.input, model.pricing.currency, model.pricing.unit) }}
              {{ t('model.card.input') }}
              {{ formatPricing(model.pricing.output, model.pricing.currency, model.pricing.unit) }}
              {{ t('model.card.output') }}
            </span>
          </div>
          <div class="cost-row">
            <span class="cost-icon">📊</span>
            <span class="cost-label">{{ t('model.card.thisMonth') }}:</span>
            <span class="cost-value" :class="{ warning: isOverBudget(model) }">
              {{ formatCurrency(model.stats.monthlyCost, model.pricing.currency) }}
            </span>
            <span v-if="isQuotaExceeded(model)" class="quota-badge">{{
              t('model.card.quotaExceeded')
            }}</span>
          </div>
        </div>

        <!-- Capabilities -->
        <div class="model-capabilities">
          <span
            v-for="cap in visibleCapabilities"
            :key="cap.key"
            class="capability-badge"
            :class="{ enabled: model.capabilities[cap.key] }"
          >
            {{ model.capabilities[cap.key] ? '✅' : '❌' }} {{ cap.label }}
          </span>
        </div>

        <!-- Quick Actions -->
        <div class="card-actions">
          <button class="action-btn" @click.stop="handleTest(model)">
            <span class="btn-icon">🧪</span>
            <span>{{ t('model.actions.test') }}</span>
          </button>
          <button class="action-btn" @click.stop="handleConfig(model)">
            <span class="btn-icon">⚙️</span>
            <span>{{ t('model.actions.config') }}</span>
          </button>
          <button class="action-btn" @click.stop="handleStats(model)">
            <span class="btn-icon">📊</span>
            <span>{{ t('model.actions.stats') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🤖</div>
      <p>{{ t('model.management.noModels') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="filteredModels.length > 0" class="pagination">
      <span class="pagination-info">
        {{
          t('model.pagination.showing', {
            start: 1,
            end: filteredModels.length,
            total: filteredModels.length
          })
        }}
      </span>
      <div class="pagination-controls">
        <button class="page-btn" disabled>&lt;</button>
        <button class="page-btn active">1</button>
        <button class="page-btn" v-if="filteredModels.length > 8">2</button>
        <button class="page-btn" disabled>&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useModelStore } from '@/store/modules/model'
  import type { LLMModel, ModelProvider, ModelType, ModelStatus, ModelCapabilities } from '@/types'

  const router = useRouter()
  const { t } = useI18n()
  const modelStore = useModelStore()

  // Providers
  const providers = [
    { value: 'openai' as ModelProvider, label: 'OpenAI' },
    { value: 'anthropic' as ModelProvider, label: 'Anthropic' },
    { value: 'google' as ModelProvider, label: 'Google' },
    { value: 'alibaba' as ModelProvider, label: t('model.providers.alibaba') },
    { value: 'ollama' as ModelProvider, label: t('model.providers.local') }
  ]

  // Model Types
  const modelTypes = [
    { value: 'chat' as ModelType, label: t('model.types.chat'), icon: '💬' },
    { value: 'completion' as ModelType, label: t('model.types.completion'), icon: '📝' },
    { value: 'image' as ModelType, label: t('model.types.image'), icon: '🖼️' },
    { value: 'audio' as ModelType, label: t('model.types.audio'), icon: '🔊' }
  ]

  // Model Statuses
  const modelStatuses = [
    { value: 'available' as ModelStatus, label: t('model.status.available') },
    { value: 'degraded' as ModelStatus, label: t('model.status.degraded') },
    { value: 'unavailable' as ModelStatus, label: t('model.status.unavailable') },
    { value: 'quota-warning' as ModelStatus, label: t('model.status.quotaWarning') }
  ]

  // Capabilities to show
  const visibleCapabilities = [
    { key: 'vision' as keyof ModelCapabilities, label: 'Vision' },
    { key: 'tools' as keyof ModelCapabilities, label: 'Tools' },
    { key: 'json' as keyof ModelCapabilities, label: 'JSON' }
  ]

  // Computed
  const filteredModels = computed(() => modelStore.filteredModels)

  // Methods
  const setFilter = (key: 'provider' | 'type' | 'status', value: any) => {
    modelStore.setFilter({ [key]: value })
  }

  const getProviderCount = (provider: ModelProvider) => {
    return modelStore.models.filter((m) => m.provider === provider).length
  }

  const getTypeCount = (type: ModelType) => {
    return modelStore.models.filter((m) => m.type === type).length
  }

  const getStatusCount = (status: ModelStatus) => {
    return modelStore.models.filter((m) => m.status === status).length
  }

  const getProviderIcon = (provider: ModelProvider) => {
    const icons: Record<ModelProvider, string> = {
      openai: '🟢',
      anthropic: '🟣',
      google: '🔵',
      alibaba: '🟠',
      ollama: '⚪',
      custom: '⚫'
    }
    return icons[provider] || '⚫'
  }

  const getProviderLabel = (provider: ModelProvider) => {
    const labels: Record<ModelProvider, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      alibaba: t('model.providers.alibaba'),
      ollama: 'Ollama',
      custom: t('model.providers.custom')
    }
    return labels[provider] || provider
  }

  const getTypeIcon = (type: ModelType) => {
    const icons: Record<ModelType, string> = {
      chat: '💬',
      completion: '📝',
      image: '🖼️',
      audio: '🔊'
    }
    return icons[type] || '💬'
  }

  const getTypeLabel = (type: ModelType) => {
    const labels: Record<ModelType, string> = {
      chat: t('model.types.chat'),
      completion: t('model.types.completion'),
      image: t('model.types.image'),
      audio: t('model.types.audio')
    }
    return labels[type] || type
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(0)}M tokens`
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(0)}K tokens`
    }
    return `${tokens} tokens`
  }

  const formatPricing = (price: number, currency: string, unit: string) => {
    const currencySymbol = currency === 'CNY' ? '¥' : '$'
    return `${currencySymbol}${price}/${unit}`
  }

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbol = currency === 'CNY' ? '¥' : '$'
    return `${currencySymbol}${amount.toFixed(2)}`
  }

  const hasMultimodal = (model: LLMModel) => {
    return model.capabilities.vision || model.capabilities.audio || model.capabilities.video
  }

  const isOverBudget = (model: LLMModel) => {
    const monthly = model.config.quota?.monthly
    if (!monthly) return false
    return model.stats.monthlyCost > monthly * 0.8
  }

  const isQuotaExceeded = (model: LLMModel) => {
    const remaining = model.config.quota?.remaining
    if (remaining === undefined) return false
    return remaining <= 0
  }

  const openDetail = (model: LLMModel) => {
    router.push(`/app/tool/models/${model.id}`)
  }

  const handleAddModel = () => {
    // TODO: Open add model dialog
    alert(t('model.management.addModel'))
  }

  const handleTest = async (model: LLMModel) => {
    const result = await modelStore.testConnection(model.id)
    alert(result.message)
  }

  const handleConfig = (model: LLMModel) => {
    openDetail(model)
  }

  const handleStats = (model: LLMModel) => {
    // Navigate to detail page with stats tab focused
    router.push(`/app/tool/models/${model.id}?tab=stats`)
  }
</script>

<style scoped lang="scss">
  .model-management {
    height: 100%;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .header-icon {
    font-size: 28px;
  }

  .page-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    color: white;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: darken(#1890ff, 10%);
    }
  }

  .search-section {
    margin-bottom: $spacing-lg;
  }

  .search-bar {
    position: relative;
    max-width: 600px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: $text-tertiary;
  }

  .search-input {
    width: 100%;
    padding: $spacing-sm $spacing-md $spacing-sm 40px;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;
    transition: all $transition-base ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .filter-section {
    margin-bottom: $spacing-md;
  }

  .filter-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-bottom: $spacing-xs;
    padding-left: $spacing-xs;
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-full;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $text-primary;
    }

    &.active {
      background: rgba(24, 144, 255, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }

    .tag-count {
      font-size: $font-size-xs;
      background: $bg-tertiary;
      padding: 0 6px;
      border-radius: $border-radius-full;
      color: $text-tertiary;
    }

    .tag-indicator {
      font-size: 8px;
      margin-left: 2px;
    }

    .type-icon {
      font-size: 14px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.available {
        background: $success;
      }

      &.degraded {
        background: $warning;
      }

      &.unavailable {
        background: $error;
      }

      &.quota-warning {
        background: $warning-dark;
      }
    }
  }

  .section-divider {
    display: flex;
    align-items: center;
    margin: $spacing-lg 0;
    color: $text-tertiary;
    font-size: $font-size-sm;

    &::before {
      content: '';
      flex: 1;
      height: 1px;
      background: $border-color-light;
      margin-right: $spacing-md;
    }

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: $border-color-light;
      margin-left: $spacing-md;
    }
  }

  .model-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $spacing-lg;
  }

  .model-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.available {
      background: $success;
      box-shadow: 0 0 0 3px rgba($success, 0.2);
    }

    &.degraded {
      background: $warning;
      box-shadow: 0 0 0 3px rgba($warning, 0.2);
    }

    &.unavailable {
      background: $error;
      box-shadow: 0 0 0 3px rgba($error, 0.2);
    }

    &.quota-warning {
      background: $warning-dark;
      box-shadow: 0 0 0 3px rgba($warning-dark, 0.2);
    }
  }

  .model-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .card-divider {
    height: 1px;
    background: $border-color-light;
    margin: $spacing-sm 0;
  }

  .model-meta {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .provider-info,
  .type-info {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .provider-icon {
    font-size: 14px;
  }

  .meta-separator {
    color: $text-tertiary;
  }

  .feature-tag {
    font-size: $font-size-xs;
    color: $primary-color;
    background: rgba($primary-color, 0.1);
    padding: 2px 6px;
    border-radius: $border-radius-sm;
  }

  .model-specs {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .spec-item {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
  }

  .spec-label {
    color: $text-secondary;
  }

  .spec-value {
    color: $text-primary;
    font-weight: $font-weight-medium;
  }

  .model-pricing {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .pricing-row,
  .cost-row {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
  }

  .pricing-icon,
  .cost-icon {
    font-size: 14px;
  }

  .pricing-value {
    color: $text-primary;
  }

  .cost-label {
    color: $text-secondary;
  }

  .cost-value {
    color: $text-primary;
    font-weight: $font-weight-medium;

    &.warning {
      color: $error;
    }
  }

  .quota-badge {
    font-size: $font-size-xs;
    color: $error;
    background: rgba($error, 0.1);
    padding: 2px 6px;
    border-radius: $border-radius-sm;
    margin-left: auto;
  }

  .model-capabilities {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    margin: $spacing-sm 0;
  }

  .capability-badge {
    font-size: $font-size-xs;
    color: $text-tertiary;
    padding: 2px 6px;
    border-radius: $border-radius-sm;

    &.enabled {
      color: $success;
      background: rgba($success, 0.1);
    }
  }

  .card-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-sm;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: $spacing-xs $spacing-sm;
    background: $bg-tertiary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    .btn-icon {
      font-size: 12px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    color: $text-tertiary;

    .empty-icon {
      font-size: 64px;
      margin-bottom: $spacing-md;
    }

    p {
      font-size: $font-size-base;
    }
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: $spacing-xl;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .pagination-info {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .pagination-controls {
    display: flex;
    gap: $spacing-xs;
  }

  .page-btn {
    padding: $spacing-xs $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.active {
      background: $primary-color;
      border-color: $primary-color;
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
