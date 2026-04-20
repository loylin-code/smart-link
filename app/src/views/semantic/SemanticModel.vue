<template>
  <div class="semantic-model">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('sidebar.vocabulary') }}</h1>
        <span class="page-desc">{{ t('semantic.vocabulary.description') }}</span>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="handleImport">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('semantic.vocabulary.import') }}</span>
        </button>
        <button class="action-btn secondary" @click="handleExport">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('semantic.vocabulary.export') }}</span>
        </button>
        <button class="action-btn primary" @click="handleAdd">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>{{ t('semantic.vocabulary.addWord') }}</span>
        </button>
      </div>
    </header>

    <!-- 统计卡片 -->
    <section class="stats-section">
      <div class="stat-card total">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ store.vocabularyCount }}</span>
          <span class="stat-label">{{ t('semantic.vocabulary.totalWords') }}</span>
        </div>
      </div>
      <div v-for="domain in store.domainStats" :key="domain.id" class="stat-card domain">
        <div class="stat-icon" :class="domain.key">{{ getDomainIcon(domain.key) }}</div>
        <div class="stat-info">
          <span class="stat-value">{{ domain.vocabularyCount }}</span>
          <span class="stat-label">{{ domain.name }}</span>
        </div>
      </div>
    </section>

    <!-- 筛选区域 -->
    <section class="filter-section">
      <div class="filter-group">
        <span class="filter-label">{{ t('semantic.vocabulary.domain') }}:</span>
        <div class="filter-tags">
          <button
            :class="['filter-tag', { active: selectedDomain === null }]"
            @click="selectedDomain = null"
          >
            {{ t('common.all') }}
          </button>
          <button
            v-for="domain in store.domains"
            :key="domain.id"
            :class="['filter-tag', { active: selectedDomain === domain.key }]"
            @click="selectedDomain = domain.key"
          >
            {{ domain.name }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-label">{{ t('semantic.vocabulary.category') }}:</span>
        <div class="filter-tags">
          <button
            :class="['filter-tag', { active: selectedCategory === null }]"
            @click="selectedCategory = null"
          >
            {{ t('common.all') }}
          </button>
          <button
            v-for="cat in categories"
            :key="cat.value"
            :class="['filter-tag', { active: selectedCategory === cat.value }]"
            @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          :placeholder="t('semantic.vocabulary.searchPlaceholder')"
          @input="handleSearch"
        />
      </div>
    </section>

    <!-- 词汇列表表格 -->
    <section class="table-section">
      <div class="table-header">
        <span class="table-title">{{ t('semantic.vocabulary.wordList') }}</span>
        <span class="table-count">({{ filteredVocabularies.length }})</span>
      </div>
      <div class="table-container">
        <table class="vocabulary-table">
          <thead>
            <tr>
              <th class="col-word">{{ t('semantic.vocabulary.word') }}</th>
              <th class="col-aliases">{{ t('semantic.vocabulary.aliases') }}</th>
              <th class="col-domain">{{ t('semantic.vocabulary.domain') }}</th>
              <th class="col-category">{{ t('semantic.vocabulary.category') }}</th>
              <th class="col-definition">{{ t('semantic.vocabulary.definition') }}</th>
              <th class="col-priority">{{ t('semantic.vocabulary.priority') }}</th>
              <th class="col-actions">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pagedVocabularies" :key="item.id" class="table-row">
              <td class="col-word">
                <span class="word-text">{{ item.word }}</span>
              </td>
              <td class="col-aliases">
                <span class="aliases-text">{{ item.aliases.join('、') }}</span>
              </td>
              <td class="col-domain">
                <span class="domain-tag" :class="item.domain">
                  {{ getDomainLabel(item.domain) }}
                </span>
              </td>
              <td class="col-category">
                <span class="category-tag" :class="item.category">
                  {{ getCategoryLabel(item.category) }}
                </span>
              </td>
              <td class="col-definition">
                <span class="definition-text" :title="item.definition">{{ item.definition }}</span>
              </td>
              <td class="col-priority">
                <div class="priority-bar">
                  <div class="priority-fill" :style="{ width: `${item.priority}%` }"></div>
                  <span class="priority-value">{{ item.priority }}</span>
                </div>
              </td>
              <td class="col-actions">
                <div class="action-btns">
                  <button class="btn-icon" @click="handleEdit(item)" :title="t('common.edit')">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <button class="btn-icon danger" @click="handleDelete(item)" :title="t('common.delete')">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredVocabularies.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>{{ t('semantic.vocabulary.empty') }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="filteredVocabularies.length > 0" class="pagination">
        <span class="pagination-info">
          {{ t('common.showing') }} {{ paginationStart }}-{{ paginationEnd }} / {{ t('common.total') }} {{ filteredVocabularies.length }} {{ t('common.items') }}
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSemanticStore, type SemanticDomain, type SemanticCategory, type SemanticVocabulary } from '@/store/modules/semantic'

const { t } = useI18n()
const store = useSemanticStore()

// State
const selectedDomain = ref<SemanticDomain | null>(null)
const selectedCategory = ref<SemanticCategory | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Constants
const categories = [
  { value: 'noun' as SemanticCategory, label: t('semantic.vocabulary.categoryNoun') },
  { value: 'verb' as SemanticCategory, label: t('semantic.vocabulary.categoryVerb') },
  { value: 'adjective' as SemanticCategory, label: t('semantic.vocabulary.categoryAdjective') },
  { value: 'phrase' as SemanticCategory, label: t('semantic.vocabulary.categoryPhrase') }
]

const domainIcons: Record<SemanticDomain, string> = {
  finance: '💰',
  medical: '🏥',
  retail: '🛒',
  manufacture: '🏭',
  education: '📚',
  other: '📋'
}

// Computed
const filteredVocabularies = computed(() => {
  let result = store.vocabularies

  if (selectedDomain.value) {
    result = result.filter(v => v.domain === selectedDomain.value)
  }

  if (selectedCategory.value) {
    result = result.filter(v => v.category === selectedCategory.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(v =>
      v.word.toLowerCase().includes(keyword) ||
      v.definition.toLowerCase().includes(keyword) ||
      v.aliases.some(a => a.toLowerCase().includes(keyword))
    )
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredVocabularies.value.length / pageSize.value))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * pageSize.value, filteredVocabularies.value.length))

const pagedVocabularies = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredVocabularies.value.slice(start, end)
})

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
const getDomainIcon = (domain: SemanticDomain) => domainIcons[domain] || '📋'

const getDomainLabel = (domain: SemanticDomain) => {
  const d = store.domains.find(d => d.key === domain)
  return d?.name || domain
}

const getCategoryLabel = (category: SemanticCategory) => {
  const c = categories.find(c => c.value === category)
  return c?.label || category
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleAdd = () => {
  // TODO: Implement add vocabulary
  console.log('Add vocabulary')
}

const handleEdit = (item: SemanticVocabulary) => {
  // TODO: Implement edit vocabulary
  console.log('Edit vocabulary', item)
}

const handleDelete = (item: SemanticVocabulary) => {
  // TODO: Implement delete vocabulary
  console.log('Delete vocabulary', item)
}

const handleImport = () => {
  // TODO: Implement import
  console.log('Import vocabularies')
}

const handleExport = () => {
  // TODO: Implement export
  console.log('Export vocabularies')
}
</script>

<style scoped lang="scss">
.semantic-model {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: $bg-secondary;
  padding: $spacing-xl;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-lg;

  .header-left {
    .page-title {
      font-size: $font-size-3xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      margin: 0 0 $spacing-xs 0;
    }

    .page-desc {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .header-actions {
    display: flex;
    gap: $spacing-sm;

    .action-btn {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-sm $spacing-md;
      border-radius: $border-radius-md;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: all $transition-base ease;
      border: 1px solid transparent;

      svg {
        width: 16px;
        height: 16px;
      }

      &.primary {
        background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
        color: #fff;
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
      }

      &.secondary {
        background: $bg-primary;
        border-color: $border-color-base;
        color: $text-secondary;

        &:hover {
          border-color: $primary-color;
          color: $primary-color;
        }
      }
    }
  }
}

// 统计卡片
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

  .stat-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    &.total {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
      border-color: rgba(59, 130, 246, 0.2);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius-md;
      background: $bg-secondary;
      font-size: 20px;

      svg {
        width: 20px;
        height: 20px;
        color: $primary-color;
      }

      &.finance { background: rgba(16, 185, 129, 0.1); }
      &.medical { background: rgba(239, 68, 68, 0.1); }
      &.retail { background: rgba(245, 158, 11, 0.1); }
      &.manufacture { background: rgba(99, 102, 241, 0.1); }
      &.education { background: rgba(139, 92, 246, 0.1); }
      &.other { background: rgba(107, 114, 128, 0.1); }
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
      }

      .stat-label {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }
  }
}

// 筛选区域
.filter-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  padding: $spacing-md $spacing-lg;
  background: $bg-primary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;

  .filter-group {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .filter-label {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $text-secondary;
      white-space: nowrap;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-xs;
    }

    .filter-tag {
      padding: $spacing-xs $spacing-md;
      background: $bg-secondary;
      border: 1px solid transparent;
      border-radius: $border-radius-full;
      font-size: $font-size-sm;
      color: $text-secondary;
      cursor: pointer;
      transition: all $transition-base ease;

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
  }

  .search-box {
    position: relative;
    width: 300px;

    .search-icon {
      position: absolute;
      left: $spacing-md;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: $text-tertiary;
    }

    .search-input {
      width: 100%;
      height: 36px;
      padding: $spacing-xs $spacing-md $spacing-xs 40px;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-lg;
      font-size: $font-size-sm;
      color: $text-primary;
      outline: none;
      transition: all $transition-base ease;

      &:focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }

      &::placeholder {
        color: $text-tertiary;
      }
    }
  }
}

// 表格区域
.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  overflow: hidden;

  .table-header {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $border-color-light;

    .table-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }

    .table-count {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .table-container {
    flex: 1;
    overflow: auto;
  }

  .vocabulary-table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: $spacing-md $spacing-lg;
      text-align: left;
      border-bottom: 1px solid $border-color-light;
    }

    th {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-secondary;
      background: $bg-secondary;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    td {
      font-size: $font-size-sm;
      color: $text-primary;
    }

    .table-row {
      transition: background $transition-base ease;

      &:hover {
        background: rgba(59, 130, 246, 0.05);
      }
    }

    .col-word {
      width: 120px;
      min-width: 120px;

      .word-text {
        font-weight: $font-weight-medium;
        color: $text-primary;
      }
    }

    .col-aliases {
      width: 150px;
      min-width: 150px;

      .aliases-text {
        color: $text-secondary;
        font-size: $font-size-xs;
      }
    }

    .col-domain {
      width: 80px;
      min-width: 80px;

      .domain-tag {
        display: inline-flex;
        padding: $spacing-xs $spacing-sm;
        border-radius: $border-radius-sm;
        font-size: $font-size-xs;
        font-weight: $font-weight-medium;

        &.finance { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        &.medical { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        &.retail { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        &.manufacture { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
        &.education { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        &.other { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
      }
    }

    .col-category {
      width: 80px;
      min-width: 80px;

      .category-tag {
        display: inline-flex;
        padding: $spacing-xs $spacing-sm;
        border-radius: $border-radius-sm;
        font-size: $font-size-xs;
        background: $bg-secondary;
        color: $text-secondary;
      }
    }

    .col-definition {
      min-width: 200px;
      max-width: 400px;

      .definition-text {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: $text-secondary;
      }
    }

    .col-priority {
      width: 100px;
      min-width: 100px;

      .priority-bar {
        display: flex;
        align-items: center;
        gap: $spacing-xs;

        .priority-fill {
          height: 4px;
          background: linear-gradient(90deg, $primary-color 0%, $primary-light 100%);
          border-radius: $border-radius-full;
          transition: width $transition-base ease;
        }

        .priority-value {
          font-size: $font-size-xs;
          color: $text-tertiary;
          min-width: 24px;
        }
      }
    }

    .col-actions {
      width: 80px;
      min-width: 80px;
      text-align: center;

      .action-btns {
        display: flex;
        justify-content: center;
        gap: $spacing-xs;

        .btn-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          border-radius: $border-radius-md;
          cursor: pointer;
          transition: all $transition-base ease;

          svg {
            width: 14px;
            height: 14px;
            color: $text-tertiary;
          }

          &:hover {
            background: $bg-secondary;
            border-color: $border-color-base;

            svg {
              color: $primary-color;
            }
          }

          &.danger:hover svg {
            color: $error;
          }
        }
      }
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl;
  text-align: center;

  svg {
    width: 48px;
    height: 48px;
    color: $text-tertiary;
    margin-bottom: $spacing-md;
  }

  p {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

// 分页
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-top: 1px solid $border-color-light;

  .pagination-info {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .pagination-controls {
    display: flex;
    gap: $spacing-xs;

    .page-btn {
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $bg-secondary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-md;
      font-size: $font-size-sm;
      color: $text-secondary;
      cursor: pointer;
      transition: all $transition-base ease;

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
  }
}
</style>
