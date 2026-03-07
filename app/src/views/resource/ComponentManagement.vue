<template>
  <div class="component-management">
    <div class="page-header">
      <h1 class="page-title">{{ t('resource.componentManagement') }}</h1>
      <div class="header-stats">
        <span class="stat-item">
          <span class="stat-value">{{ componentsStore.stats.total }}</span>
          <span class="stat-label">{{ t('component.total') }}</span>
        </span>
      </div>
    </div>

    <div class="category-tabs">
      <button
        v-for="cat in componentsStore.categories"
        :key="cat.value"
        :class="['tab-item', { active: activeCategory === cat.value }]"
        @click="setCategory(cat.value)"
      >
        {{ cat.label }}
        <span v-if="cat.value !== 'all'" class="tab-count">
          {{ componentsStore.getCategoryCount(cat.value) }}
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
        :placeholder="t('component.searchPlaceholder')"
        @input="handleSearch"
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
      <p>{{ t('component.empty') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useComponentsStore } from '@/store/modules/components'
  import type { ComponentMeta } from '@smart-link/core'
  import ComponentCard from '@/components/component/ComponentCard.vue'

  const router = useRouter()
  const { t } = useI18n()
  const componentsStore = useComponentsStore()

  const activeCategory = ref('all')
  const searchKeyword = ref('')

  // 使用 store 的过滤组件列表
  const filteredComponents = computed(() => {
    return componentsStore.filteredComponents
  })

  // 设置分类
  function setCategory(category: string) {
    activeCategory.value = category
    componentsStore.setFilter({ category: category === 'all' ? undefined : category })
  }

  // 搜索处理
  function handleSearch() {
    componentsStore.setFilter({ keyword: searchKeyword.value })
  }

  // 打开详情页
  function openDetail(component: ComponentMeta) {
    componentsStore.setCurrentComponent(component)
    router.push(`/app/resource/components/${component.type}`)
  }

  // 组件挂载时初始化
  onMounted(() => {
    // 重置筛选条件
    componentsStore.setFilter({ keyword: '', category: undefined })
  })
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
    border: 1px solid $border-color-light;
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
    border: 1px solid $border-color-light;
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
      background: rgba(24, 144, 255, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .tab-count {
    font-size: $font-size-xs;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
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
    border: 1px solid $border-color-base;
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
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
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