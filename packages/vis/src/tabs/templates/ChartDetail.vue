<script setup lang="ts">
import { computed } from 'vue'
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
</script>

<template>
  <div class="chart-detail" :class="`theme-${theme}`">
    <!-- Header -->
    <header class="chart-header">
      <h2 class="chart-title">{{ chartTitle }}</h2>
      <div class="chart-meta">
        <span class="type-badge">{{ chartType }}</span>
        <span class="count-badge">{{ dataCount }} 条数据</span>
      </div>
    </header>

    <!-- Chart Visualization -->
    <section class="chart-section">
      <!-- Line Chart -->
      <div v-if="chartType === 'line'" class="line-chart">
        <svg viewBox="0 0 580 280">
          <!-- Grid -->
          <line v-for="i in 5" :key="i" x1="40" :y1="i * 48" x2="560" :y2="i * 48" stroke="#e5e7eb" />
          <!-- Line -->
          <polyline
            :points="chartData.map((item: Record<string, unknown>, idx: number) => 
              `${40 + idx * (520 / Math.max(chartData.length - 1, 1))},${280 - getYValue(item) * 200 / maxValue}`
            ).join(' ')"
            fill="none" stroke="#3b82f6" stroke-width="2"
          />
          <!-- Points -->
          <circle
            v-for="(item, idx) in chartData"
            :key="idx"
            :cx="40 + idx * (520 / Math.max(chartData.length - 1, 1))"
            :cy="280 - getYValue(item) * 200 / maxValue"
            r="4" fill="#3b82f6"
          />
        </svg>
      </div>

      <!-- Bar Chart -->
      <div v-else-if="chartType === 'bar'" class="bar-chart">
        <div v-for="(item, idx) in chartData" :key="idx" class="bar-row">
          <span class="bar-label">{{ item[xField] }}</span>
          <div class="bar-track">
            <div 
              class="bar-fill"
              :style="{ width: `${getYValue(item) / maxValue * 100}%` }"
            >
              <span>{{ getYValue(item) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie Chart -->
      <div v-else-if="chartType === 'pie'" class="pie-chart">
        <div v-for="(item, idx) in chartData" :key="idx" class="pie-row">
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

    <!-- Statistics -->
    <section v-if="statistics" class="stats-section">
      <h3>统计摘要</h3>
      <div class="stats-grid">
        <div><span class="label">总和</span><span class="value">{{ statistics.sum }}</span></div>
        <div><span class="label">平均</span><span class="value">{{ statistics.avg }}</span></div>
        <div><span class="label">最大</span><span class="value">{{ statistics.max }}</span></div>
        <div><span class="label">最小</span><span class="value">{{ statistics.min }}</span></div>
        <div><span class="label">数量</span><span class="value">{{ statistics.count }}</span></div>
      </div>
    </section>

    <!-- Data Table -->
    <section class="table-section">
      <h3>数据表格</h3>
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
    </section>
  </div>
</template>

<style scoped>
.chart-detail {
  padding: 16px;
  background: #fff;
  overflow-y: auto;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.chart-meta {
  display: flex;
  gap: 8px;
}

.type-badge {
  padding: 2px 8px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 12px;
}

.count-badge {
  color: #6b7280;
  font-size: 12px;
}

.chart-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.line-chart svg {
  width: 100%;
  height: 280px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 80px;
  font-size: 12px;
  color: #6b7280;
}

.bar-track {
  flex: 1;
  height: 24px;
  background: #f3f4f6;
  border-radius: 4px;
}

.bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding-left: 8px;
  color: white;
  font-size: 12px;
}

.pie-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pie-row {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
}

.fallback {
  text-align: center;
  color: #6b7280;
}

.stats-section h3 {
  font-size: 14px;
  margin: 0 0 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.stats-grid div {
  text-align: center;
}

.label {
  display: block;
  font-size: 11px;
  color: #6b7280;
}

.value {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.table-section h3 {
  font-size: 14px;
  margin: 0 0 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th {
  padding: 8px;
  background: #f9fafb;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 6px 8px;
  border-bottom: 1px solid #f3f4f6;
}

.theme-dark {
  background: #1f2937;
  color: #f9fafb;
}

.theme-dark .chart-header {
  border-bottom-color: #374151;
}

.theme-dark .chart-section {
  background: #111827;
}

.theme-dark th {
  background: #374151;
}
</style>