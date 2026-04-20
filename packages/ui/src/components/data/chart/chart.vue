<template>
  <div class="sl-chart" :class="{ 'is-smooth': smooth }">
    <div v-if="title" class="sl-chart__header">
      <h3 class="sl-chart__title">{{ title }}</h3>
    </div>

    <div class="sl-chart__content">
      <!-- 折线图 -->
      <svg
        v-if="chartType === 'line'"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        class="sl-chart__svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- 区域填充 -->
        <path
          v-if="computedLinePath"
          :d="computedAreaPath"
          :stroke="colorAt(0)"
          :fill="colorAtWithOpacity(0, '20')"
          fill-rule="evenodd"
        />
        <!-- 折线路径 -->
        <path
          v-if="computedLinePath"
          :d="computedLinePath"
          :stroke="colorAt(0)"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- 数据点 -->
        <circle
          v-for="(point, pIndex) in dataPoints"
          :key="pIndex"
          :cx="point.x"
          :cy="point.y"
          r="4"
          :fill="colorAt(0)"
          :stroke="bgColor"
          stroke-width="2"
        />
        <!-- X 轴标签 -->
        <text
          v-for="(label, lIndex) in visibleLabels"
          :key="lIndex"
          :x="labelXPosition(lIndex)"
          :y="svgHeight - 10"
          text-anchor="middle"
          font-size="10"
          :fill="textColor"
        >
          {{ label }}
        </text>
      </svg>

      <!-- 柱状图 -->
      <div v-else-if="chartType === 'bar'" class="sl-chart__bar-container">
        <div v-for="(bar, bIndex) in barData" :key="bIndex" class="sl-chart__bar-item">
          <div class="sl-chart__bar-label">{{ bar.label }}</div>
          <div class="sl-chart__bar-wrapper">
            <div
              class="sl-chart__bar"
              :style="{
                width: `${bar.width}%`,
                backgroundColor: colorAt(bIndex)
              }"
            >
              <span class="sl-chart__bar-value">{{ formatValue(bar.value) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 饼图 -->
      <div v-else-if="chartType === 'pie'" class="sl-chart__pie-container">
        <svg
          :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
          class="sl-chart__svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            v-for="(segment, sIndex) in pieSegments"
            :key="sIndex"
            :d="segment.path"
            :fill="colorAt(sIndex)"
          />
        </svg>
        <div v-if="showLegend" class="sl-chart__legend">
          <div v-for="(item, pieIndex) in pieData" :key="pieIndex" class="sl-chart__legend-item">
            <span
              class="sl-chart__legend-dot"
              :style="{ backgroundColor: colorAt(pieIndex) }"
            ></span>
            <span class="sl-chart__legend-label">{{ item.label }}</span>
            <span class="sl-chart__legend-value">{{ formatValue(item.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div v-if="showLegend && chartType !== 'pie'" class="sl-chart__legend">
      <div
        v-for="(dataset, dsIndex) in legendDatasets"
        :key="dsIndex"
        class="sl-chart__legend-item"
      >
        <span class="sl-chart__legend-dot" :style="{ backgroundColor: colorAt(dsIndex) }"></span>
        <span class="sl-chart__legend-label">{{
          dataset.label || `数据${Number(dsIndex) + 1}`
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  interface DataSet {
    label?: string
    data: number[]
  }

  interface ChartData {
    labels?: string[]
    datasets?: DataSet[]
    values?: number[]
  }

  interface Props {
    chartType: 'line' | 'bar' | 'pie'
    dataSource?: ChartData
    title?: string
    showLegend?: boolean
    smooth?: boolean
    colors?: string[]
  }

  interface DataPoint {
    x: number
    y: number
  }

  interface BarItem {
    label: string
    value: number
    width: number
  }

  interface PieItem {
    label: string
    value: number
  }

  interface PieSegment {
    path: string
  }

  const props = withDefaults(defineProps<Props>(), {
    showLegend: true,
    smooth: true,
    dataSource: () => ({})
  })

  const svgWidth = 400
  const svgHeight = 250
  const padding = { top: 20, right: 20, bottom: 30, left: 20 }
  const chartWidth = svgWidth - padding.left - padding.right
  const chartHeight = svgHeight - padding.top - padding.bottom - padding.bottom

  const defaultColors: string[] = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  const bgColor = '#ffffff'
  const textColor = '#6b7280'

  const computedColors = computed<string[]>(() => props.colors || defaultColors)

  const colorAt = (index: number): string => {
    const colors = computedColors.value
    return colors[index % colors.length]
  }

  const colorAtWithOpacity = (index: number, opacity: string): string => {
    return `${colorAt(index)}${opacity}`
  }

  const dataValues = computed<number[]>(() => {
    if (props.dataSource?.datasets?.[0]?.data) {
      return props.dataSource.datasets[0].data
    }
    return props.dataSource?.values || []
  })

  const labels = computed<string[]>(() => props.dataSource?.labels || [])

  const legendDatasets = computed<DataSet[]>(() => props.dataSource?.datasets || [])

  const visibleLabels = computed<string[]>(() => {
    const allLabels = labels.value
    if (allLabels.length <= 6) return allLabels
    const step = Math.ceil(allLabels.length / 6)
    return allLabels.filter((_label: string, i: number) => i % step === 0)
  })

  const minVal = ref<number>(0)
  const maxVal = ref<number>(0)

  const calculateMinMax = (): void => {
    const values = dataValues.value
    if (values.length === 0) {
      minVal.value = 0
      maxVal.value = 0
      return
    }
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = (max - min) * 0.1 || 1
    minVal.value = min - pad
    maxVal.value = max + pad
  }

  watch(
    () => props.dataSource,
    () => {
      calculateMinMax()
    },
    { immediate: true }
  )

  const dataPoints = computed<DataPoint[]>(() => {
    const values = dataValues.value
    const step = chartWidth / (values.length - 1 || 1)
    const range = maxVal.value - minVal.value || 1

    return values.map((val: number, i: number) => ({
      x: padding.left + (values.length === 1 ? chartWidth / 2 : i * step),
      y: padding.top + chartHeight - ((val - minVal.value) / range) * chartHeight
    }))
  })

  const computedLinePath = computed<string>(() => {
    const points = dataPoints.value
    if (points.length === 0) return ''

    if (props.smooth && points.length > 2) {
      let path = `M ${points[0].x} ${points[0].y}`
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const cp1x = prev.x + (curr.x - prev.x) / 2
        const cp1y = prev.y
        const cp2x = prev.x + (curr.x - prev.x) / 2
        const cp2y = curr.y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      }
      return path
    }

    return points.map((p: DataPoint, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  })

  const computedAreaPath = computed<string>(() => {
    const points = dataPoints.value
    if (points.length === 0) return ''

    const linePath = computedLinePath.value
    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]
    const baseline = padding.top + chartHeight

    return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`
  })

  const labelXPosition = (index: number): number => {
    const step = labels.value.length <= 6 ? 1 : Math.ceil(labels.value.length / 6)
    return padding.left + index * step * (chartWidth / (labels.value.length - 1 || 1))
  }

  const barData = computed<BarItem[]>(() => {
    const values = dataValues.value
    const max = maxVal.value || 1

    return values.map((val: number, i: number) => ({
      label: labels.value[i] || `${i + 1}`,
      value: val,
      width: (val / max) * 100
    }))
  })

  const pieData = computed<PieItem[]>(() => {
    if (props.dataSource?.datasets?.[0]?.data) {
      return props.dataSource.datasets[0].data.map((val: number, i: number) => ({
        label: props.dataSource?.labels?.[i] || `数据${i + 1}`,
        value: val
      }))
    }
    const values = props.dataSource?.values || []
    return values.map((val: number, i: number) => ({
      label: props.dataSource?.labels?.[i] || `数据${i + 1}`,
      value: val
    }))
  })

  const pieSegments = computed<PieSegment[]>(() => {
    const data = pieData.value
    const total = data.reduce((sum: number, item: PieItem) => sum + item.value, 0) || 1
    const centerX = svgWidth / 2
    const centerY = svgHeight / 2 - 10
    const radius = Math.min(centerX, centerY) - 40

    let currentAngle = -Math.PI / 2
    const segments: PieSegment[] = []

    data.forEach((item: PieItem) => {
      const angle = (item.value / total) * Math.PI * 2
      const endAngle = currentAngle + angle

      const x1 = centerX + radius * Math.cos(currentAngle)
      const y1 = centerY + radius * Math.sin(currentAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)

      const largeArc = angle > Math.PI ? 1 : 0

      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
      segments.push({ path })

      currentAngle = endAngle
    })

    return segments
  })

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }
</script>

<style scoped lang="scss">
  .sl-chart {
    background: #ffffff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &__header {
      margin-bottom: 16px;
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    &__content {
      position: relative;
      min-height: 200px;
    }

    &__svg {
      width: 100%;
      height: auto;
      display: block;
    }

    /* bar chart styles */
    &__bar-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }

    &__bar-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__bar-label {
      width: 60px;
      font-size: 12px;
      color: #6b7280;
      text-align: right;
      flex-shrink: 0;
    }

    &__bar-wrapper {
      flex: 1;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;
    }

    &__bar {
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      min-width: 40px;
      transition: width 0.3s ease;
    }

    &__bar-value {
      font-size: 12px;
      color: #ffffff;
      font-weight: 500;
    }

    /* pie chart styles */
    &__pie-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    /* legend styles */
    &__legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    &__legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #6b7280;
    }

    &__legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    &__legend-label {
      flex-shrink: 0;
    }

    &__legend-value {
      font-weight: 500;
      color: #1f2937;
      margin-left: 4px;
    }

    /* smooth effect */
    &.is-smooth {
      .sl-chart__svg path {
        transition: all 0.3s ease;
      }
    }
  }
</style>
