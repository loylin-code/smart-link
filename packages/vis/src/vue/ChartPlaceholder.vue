<script setup lang="ts">
  import { computed } from 'vue'
  import type { ChartType, RenderState, StreamingConfig } from '../types'

  interface Props {
    state: RenderState
    progress?: number
    detectedType?: ChartType | null
    title?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    progress: 0,
    detectedType: null,
    title: ''
  })

  const isVisible = computed(() => props.state !== 'idle' && props.state !== 'error')

  const displayTitle = computed(() => {
    if (props.title) return props.title
    if (props.detectedType) {
      const typeNames: Record<string, string> = {
        line: '折线图',
        pie: '饼图',
        bar: '柱状图',
        area: '面积图',
        scatter: '散点图',
        summary: '数据摘要',
        'stat-card': '统计卡片',
        table: '数据表格'
      }
      return typeNames[props.detectedType] || '图表'
    }
    return '图表'
  })

  const statusText = computed(() => {
    switch (props.state) {
      case 'loading':
        return '正在生成图表...'
      case 'partial':
        return '正在解析数据...'
      case 'ready':
        return '图表已就绪'
      default:
        return ''
    }
  })

  const showSkeleton = computed(() =>
    props.state === 'loading' || props.state === 'partial'
  )

  const showProgress = computed(() => props.progress > 0)

  const typeIcon = computed(() => {
    if (!props.detectedType) return '📊'
    const icons: Record<string, string> = {
      line: '📈',
      pie: '🥧',
      bar: '📊',
      area: '📉',
      scatter: '⚪',
      summary: '📋',
      'stat-card': '📇',
      table: '📑'
    }
    return icons[props.detectedType] || '📊'
  })
</script>

<template>
  <Transition name="chart-placeholder-fade">
    <div v-if="isVisible" class="chart-placeholder" :class="`is-${state}`">
      <!-- Header with icon and title -->
      <div class="chart-placeholder-header">
        <span class="chart-placeholder-icon">{{ typeIcon }}</span>
        <span class="chart-placeholder-title">{{ displayTitle }}</span>
      </div>

      <!-- Skeleton animation area -->
      <div v-if="showSkeleton" class="chart-placeholder-skeleton">
        <!-- Chart skeleton bars for bar/pie -->
        <div v-if="detectedType === 'bar' || detectedType === 'pie'" class="skeleton-bars">
          <div
            v-for="i in 5"
            :key="i"
            class="skeleton-bar"
            :style="{ animationDelay: `${i * 0.1}s` }"
          />
        </div>
        <!-- Chart skeleton line for line/area -->
        <div v-else-if="detectedType === 'line' || detectedType === 'area'" class="skeleton-line">
          <div class="skeleton-line-path" />
        </div>
        <!-- Generic skeleton for other types -->
        <div v-else class="skeleton-generic">
          <div class="skeleton-circle" />
          <div class="skeleton-text-lines">
            <div v-for="i in 3" :key="i" class="skeleton-text-line" />
          </div>
        </div>
      </div>

      <!-- Progress indicator -->
      <div v-if="showProgress" class="chart-placeholder-progress">
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: `${progress}%` }" />
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>

      <!-- Status text -->
      <div v-if="statusText" class="chart-placeholder-status">
        {{ statusText }}
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .chart-placeholder {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .chart-placeholder-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chart-placeholder-icon {
    font-size: 20px;
  }

  .chart-placeholder-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .chart-placeholder-skeleton {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-placeholder-progress {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .chart-placeholder-status {
    font-size: 14px;
    color: #6b7280;
    text-align: center;
  }

  .chart-placeholder.is-ready {
    opacity: 0;
    pointer-events: none;
  }

  /* Skeleton animations */
  @keyframes skeleton-pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes skeleton-shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .skeleton-bars {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 100px;
    width: 100%;
    padding: 0 20px;
  }

  .skeleton-bar {
    flex: 1;
    background: linear-gradient(
      90deg,
      #e5e7eb 0%,
      #f3f4f6 50%,
      #e5e7eb 100%
    );
    background-size: 200% 100%;
    border-radius: 4px 4px 0 0;
    animation: skeleton-pulse 1.5s ease-in-out infinite,
               skeleton-shimmer 2s linear infinite;
  }

  .skeleton-bar:nth-child(1) { height: 60%; }
  .skeleton-bar:nth-child(2) { height: 80%; }
  .skeleton-bar:nth-child(3) { height: 100%; }
  .skeleton-bar:nth-child(4) { height: 70%; }
  .skeleton-bar:nth-child(5) { height: 50%; }

  .skeleton-line {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
  }

  .skeleton-line-path {
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      #3b82f6 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    border-radius: 2px;
    animation: skeleton-shimmer 2s linear infinite;
  }

  .skeleton-generic {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  .skeleton-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(
      90deg,
      #e5e7eb 0%,
      #f3f4f6 50%,
      #e5e7eb 100%
    );
    background-size: 200% 100%;
    animation: skeleton-pulse 1.5s ease-in-out infinite,
               skeleton-shimmer 2s linear infinite;
  }

  .skeleton-text-lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 200px;
  }

  .skeleton-text-line {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  .skeleton-text-line:nth-child(1) { width: 100%; }
  .skeleton-text-line:nth-child(2) { width: 80%; }
  .skeleton-text-line:nth-child(3) { width: 60%; }

  /* Progress bar */
  .progress-bar {
    flex: 1;
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    min-width: 40px;
    text-align: right;
  }

  /* Fade transition */
  .chart-placeholder-fade-enter-active,
  .chart-placeholder-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .chart-placeholder-fade-enter-from,
  .chart-placeholder-fade-leave-to {
    opacity: 0;
  }
</style>
