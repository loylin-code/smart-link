<template>
  <div class="data-model-list">
    <!-- 页面头部 - 放在最上方 -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('configModel.title') }}</h1>
        <span class="page-desc">{{ t('configModel.pageDesc') }}</span>
      </div>
      <div class="header-right">
        <button class="create-btn" @click="showCreateDialog = true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ t('configModel.createModel') }}</span>
        </button>
      </div>
    </header>

    <!-- 下方内容区 -->
    <div class="content-area">
      <!-- 左侧分类树 -->
      <aside class="category-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">{{ t('configModel.categoryTitle') }}</span>
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
            {{ t('configModel.newCategory') }}
          </button>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <main class="main-content">
        <!-- 列表标题 + 搜索框 -->
        <div class="section-header">
          <h2 class="section-title">
            {{ t('configModel.modelList')
            }}<span class="title-count">({{ filteredModels.length }})</span>
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
              :placeholder="t('configModel.searchPlaceholder')"
              @input="handleSearch"
            />
          </div>
        </div>

        <!-- 筛选标签 -->
        <div class="filter-tags">
          <button
            :class="['filter-tag', { active: typeFilter === undefined }]"
            @click="setTypeFilter(undefined)"
          >
            <span class="tag-label">{{ t('common.all') }}</span>
            <span class="tag-count">{{ filteredModels.length }}</span>
          </button>
          <button
            v-for="type in modelTypes"
            :key="type.value"
            :class="['filter-tag', { active: typeFilter === type.value }]"
            @click="setTypeFilter(type.value)"
          >
            <span v-if="type.icon" class="tag-icon">{{ type.icon }}</span>
            <span class="tag-label">{{ type.label }}</span>
            <span class="tag-count">{{ getTypeCount(type.value) }}</span>
          </button>
        </div>

        <!-- 模型卡片网格 -->
        <div v-if="displayModels.length" class="model-grid">
          <div
            v-for="model in displayModels"
            :key="model.id"
            class="model-card"
            @click="openDetail(model)"
          >
            <div class="card-header">
              <div class="card-icon">{{ getModelTypeIcon(model.type) }}</div>
              <div class="card-header-info">
                <h3 class="card-name">{{ model.displayName }}</h3>
                <div class="card-tags">
                  <span class="model-type">{{ getModelTypeLabel(model.type) }}</span>
                  <span class="version">v{{ model.version }}</span>
                </div>
              </div>
            </div>
            <div class="card-stats">
              <div class="stat-row">
                <span class="stat-label">{{ t('configModel.fieldCount') }}:</span>
                <span class="stat-value"
                  >{{ model.fields.length }} {{ t('configModel.fields') }}</span
                >
              </div>
              <div class="stat-row">
                <span class="stat-label">{{ t('configModel.relationCount') }}:</span>
                <span class="stat-value"
                  >{{ model.relations.length }} {{ t('configModel.models') }}</span
                >
              </div>
            </div>
            <div class="card-footer">
              <span class="update-time"
                >{{ t('configModel.updated') }}: {{ formatTime(model.updatedAt) }}</span
              >
            </div>

            <!-- 悬浮操作按钮 -->
            <div class="card-actions" @click.stop>
              <button class="action-btn primary" @click="openDetail(model)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{{ t('common.edit') }}</span>
              </button>
              <button class="action-btn" @click="handleDelete(model)" :title="t('common.delete')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
          <p>{{ t('configModel.noModels') }}</p>
        </div>

        <!-- 分页 -->
        <div v-if="displayModels.length" class="pagination">
          <span class="pagination-info">
            {{ t('configModel.showing') }} {{ paginationStart }}-{{ paginationEnd }} /
            {{ t('configModel.total') }} {{ totalCount }} {{ t('configModel.items') }}
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
    </div>

    <!-- 创建模型弹窗 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ t('configModel.createModelTitle') }}</h3>
          <button class="close-btn" @click="showCreateDialog = false">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>{{ t('configModel.modelName') }} <span class="required">*</span></label>
            <input
              v-model="newModel.name"
              type="text"
              :placeholder="t('configModel.modelNamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ t('configModel.displayName') }} <span class="required">*</span></label>
            <input
              v-model="newModel.displayName"
              type="text"
              :placeholder="t('configModel.displayNamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ t('configModel.modelType') }} <span class="required">*</span></label>
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
            <label>{{ t('configModel.category') }} <span class="required">*</span></label>
            <select v-model="newModel.category">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('configModel.description') }}</label>
            <textarea
              v-model="newModel.description"
              rows="3"
              :placeholder="t('configModel.descriptionPlaceholder')"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="showCreateDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="createModel">
            {{ t('configModel.createAndEdit') }}
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
          <h3>{{ t('configModel.newCategoryTitle') }}</h3>
          <button class="close-btn" @click="showNewCategoryDialog = false">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>{{ t('configModel.categoryName') }} <span class="required">*</span></label>
            <input
              v-model="newCategory.name"
              type="text"
              :placeholder="t('configModel.categoryNamePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ t('configModel.categoryIcon') }}</label>
            <input v-model="newCategory.icon" type="text" placeholder="📁" maxlength="2" />
          </div>
          <div class="form-group">
            <label>{{ t('configModel.categoryDescription') }}</label>
            <textarea
              v-model="newCategory.description"
              rows="2"
              :placeholder="t('configModel.categoryDescriptionPlaceholder')"
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
    { id: 'all', name: t('configModel.allModels'), icon: '📂' },
    ...dataModelStore.categories
  ])

  const modelTypes = [
    {
      value: 'entity' as DataModelType,
      label: t('configModel.type.entity'),
      icon: '📄',
      description: t('configModel.type.entityDesc')
    },
    {
      value: 'input' as DataModelType,
      label: t('configModel.type.input'),
      icon: '📥',
      description: t('configModel.type.inputDesc')
    },
    {
      value: 'output' as DataModelType,
      label: t('configModel.type.output'),
      icon: '📤',
      description: t('configModel.type.outputDesc')
    },
    {
      value: 'intermediate' as DataModelType,
      label: t('configModel.type.intermediate'),
      icon: '🔄',
      description: t('configModel.type.intermediateDesc')
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

  // Get model count for a category
  const getCategoryModelCount = (categoryId: string): number => {
    if (categoryId === 'all') {
      return dataModelStore.models.length
    }
    return dataModelStore.models.filter((m) => m.category === categoryId).length
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

  const getModelTypeIcon = (type: DataModelType): string => {
    const found = modelTypes.find((t) => t.value === type)
    return found?.icon || '📄'
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
    router.push(`/app/semantic/configModel/${model.id}`)
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
    router.push(`/app/semantic/configModel/${model.id}`)
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

  const handleDelete = (model: DataModel) => {
    if (confirm(t('configModel.confirmDelete'))) {
      dataModelStore.deleteModel(model.id)
    }
  }
</script>

<style scoped lang="scss">
  .data-model-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: $bg-secondary;
  }

  // ================================
  // 页面头部
  // ================================
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $spacing-lg;
    padding: $spacing-xl $spacing-xl 0;
  }

  .header-left {
    flex: 1;

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

  .header-right {
    flex-shrink: 0;
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-lg;
    background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
    border: none;
    border-radius: $border-radius-lg;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
  }

  // ================================
  // 下方内容区
  // ================================
  .content-area {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding: $spacing-xl;
    padding-top: $spacing-lg;
  }

  // 左侧分类树
  .category-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: $spacing-lg;
    padding-bottom: $spacing-md;
  }

  .sidebar-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
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

  // ================================
  // 主内容区
  // ================================
  .main-content {
    flex: 1;
    padding: 0;
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    overflow-y: auto;
    margin-left: $spacing-lg;
  }

  // ================================
  // 列表标题 + 搜索框
  // ================================
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-lg;
    padding: $spacing-lg;
    padding-bottom: $spacing-md;
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

  .search-icon {
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
    background: $bg-secondary;
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
  // 筛选标签
  // ================================
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    padding: 0 $spacing-lg $spacing-md;
  }

  .filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid transparent;
    border-radius: $border-radius-full;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    .tag-icon {
      font-size: 14px;
    }

    .tag-label {
      font-weight: $font-weight-medium;
    }

    .tag-count {
      font-size: $font-size-xs;
      background: $bg-tertiary;
      border: 1px solid $border-color-light;
      padding: 0 6px;
      border-radius: $border-radius-full;
      color: $text-tertiary;
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba(59, 130, 246, 0.1);
      border-color: $primary-color;
      color: $primary-color;

      .tag-count {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.3);
        color: $primary-color;
      }
    }
  }

  // ================================
  // 模型卡片网格
  // ================================
  .model-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;
    padding: $spacing-lg;
    padding-top: 0;
  }

  .model-card {
    position: relative;
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);

      .card-actions {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $border-color-light;
  }

  .card-icon {
    font-size: 36px;
    flex-shrink: 0;
  }

  .card-header-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .card-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-tags {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .model-type {
    font-size: $font-size-xs;
    color: $text-secondary;
  }

  .version {
    font-size: $font-size-xs;
    color: $primary-color;
    background: rgba(59, 130, 246, 0.1);
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

  // ================================
  // 悬浮操作按钮
  // ================================
  .card-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-md;
    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(255, 255, 255, 0.95) 100%
    );
    border-top: 1px solid $border-color-lighter;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.primary {
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      border-color: transparent;
      color: #fff;

      &:hover {
        background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      }
    }
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
    text-align: center;

    svg {
      width: 80px;
      height: 80px;
      color: $text-tertiary;
      margin-bottom: $spacing-md;
    }

    p {
      font-size: $font-size-base;
      color: $text-secondary;
      margin: 0;
    }
  }

  // ================================
  // 分页
  // ================================
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-lg;
    padding-top: 0;
  }

  .pagination-info {
    display: none;
  }

  .pagination-controls {
    display: flex;
    gap: $spacing-xs;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.active {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

  // ================================
  // 深色模式适配
  // ================================
  [data-theme='dark'] {
    .card-actions {
      background: linear-gradient(to top, rgba(30, 41, 59, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
      border-top-color: $border-color-base;
    }

    .action-btn {
      background: $bg-tertiary;
      border-color: $border-color-base;

      &.primary {
        background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      }
    }

    .model-card {
      background: $bg-tertiary;
    }

    .search-input {
      background: $bg-tertiary;
    }

    .filter-tag {
      background: $bg-tertiary;

      &.active {
        background: rgba(96, 165, 250, 0.15);
      }
    }
  }

  // ================================
  // 响应式
  // ================================
  @media (max-width: 1200px) {
    .model-grid {
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .content-area {
      padding: $spacing-md;
    }

    .category-sidebar {
      width: 200px;
    }

    .model-grid {
      grid-template-columns: 1fr;
    }

    .card-actions {
      opacity: 1;
      transform: translateY(0);
      position: static;
      background: $bg-tertiary;
      backdrop-filter: none;
      border-top: 1px solid $border-color-light;
      margin-top: $spacing-md;
      padding: $spacing-sm 0 0 0;
    }

    .filter-section {
      flex-direction: column;
      align-items: stretch;
    }

    .search-box {
      max-width: 100%;
    }
  }

  @media (max-width: 576px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;
      padding: $spacing-lg $spacing-md 0;
    }

    .header-right {
      width: 100%;
    }

    .content-area {
      flex-direction: column;
      padding: $spacing-md;
    }

    .category-sidebar {
      display: none;
    }

    .main-content {
      margin-left: 0;
    }

    .create-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
