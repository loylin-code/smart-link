<template>
  <div class="view-orchestration">
    <!-- Header -->
    <header class="orchestration-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="view-info">
          <h1 class="view-title">{{ viewData.name || t('agent.design.view.untitled') }}</h1>
          <span class="view-type-tag">{{ getViewTypeLabel(viewData.type) }}</span>
        </div>
      </div>

      <div class="header-center">
        <div class="mode-switcher">
          <button class="mode-btn" :class="{ active: mode === 'design' }" @click="mode = 'design'">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <span>{{ t('orchestrator.design') }}</span>
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'preview' }"
            @click="mode = 'preview'"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                stroke="currentColor"
                stroke-width="2"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>{{ t('orchestrator.preview') }}</span>
          </button>
        </div>
      </div>

      <div class="header-right">
        <button class="action-btn" @click="handleSave">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
              stroke="currentColor"
              stroke-width="2"
            />
            <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>{{ t('common.save') }}</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="orchestration-main">
      <!-- Left Panel - Component Library -->
      <aside class="component-panel">
        <div class="panel-header">
          <h3>{{ t('agent.design.view.components') }}</h3>
        </div>
        <div class="panel-body">
          <div class="component-category">
            <div class="category-title">{{ t('agent.design.view.charts') }}</div>
            <div class="component-list">
              <div
                v-for="comp in chartComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
              >
                <span class="component-icon">{{ comp.icon }}</span>
                <span class="component-name">{{ comp.name }}</span>
              </div>
            </div>
          </div>

          <div class="component-category">
            <div class="category-title">{{ t('agent.design.view.widgets') }}</div>
            <div class="component-list">
              <div
                v-for="comp in widgetComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
              >
                <span class="component-icon">{{ comp.icon }}</span>
                <span class="component-name">{{ comp.name }}</span>
              </div>
            </div>
          </div>

          <div class="component-category">
            <div class="category-title">{{ t('agent.design.view.layouts') }}</div>
            <div class="component-list">
              <div
                v-for="comp in layoutComponents"
                :key="comp.type"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, comp)"
              >
                <span class="component-icon">{{ comp.icon }}</span>
                <span class="component-name">{{ comp.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center - Design Canvas -->
      <main class="design-canvas">
        <div class="canvas-wrapper">
          <div
            v-if="canvasElements.length === 0"
            class="canvas-empty"
            @dragover.prevent
            @drop="handleDrop"
          >
            <div class="empty-icon">🎨</div>
            <h3>{{ t('agent.design.view.canvasEmpty') }}</h3>
            <p>{{ t('agent.design.view.canvasEmptyDesc') }}</p>
          </div>

          <div v-else class="canvas-content" @dragover.prevent @drop="handleDrop">
            <div
              v-for="(element, index) in canvasElements"
              :key="element.id"
              class="canvas-element"
              :class="{ selected: selectedElement === element.id }"
              @click="selectedElement = element.id"
            >
              <div class="element-header">
                <span class="element-icon">{{ element.icon }}</span>
                <span class="element-name">{{ element.name }}</span>
                <button class="element-remove" @click.stop="removeElement(index)">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" />
                  </svg>
                </button>
              </div>
              <div class="element-body">
                <div class="element-placeholder">
                  {{ element.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Right Panel - Properties -->
      <aside class="properties-panel">
        <div class="panel-header">
          <h3>{{ t('agent.design.view.properties') }}</h3>
        </div>
        <div class="panel-body">
          <div v-if="!selectedElement" class="no-selection">
            <p>{{ t('agent.design.view.selectElement') }}</p>
          </div>
          <div v-else class="properties-form">
            <div class="form-group">
              <label>{{ t('agent.design.view.elementName') }}</label>
              <input v-model="getSelectedElement()!.name" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>{{ t('agent.design.view.dataSource') }}</label>
              <select class="form-select">
                <option value="llm">LLM Response</option>
                <option value="api">API Data</option>
                <option value="static">{{ t('agent.design.view.staticData') }}</option>
              </select>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useViewStore } from '@/store/modules/view'
  import type { InteractionView } from '@/types'

  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()
  const viewStore = useViewStore()

  // State
  const mode = ref<'design' | 'preview'>('design')
  const selectedElement = ref<string | null>(null)
  const canvasElements = ref<Array<{ id: string; type: string; name: string; icon: string }>>([])

  // View data
  const viewData = reactive<InteractionView>({
    id: '',
    name: '',
    description: '',
    type: 'dashboard',
    createdAt: Date.now(),
    updatedAt: Date.now()
  })

  // Component library
  const chartComponents = [
    { type: 'line-chart', name: t('agent.design.view.lineChart'), icon: '📈' },
    { type: 'bar-chart', name: t('agent.design.view.barChart'), icon: '📊' },
    { type: 'pie-chart', name: t('agent.design.view.pieChart'), icon: '🥧' },
    { type: 'area-chart', name: t('agent.design.view.areaChart'), icon: '📉' }
  ]

  const widgetComponents = [
    { type: 'stat-card', name: t('agent.design.view.statCard'), icon: '🔢' },
    { type: 'data-table', name: t('agent.design.view.dataTable'), icon: '📋' },
    { type: 'progress-bar', name: t('agent.design.view.progressBar'), icon: '📊' },
    { type: 'text-block', name: t('agent.design.view.textBlock'), icon: '📝' }
  ]

  const layoutComponents = [
    { type: 'grid-layout', name: t('agent.design.view.gridLayout'), icon: '⊞' },
    { type: 'flex-row', name: t('agent.design.view.flexRow'), icon: '▤' },
    { type: 'flex-col', name: t('agent.design.view.flexCol'), icon: '▥' },
    { type: 'tabs', name: t('agent.design.view.tabs'), icon: '📑' }
  ]

  // View types
  const viewTypes: { value: InteractionView['type']; label: string }[] = [
    { value: 'dashboard', label: t('agent.design.view.types.dashboard') },
    { value: 'chart', label: t('agent.design.view.types.chart') },
    { value: 'table', label: t('agent.design.view.types.table') },
    { value: 'form', label: t('agent.design.view.types.form') },
    { value: 'custom', label: t('agent.design.view.types.custom') }
  ]

  // Methods
  function getViewTypeLabel(type: InteractionView['type']): string {
    return viewTypes.find((t) => t.value === type)?.label || type
  }

  function getSelectedElement() {
    return canvasElements.value.find((e) => e.id === selectedElement.value)
  }

  function handleDragStart(
    event: DragEvent,
    component: { type: string; name: string; icon: string }
  ) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('component', JSON.stringify(component))
    }
  }

  function handleDrop(event: DragEvent) {
    const data = event.dataTransfer?.getData('component')
    if (data) {
      const component = JSON.parse(data)
      canvasElements.value.push({
        id: `element-${Date.now()}`,
        type: component.type,
        name: component.name,
        icon: component.icon
      })
    }
  }

  function removeElement(index: number) {
    canvasElements.value.splice(index, 1)
    if (
      selectedElement.value &&
      !canvasElements.value.find((e) => e.id === selectedElement.value)
    ) {
      selectedElement.value = null
    }
  }

  function handleBack() {
    // Navigate back to agent design page with view tab active
    router.push({
      path: '/app/agent/design',
      query: { tab: 'view' }
    })
  }

  function handleSave() {
    // Save view schema
    viewData.schema = {
      elements: canvasElements.value
    }
    viewData.updatedAt = Date.now()

    // Save to store
    viewStore.setView({ ...viewData })

    // Navigate back to agent design page with the view tab active
    router.push({
      path: '/app/agent/design',
      query: { tab: 'view' }
    })
  }

  // Initialize
  onMounted(() => {
    const viewId = route.params.viewId as string

    // Load view data from store
    const existingView = viewStore.getView(viewId)

    if (existingView) {
      // Load existing view data
      Object.assign(viewData, existingView)

      // Load canvas elements from schema
      const schema = existingView.schema as { elements?: typeof canvasElements.value } | undefined
      if (schema?.elements && Array.isArray(schema.elements)) {
        canvasElements.value = [...schema.elements]
      }
    } else {
      // New view - initialize with defaults
      viewData.id = viewId || `view-${Date.now()}`
      viewData.name = t('agent.design.view.untitled')
      viewData.type = 'dashboard'
      viewData.description = ''
      viewData.createdAt = Date.now()
      viewData.updatedAt = Date.now()
    }
  })
</script>

<style scoped lang="scss">
  .view-orchestration {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: $bg-secondary;
    overflow: hidden;
  }

  // Header
  .orchestration-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-lighter;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .view-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .view-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }

  .view-type-tag {
    padding: 2px 10px;
    background: rgba(168, 85, 247, 0.1);
    color: #a855f7;
    font-size: $font-size-xs;
    border-radius: $border-radius-full;
  }

  .header-center {
    display: flex;
    align-items: center;
  }

  .mode-switcher {
    display: flex;
    background: $bg-secondary;
    border-radius: $border-radius-md;
    padding: 3px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: $text-primary;
    }

    &.active {
      background: $bg-primary;
      color: $primary-color;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &--primary {
      background: #a855f7;
      border-color: #a855f7;
      color: #fff;

      &:hover {
        background: #9333ea;
      }
    }
  }

  // Main Content
  .orchestration-main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  // Component Panel
  .component-panel {
    width: 240px;
    background: $bg-primary;
    border-right: 1px solid $border-color-lighter;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .panel-header {
    padding: $spacing-md;
    border-bottom: 1px solid $border-color-lighter;

    h3 {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-md;
  }

  .component-category {
    margin-bottom: $spacing-lg;
  }

  .category-title {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-tertiary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: $spacing-sm;
  }

  .component-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .component-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-secondary;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    cursor: grab;
    transition: all 0.2s ease;

    &:hover {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.05);
    }

    &:active {
      cursor: grabbing;
    }
  }

  .component-icon {
    font-size: 18px;
  }

  .component-name {
    font-size: $font-size-sm;
    color: $text-primary;
  }

  // Design Canvas
  .design-canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .canvas-wrapper {
    flex: 1;
    padding: $spacing-lg;
    overflow: auto;
  }

  .canvas-empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: $bg-primary;
    border: 2px dashed $border-color-base;
    border-radius: $border-radius-lg;

    .empty-icon {
      font-size: 48px;
      margin-bottom: $spacing-md;
      opacity: 0.5;
    }

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-medium;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    p {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0;
    }
  }

  .canvas-content {
    min-height: 100%;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .canvas-element {
    background: $bg-secondary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-md;
    overflow: hidden;
    transition: all 0.2s ease;

    &:hover {
      border-color: $text-tertiary;
    }

    &.selected {
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
    }
  }

  .element-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-tertiary;
    border-bottom: 1px solid $border-color-lighter;
  }

  .element-icon {
    font-size: 16px;
  }

  .element-name {
    flex: 1;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .element-remove {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: rgba(220, 38, 38, 0.1);
      color: $error;
    }
  }

  .element-body {
    padding: $spacing-xl;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .element-placeholder {
    font-size: $font-size-lg;
    color: $text-tertiary;
  }

  // Properties Panel
  .properties-panel {
    width: 280px;
    background: $bg-primary;
    border-left: 1px solid $border-color-lighter;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .no-selection {
    padding: $spacing-lg;
    text-align: center;
    color: $text-tertiary;
    font-size: $font-size-sm;
  }

  .properties-form {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    label {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      color: $text-secondary;
    }
  }

  .form-input,
  .form-select {
    padding: $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-primary;

    &:focus {
      outline: none;
      border-color: #a855f7;
    }
  }
</style>
