<template>
  <div class="model-management">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('model.management.title') }}</h1>
        <span class="page-desc">{{ t('model.management.description') }}</span>
      </div>
      <div class="header-right">
        <button class="create-btn" @click="handleAddModel">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ t('model.management.addModel') }}</span>
        </button>
      </div>
    </div>

    <!-- Provider Filter -->
    <div class="filter-tags">
      <button
        :class="['filter-tag', { active: !modelStore.filter.provider }]"
        @click="setFilter('provider', undefined)"
      >
        {{ t('model.filters.all') }}
      </button>
      <button
        v-for="provider in providers"
        :key="provider.value"
        :class="['filter-tag', { active: modelStore.filter.provider === provider.value }]"
        @click="setFilter('provider', provider.value)"
      >
        {{ provider.label }}
      </button>
    </div>

    <!-- Type Filter -->
    <div class="filter-tags">
      <button
        :class="['filter-tag', { active: !modelStore.filter.type }]"
        @click="setFilter('type', undefined)"
      >
        {{ t('model.filters.all') }}
      </button>
      <button
        v-for="type in modelTypes"
        :key="type.value"
        :class="['filter-tag', { active: modelStore.filter.type === type.value }]"
        @click="setFilter('type', type.value)"
      >
        <span v-if="type.icon" class="tag-icon">{{ type.icon }}</span>
        {{ type.label }}
      </button>
    </div>

    <!-- Status Filter -->
    <div class="filter-tags">
      <button
        :class="['filter-tag', { active: !modelStore.filter.status }]"
        @click="setFilter('status', undefined)"
      >
        {{ t('model.filters.all') }}
      </button>
      <button
        v-for="status in modelStatuses"
        :key="status.value"
        :class="['filter-tag', status.value, { active: modelStore.filter.status === status.value }]"
        @click="setFilter('status', status.value)"
      >
        <span class="status-dot" :class="status.value"></span>
        {{ status.label }}
      </button>
    </div>

    <!-- Section Header: Title + Search -->
    <div class="section-header">
      <h2 class="section-title">
        {{ t('model.management.listTitle')
        }}<span class="title-count">({{ filteredModels.length }})</span>
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
          v-model="modelStore.filter.keyword"
          type="text"
          class="search-input"
          :placeholder="t('model.management.searchPlaceholder')"
        />
      </div>
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
        <div class="card-actions" @click.stop>
          <button class="action-btn primary" @click="handleTest(model)">
            <span class="btn-icon">🧪</span>
            <span>{{ t('model.actions.test') }}</span>
          </button>
          <button class="action-btn" @click="handleConfig(model)" :title="t('common.edit')">
            <span class="btn-icon">⚙️</span>
          </button>
          <button class="action-btn" @click="handleStats(model)" :title="t('model.actions.stats')">
            <span class="btn-icon">📊</span>
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
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .page-title {
      display: block;
      font-size: $font-size-3xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      margin: 0;
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
    margin-bottom: $spacing-lg;
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

  .search-icon {
    position: absolute;
    left: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    pointer-events: none;
  }

  .search-input {
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
  // 模型卡片网格
  // ================================
  .model-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .model-card {
    position: relative;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
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
  // 卡片头部
  // ================================
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

  // ================================
  // 模型信息
  // ================================
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

  // ================================
  // 规格信息
  // ================================
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

  // ================================
  // 定价信息
  // ================================
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

  // ================================
  // 能力标签
  // ================================
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

    .btn-icon {
      font-size: 12px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: transparent;
      color: #fff;

      &:hover {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
      }
    }
  }

  // ================================
  // 空状态
  // ================================
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

  // ================================
  // 分页
  // ================================
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
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.active {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // ================================
  // 响应式
  // ================================
  @media (max-width: 1200px) {
    .model-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .model-management {
      padding: $spacing-md;
    }

    .model-grid {
      grid-template-columns: 1fr;
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
  }
</style>
