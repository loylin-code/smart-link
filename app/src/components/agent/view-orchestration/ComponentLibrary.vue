<template>
  <div class="component-library">
    <!-- Search Header -->
    <div class="library-header">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          :placeholder="t('agent.design.view.searchPlaceholder') || '搜索组件...'"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Component Categories -->
    <div class="library-content">
      <div v-if="filteredCategories.length === 0" class="empty-state">
        <span class="empty-icon">🔍</span>
        <p class="empty-text">{{ t('agent.design.view.noResults') || '未找到组件' }}</p>
      </div>

      <div v-for="category in filteredCategories" :key="category.key" class="category-section">
        <button
          class="category-header"
          :class="{ collapsed: collapsedCategories.has(category.key) }"
          @click="toggleCategory(category.key)"
        >
          <span class="category-title">{{ category.label }}</span>
          <span class="category-count">{{ category.components.length }}</span>
          <svg
            class="collapse-icon"
            viewBox="0 0 24 24"
            fill="none"
            :style="{
              transform: collapsedCategories.has(category.key) ? 'rotate(-90deg)' : 'rotate(0deg)'
            }"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <Transition name="collapse">
          <div v-show="!collapsedCategories.has(category.key)" class="category-items">
            <div
              v-for="component in category.components"
              :key="component.type"
              class="component-item"
              :class="{ dragging: isDragging === component.type }"
              draggable="true"
              @dragstart="handleDragStart($event, component)"
              @dragend="handleDragEnd"
              @mouseenter="showPreview($event, component)"
              @mouseleave="hidePreview"
            >
              <span class="component-icon">{{ component.icon }}</span>
              <span class="component-name">{{ component.name }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Preview Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div v-if="previewComponent" class="component-preview" :style="previewPosition">
          <div class="preview-header">
            <span class="preview-icon">{{ previewComponent.icon }}</span>
            <span class="preview-name">{{ previewComponent.name }}</span>
          </div>
          <p class="preview-desc">{{ previewComponent.description }}</p>
          <div class="preview-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="2" />
              </svg>
              {{ previewComponent.defaultLayout?.width?.preset || '1/2' }}
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" />
              </svg>
              {{ previewComponent.defaultLayout?.height?.value || 120 }}px
            </span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { COMPONENT_LIBRARY, type ComponentMeta } from '@/store/modules/view'

  const { t } = useI18n()

  // Emits
  const emit = defineEmits<{
    'drag-start': [component: ComponentMeta]
    'drag-end': []
  }>()

  // State
  const searchQuery = ref('')
  const collapsedCategories = ref<Set<string>>(new Set())
  const isDragging = ref<string | null>(null)
  const previewComponent = ref<ComponentMeta | null>(null)
  const previewPosition = ref({ left: '0px', top: '0px' })

  // Category definitions with labels
  const categoryConfig = [
    { key: 'layout', label: t('agent.design.view.layouts') || '布局组件' },
    { key: 'data', label: t('agent.design.view.data') || '数据展示' },
    { key: 'form', label: t('agent.design.view.forms') || '表单组件' },
    { key: 'business', label: t('agent.design.view.business') || '智能体组件' },
    { key: 'basic', label: t('agent.design.view.basic') || '基础组件' }
  ]

  // Filter components based on search query
  const filteredCategories = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()

    return categoryConfig
      .map((config) => {
        const components = COMPONENT_LIBRARY.filter(
          (c) =>
            c.category === config.key &&
            (!query ||
              c.name.toLowerCase().includes(query) ||
              c.description.toLowerCase().includes(query) ||
              c.type.toLowerCase().includes(query))
        )
        return {
          ...config,
          components
        }
      })
      .filter((cat) => cat.components.length > 0)
  })

  // Toggle category collapse state
  function toggleCategory(categoryKey: string) {
    const newSet = new Set(collapsedCategories.value)
    if (newSet.has(categoryKey)) {
      newSet.delete(categoryKey)
    } else {
      newSet.add(categoryKey)
    }
    collapsedCategories.value = newSet
  }

  // Drag handlers
  function handleDragStart(event: DragEvent, component: ComponentMeta) {
    isDragging.value = component.type

    // Set drag data
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData('application/json', JSON.stringify(component))
      event.dataTransfer.setData('text/plain', component.name)
    }

    emit('drag-start', component)
  }

  function handleDragEnd() {
    isDragging.value = null
    emit('drag-end')
  }

  // Preview tooltip handlers
  function showPreview(event: MouseEvent, component: ComponentMeta) {
    previewComponent.value = component
    updatePreviewPosition(event)
  }

  function hidePreview() {
    previewComponent.value = null
  }

  function updatePreviewPosition(event: MouseEvent) {
    const offset = 16
    const rect = { width: 240, height: 100 }

    let left = event.clientX + offset
    let top = event.clientY + offset

    // Prevent overflow on right edge
    if (left + rect.width > window.innerWidth) {
      left = event.clientX - rect.width - offset
    }

    // Prevent overflow on bottom edge
    if (top + rect.height > window.innerHeight) {
      top = event.clientY - rect.height - offset
    }

    previewPosition.value = {
      left: `${left}px`,
      top: `${top}px`
    }
  }
</script>

<style scoped lang="scss">
  .component-library {
    width: 240px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-primary;
    border-right: 1px solid $border-color-base;
    overflow: hidden;
  }

  // Header with search
  .library-header {
    padding: $spacing-md;
    border-bottom: 1px solid $border-color-lighter;
    background: $bg-secondary;
  }

  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: $spacing-sm;
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: $spacing-sm $spacing-xl;
    padding-left: $spacing-xl + $spacing-xs;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-primary;
    outline: none;
    transition: all $transition-fast $ease-out;

    &::placeholder {
      color: $text-tertiary;
    }

    &:hover {
      border-color: $border-color-dark;
    }

    &:focus {
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
    }
  }

  .clear-btn {
    position: absolute;
    right: $spacing-xs;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    cursor: pointer;
    transition: all $transition-fast $ease-out;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-secondary;
    }
  }

  // Scrollable content area
  .library-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm 0;
  }

  // Empty state
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    text-align: center;

    .empty-icon {
      font-size: 32px;
      margin-bottom: $spacing-md;
      opacity: 0.6;
    }

    .empty-text {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0;
    }
  }

  // Category section
  .category-section {
    margin-bottom: $spacing-xs;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background $transition-fast $ease-out;

    &:hover {
      background: $bg-secondary;
    }

    &.collapsed {
      .collapse-icon {
        transform: rotate(-90deg);
      }
    }
  }

  .category-title {
    flex: 1;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    color: $text-tertiary;
    text-transform: uppercase;
    letter-spacing: $letter-spacing-wider;
    text-align: left;
  }

  .category-count {
    font-size: $font-size-xs;
    color: $text-tertiary;
    padding: 2px 6px;
    background: $bg-tertiary;
    border-radius: $border-radius-full;
    min-width: 20px;
    text-align: center;
  }

  .collapse-icon {
    width: 14px;
    height: 14px;
    color: $text-tertiary;
    transition: transform $transition-fast $ease-out;
  }

  // Category items container
  .category-items {
    padding: $spacing-xs $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  // Component item
  .component-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    cursor: grab;
    transition: all $transition-fast $ease-out;

    &:hover {
      border-color: #a855f7;
      box-shadow: 0 2px 8px rgba(168, 85, 247, 0.15);
      transform: translateY(-1px);
    }

    &:active {
      cursor: grabbing;
    }

    &.dragging {
      opacity: 0.5;
      border-color: #a855f7;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.25);
    }
  }

  .component-icon {
    font-size: 18px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .component-name {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // Collapse animation
  .collapse-enter-active,
  .collapse-leave-active {
    transition: all $transition-fast $ease-out;
    overflow: hidden;
  }

  .collapse-enter-from,
  .collapse-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  // Preview tooltip
  .component-preview {
    position: fixed;
    z-index: 1000;
    width: 240px;
    padding: $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    box-shadow:
      $shadow-lg,
      0 4px 20px rgba(168, 85, 247, 0.15);
    pointer-events: none;
  }

  .preview-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-sm;
  }

  .preview-icon {
    font-size: 20px;
  }

  .preview-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .preview-desc {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin: 0 0 $spacing-sm 0;
    line-height: $line-height-base;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .preview-meta {
    display: flex;
    gap: $spacing-md;
    padding-top: $spacing-sm;
    border-top: 1px solid $border-color-lighter;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-xs;
    color: $text-tertiary;

    svg {
      width: 12px;
      height: 12px;
    }
  }

  // Tooltip transition
  .tooltip-enter-active,
  .tooltip-leave-active {
    transition: all $transition-fast $ease-out;
  }

  .tooltip-enter-from,
  .tooltip-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
