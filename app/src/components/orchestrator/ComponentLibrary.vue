<template>
  <div class="component-library">
    <!-- 搜索框 -->
    <div class="library-search">
      <SlInput
        v-model="searchQuery"
        :placeholder="t('orchestrator.searchComponents')"
        clearable
        size="small"
      >
        <template #prefix>
          <svg class="search-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </template>
      </SlInput>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <div
        v-for="cat in filteredCategories"
        :key="cat.value"
        class="category-tab"
        :class="{ active: activeCategory === cat.value }"
        @click="activeCategory = cat.value"
      >
        {{ cat.label }}
      </div>
    </div>

    <!-- 组件列表 -->
    <div class="component-list">
      <div
        v-for="component in filteredComponents"
        :key="component.type"
        class="component-item"
        draggable="true"
        @dragstart="handleDragStart($event, component)"
        @dragend="handleDragEnd"
      >
        <div class="component-icon">
          <ComponentIcon :type="component.type" />
        </div>
        <div class="component-info">
          <div class="component-name">{{ component.name }}</div>
          <div class="component-desc">{{ component.description }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredComponents.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ t('orchestrator.noComponents') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { COMPONENT_META_LIST, COMPONENT_CATEGORIES, type ComponentMeta } from '@smart-link/shared'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'

  // 组件图标组件
  const ComponentIcon = {
    props: ['type'],
    template: `
    <svg viewBox="0 0 24 24" fill="none" class="icon-svg">
      <rect v-if="type.includes('Button')" x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" stroke-width="2"/>
      <rect v-else-if="type.includes('Input')" x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
      <rect v-else-if="type.includes('Card')" x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
      <rect v-else-if="type.includes('Container')" x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/>
      <path v-else-if="type.includes('Row') || type.includes('Col')" d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <circle v-else-if="type.includes('Checkbox') || type.includes('Radio')" cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>
      <rect v-else x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
    </svg>
  `
  }

  const { t } = useI18n()
  const store = useOrchestratorStore()

  // 搜索查询
  const searchQuery = ref('')

  // 当前分类
  const activeCategory = ref('all')

  // 过滤分类
  const filteredCategories = computed(() => {
    const categories = COMPONENT_CATEGORIES.map((cat) => ({
      value: cat.value,
      label: t(`orchestrator.categories.${cat.value}`)
    }))
    return categories
  })

  // 过滤组件
  const filteredComponents = computed(() => {
    let components = COMPONENT_META_LIST

    // 按分类过滤
    if (activeCategory.value !== 'all') {
      components = components.filter((c) => c.category === activeCategory.value)
    }

    // 按搜索词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      components = components.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.type.toLowerCase().includes(query)
      )
    }

    return components
  })

  // 拖拽开始
  function handleDragStart(event: DragEvent, component: ComponentMeta) {
    if (!event.dataTransfer) return

    // 设置拖拽数据
    event.dataTransfer.setData('componentType', component.type)
    event.dataTransfer.effectAllowed = 'copy'

    // 设置拖拽图像
    const dragImage = document.createElement('div')
    dragImage.className = 'drag-preview'
    dragImage.textContent = component.name
    dragImage.style.cssText = `
    position: absolute;
    top: -1000px;
    padding: 8px 16px;
    background: #1E2447;
    border: 1px solid #00D4FF;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    pointer-events: none;
  `
    document.body.appendChild(dragImage)
    event.dataTransfer.setDragImage(dragImage, 0, 0)
    setTimeout(() => dragImage.remove(), 0)

    // 更新状态
    store.startDragComponent(component.type)
  }

  // 拖拽结束
  function handleDragEnd() {
    store.endDrag()
  }
</script>

<style scoped lang="scss">
  .component-library {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
  }

  .library-search {
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .search-icon {
    width: 16px;
    height: 16px;
    color: rgba(255, 255, 255, 0.45);
  }

  .category-tabs {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    overflow-x: auto;
    flex-shrink: 0;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .category-tab {
    flex-shrink: 0;
    padding: 4px 12px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      border-color: #00d4ff;
      color: #00d4ff;
    }

    &.active {
      background: #00d4ff;
      border-color: #00d4ff;
      color: #fff;
    }
  }

  .component-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .component-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    margin-bottom: 4px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s;

    &:hover {
      border-color: rgba(0, 212, 255, 0.3);
      background: rgba(0, 212, 255, 0.05);
      transform: translateX(4px);
    }

    &:active {
      cursor: grabbing;
    }
  }

  .component-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    color: #00d4ff;
  }

  .icon-svg {
    width: 20px;
    height: 20px;
  }

  .component-info {
    flex: 1;
    min-width: 0;
  }

  .component-name {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 2px;
  }

  .component-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: rgba(255, 255, 255, 0.25);
    font-size: 13px;

    svg {
      width: 32px;
      height: 32px;
      margin-bottom: 8px;
    }
  }

  :deep(.sl-input) {
    background: rgba(255, 255, 255, 0.04) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;

    .sl-input__inner {
      background: transparent !important;
      color: rgba(255, 255, 255, 0.85) !important;

      &::placeholder {
        color: rgba(255, 255, 255, 0.35) !important;
      }
    }
  }
</style>
