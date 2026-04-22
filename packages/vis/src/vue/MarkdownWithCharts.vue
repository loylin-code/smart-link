<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import { SmartVis } from '../core/SmartVis'
import { StreamingDetector } from '../syntax/streaming-detector'
import type { VisConfig, ChartBlockConfig } from '../types'

const props = defineProps<{
  content: string
  streaming?: boolean
}>()

const emit = defineEmits<{
  'chart-click': [config: VisConfig]
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// Refs
const contentRef = ref<HTMLElement | null>(null)
const smartVisInstances = new Map<string, SmartVis>()

// Computed
const hasChartBlocks = computed(() => {
  if (!props.content) return false
  return StreamingDetector.hasChartMarker(props.content)
})

// Parse chart blocks
const parseChartBlocks = (content: string): ChartBlockConfig[] => {
  if (!content) return []
  const blocks: ChartBlockConfig[] = []
  const codeBlockRegex = /```(?:chart-json|vis|chart)\s*\n([\s\S]*?)\n```/g
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const raw = match[1].trim()
    try {
      const parsed = JSON.parse(raw) as VisConfig
      if (parsed.type && parsed.data) {
        blocks.push({
          config: parsed,
          raw,
          position: { start: match.index, end: match.index + match[0].length }
        })
      }
    } catch {
      // Skip invalid JSON
    }
  }
  return blocks
}

// Replace chart blocks with placeholders
const processMarkdownContent = (content: string): string => {
  if (!content || !hasChartBlocks.value) return content || ''

  let processed = content
  const blocks = parseChartBlocks(content)

  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]
    const placeholder = `<div class="chart-container" data-chart-index="${i}" data-chart-type="${block.config.type}"></div>`
    processed = processed.slice(0, block.position.start) + placeholder + processed.slice(block.position.end)
  }

  return processed
}

// Computed HTML
const renderedHtml = computed(() => {
  const content = props.content || ''
  const processed = processMarkdownContent(content)
  return md.render(processed)
})

// Initialize charts - only once per mount
const initCharts = () => {
  if (!contentRef.value) return

  const containers = contentRef.value.querySelectorAll('.chart-container')
  console.log('[MarkdownWithCharts] initCharts, containers:', containers.length)

  if (containers.length === 0) return

  const blocks = parseChartBlocks(props.content)

  containers.forEach((container, index) => {
    const htmlEl = container as HTMLElement
    const block = blocks[index]

    if (!block) return

    const chartId = `chart-${index}-${Date.now()}`
    htmlEl.style.width = '100%'
    htmlEl.style.minHeight = '280px'

    try {
      const smartVis = new SmartVis({
        container: htmlEl,
        theme: 'light',
        streaming: false,
        onChartClick: (_, cfg) => emit('chart-click', cfg)
      })

      smartVisInstances.set(chartId, smartVis)
      smartVis.render(block.config)
      console.log('[MarkdownWithCharts] chart rendered:', chartId)
    } catch (e) {
      console.error('[MarkdownWithCharts] render error:', e)
    }
  })
}

// Destroy all charts
const destroyCharts = () => {
  console.log('[MarkdownWithCharts] destroyCharts, count:', smartVisInstances.size)
  smartVisInstances.forEach((instance) => {
    try {
      instance.destroy()
    } catch (e) {
      console.warn('[MarkdownWithCharts] destroy error:', e)
    }
  })
  smartVisInstances.clear()
}

// Lifecycle - single mount/unmount, no watch
onMounted(() => {
  console.log('[MarkdownWithCharts] onMounted')
  // Wait for next frame then init
  requestAnimationFrame(() => {
    initCharts()
  })
})

onUnmounted(() => {
  console.log('[MarkdownWithCharts] onUnmounted')
  destroyCharts()
})
</script>

<template>
  <div class="markdown-with-charts">
    <div
      ref="contentRef"
      class="markdown-content"
      v-html="renderedHtml"
    />
  </div>
</template>

<style scoped>
.markdown-with-charts {
  position: relative;
  width: 100%;
  color: inherit;
}

.markdown-content {
  width: 100%;
  color: inherit;
}

.markdown-content :deep(p),
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6),
.markdown-content :deep(li),
.markdown-content :deep(span),
.markdown-content :deep(strong),
.markdown-content :deep(em) {
  color: inherit;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.3em;
}

.markdown-content :deep(p) {
  margin-bottom: 16px;
  line-height: 1.6;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 16px;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin-bottom: 4px;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-content :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.5);
}

.markdown-content :deep(a:hover) {
  text-decoration-color: currentColor;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid currentColor;
  opacity: 0.7;
  padding-left: 16px;
  margin-left: 0;
  margin-bottom: 16px;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.markdown-content :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.05);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 24px 0;
}

.markdown-content :deep(.chart-container) {
  margin: 16px 0;
  min-height: 280px;
  width: 100%;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
}
</style>