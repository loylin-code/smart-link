<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    title: string
    value: number | string
    icon: string
    trend?: number
    trendLabel?: string
    status?: 'default' | 'success' | 'warning' | 'error'
  }

  const props = withDefaults(defineProps<Props>(), {
    trend: undefined,
    trendLabel: '',
    status: 'default'
  })

  const trendClass = computed(() => {
    if (props.trend === undefined) return ''
    if (props.trend > 0) return 'trend--up'
    if (props.trend < 0) return 'trend--down'
    return 'trend--neutral'
  })

  const statusClass = computed(() => {
    return `stat-card--${props.status}`
  })
</script>

<template>
  <div class="stat-card" :class="statusClass">
    <div class="stat-card__icon">
      <span class="icon">{{ icon }}</span>
    </div>
    <div class="stat-card__content">
      <div class="stat-card__title">{{ title }}</div>
      <div class="stat-card__value">{{ value }}</div>
      <div v-if="trend !== undefined || trendLabel" class="stat-card__trend" :class="trendClass">
        <span v-if="trend !== undefined" class="trend-icon">
          {{ trend > 0 ? '↑' : trend < 0 ? '↓' : '−' }}
        </span>
        <span class="trend-text">{{ trendLabel }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/assets/styles/variables' as *;

  .stat-card {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: $bg-surface;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-card;
    transition: all $transition-base $ease-out;

    &:hover {
      box-shadow: $shadow-card-hover;
      transform: translateY(-2px);
    }

    &--success {
      border-color: $success;
      background: linear-gradient(135deg, $bg-surface 0%, $success-bg 100%);
    }

    &--warning {
      border-color: $warning;
      background: linear-gradient(135deg, $bg-surface 0%, $warning-bg 100%);
    }

    &--error {
      border-color: $error;
      background: linear-gradient(135deg, $bg-surface 0%, $error-bg 100%);
    }
  }

  .stat-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: $border-radius-md;
    background: $primary-muted;
    flex-shrink: 0;

    .icon {
      font-size: $font-size-2xl;
    }
  }

  .stat-card__content {
    flex: 1;
    min-width: 0;
  }

  .stat-card__title {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  .stat-card__value {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    line-height: $line-height-tight;
    margin-bottom: $spacing-xs;
  }

  .stat-card__trend {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-tertiary;

    .trend-icon {
      font-size: $font-size-xs;
    }

    &.trend--up {
      color: $success;
    }

    &.trend--down {
      color: $error;
    }

    &.trend--neutral {
      color: $text-tertiary;
    }
  }
</style>
