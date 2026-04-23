<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, type Component } from 'vue'
import type { TabItem } from '../types'
import type { TabManager } from '../tabs/TabManager'
import ChartDetail from '../tabs/templates/ChartDetail.vue'

interface Props {
  manager: TabManager
  theme?: 'light' | 'dark'
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  collapsed: false
})

const emit = defineEmits<{
  (e: 'tab-close', tab: TabItem): void
  (e: 'toggle-panel'): void
}>()

// Internal state
const tabs = ref<TabItem[]>([])
const activeTabId = ref<string | null>(null)
const tabListRef = ref<HTMLElement | null>(null)

// Scroll state
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// Computed
const activeTab = computed(() => {
  if (!activeTabId.value) return null
  return tabs.value.find((tab) => tab.id === activeTabId.value) ?? null
})

// Template component map
const templateComponents: Record<string, Component> = {
  'chart-detail': ChartDetail
}

const getTemplateComponent = (templateId: string): Component => {
  return templateComponents[templateId] ?? ChartDetail
}

// Check scroll state
const checkScrollState = () => {
  if (!tabListRef.value) return
  const el = tabListRef.value
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

// Scroll functions
const scrollLeft = () => {
  if (!tabListRef.value) return
  tabListRef.value.scrollBy({ left: -150, behavior: 'smooth' })
  setTimeout(checkScrollState, 300)
}

const scrollRight = () => {
  if (!tabListRef.value) return
  tabListRef.value.scrollBy({ left: 150, behavior: 'smooth' })
  setTimeout(checkScrollState, 300)
}

// Chart type icon mapping (mini strip display)
const chartTypeIcons: Record<string, string> = {
  line: 'L',
  bar: 'B',
  pie: 'P',
  area: 'A',
  scatter: 'S',
  table: 'T',
  summary: 'Σ',
  'stat-card': '#'
}

const getChartIcon = (type: string): string => {
  return chartTypeIcons[type] || '?'
}

// Toggle collapsed state
const handleToggle = () => {
  emit('toggle-panel')
}

// Mini icon click: switch tab and expand
const handleMiniTabClick = (tab: TabItem) => {
  props.manager.switchTab(tab.id)
  emit('toggle-panel')
}

// Sync with manager state
const syncWithManager = () => {
  tabs.value = props.manager.getAllTabs()
  activeTabId.value = props.manager.getActiveTabId()
  nextTick(checkScrollState)
}

// Handle tab close
const handleTabClose = (tab: TabItem) => {
  props.manager.closeTab(tab.id)
  emit('tab-close', tab)
  syncWithManager()
}

// Event handlers
const onManagerOpen = () => syncWithManager()
const onManagerClose = () => syncWithManager()
const onManagerSwitch = () => syncWithManager()

// Initialize on mount
onMounted(() => {
  syncWithManager()
  props.manager.on('open', onManagerOpen)
  props.manager.on('close', onManagerClose)
  props.manager.on('switch', onManagerSwitch)
})

// Cleanup
onUnmounted(() => {
  props.manager.off('open', onManagerOpen)
  props.manager.off('close', onManagerClose)
  props.manager.off('switch', onManagerSwitch)
})
</script>

<template>
  <div class="tab-panel">
    <!-- Normal mode: Tab Header Bar with collapse button -->
    <header v-if="!collapsed" class="tab-header-bar">
      <!-- Collapse button at left edge -->
      <button
        class="panel-collapse-btn"
        @click="handleToggle"
        type="button"
        title="收起面板"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Scroll left arrow -->
      <button
        v-if="canScrollLeft"
        class="scroll-arrow scroll-left"
        @click="scrollLeft"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Tab list container -->
      <div ref="tabListRef" class="tab-list-container">
        <div class="tab-list">
          <!-- Tab items -->
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-item"
            :class="{ active: tab.id === activeTabId }"
            @click="manager.switchTab(tab.id)"
          >
            <span class="tab-title">{{ tab.title }}</span>
            <span
              v-if="tab.closable !== false"
              class="tab-close"
              @click.stop="handleTabClose(tab)"
            >×</span>
          </div>
        </div>
      </div>

      <!-- Scroll right arrow -->
      <button
        v-if="canScrollRight"
        class="scroll-arrow scroll-right"
        @click="scrollRight"
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </header>

    <!-- Collapsed mode: Mini Tab Strip -->
    <div v-if="collapsed" class="mini-tab-strip">
      <!-- Expand button -->
      <button
        class="panel-expand-btn"
        @click="handleToggle"
        type="button"
        title="展开面板"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 12 12)"/>
        </svg>
      </button>

      <!-- Mini icons -->
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="mini-tab-item"
        :class="{ active: tab.id === activeTabId }"
        :title="tab.title"
        @click="handleMiniTabClick(tab)"
      >
        {{ getChartIcon(tab.data.type) }}
      </div>
    </div>

    <!-- Normal mode: Tab Content -->
    <div v-if="!collapsed" class="tab-content">
      <KeepAlive :include="['ChartDetail']">
        <component
          v-if="activeTab"
          :is="getTemplateComponent(activeTab.template.id)"
          :data="activeTab.data"
          :theme="theme"
        />
      </KeepAlive>

      <!-- Empty state -->
      <div v-if="!activeTab" class="tab-empty">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="empty-text">点击图表卡片查看详情</p>
      </div>
    </div>
  </div>
</template>
