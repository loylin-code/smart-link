<template>
  <div v-if="title" class="data-summary">
    <div class="summary-header">
      <span class="summary-title">{{ title }}</span>
      <span class="summary-badge" :class="`badge--${status}`">{{ statusText }}</span>
    </div>

    <div v-if="items && items.length > 0" class="summary-grid">
      <div v-for="(item, index) in items" :key="index" class="summary-item">
        <div class="item-header">
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-label">{{ item.label }}</span>
        </div>
        <div class="item-value">
          <span class="value-main">{{ item.value }}</span>
          <span v-if="item.unit" class="value-unit">{{ item.unit }}</span>
        </div>
        <div v-if="item.change" class="item-change" :class="item.changeClass || ''">
          {{ item.change }}
        </div>
      </div>
    </div>

    <div v-if="description" class="summary-desc">
      <svg viewBox="0 0 24 24" fill="none" class="info-icon">
        <path
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface SummaryItem {
    icon: string
    label: string
    value: string | number
    unit?: string
    change?: string
    changeClass?: 'positive' | 'negative' | 'neutral'
  }

  interface Props {
    title: string
    items?: SummaryItem[]
    status?: 'success' | 'warning' | 'danger' | 'info'
    description?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    status: 'info'
  })

  const statusText = computed(() => {
    const map: Record<string, string> = {
      success: '正常',
      warning: '警告',
      danger: '异常',
      info: '信息'
    }
    return map[props.status]
  })
</script>

<style scoped lang="scss">
  .data-summary {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    margin: 8px 0;
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .summary-title {
    font-weight: 600;
    color: #1f2937;
  }

  .summary-badge {
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;

    &.badge--success {
      background: #d1fae5;
      color: #065f46;
    }

    &.badge--warning {
      background: #fef3c7;
      color: #92400e;
    }

    &.badge--danger {
      background: #fee2e2;
      color: #991b1b;
    }

    &.badge--info {
      background: #dbeafe;
      color: #1e40af;
    }
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    padding: 16px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .item-icon {
    font-size: 16px;
  }

  .item-label {
    font-size: 12px;
    color: #6b7280;
  }

  .item-value {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .value-main {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }

  .value-unit {
    font-size: 12px;
    color: #9ca3af;
  }

  .item-change {
    font-size: 11px;

    &.positive {
      color: #10b981;
    }

    &.negative {
      color: #ef4444;
    }

    &.neutral {
      color: #6b7280;
    }
  }

  .summary-desc {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: #f9fafb;
    font-size: 13px;
    color: #4b5563;
    border-top: 1px solid #f3f4f6;
  }

  .info-icon {
    width: 18px;
    height: 18px;
    color: #3b82f6;
    flex-shrink: 0;
  }
</style>
