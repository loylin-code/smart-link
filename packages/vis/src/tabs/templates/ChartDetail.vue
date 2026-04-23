<script setup lang="ts">
import { computed, ref } from 'vue'
import type { VisConfig } from '../../types'

interface Props {
  data: VisConfig
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
})

// Chart metadata
const chartTitle = computed(() => props.data.title ?? '图表详情')
const chartType = computed(() => props.data.type)
const chartData = computed<Record<string, unknown>[]>(() => (props.data.data as Record<string, unknown>[]) ?? [])
const dataCount = computed(() => chartData.value.length)

// Field names
const xField = computed(() => props.data.xField ?? 'category')
const yField = computed(() => props.data.yField ?? 'value')

// Type color mapping for Hero Header
const typeColors = computed(() => {
  const colors: Record<string, { bg: string; border: string; accent: string }> = {
    line: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', accent: '#2563eb' },
    bar: { bg: 'rgba(5, 150, 105, 0.08)', border: '#059669', accent: '#047857' },
    pie: { bg: 'rgba(217, 119, 6, 0.08)', border: '#d97706', accent: '#b45309' },
    area: { bg: 'rgba(139, 92, 246, 0.08)', border: '#8b5cf6', accent: '#7c3aed' },
  }
  return colors[chartType.value] ?? colors.line
})

// Get value helper
const getYValue = (item: Record<string, unknown>): number => {
  const val = item[yField.value]
  return typeof val === 'number' ? val : 0
}

// Statistics
const statistics = computed(() => {
  const data = chartData.value
  if (!data.length) return null

  const values: number[] = data.map(getYValue)
  const sum = values.reduce((a: number, b: number): number => a + b, 0)
  const avg = sum / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)

  return { sum, avg: Math.round(avg * 100) / 100, max, min, count: values.length }
})

// Max value for scaling
const maxValue = computed(() => {
  const values: number[] = chartData.value.map(getYValue)
  return Math.max(...values, 1)
})

// Table columns
const tableColumns = computed(() => {
  if (!chartData.value.length) return []
  const keys = Object.keys(chartData.value[0])
  return keys.map(key => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1) }))
})

// Table collapse state
const tableExpanded = ref(true)
const toggleTable = () => tableExpanded.value = !tableExpanded.value

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 10000) return `${Math.round(num / 1000)}K`
  return num.toString()
}
</script>

<template>
  <div class="chart-detail" :class="[`theme-${theme}`, `type-${chartType}`]">
    <!-- Hero Header - Type color gradient background -->
    <header class="chart-header" :style="{ background: typeColors.bg, borderBottomColor: typeColors.border }">
      <h2 class="chart-title">{{ chartTitle }}</h2>
      <div class="chart-meta">
        <span class="type-badge" :style="{ background: typeColors.border }">{{ chartType }}</span>
        <span class="count-badge">{{ dataCount }} 条数据</span>
      </div>
    </header>

    <!-- Chart Visualization -->
    <section class="chart-section">
      <!-- Line Chart (SVG) -->
      <div v-if="chartType === 'line'" class="line-chart">
        <svg viewBox="0 0 580 280" preserveAspectRatio="xMidYMid meet">
          <!-- Grid Lines -->
          <line v-for="i in 5" :key="i" x1="40" :y1="i * 48" x2="560" :y2="i * 48" stroke="#e5e7eb" stroke-dasharray="4 2" />
          <!-- X Axis Labels -->
          <text
            v-for="(item, idx) in chartData"
            :key="'label-' + idx"
            :x="40 + idx * (520 / Math.max(chartData.length - 1, 1))"
            y="270"
            text-anchor="middle"
            fill="#94a3b8"
            font-size="11"
          >
            {{ item[xField] }}
          </text>
          <!-- Line Path -->
          <polyline
            :points="chartData.map((item, idx) =>
              `${40 + idx * (520 / Math.max(chartData.length - 1, 1))},${280 - getYValue(item) * 200 / maxValue}`
            ).join(' ')"
            fill="none"
            :stroke="typeColors.border"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Data Points -->
          <circle
            v-for="(item, idx) in chartData"
            :key="'point-' + idx"
            :cx="40 + idx * (520 / Math.max(chartData.length - 1, 1))"
            :cy="280 - getYValue(item) * 200 / maxValue"
            r="5"
            :fill="typeColors.border"
            stroke="#fff"
            stroke-width="2"
            class="chart-point"
          />
        </svg>
      </div>

      <!-- Bar Chart (CSS) -->
      <div v-else-if="chartType === 'bar'" class="bar-chart">
        <div v-for="(item, idx) in chartData" :key="idx" class="bar-row">
          <span class="bar-label">{{ item[xField] }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ width: `${getYValue(item) / maxValue * 100}%`, background: typeColors.border }"
            >
              <span>{{ formatNumber(getYValue(item)) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie Chart (CSS) -->
      <div v-else-if="chartType === 'pie'" class="pie-chart">
        <div v-for="(item, idx) in chartData" :key="idx" class="pie-row" :style="{ background: idx % 2 === 0 ? typeColors.border : typeColors.accent }">
          <span class="pie-label">{{ item[xField] || item.category }}</span>
          <span class="pie-value">{{ Math.round(getYValue(item) / (statistics?.sum ?? 1) * 100) }}%</span>
        </div>
      </div>

      <!-- Fallback -->
      <div v-else class="fallback">
        <p>图表类型: {{ chartType }}</p>
        <p>数据条数: {{ dataCount }}</p>
      </div>
    </section>

    <!-- Statistics Grid - Type color left border -->
    <section v-if="statistics" class="stats-section">
      <h3>统计摘要</h3>
      <div class="stats-grid">
        <div class="stat-item" :style="{ borderLeftColor: typeColors.border }">
          <span class="label">总和</span>
          <span class="value">{{ formatNumber(statistics.sum) }}</span>
        </div>
        <div class="stat-item" :style="{ borderLeftColor: typeColors.border }">
          <span class="label">平均</span>
          <span class="value">{{ statistics.avg }}</span>
        </div>
        <div class="stat-item" :style="{ borderLeftColor: typeColors.border }">
          <span class="label">最大</span>
          <span class="value">{{ formatNumber(statistics.max) }}</span>
        </div>
        <div class="stat-item" :style="{ borderLeftColor: typeColors.border }">
          <span class="label">最小</span>
          <span class="value">{{ formatNumber(statistics.min) }}</span>
        </div>
        <div class="stat-item" :style="{ borderLeftColor: typeColors.border }">
          <span class="label">数量</span>
          <span class="value">{{ statistics.count }}</span>
        </div>
      </div>
    </section>

    <!-- Data Table (Collapsible) -->
    <section class="table-section">
      <div class="table-header" @click="toggleTable">
        <h3>数据表格</h3>
        <svg class="table-toggle-icon" :class="{ collapsed: !tableExpanded }" viewBox="0 0 24 24" fill="none">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div v-show="tableExpanded" class="table-content">
        <table>
          <thead>
            <tr>
              <th v-for="col in tableColumns" :key="col.key">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in chartData" :key="idx">
              <td v-for="col in tableColumns" :key="col.key">{{ row[col.key] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chart-detail {
  padding: 0;
  background: var(--bg-primary, #fff);
  overflow-y: auto;
  height: 100%;
}

/* Hero Header */
.chart-header {
  padding: 20px 24px;
  border-bottom: 3px solid;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #0f172a);
}

.chart-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.type-badge {
  padding: 4px 12px;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.count-badge {
  color: var(--text-secondary, #6b7280);
  font-size: 12px;
}

/* Chart Section */
.chart-section {
  padding: 16px 24px;
  background: var(--bg-tertiary, #f9fafb);
  border-radius: 0;
  margin: 0;
}

.line-chart svg {
  width: 100%;
  height: 280px;
  display: block;
}

.chart-point {
  transition: r 0.2s ease;
  cursor: pointer;
}

.chart-point:hover {
  r: 8;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 80px;
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 24px;
  background: var(--bg-elevated, #f3f4f6);
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding-left: 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  transition: width 0.3s ease;
}

.pie-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pie-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
}

.pie-label {
  font-weight: 500;
}

.pie-value {
  font-weight: 600;
}

.fallback {
  text-align: center;
  color: var(--text-tertiary, #6b7280);
  padding: 24px;
}

/* Statistics Section */
.stats-section {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color-base, #e5e7eb);
}

.stats-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  margin: 0 0 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.stat-item {
  padding: 12px 16px;
  background: var(--bg-surface, #fff);
  border-left: 3px solid;
  border-radius: 0 8px 8px 0;
}

.stat-item .label {
  display: block;
  font-size: 11px;
  color: var(--text-tertiary, #94a3b8);
  margin-bottom: 4px;
}

.stat-item .value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
}

/* Table Section */
.table-section {
  padding: 16px 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 8px 0;
}

.table-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #0f172a);
  margin: 0;
}

.table-toggle-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary, #6b7280);
  transition: transform 0.2s ease;
}

.table-toggle-icon.collapsed {
  transform: rotate(-90deg);
}

.table-content {
  margin-top: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th {
  padding: 10px 12px;
  background: var(--bg-tertiary, #f9fafb);
  text-align: left;
  border-bottom: 2px solid var(--border-color-base, #e5e7eb);
  font-weight: 600;
  color: var(--text-primary, #0f172a);
}

td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color-light, #f3f4f6);
  color: var(--text-secondary, #475569);
}

tbody tr:hover td {
  background: var(--bg-overlay, rgba(15, 23, 42, 0.04));
}

/* Dark Theme */
.theme-dark {
  background: var(--bg-primary, #1f2937);
  color: var(--text-primary, #f9fafb);
}

.theme-dark .chart-header {
  border-bottom-color: var(--type-border);
}

.theme-dark .chart-title {
  color: var(--text-primary, #f9fafb);
}

.theme-dark .chart-section {
  background: var(--bg-surface, #111827);
}

.theme-dark .bar-track {
  background: var(--bg-tertiary, #374151);
}

.theme-dark .stats-section {
  border-top-color: var(--border-color-base, #374151);
}

.theme-dark .stat-item {
  background: var(--bg-surface, #1f2937);
}

.theme-dark .stat-item .value {
  color: var(--text-primary, #f9fafb);
}

.theme-dark th {
  background: var(--bg-tertiary, #374151);
  color: var(--text-primary, #f9fafb);
}

.theme-dark td {
  color: var(--text-secondary, #e5e7eb);
  border-bottom-color: var(--border-color-light, #374151);
}
</style>