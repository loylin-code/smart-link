<template>
  <div class="component-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('resource.componentManagement') }}</h1>
        <span class="page-desc">{{ t('component.managementDescription') }}</span>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tags">
      <button
        v-for="cat in componentsStore.categories"
        :key="cat.value"
        class="filter-tag"
        :class="{
          active:
            cat.value === 'all'
              ? !activeCategory || activeCategory === 'all'
              : activeCategory === cat.value
        }"
        @click="setCategory(cat.value)"
      >
        <span class="tag-label">{{ cat.label }}</span>
        <span v-if="cat.value !== 'all'" class="tag-count">
          {{ componentsStore.getCategoryCount(cat.value) }}
        </span>
      </button>
    </div>

    <!-- 组件列表标题 + 搜索框 -->
    <div class="section-header">
      <h2 class="section-title">
        {{ t('component.componentList')
        }}<span class="title-count">({{ componentsStore.stats.total }})</span>
      </h2>
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
          <path
            d="M21 21l-4.35-4.35"
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
    background: $bg-secondary;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-color-base;
      border-radius: 3px;

      &:hover {
        background: $text-tertiary;
      }
    }
  }

  // ================================
  // 页面头部
  // ================================
  .page-header {
    margin-bottom: $spacing-xl;

    .header-left {
      .page-title {
        display: block;
        font-size: $font-size-3xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin: 0 0 $spacing-xs 0;
        text-align: left;
      }

      .page-desc {
        display: block;
        font-size: $font-size-sm;
        color: $text-tertiary;
        margin: 0;
        text-align: left;
      }
    }
  }

  // ================================
  // 筛选标签
  // ================================
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-xs $spacing-md;
    background: $bg-primary;
    border: 1px solid transparent;
    border-radius: $border-radius-full;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba(59, 130, 246, 0.1);
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .tag-count {
    font-size: $font-size-xs;
    background: $bg-tertiary;
    padding: 0 6px;
    border-radius: $border-radius-full;
    color: $text-tertiary;
  }

  // ================================
  // 区块标题（标题 + 搜索框）
  // ================================
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    .title-count {
      font-size: $font-size-base;
      font-weight: $font-weight-normal;
      color: $text-tertiary;
    }
  }

  .section-header .search-box {
    position: relative;
    width: 280px;
    flex-shrink: 0;
  }

  .section-header .search-icon {
    position: absolute;
    left: $spacing-md;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: $text-tertiary;
    pointer-events: none;
  }

  .section-header .search-input {
    width: 100%;
    height: 40px;
    padding: $spacing-sm $spacing-md $spacing-sm 40px;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-lg;
    font-size: $font-size-sm;
    color: $text-primary;
    transition: all 0.2s ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      outline: none;
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }

  // ================================
  // 组件网格
  // ================================
  .component-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;
  }

  // ================================
  // 空状态
  // ================================
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

  // ================================
  // 响应式
  // ================================
  @media (max-width: 768px) {
    .component-management {
      padding: $spacing-md;
    }

    .component-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;

      .search-box {
        width: 100%;
      }
    }
  }
</style>
