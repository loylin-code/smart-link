<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, type Component } from 'vue'
import type { TabItem } from '../types'
import type { TabManager } from '../tabs/TabManager'
import ChartDetail from '../tabs/templates/ChartDetail.vue'

interface Props {
  manager: TabManager
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
})

const emit = defineEmits<{
  (e: 'tab-close', tab: TabItem): void
}>()

// Internal state
const tabs = ref<TabItem[]>([])
const activeTabId = ref<string | null>(null)

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

// Sync with manager state
const syncWithManager = () => {
  tabs.value = props.manager.getAllTabs()
  activeTabId.value = props.manager.getActiveTabId()
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
  <aside class="tab-panel" :class="`theme-${theme}`">
    <!-- Tab Headers -->
    <header class="tab-panel-header">
      <div class="tab-list">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: tab.id === activeTabId }"
          @click="manager.switchTab(tab.id)"
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
      <KeepAlive :include="['ChartDetail']">
        <component
          v-if="activeTab"
          :is="getTemplateComponent(activeTab.template.id)"
          :data="activeTab.data"
          :theme="theme"
        />
      </KeepAlive>
      <div v-if="!activeTab" class="tab-panel-empty">
        <span class="empty-text">No tab selected</span>
      </div>
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
  width: 100%;
  max-height: 100%;
  overflow: hidden;
}

.tab-panel-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
  flex-shrink: 0;
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
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
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

.theme-dark .tab-panel-empty {
  color: #9ca3af;
}
</style>