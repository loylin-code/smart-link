<template>
  <div class="vis-component-card" @click="$emit('click')">
    <div ref="chartContainer" class="preview-area">
      <!-- G2 chart will be rendered here -->
    </div>
    <div class="card-info">
      <span class="card-name">{{ component.name }}</span>
      <span class="card-category">可视化</span>
    </div>
    <div class="card-desc">{{ component.description }}</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import type { ComponentMeta } from '@smart-link/shared'
  import {
    LineChart,
    BarChart,
    PieChart,
    type ChartInstance,
    type VisConfig
  } from '@smart-link/chat-vis'

  const props = defineProps<{
    component: ComponentMeta
  }>()

  defineEmits<{
    click: []
  }>()

  const chartContainer = ref<HTMLElement | null>(null)
  let chartInstance: ChartInstance | null = null

  // Preview data for each chart type (GPT VIS style)
  const previewDataMap: Record<string, VisConfig> = {
    VisLineChart: {
      type: 'line',
      data: [
        { year: '1880', value: -0.12 },
        { year: '1900', value: -0.08 },
        { year: '1920', value: -0.25 },
        { year: '1940', value: 0.12 },
        { year: '1960', value: 0.03 },
        { year: '1980', value: 0.26 },
        { year: '2000', value: 0.42 },
        { year: '2020', value: 1.02 }
      ],
      xField: 'year',
      yField: 'value',
      smooth: true
    },
    VisBarChart: {
      type: 'bar',
      data: [
        { quarter: 'Q1', value: 120 },
        { quarter: 'Q2', value: 180 },
        { quarter: 'Q3', value: 150 },
        { quarter: 'Q4', value: 220 }
      ],
      xField: 'quarter',
      yField: 'value'
    },
    VisPieChart: {
      type: 'pie',
      data: [
        { category: '电子产品', value: 35 },
        { category: '服装', value: 25 },
        { category: '食品', value: 20 },
        { category: '家居', value: 15 },
        { category: '其他', value: 5 }
      ],
      categoryField: 'category',
      valueField: 'value',
      innerRadius: 0.4
    }
  }

  // Chart factory mapping
  const chartFactoryMap: Record<string, typeof LineChart> = {
    VisLineChart: LineChart,
    VisBarChart: BarChart,
    VisPieChart: PieChart
  }

  const chartType = computed(() => props.component.type)

  // Initialize and render chart on mount
  onMounted(() => {
    if (!chartContainer.value) return

    const factory = chartFactoryMap[chartType.value]
    const config = previewDataMap[chartType.value]

    if (factory && config) {
      chartInstance = factory({
        container: chartContainer.value,
        width: 280,
        height: 120,
        theme: 'light'
      })

      chartInstance.render(config)
    }
  })

  // Destroy chart on unmount
  onUnmounted(() => {
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
  })
</script>

<style scoped lang="scss">
  .vis-component-card {
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: all $transition-base ease;
    overflow: hidden;
    box-shadow: $shadow-card;

    &:hover {
      border-color: rgba(16, 185, 129, 0.5);
      transform: translateY(-4px);
      box-shadow: $shadow-card-hover;

      .preview-area {
        background: $bg-tertiary;
      }
    }
  }

  .preview-area {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    padding: $spacing-sm;
    transition: background $transition-base ease;

    :deep(canvas) {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .card-info {
    padding: $spacing-md $spacing-lg;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid $border-color-light;
  }

  .card-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .card-category {
    font-size: $font-size-xs;
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    padding: 2px 8px;
    border-radius: $border-radius-sm;
  }

  .card-desc {
    padding: $spacing-sm $spacing-lg $spacing-md;
    font-size: $font-size-sm;
    color: $text-tertiary;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
