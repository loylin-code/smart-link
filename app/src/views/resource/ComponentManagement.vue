<template>
  <div class="component-management">
    <div class="page-header">
      <h1 class="page-title">前端组件管理</h1>
      <div class="header-stats">
        <span class="stat-item">
          <span class="stat-value">{{ componentList.length }}</span>
          <span class="stat-label">组件总数</span>
        </span>
      </div>
    </div>

    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.value"
        :class="['tab-item', { active: activeCategory === cat.value }]"
        @click="activeCategory = cat.value"
      >
        {{ cat.label }}
        <span v-if="cat.value !== 'all'" class="tab-count">
          {{ getCategoryCount(cat.value) }}
        </span>
      </button>
    </div>

    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" class="search-icon">
        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
        <path
          d="M21 21L16.65 16.65"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <input
        v-model="searchKeyword"
        type="text"
        class="search-input"
        placeholder="搜索组件名称..."
      />
    </div>

    <div v-if="filteredComponents.length" class="component-grid">
      <ComponentCard
        v-for="component in filteredComponents"
        :key="component.type"
        :component="component"
        @click="openDetail(component)"
      />
    </div>

    <div v-else class="empty-state">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
      </svg>
      <p>暂无匹配的组件</p>
    </div>

    <SlDrawer v-model="drawerVisible" :title="currentComponent?.name || '组件详情'" size="640px">
      <ComponentDetail v-if="currentComponent" :component="currentComponent" />
    </SlDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { COMPONENT_META_LIST, COMPONENT_CATEGORIES } from '@smart-link/shared'
  import type { ComponentMeta } from '@smart-link/shared'
  import { SlDrawer } from '@smart-link/ui'
  import ComponentCard from '@/components/component/ComponentCard.vue'
  import ComponentDetail from '@/components/component/ComponentDetail.vue'

  const componentList = COMPONENT_META_LIST
  const categories = COMPONENT_CATEGORIES

  const activeCategory = ref('all')
  const searchKeyword = ref('')
  const drawerVisible = ref(false)
  const currentComponent = ref<ComponentMeta | null>(null)

  const filteredComponents = computed(() => {
    let result = componentList

    if (activeCategory.value !== 'all') {
      result = result.filter((c) => c.category === activeCategory.value)
    }

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.type.toLowerCase().includes(keyword) ||
          c.description.toLowerCase().includes(keyword)
      )
    }

    return result
  })

  const getCategoryCount = (category: string) => {
    return componentList.filter((c) => c.category === category).length
  }

  const openDetail = (component: ComponentMeta) => {
    currentComponent.value = component
    drawerVisible.value = true
  }
</script>

<style scoped lang="scss">
  .component-management {
    height: 100%;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
  }

  .page-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .header-stats {
    display: flex;
    gap: $spacing-lg;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-sm $spacing-lg;
    background: $bg-secondary;
    border-radius: $border-radius-md;
  }

  .stat-value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $primary-color;
  }

  .stat-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .category-tabs {
    display: flex;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-sm $spacing-lg;
    background: $bg-secondary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-full;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $text-primary;
    }

    &.active {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(124, 58, 237, 0.1));
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .tab-count {
    font-size: $font-size-xs;
    background: $bg-elevated;
    padding: 0 6px;
    border-radius: $border-radius-full;
    color: $text-tertiary;
  }

  .search-bar {
    position: relative;
    margin-bottom: $spacing-xl;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: $text-tertiary;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: $spacing-sm $spacing-md $spacing-sm 40px;
    background: $bg-secondary;
    border: 1px solid $bg-elevated;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;
    transition: all $transition-base ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    color: $text-tertiary;

    svg {
      width: 80px;
      height: 80px;
      margin-bottom: $spacing-md;
    }

    p {
      font-size: $font-size-base;
    }
  }
</style>
