<template>
  <div v-if="title" class="trend-analysis">
    <div class="trend-header">
      <span class="trend-title">{{ title }}</span>
      <div class="trend-period">
        <button
          v-for="p in periods"
          :key="p.value"
          class="period-btn"
          :class="{ active: selectedPeriod === p.value }"
          @click="selectedPeriod = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="summaries && summaries.length > 0" class="summary-cards">
      <div v-for="(summary, index) in summaries" :key="index" class="summary-card">
        <div
          class="summary-icon"
          :style="{
            background: (summary.color || '#3b82f6') + '20',
            color: summary.color || '#3b82f6'
          }"
        >
          <svg v-if="summary.trend === 'up'" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else-if="summary.trend === 'down'" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 7L17 17M17 17H7M17 17V7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="summary-info">
          <span class="summary-label">{{ summary.label }}</span>
          <span class="summary-value">{{ summary.value }}</span>
          <span class="summary-change" :class="summary.trend">
            {{ summary.change }}
          </span>
        </div>
      </div>
    </div>

    <!-- Trend Chart -->
    <div v-if="chartData && chartData.length > 0" class="trend-chart">
      <svg viewBox="0 0 500 180" class="trend-svg">
        <!-- Grid -->
        <g class="grid">
          <line
            v-for="i in 5"
            :key="'h' + i"
            x1="50"
            :y1="20 + (i - 1) * 35"
            x2="480"
            :y2="20 + (i - 1) * 35"
            stroke="#f3f4f6"
          />
        </g>

        <!-- Trend Line -->
        <path
          :d="trendPath"
          fill="none"
          :stroke="chartColor"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- Area -->
        <path :d="areaPath" :fill="chartColor + '20'" />

        <!-- Points -->
        <g class="points">
          <circle
            v-for="(point, index) in chartPoints"
            :key="index"
            :cx="point.x"
            :cy="point.y"
            r="5"
            :fill="chartColor"
            class="chart-point"
            @mouseenter="hoveredPoint = index"
            @mouseleave="hoveredPoint = null"
          />
        </g>
      </svg>

      <div v-if="chartLabels && chartLabels.length > 0" class="chart-labels">
        <span v-for="(label, index) in chartLabels" :key="index">{{ label }}</span>
      </div>
    </div>

    <!-- Key Insights -->
    <div v-if="insights && insights.length > 0" class="insights">
      <div class="insights-header">
        <svg viewBox="0 0 24 24" fill="none" class="insight-icon">
          <path
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>关键洞察</span>
      </div>
      <div class="insights-list">
        <div
          v-for="(insight, index) in insights"
          :key="index"
          class="insight-item"
          :class="insight.type"
        >
          <span class="insight-badge">{{
            insight.type === 'positive' ? '📈' : insight.type === 'negative' ? '📉' : '💡'
          }}</span>
          <span class="insight-text">{{ insight.text }}</span>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="trend-actions">
      <button class="action-btn" @click="handleExport">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        导出报告
      </button>
      <button class="action-btn primary" @click="handleDetail">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" />
          <path
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
        查看详情
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Summary {
    label: string
    value: string
    change: string
    trend: 'up' | 'down' | 'flat'
    color?: string
  }

  interface Insight {
    type: 'positive' | 'negative' | 'neutral'
    text: string
  }

  interface Props {
    title: string
    summaries?: Summary[]
    chartData?: number[]
    chartLabels?: string[]
    insights?: Insight[]
    chartColor?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    summaries: () => [],
    chartData: () => [],
    chartLabels: () => [],
    insights: () => [],
    chartColor: '#3b82f6'
  })

  const periods = [
    { label: '7天', value: '7d' },
    { label: '30天', value: '30d' },
    { label: '90天', value: '90d' }
  ]

  const selectedPeriod = ref('7d')
  const hoveredPoint = ref<number | null>(null)

  const chartPoints = computed(() => {
    const data = props.chartData || []
    if (data.length === 0) return []

    const width = 430
    const height = 140
    const max = Math.max(...data) || 1

    return data.map((value, index) => ({
      x: 50 + (index / Math.max(data.length - 1, 1)) * width,
      y: 20 + height - (value / max) * height
    }))
  })

  const trendPath = computed(() => {
    if (chartPoints.value.length === 0) return ''
    return chartPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  })

  const areaPath = computed(() => {
    const points = chartPoints.value
    if (points.length === 0) return ''
    return `${trendPath.value} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`
  })

  const emit = defineEmits<{
    (e: 'event', data: { type: string; action: string; data?: any }): void
  }>()

  const handleExport = () => {
    emit('event', { type: 'trend', action: 'export' })
  }

  const handleDetail = () => {
    emit('event', { type: 'trend', action: 'detail' })
  }
</script>

<style scoped lang="scss">
  .trend-analysis {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    margin: 8px 0;
  }

  .trend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
  }

  .trend-title {
    font-weight: 600;
    color: #1f2937;
  }

  .trend-period {
    display: flex;
    gap: 4px;
  }

  .period-btn {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e5e7eb;
    }

    &.active {
      background: #3b82f6;
      color: #fff;
    }
  }

  // Summary Cards
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    padding: 16px;
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .summary-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .summary-info {
    display: flex;
    flex-direction: column;
  }

  .summary-label {
    font-size: 12px;
    color: #6b7280;
  }

  .summary-value {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }

  .summary-change {
    font-size: 11px;

    &.up {
      color: #10b981;
    }

    &.down {
      color: #ef4444;
    }

    &.flat {
      color: #6b7280;
    }
  }

  // Trend Chart
  .trend-chart {
    padding: 16px;
  }

  .trend-svg {
    width: 100%;
    height: 180px;
  }

  .chart-point {
    cursor: pointer;
    transition: r 0.2s;

    &:hover {
      r: 7;
    }
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    padding: 8px 50px 0;
    font-size: 11px;
    color: #9ca3af;
  }

  // Insights
  .insights {
    padding: 16px;
    background: #f9fafb;
  }

  .insights-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 600;
    color: #374151;
  }

  .insight-icon {
    width: 18px;
    height: 18px;
    color: #f59e0b;
  }

  .insights-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .insight-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 13px;
    color: #4b5563;
  }

  .insight-badge {
    font-size: 14px;
  }

  // Actions
  .trend-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid #f3f4f6;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    color: #4b5563;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: #9ca3af;
      background: #f9fafb;
    }

    &.primary {
      background: #3b82f6;
      border-color: #3b82f6;
      color: #fff;

      &:hover {
        background: #2563eb;
      }
    }
  }
</style>
