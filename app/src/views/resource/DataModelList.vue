<template>
  <div class="data-model-list">
    <!-- 左侧分类树 -->
    <aside class="category-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">{{ t('datamodel.categoryTitle') }}</span>
      </div>

      <div class="category-list">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['category-item', { active: selectedCategory === cat.id }]"
          @click="selectCategory(cat.id)"
        >
          <span class="category-icon">{{ cat.icon }}</span>
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ getCategoryModelCount(cat.id) }}</span>
        </button>
      </div>

      <div class="sidebar-footer">
        <button class="new-category-btn" @click="showNewCategoryDialog = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ t('datamodel.newCategory') }}
        </button>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main-content">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-left">
          <h1 class="page-title">{{ t('datamodel.title') }}</h1>
          <span class="current-category-label">
            {{ t('datamodel.currentCategory') }}: {{ getCurrentCategoryName() }}
          </span>
        </div>
        <button class="create-btn" @click="showCreateDialog = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('datamodel.createModel') }}</span>
        </button>
      </header>

      <!-- 搜索栏 -->
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
          :placeholder="t('datamodel.searchPlaceholder')"
          @input="handleSearch"
        />
      </div>

      <!-- 类型筛选 -->
      <div class="filter-section">
        <span class="filter-label">{{ t('datamodel.filterByType') }}:</span>
        <div class="filter-tags">
          <button
            :class="['filter-tag', { active: typeFilter === undefined }]"
            @click="setTypeFilter(undefined)"
          >
            {{ t('common.all') }}
            <span class="tag-count">{{ filteredModels.length }}</span>
          </button>
          <button
            v-for="type in modelTypes"
            :key="type.value"
            :class="['filter-tag', { active: typeFilter === type.value }]"
            @click="setTypeFilter(type.value)"
          >
            <span class="type-icon">{{ type.icon }}</span>
            {{ type.label }}
            <span class="tag-count">{{ getTypeCount(type.value) }}</span>
          </button>
        </div>
      </div>

      <!-- 模型卡片网格 -->
      <div v-if="displayModels.length" class="model-grid">
        <div
          v-for="model in displayModels"
          :key="model.id"
          class="model-card"
          @click="openDetail(model)"
        >
          <div class="card-icon">📄</div>
          <h3 class="card-name">{{ model.displayName }}</h3>
          <div class="card-meta">
            <span class="model-type">{{ getModelTypeLabel(model.type) }}</span>
            <span class="version">v{{ model.version }}</span>
          </div>
          <div class="card-stats">
            <div class="stat-row">
              <span class="stat-label">{{ t('datamodel.fieldCount') }}:</span>
              <span class="stat-value">{{ model.fields.length }} {{ t('datamodel.fields') }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">{{ t('datamodel.relationCount') }}:</span>
              <span class="stat-value"
                >{{ model.relations.length }} {{ t('datamodel.models') }}</span
              >
            </div>
          </div>
          <div class="card-footer">
            <span class="update-time"
              >{{ t('datamodel.updated') }}: {{ formatTime(model.updatedAt) }}</span
            >
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
        </svg>
        <p>{{ t('datamodel.noModels') }}</p>
      </div>

      <!-- 分页 -->
      <div v-if="displayModels.length" class="pagination">
        <span class="pagination-info">
          {{ t('datamodel.showing') }} {{ paginationStart }}-{{ paginationEnd }} /
          {{ t('datamodel.total') }} {{ totalCount }} {{ t('datamodel.items') }}
        </span>
        <div class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            &lt;
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            &gt;
          </button>
        </div>
      </div>
    </main>

    <!-- 创建模型弹窗 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ t('datamodel.createModelTitle') }}</h3>
          <button class="close-btn" @click="showCreateDialog = false">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>{{ t('datamodel.modelName') }} <span class="required">*</span></label>
            <input
              v-model="newModel.name"
              type="text"
              :placeholder="t('datamodel.modelNamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.displayName') }} <span class="required">*</span></label>
            <input
              v-model="newModel.displayName"
              type="text"
              :placeholder="t('datamodel.displayNamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.modelType') }} <span class="required">*</span></label>
            <div class="radio-group">
              <label v-for="type in modelTypes" :key="type.value" class="radio-label">
                <input v-model="newModel.type" type="radio" :value="type.value" />
                <span class="type-icon">{{ type.icon }}</span>
                <span>{{ type.label }}</span>
                <small>{{ type.description }}</small>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.category') }} <span class="required">*</span></label>
            <select v-model="newModel.category">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.description') }}</label>
            <textarea
              v-model="newModel.description"
              rows="3"
              :placeholder="t('datamodel.descriptionPlaceholder')"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="createModel">
            {{ t('datamodel.createAndEdit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新建分类弹窗 -->
    <div
      v-if="showNewCategoryDialog"
      class="dialog-overlay"
      @click.self="showNewCategoryDialog = false"
    >
      <div class="dialog dialog-small">
        <div class="dialog-header">
          <h3>{{ t('datamodel.newCategoryTitle') }}</h3>
          <button class="close-btn" @click="showNewCategoryDialog = false">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>{{ t('datamodel.categoryName') }} <span class="required">*</span></label>
            <input
              v-model="newCategory.name"
              type="text"
              :placeholder="t('datamodel.categoryNamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.categoryIcon') }}</label>
            <input v-model="newCategory.icon" type="text" placeholder="📁" maxlength="2" />
          </div>
          <div class="form-group">
            <label>{{ t('datamodel.categoryDescription') }}</label>
            <textarea
              v-model="newCategory.description"
              rows="2"
              :placeholder="t('datamodel.categoryDescriptionPlaceholder')"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="showNewCategoryDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="createCategory">
            {{ t('common.create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useDataModelStore } from '@/store/modules/datamodel'
  import type { DataModel, DataModelType } from '@/types'

  const { t } = useI18n()
  const router = useRouter()
  const dataModelStore = useDataModelStore()

  // State
  const selectedCategory = ref<string>('all')
  const searchKeyword = ref('')
  const typeFilter = ref<DataModelType | undefined>(undefined)
  const currentPage = ref(1)
  const pageSize = ref(8)
  const showCreateDialog = ref(false)
  const showNewCategoryDialog = ref(false)

  const newModel = ref({
    name: '',
    displayName: '',
    type: 'entity' as DataModelType,
    category: 'asset',
    description: ''
  })

  const newCategory = ref({
    name: '',
    icon: '📁',
    description: ''
  })

  // Constants
  const categories = computed(() => [
    { id: 'all', name: t('datamodel.allModels'), icon: '📂' },
    ...dataModelStore.categories
  ])

  const modelTypes = [
    {
      value: 'entity' as DataModelType,
      label: t('datamodel.type.entity'),
      icon: '📄',
      description: t('datamodel.type.entityDesc')
    },
    {
      value: 'input' as DataModelType,
      label: t('datamodel.type.input'),
      icon: '📥',
      description: t('datamodel.type.inputDesc')
    },
    {
      value: 'output' as DataModelType,
      label: t('datamodel.type.output'),
      icon: '📤',
      description: t('datamodel.type.outputDesc')
    },
    {
      value: 'intermediate' as DataModelType,
      label: t('datamodel.type.intermediate'),
      icon: '🔄',
      description: t('datamodel.type.intermediateDesc')
    }
  ]

  // Computed
  const filteredModels = computed(() => {
    let result = dataModelStore.models

    if (selectedCategory.value !== 'all') {
      result = result.filter((m) => m.category === selectedCategory.value)
    }

    if (typeFilter.value) {
      result = result.filter((m) => m.type === typeFilter.value)
    }

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(keyword) ||
          m.displayName.toLowerCase().includes(keyword) ||
          m.description.toLowerCase().includes(keyword)
      )
    }

    return result
  })

  const totalCount = computed(() => filteredModels.value.length)
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

  const displayModels = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredModels.value.slice(start, end)
  })

  const paginationStart = computed(() => (currentPage.value - 1) * pageSize.value + 1)
  const paginationEnd = computed(() =>
    Math.min(currentPage.value * pageSize.value, totalCount.value)
  )

  const visiblePages = computed(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  })

  // Methods
  const selectCategory = (categoryId: string) => {
    selectedCategory.value = categoryId
    currentPage.value = 1
    dataModelStore.setFilter({ category: categoryId === 'all' ? undefined : categoryId })
  }

  const getCategoryModelCount = (categoryId: string): number => {
    if (categoryId === 'all') return dataModelStore.models.length
    return dataModelStore.models.filter((m) => m.category === categoryId).length
  }

  const getCurrentCategoryName = (): string => {
    const cat = categories.value.find((c) => c.id === selectedCategory.value)
    return cat?.name || t('datamodel.allModels')
  }

  const handleSearch = () => {
    dataModelStore.setFilter({ keyword: searchKeyword.value })
    currentPage.value = 1
  }

  const setTypeFilter = (type: DataModelType | undefined) => {
    typeFilter.value = type
    dataModelStore.setFilter({ type })
    currentPage.value = 1
  }

  const getTypeCount = (type: DataModelType): number => {
    let result = dataModelStore.models
    if (selectedCategory.value !== 'all') {
      result = result.filter((m) => m.category === selectedCategory.value)
    }
    return result.filter((m) => m.type === type).length
  }

  const getModelTypeLabel = (type: DataModelType): string => {
    const found = modelTypes.find((t) => t.value === type)
    return found?.label || type
  }

  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) return t('common.justNow')
    if (diff < hour) return `${Math.floor(diff / minute)}${t('common.minutesAgo')}`
    if (diff < day) return `${Math.floor(diff / hour)}${t('common.hoursAgo')}`
    return `${Math.floor(diff / day)}${t('common.daysAgo')}`
  }

  const openDetail = (model: DataModel) => {
    router.push(`/app/resource/datamodel/${model.id}`)
  }

  const createModel = () => {
    if (!newModel.value.name || !newModel.value.displayName) return

    const model: DataModel = {
      id: `model_${Date.now()}`,
      name: newModel.value.name,
      displayName: newModel.value.displayName,
      type: newModel.value.type,
      category: newModel.value.category,
      description: newModel.value.description,
      version: '1.0.0',
      fields: [],
      relations: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    dataModelStore.addModel(model)
    showCreateDialog.value = false

    // 重置表单
    newModel.value = {
      name: '',
      displayName: '',
      type: 'entity',
      category: 'asset',
      description: ''
    }

    // 跳转到详情页
    router.push(`/app/resource/datamodel/${model.id}`)
  }

  const createCategory = () => {
    if (!newCategory.value.name) return

    dataModelStore.addCategory({
      id: `cat_${Date.now()}`,
      name: newCategory.value.name,
      icon: newCategory.value.icon || '📁',
      description: newCategory.value.description,
      modelCount: 0
    })

    showNewCategoryDialog.value = false
    newCategory.value = { name: '', icon: '📁', description: '' }
  }
</script>

<style scoped lang="scss">
  .data-model-list {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  // 左侧分类树
  .category-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: $bg-secondary;
    border-right: 1px solid $border-color-light;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: $spacing-lg $spacing-lg $spacing-sm;
  }

  .sidebar-title {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .category-list {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-sm $spacing-md;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    margin-bottom: $spacing-xs;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba(24, 144, 255, 0.1);
      border-color: rgba(24, 144, 255, 0.2);
      color: $primary-color;
    }
  }

  .category-icon {
    font-size: 16px;
  }

  .category-name {
    flex: 1;
    text-align: left;
  }

  .category-count {
    font-size: $font-size-xs;
    background: $bg-tertiary;
    padding: 2px 8px;
    border-radius: $border-radius-full;
    color: $text-tertiary;
  }

  .category-item.active .category-count {
    background: rgba(24, 144, 255, 0.2);
    color: $primary-color;
  }

  .sidebar-footer {
    padding: $spacing-md;
    border-top: 1px solid $border-color-light;
  }

  .new-category-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: 1px dashed $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: rgba(24, 144, 255, 0.05);
    }
  }

  // 右侧主内容
  .main-content {
    flex: 1;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
  }

  .header-left {
    display: flex;
    align-items: baseline;
    gap: $spacing-md;
  }

  .page-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  .current-category-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: 1px solid $primary-color;
    border-radius: $border-radius-md;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background: $primary-light;
      border-color: $primary-light;
    }
  }

  // 搜索栏
  .search-bar {
    position: relative;
    margin-bottom: $spacing-lg;
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

  // 筛选区
  .filter-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }

  .filter-tags {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-xs $spacing-md;
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

  .type-icon {
    font-size: 14px;
  }

  .tag-count {
    font-size: $font-size-xs;
    background: $bg-tertiary;
    border: 1px solid $border-color-light;
    padding: 0 6px;
    border-radius: $border-radius-full;
    color: $text-tertiary;
  }

  .filter-tag.active .tag-count {
    background: rgba(24, 144, 255, 0.2);
    border-color: rgba(24, 144, 255, 0.3);
    color: $primary-color;
  }

  // 模型卡片网格
  .model-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .model-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }

  .card-icon {
    font-size: 32px;
    margin-bottom: $spacing-sm;
  }

  .card-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-xs 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $border-color-light;
  }

  .model-type {
    font-size: $font-size-xs;
    color: $text-secondary;
  }

  .version {
    font-size: $font-size-xs;
    color: $primary-color;
    background: rgba(24, 144, 255, 0.1);
    padding: 2px 8px;
    border-radius: $border-radius-full;
  }

  .card-stats {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .stat-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }

  .card-footer {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  // 空状态
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

  // 分页
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .pagination-info {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .pagination-controls {
    display: flex;
    gap: $spacing-xs;
  }

  .page-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.active {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }
  }

  // 弹窗
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &.dialog-small {
      max-width: 400px;
    }
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-lg;
    border-bottom: 1px solid $border-color-light;

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: $text-tertiary;
    font-size: 20px;
    cursor: pointer;
    padding: $spacing-xs;
    line-height: 1;

    &:hover {
      color: $text-primary;
    }
  }

  .dialog-body {
    padding: $spacing-lg;
    overflow-y: auto;
    flex: 1;
  }

  .form-group {
    margin-bottom: $spacing-md;

    label {
      display: block;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-secondary;
      margin-bottom: $spacing-xs;
    }
  }

  .required {
    color: $error;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;
    transition: all $transition-base ease;

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    &::placeholder {
      color: $text-tertiary;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
    }

    input[type='radio'] {
      width: auto;
    }

    .type-icon {
      font-size: 16px;
    }

    small {
      margin-left: auto;
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
    padding: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-base ease;
    border: 1px solid transparent;

    &.btn-secondary {
      background: $bg-secondary;
      border-color: $border-color-base;
      color: $text-secondary;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }

    &.btn-primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
        border-color: $primary-light;
      }
    }
  }
</style>
