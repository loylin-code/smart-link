<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import {
    useViewStore,
    type ViewComponentNode,
    type DataBinding,
    type WidthConfig
  } from '@/store/modules/view'
  import WidthSelector from './WidthSelector.vue'
  import StyleConfigPanel from './StyleConfig.vue'

  const { t } = useI18n()
  const viewStore = useViewStore()

  // Emits
  const emit = defineEmits<{
    update: [component: Partial<ViewComponentNode>]
  }>()

  // Get selected component from store
  const selectedComponent = computed(() => viewStore.selectedComponent)

  // Local reactive state for form editing
  const componentName = ref('')
  const dataSourceType = ref<DataBinding['type'] | ''>('')
  const bindingField = ref('')

  // Expanded sections state
  const expandedSections = ref({
    layout: true,
    style: true,
    data: true,
    events: false
  })

  // Data source options
  const dataSourceOptions: { value: DataBinding['type']; label: string; icon: string }[] = [
    { value: 'llm', label: t('agent.design.view.dataSourceTypes.llm'), icon: '🤖' },
    { value: 'api', label: t('agent.design.view.dataSourceTypes.api'), icon: '🔌' },
    { value: 'static', label: t('agent.design.view.dataSourceTypes.static'), icon: '📄' },
    { value: 'database', label: t('agent.design.view.dataSourceTypes.database'), icon: '🗄️' }
  ]

  // Width config computed
  const widthConfig = computed<WidthConfig>({
    get: () => {
      return (
        selectedComponent.value?.layout?.width ?? {
          preset: '1/2',
          desktop: 6,
          tablet: 6,
          mobile: 12,
          auto: false
        }
      )
    },
    set: (value) => {
      if (!selectedComponent.value) return
      updateLayout({ width: value })
    }
  })

  // Sync local state with selected component
  watch(
    () => selectedComponent.value,
    (comp) => {
      if (comp) {
        componentName.value = comp.name || ''
        dataSourceType.value = comp.dataSource?.type || ''
        bindingField.value = comp.dataSource?.field || ''
      } else {
        componentName.value = ''
        dataSourceType.value = ''
        bindingField.value = ''
      }
    },
    { immediate: true }
  )

  // Update component name
  function updateName() {
    if (!selectedComponent.value) return
    viewStore.updateComponent(selectedComponent.value.id, { name: componentName.value })
    emit('update', { name: componentName.value })
  }

  // Update layout
  function updateLayout(layout: Partial<ViewComponentNode['layout']>) {
    if (!selectedComponent.value) return
    const newLayout = {
      ...selectedComponent.value.layout,
      ...layout
    }
    viewStore.updateComponent(selectedComponent.value.id, { layout: newLayout })
    emit('update', { layout: newLayout })
  }

  // Update style
  function updateStyle(style: Partial<ViewComponentNode['style']>) {
    if (!selectedComponent.value) return
    const newStyle = {
      ...selectedComponent.value.style,
      ...style
    }
    viewStore.updateComponent(selectedComponent.value.id, { style: newStyle })
    emit('update', { style: newStyle })
  }

  // Update data source type
  function updateDataSourceType(type: DataBinding['type']) {
    if (!selectedComponent.value) return
    dataSourceType.value = type
    const dataSource: DataBinding = { type, field: bindingField.value }
    viewStore.updateComponent(selectedComponent.value.id, { dataSource })
    emit('update', { dataSource })
  }

  // Update binding field
  function updateBindingField() {
    if (!selectedComponent.value) return
    const dataSource: DataBinding = {
      type: (dataSourceType.value as DataBinding['type']) || 'static',
      field: bindingField.value
    }
    viewStore.updateComponent(selectedComponent.value.id, { dataSource })
    emit('update', { dataSource })
  }

  // Toggle section expansion
  function toggleSection(section: keyof typeof expandedSections.value) {
    expandedSections.value[section] = !expandedSections.value[section]
  }

  // Get component type label
  function getComponentTypeLabel(type: string): string {
    return t(`agent.design.view.componentNames.${type}`) || type
  }

  // Responsive columns update
  function updateResponsiveCols(device: 'desktop' | 'tablet' | 'mobile', cols: number) {
    if (!selectedComponent.value) return
    const width = { ...selectedComponent.value.layout?.width }
    width[device] = cols
    updateLayout({ width })
  }
</script>

<template>
  <div class="property-panel">
    <!-- Header -->
    <div class="panel-header">
      <h2 class="panel-title">
        <svg class="title-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ t('agent.design.view.properties') }}
      </h2>
    </div>

    <!-- Empty State -->
    <div v-if="!selectedComponent" class="empty-state">
      <div class="empty-icon-wrapper">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <p class="empty-text">{{ t('agent.design.view.selectElement') }}</p>
    </div>

    <!-- Properties Form -->
    <div v-else class="properties-content">
      <!-- Basic Info Section -->
      <div class="property-section">
        <div class="section-header" @click="toggleSection('layout')">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          <h3 class="section-title">{{ t('agent.design.view.basicInfo') }}</h3>
          <svg
            class="toggle-icon"
            :class="{ expanded: expandedSections.layout }"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>

        <div v-if="expandedSections.layout" class="section-body">
          <!-- Component Name -->
          <div class="form-group">
            <label class="form-label">{{ t('agent.design.view.elementName') }}</label>
            <input
              v-model="componentName"
              type="text"
              class="form-input"
              :placeholder="t('agent.design.view.namePlaceholder')"
              @blur="updateName"
            />
          </div>

          <!-- Component Type -->
          <div class="form-group">
            <label class="form-label">{{ t('agent.design.view.elementType') }}</label>
            <div class="type-display">
              <span class="type-icon">{{ selectedComponent.icon }}</span>
              <span class="type-name">{{ getComponentTypeLabel(selectedComponent.type) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Layout Config Section -->
      <div class="property-section">
        <div class="section-header" @click="toggleSection('layout')">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" />
            <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2" />
            <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" />
            <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2" />
          </svg>
          <h3 class="section-title">{{ t('agent.design.view.widthConfig') }}</h3>
          <svg
            class="toggle-icon"
            :class="{ expanded: expandedSections.layout }"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>

        <div v-if="expandedSections.layout" class="section-body">
          <!-- Width Selector -->
          <div class="form-group">
            <label class="form-label">宽度比例</label>
            <WidthSelector v-model="widthConfig" />
          </div>

          <!-- Responsive Settings -->
          <div class="form-group">
            <label class="form-label">{{ t('agent.design.view.responsiveConfig') }}</label>
            <div class="responsive-grid">
              <div class="responsive-item">
                <svg class="device-icon" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="3"
                    width="20"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.5" />
                </svg>
                <select
                  class="form-select"
                  :value="widthConfig.desktop"
                  @change="
                    updateResponsiveCols(
                      'desktop',
                      Number(($event.target as HTMLSelectElement).value)
                    )
                  "
                >
                  <option v-for="n in 12" :key="n" :value="n">{{ n }}/12</option>
                </select>
              </div>
              <div class="responsive-item">
                <svg class="device-icon tablet" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="2"
                    width="16"
                    height="20"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path d="M10 18h4" stroke="currentColor" stroke-width="1.5" />
                </svg>
                <select
                  class="form-select"
                  :value="widthConfig.tablet"
                  @change="
                    updateResponsiveCols(
                      'tablet',
                      Number(($event.target as HTMLSelectElement).value)
                    )
                  "
                >
                  <option v-for="n in 12" :key="n" :value="n">{{ n }}/12</option>
                </select>
              </div>
              <div class="responsive-item">
                <svg class="device-icon mobile" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="6"
                    y="2"
                    width="12"
                    height="20"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path d="M10 18h4" stroke="currentColor" stroke-width="1.5" />
                </svg>
                <select
                  class="form-select"
                  :value="widthConfig.mobile"
                  @change="
                    updateResponsiveCols(
                      'mobile',
                      Number(($event.target as HTMLSelectElement).value)
                    )
                  "
                >
                  <option v-for="n in 12" :key="n" :value="n">{{ n }}/12</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Source Section -->
      <div class="property-section">
        <div class="section-header" @click="toggleSection('data')">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          <h3 class="section-title">{{ t('agent.design.view.dataSource') }}</h3>
          <svg
            class="toggle-icon"
            :class="{ expanded: expandedSections.data }"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>

        <div v-if="expandedSections.data" class="section-body">
          <!-- Data Source Type -->
          <div class="form-group">
            <label class="form-label">{{ t('agent.design.view.dataSourceType') }}</label>
            <div class="radio-group">
              <label
                v-for="option in dataSourceOptions"
                :key="option.value"
                class="radio-option"
                :class="{ active: dataSourceType === option.value }"
              >
                <input
                  type="radio"
                  :value="option.value"
                  :checked="dataSourceType === option.value"
                  @change="updateDataSourceType(option.value)"
                />
                <span class="radio-icon">{{ option.icon }}</span>
                <span class="radio-label">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <!-- Binding Field -->
          <div class="form-group">
            <label class="form-label">{{ t('agent.design.view.dataBinding') }}</label>
            <input
              v-model="bindingField"
              type="text"
              class="form-input"
              :placeholder="t('agent.design.view.bindingPlaceholder')"
              @blur="updateBindingField"
            />
            <span class="form-hint">{{ t('agent.design.view.bindingHint') }}</span>
          </div>
        </div>
      </div>

      <!-- Style Section (Collapsible) -->
      <div class="property-section">
        <button class="section-toggle" @click="toggleSection('style')">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          <h3 class="section-title">{{ t('agent.design.view.styleSettings') }}</h3>
          <svg
            class="toggle-icon"
            :class="{ expanded: expandedSections.style }"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" />
          </svg>
        </button>

        <div v-if="expandedSections.style" class="section-body">
          <StyleConfigPanel
            v-if="selectedComponent?.style"
            :model-value="selectedComponent.style"
            @update:model-value="updateStyle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .property-panel {
    width: 320px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-primary;
    border-left: 1px solid $border-color-base;
    overflow-y: auto;
  }

  // Panel Header
  .panel-header {
    flex-shrink: 0;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $border-color-base;
    background: $bg-secondary;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin: 0;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .title-icon {
    width: 18px;
    height: 18px;
    color: $primary-color;
  }

  // Empty State
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl $spacing-lg;
    text-align: center;
  }

  .empty-icon-wrapper {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-tertiary;
    border-radius: $border-radius-xl;
    margin-bottom: $spacing-md;

    svg {
      width: 32px;
      height: 32px;
      color: $text-tertiary;
    }
  }

  .empty-text {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0;
  }

  // Properties Content
  .properties-content {
    flex: 1;
    padding: $spacing-md 0;
  }

  // Property Section
  .property-section {
    margin-bottom: $spacing-sm;
  }

  .section-header,
  .section-toggle {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    width: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background $transition-fast;

    &:hover {
      background: $bg-secondary;
    }
  }

  .section-icon {
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    flex-shrink: 0;
  }

  .section-title {
    flex: 1;
    margin: 0;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-primary;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .toggle-icon {
    width: 14px;
    height: 14px;
    color: $text-tertiary;
    transition: transform $transition-fast;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  .section-body {
    padding: $spacing-sm $spacing-md $spacing-md;
  }

  // Form Elements
  .form-group {
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    display: block;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin-bottom: $spacing-xs;
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    outline: none;
    transition: all $transition-fast;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }

  .form-hint {
    display: block;
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  // Type Display
  .type-display {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
  }

  .type-icon {
    font-size: $font-size-base;
  }
  .type-name {
    font-size: $font-size-sm;
    color: $text-primary;
  }

  // Radio Group
  .radio-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-xs;
  }

  .radio-option {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-fast;

    input[type='radio'] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    &:hover {
      border-color: $primary-light;
      background: $bg-tertiary;
    }

    &.active {
      border-color: $primary-color;
      background: rgba($primary-color, 0.1);
    }
  }

  .radio-icon {
    font-size: $font-size-base;
  }
  .radio-label {
    font-size: $font-size-xs;
    color: $text-primary;
  }

  // Responsive Grid
  .responsive-grid {
    display: flex;
    gap: $spacing-sm;
  }

  .responsive-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
  }

  .device-icon {
    width: 20px;
    height: 20px;
    color: $text-tertiary;

    &.tablet {
      width: 18px;
      height: 18px;
    }
    &.mobile {
      width: 14px;
      height: 14px;
    }
  }

  .form-select {
    width: 100%;
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-xs;
  }

  // Placeholder Content
  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-xl;
    background: $bg-secondary;
    border: 1px dashed $border-color-base;
    border-radius: $border-radius-md;
    gap: $spacing-sm;
  }

  .placeholder-icon {
    font-size: 24px;
  }
  .placeholder-text {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }
</style>
