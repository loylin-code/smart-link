<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart } from '@antv/g2'
import type { VisConfig } from '../../types'

interface Props {
  data: VisConfig
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
})

// Refs
const chartContainerRef = ref<HTMLElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const isInitialized = ref(false)

// Computed
const chartTitle = computed(() => props.data.title ?? 'Chart Detail')
const chartType = computed(() => props.data.type)
const chartData = computed(() => props.data.data)
const dataCount = computed(() => chartData.value.length)

// Calculate statistics summary
const statistics = computed(() => {
  const data = chartData.value
  if (!data.length) return null

  const yField = props.data.yField ?? props.data.valueField ?? 'value'
  const values = data.map((item: Record<string, unknown>) => {
    const val = item[yField] as number | undefined
    return typeof val === 'number' ? val : 0
  })

  const sum = values.reduce((a: number, b: number) => a + b, 0)
  const avg = sum / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)

  return { sum, avg: Math.round(avg * 100) / 100, max, min, count: values.length }
})

// Table columns
const tableColumns = computed(() => {
  if (!chartData.value.length) return []
  return Object.keys(chartData.value[0]).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1)
  }))
})

// Initialize chart - only once
const initChart = async () => {
  if (isInitialized.value) {
    console.log('[ChartDetail] Already initialized, skipping')
    return
  }

  // Mark as initialized immediately to prevent re-entry
  isInitialized.value = true

  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))

  if (!chartContainerRef.value) {
    console.log('[ChartDetail] Container not ready')
    isInitialized.value = false
    return
  }

  const container = chartContainerRef.value
  // Use a fallback width if container is not yet sized
  const width = container.clientWidth || 400

  console.log('[ChartDetail] Initializing chart, width:', width, 'type:', props.data.type)

  const theme = props.theme === 'dark' ? 'classicDark' : 'classic'
  const config = props.data

  try {
    chartInstance.value = new Chart({
      container,
      width,
      height: 300,
      theme,
      autoFit: false
    })

    const xField = config.xField ?? 'category'
    const yField = config.yField ?? 'value'
    const colorField = config.colorField ?? config.categoryField

    switch (config.type) {
      case 'line':
        const line = chartInstance.value
          .line()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
          .style('smooth', config.smooth ?? false)
          .style('lineWidth', 2)

        if (colorField) {
          line.encode('color', colorField)
        }

        const point = chartInstance.value
          .point()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
          .style('r', 3)

        if (colorField) {
          point.encode('color', colorField)
        }
        break

      case 'pie':
        chartInstance.value.coordinate({ type: 'polar', innerRadius: 0.6 })
        const pieInterval = chartInstance.value
          .interval()
          .data(config.data)
          .encode('y', config.angleField ?? 'value')
          .transform({ type: 'stackY' })
          .legend(true)

        if (colorField) {
          pieInterval.encode('color', colorField)
        }
        break

      case 'bar':
        const barInterval = chartInstance.value
          .interval()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
          .style('radius', 4)

        if (colorField) {
          barInterval.encode('color', colorField)
        }
        break

      default:
        chartInstance.value
          .interval()
          .data(config.data)
          .encode('x', xField)
          .encode('y', yField)
    }

    chartInstance.value.render()
    console.log('[ChartDetail] Chart rendered successfully')
  } catch (e) {
    console.error('[ChartDetail] Error:', e)
    isInitialized.value = false
  }
}

// Lifecycle - only init on mount, no watch
onMounted(() => {
  console.log('[ChartDetail] onMounted')
  initChart()
})

onUnmounted(() => {
  console.log('[ChartDetail] onUnmounted')
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
  isInitialized.value = false
})

// Export
const exportImage = () => {
  if (!chartInstance.value) return
  const context = chartInstance.value.getContext()
  const canvas = context?.canvas?.getConfig?.()?.canvas as unknown as HTMLCanvasElement | undefined
  if (canvas) {
    const link = document.createElement('a')
    link.download = `${chartTitle.value}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
}

defineExpose({ exportImage })
</script>

<template>
  <div class="chart-detail" :class="`theme-${theme}`">
    <!-- Header -->
    <header class="chart-detail-header">
      <h2 class="chart-title">{{ chartTitle }}</h2>
      <div class="chart-meta">
        <span class="chart-type-badge">{{ chartType }}</span>
        <span class="data-count">{{ dataCount }} items</span>
      </div>
      <button class="export-btn" @click="exportImage">
        Export PNG
      </button>
    </header>

    <!-- Large Chart -->
    <section class="chart-section">
      <div ref="chartContainerRef" class="chart-container"></div>
    </section>

    <!-- Statistics Summary -->
    <section v-if="statistics" class="statistics-section">
      <h3 class="section-title">Statistics Summary</h3>
      <div class="statistics-grid">
        <div class="stat-item">
          <span class="stat-label">Sum</span>
          <span class="stat-value">{{ statistics.sum }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Average</span>
          <span class="stat-value">{{ statistics.avg }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Max</span>
          <span class="stat-value">{{ statistics.max }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Min</span>
          <span class="stat-value">{{ statistics.min }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Count</span>
          <span class="stat-value">{{ statistics.count }}</span>
        </div>
      </div>
    </section>

    <!-- Data Table -->
    <section class="data-table-section">
      <h3 class="section-title">Data Table</h3>
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in tableColumns" :key="col.key">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in chartData" :key="rowIndex">
              <td v-for="col in tableColumns" :key="col.key">
                {{ row[col.key] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.chart-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #ffffff;
  height: auto;
  max-height: 100%;
  overflow: visible;
}

.chart-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.chart-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-type-badge {
  padding: 3px 10px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.data-count {
  color: #6b7280;
  font-size: 12px;
}

.export-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.export-btn:hover {
  background: #2563eb;
}

.chart-section {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.chart-container {
  width: 100%;
  height: 300px;
  max-height: 300px;
  background: #f9fafb;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.statistics-section {
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  flex-shrink: 0;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.data-table-section {
  flex-shrink: 0;
}

.data-table-wrapper {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.data-table th {
  padding: 8px 12px;
  background: #f9fafb;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 6px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: #f9fafb;
}

/* Dark theme */
.chart-detail.theme-dark {
  background: #1f2937;
}

.theme-dark .chart-detail-header {
  border-bottom-color: #374151;
}

.theme-dark .chart-title {
  color: #f9fafb;
}

.theme-dark .chart-type-badge {
  background: #1e3a5f;
  color: #60a5fa;
}

.theme-dark .data-count {
  color: #9ca3af;
}

.theme-dark .chart-section {
  border-color: #374151;
}

.theme-dark .chart-container {
  background: #111827;
}

.theme-dark .section-title {
  color: #e5e7eb;
}

.theme-dark .statistics-section {
  background: #111827;
}

.theme-dark .stat-label {
  color: #9ca3af;
}

.theme-dark .stat-value {
  color: #f9fafb;
}

.theme-dark .data-table-wrapper {
  border-color: #374151;
}

.theme-dark .data-table th {
  background: #374151;
  color: #e5e7eb;
  border-bottom-color: #4b5563;
}

.theme-dark .data-table td {
  border-bottom-color: #374151;
  color: #f9fafb;
}

.theme-dark .data-table tr:hover td {
  background: #374151;
}
</style>