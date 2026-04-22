<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import type { TabItem, VisConfig } from '../types'
import type { TabManager } from '../tabs/TabManager'
import ChartDetail from '../tabs/templates/ChartDetail.vue'

interface Props {
  manager: TabManager
  theme?: 'light' | 'dark'
  width?: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  width: 600
})

const emit = defineEmits<{
  (e: 'tab-close', tab: TabItem): void
  (e: 'tab-switch', tab: TabItem): void
}>()

// Internal state
const tabs = ref<TabItem[]>([])
const activeTabId = ref<string | null>(null)

// Computed
const hasTabs = computed(() => tabs.value.length > 0)

const activeTab = computed(() => {
  if (!activeTabId.value) {
    return null
  }
  return tabs.value.find((tab) => tab.id === activeTabId.value) ?? null
})

const panelStyle = computed(() => ({
  width: `${props.width}px`,
  maxWidth: `${props.width}px`
}))

// Template component map
const templateComponents: Record<string, Component> = {
  'chart-detail': ChartDetail
}

// Get component for a template
const getTemplateComponent = (templateId: string): Component => {
  return templateComponents[templateId] ?? ChartDetail
}

// Sync with manager state
const syncWithManager = () => {
  tabs.value = props.manager.getAllTabs()
  activeTabId.value = props.manager.getActiveTabId()
}

// Handle tab click
const handleTabClick = (tab: TabItem) => {
  props.manager.switchTab(tab.id)
  emit('tab-switch', tab)
}

// Handle tab close
const handleTabClose = (tab: TabItem) => {
  props.manager.closeTab(tab.id)
  emit('tab-close', tab)
}

// Subscribe to manager events
const unsubscribeCallbacks: Array<() => void> = []

const subscribeToManager = () => {
  const onOpen = () => syncWithManager()
  const onClose = () => syncWithManager()
  const onSwitch = () => syncWithManager()

  props.manager.on('open', onOpen)
  props.manager.on('close', onClose)
  props.manager.on('switch', onSwitch)

  unsubscribeCallbacks.push(() => {
    props.manager.off('open', onOpen)
    props.manager.off('close', onClose)
    props.manager.off('switch', onSwitch)
  })
}

// Initialize
syncWithManager()
subscribeToManager()

// Watch for manager changes
watch(
  () => props.manager,
  (newManager) => {
    // Unsubscribe from old manager
    unsubscribeCallbacks.forEach((cb) => cb())
    unsubscribeCallbacks.length = 0

    // Sync and subscribe to new manager
    syncWithManager()
    subscribeToManager()
  }
)
</script>

<template>
  <aside v-if="hasTabs" class="tab-panel" :class="`theme-${theme}`" :style="panelStyle">
    <!-- Tab Headers -->
    <header class="tab-panel-header">
      <div class="tab-list">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: tab.id === activeTabId }"
          @click="handleTabClick(tab)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="tab-close-btn"
            @click.stop="handleTabClose(tab)"
          >
            ×
          </button>
        </div>
      </div>
    </header>

    <!-- Tab Content -->
    <div class="tab-panel-content">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-content-item"
        :class="{ visible: tab.id === activeTabId }"
      >
        <component
          :is="getTemplateComponent(tab.template.id)"
          :data="tab.data"
          :theme="theme"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!activeTab" class="tab-panel-empty">
      <span class="empty-text">No tab selected</span>
    </div>
  </aside>
</template>

<style scoped>
.tab-panel {
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  border-left: 1px solid #e5e7eb;
  height: 100%;
  overflow: hidden;
}

.tab-panel-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
}

.tab-list {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-item:hover {
  background: #e5e7eb;
}

.tab-item.active {
  background: #3b82f6;
  color: white;
}

.tab-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: inherit;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.tab-close-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.tab-item.active .tab-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tab-panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.tab-content-item {
  display: none;
  height: 100%;
}

.tab-content-item.visible {
  display: block;
}

.tab-panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.empty-text {
  font-size: 14px;
}

/* Dark theme */
.tab-panel.theme-dark {
  background: #1f2937;
  border-left-color: #374151;
}

.theme-dark .tab-panel-header {
  background: #111827;
  border-bottom-color: #374151;
}

.theme-dark .tab-item {
  background: #374151;
  color: #e5e7eb;
}

.theme-dark .tab-item:hover {
  background: #4b5563;
}

.theme-dark .tab-item.active {
  background: #3b82f6;
  color: white;
}

.theme-dark .tab-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.theme-dark .tab-panel-empty {
  color: #9ca3af;
}
</style>