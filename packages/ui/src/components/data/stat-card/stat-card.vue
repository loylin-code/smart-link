<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    title: string
    value: string | number
    unit?: string
    trend?: 'up' | 'down' | 'flat'
    trendValue?: string
    icon?: string
    color?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    unit: '',
    trend: 'flat',
    trendValue: '',
    icon: '',
    color: '#3b82f6'
  })

  const trendColors: Record<string, string> = {
    up: '#10b981',
    down: '#ef4444',
    flat: '#9ca3af'
  }

  const trendIcons: Record<string, string> = {
    up: '↑',
    down: '↓',
    flat: '→'
  }

  const formattedValue = computed(() => {
    const num = typeof props.value === 'number' ? props.value : parseFloat(props.value)
    if (isNaN(num)) return props.value

    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`
    }
    return String(props.value)
  })

  const trendColor = computed(() => trendColors[props.trend])
  const trendIcon = computed(() => trendIcons[props.trend])
</script>

<template>
  <div class="sl-stat-card" :style="{ '--sl-stat-color': color }">
    <div class="sl-stat-card__header">
      <span v-if="icon" class="sl-stat-card__icon">{{ icon }}</span>
      <span class="sl-stat-card__title">{{ title }}</span>
    </div>

    <div class="sl-stat-card__body">
      <div class="sl-stat-card__value">
        {{ formattedValue }}
        <span v-if="unit" class="sl-stat-card__unit">{{ unit }}</span>
      </div>

      <div v-if="trend || trendValue" class="sl-stat-card__trend" :style="{ color: trendColor }">
        <span v-if="trend" class="sl-stat-card__trend-icon">{{ trendIcon }}</span>
        <span v-if="trendValue" class="sl-stat-card__trend-value">{{ trendValue }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .sl-stat-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    &__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    &__icon {
      font-size: 20px;
      line-height: 1;
    }

    &__title {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &__value {
      font-size: 32px;
      font-weight: 700;
      color: var(--sl-stat-color);
      line-height: 1;
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    &__unit {
      font-size: 16px;
      font-weight: 500;
      color: #6b7280;
    }

    &__trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
    }

    &__trend-icon {
      font-size: 16px;
      line-height: 1;
    }

    &__trend-value {
      color: inherit;
    }
  }
</style>
