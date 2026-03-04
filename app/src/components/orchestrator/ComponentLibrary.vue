<template>
  <div class="component-library">
    <!-- 搜索框 -->
    <div class="library-search">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('orchestrator.searchComponents')"
        class="search-input"
      />
      <svg class="search-icon" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
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
  import { h, defineComponent } from 'vue'
  import { useOrchestratorStore } from '@/store/modules/orchestrator'

  // 组件图标组件 - 使用渲染函数避免运行时编译
  const ComponentIcon = defineComponent({
    props: {
      type: { type: String, default: '' }
    },
    render() {
      const type = this.type || ''

      // 根据类型返回不同的图标
      if (type.includes('Button')) {
        return h('svg', { class: 'icon-svg', viewBox: '0 0 24 24', fill: 'none' }, [
          h('rect', {
            x: '3',
            y: '8',
            width: '18',
            height: '8',
            rx: '2',
            stroke: 'currentColor',
            'stroke-width': '2'
          })
        ])
      } else if (type.includes('Input')) {
        return h('svg', { class: 'icon-svg', viewBox: '0 0 24 24', fill: 'none' }, [
          h('rect', {
            x: '3',
            y: '6',
            width: '18',
            height: '12',
            rx: '2',
            stroke: 'currentColor',
            'stroke-width': '2'
          })
        ])
      } else if (type.includes('Card')) {
        return h('svg', { class: 'icon-svg', viewBox: '0 0 24 24', fill: 'none' }, [
          h('rect', {
            x: '3',
            y: '3',
            width: '18',
            height: '18',
            rx: '2',
            stroke: 'currentColor',
            'stroke-width': '2'
          })
        ])
      } else if (type.includes('Container')) {
        return h('svg', { class: 'icon-svg', viewBox: '0 0 24 24', fill: 'none' }, [
          h('rect', {
            x: '2',
            y: '2',
            width: '20',
            height: '20',
            rx: '2',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-dasharray': '4 2'
          })
        ])
      } else if (type.includes('Row') || type.includes('Col')) {
        return h('svg', { class: 'icon-svg', viewBox: '0 0 24 24', fill: 'none' }, [
          h('path', {
            d: 'M3 6h18M3 12h18M3 18h18',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round'
          })
        ])
      } else if (type.includes('Checkbox') || type.includes('Radio')) {
        return h('svg', { class: 'icon-svg', viewBox: '0 0 24 24', fill: 'none' }, [
          h('circle', { cx: '12', cy: '12', r: '8', stroke: 'currentColor', 'stroke-width': '2' })
        ])
      } else {
        return h('svg', { class: 'icon-svg', viewBox: '0 0 24 24', fill: 'none' }, [
          h('rect', {
            x: '4',
            y: '4',
            width: '16',
            height: '16',
            rx: '2',
            stroke: 'currentColor',
            'stroke-width': '2'
          })
        ])
      }
    }
  })

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
        background: #ffffff;
        border: 1px solid #1890ff;
        border-radius: 4px;
        color: #1890ff;
        font-size: 12px;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  @import '@/assets/styles/variables.scss';

  .component-library {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-primary;
  }

  .library-search {
    padding: $spacing-md;
    border-bottom: 1px solid $border-color-lighter;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: $spacing-sm $spacing-md $spacing-sm 36px;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    transition: all $transition-base ease;

    &:focus {
      outline: none;
      border-color: $primary-color;
      background: rgba($primary-color, 0.02);
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }

  .search-icon {
    position: absolute;
    left: $spacing-lg;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    pointer-events: none;
  }

  .category-tabs {
    display: flex;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border-bottom: 1px solid $border-color-lighter;
    overflow-x: auto;
    flex-shrink: 0;
    background: $bg-secondary;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .category-tab {
    flex-shrink: 0;
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    color: $text-secondary;
    cursor: pointer;
    white-space: nowrap;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.active {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }
  }

  .component-list {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm;
  }

  .component-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    margin-bottom: $spacing-xs;
    background: $bg-primary;
    border: 1px solid $border-color-lighter;
    border-radius: $border-radius-md;
    cursor: grab;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
      transform: translateX(4px);
      box-shadow: $shadow-sm;
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
    background: rgba($primary-color, 0.1);
    border-radius: $border-radius-sm;
    color: $primary-color;
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
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin-bottom: 2px;
  }

  .component-desc {
    font-size: $font-size-xs;
    color: $text-tertiary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    color: $text-tertiary;
    font-size: $font-size-sm;

    svg {
      width: 32px;
      height: 32px;
      margin-bottom: $spacing-sm;
      opacity: 0.5;
    }
  }

  :deep(.sl-input) {
    background: $bg-secondary !important;
    border-color: $border-color-base !important;

    .sl-input__inner {
      background: transparent !important;
      color: $text-primary !important;

      &::placeholder {
        color: $text-tertiary !important;
      }
    }
  }
</style>
