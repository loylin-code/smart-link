<template>
  <div class="skills-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('skills.title') }}</h1>
        <span class="page-desc">{{ t('skills.description') }}</span>
      </div>
    </div>

    <!-- 统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ skillsStore.stats.total }}</span>
        <span class="stat-label">{{ t('skills.stats.total') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ skillsStore.stats.enabled }}</span>
        <span class="stat-label">{{ t('skills.stats.enabled') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(skillsStore.stats.totalCalls) }}</span>
        <span class="stat-label">{{ t('skills.stats.totalCalls') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ skillsStore.stats.avgSuccessRate }}%</span>
        <span class="stat-label">{{ t('skills.stats.avgSuccessRate') }}</span>
      </div>
    </div>

    <!-- 分类筛选标签 -->
    <div class="filter-tags">
      <button
        v-for="cat in categoryOptions"
        :key="cat.value"
        class="filter-tag"
        :class="{ active: categoryFilter === cat.value }"
        @click="categoryFilter = cat.value; handleFilterChange()"
      >
        <span v-if="cat.icon" class="tag-icon">{{ cat.icon }}</span>
        <span class="tag-label">{{ cat.label }}</span>
      </button>
    </div>

    <!-- 风险等级筛选标签 -->
    <div class="filter-tags">
      <button
        v-for="risk in riskOptions"
        :key="risk.value"
        class="filter-tag"
        :class="{ active: riskFilter === risk.value }"
        @click="riskFilter = risk.value; handleFilterChange()"
      >
        <span v-if="risk.icon" class="tag-icon">{{ risk.icon }}</span>
        <span class="tag-label">{{ risk.label }}</span>
      </button>
    </div>

    <!-- Skills列表标题 + 搜索框 -->
    <div class="section-header">
      <h2 class="section-title">
        {{ t('skills.listTitle') }}<span class="title-count">({{ filteredSkills.length }})</span>
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
          :placeholder="t('skills.searchPlaceholder')"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Skills Card Grid -->
    <div class="skills-grid">
      <div
        v-for="skill in filteredSkills"
        :key="skill.id"
        class="skill-card"
        @click="handleViewDetail(skill)"
      >
        <!-- Card Header -->
        <div class="card-header">
          <span class="status-indicator" :class="`status--${skill.status}`" />
          <h3 class="skill-name" :title="skill.displayName">{{ skill.displayName }}</h3>
        </div>

        <div class="card-divider" />

        <!-- Category & Version -->
        <div class="skill-meta">
          <span class="category-badge">
            <span class="category-icon">{{ getCategoryIcon(skill.category) }}</span>
            {{ getCategoryLabel(skill.category) }}
          </span>
          <span class="version">· v{{ skill.version }}</span>
        </div>

        <!-- Author -->
        <div class="skill-author">{{ t('skills.author') }}: {{ skill.author }}</div>

        <div class="card-divider" />

        <!-- Usage Stats -->
        <div class="skill-stats">
          <div class="stat-row">
            <span class="stat-label">{{ t('skills.stats.calls') }}:</span>
            <span class="stat-value">{{ formatNumber(skill.stats.totalCalls) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">{{ t('skills.stats.successRate') }}:</span>
            <span
              class="stat-value"
              :class="{
                'text-warning': skill.stats.successRate < 95,
                'text-danger': skill.stats.successRate < 90
              }"
            >
              {{ skill.stats.successRate }}%
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">{{ t('skills.stats.avgDuration') }}:</span>
            <span class="stat-value">{{ skill.stats.avgDuration }}s</span>
          </div>
        </div>

        <!-- Risk Level -->
        <div class="risk-badge" :class="`risk--${skill.riskLevel}`">
          <span class="risk-indicator" />
          <span class="risk-label">{{
            getRiskLabel(skill.riskLevel, skill.requiresApproval)
          }}</span>
        </div>

        <!-- Quick Actions -->
        <div class="card-actions">
          <button class="action-btn action-test" @click.stop="handleTest(skill)">
            <span class="action-icon">▶</span>
            <span>{{ t('skills.actions.test') }}</span>
          </button>
          <button class="action-btn action-edit" @click.stop="handleEdit(skill)">
            <span class="action-icon">✏️</span>
            <span>{{ t('skills.actions.edit') }}</span>
          </button>
          <button class="action-btn action-delete" @click.stop="handleDelete(skill)">
            <span class="action-icon">🗑️</span>
            <span>{{ t('skills.actions.delete') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredSkills.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p class="empty-text">{{ t('skills.empty.title') }}</p>
      <p class="empty-subtext">{{ t('skills.empty.subtitle') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="filteredSkills.length > 0" class="pagination">
      <span class="pagination-info">
        {{
          t('skills.pagination.showing', {
            start: 1,
            end: filteredSkills.length,
            total: filteredSkills.length
          })
        }}
      </span>
      <div class="pagination-controls">
        <button class="page-btn" disabled>&lt;</button>
        <button class="page-btn active">1</button>
        <button class="page-btn" disabled>&gt;</button>
      </div>
    </div>

    <!-- Skill Form Dialog -->
    <SkillFormDialog
      v-model:visible="showFormDialog"
      :skill="editingSkill"
      @submit="handleFormSubmit"
      @close="handleFormClose"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useSkillsStore } from '@/store/modules/skills'
  import type { Skill, SkillCategory, SkillRiskLevel } from '@/types'
  import SkillFormDialog from '@/components/skill/SkillFormDialog.vue'

  const router = useRouter()
  const { t } = useI18n()
  const skillsStore = useSkillsStore()

  // Search & Filter states
  const searchKeyword = ref('')
  const categoryFilter = ref<SkillCategory | ''>('')
  const riskFilter = ref<SkillRiskLevel | ''>('')

  // Dialog states
  const showFormDialog = ref(false)
  const editingSkill = ref<Skill | null>(null)

  // Category filter options
  const categoryOptions = computed(() => [
    { value: '' as SkillCategory | '', label: t('skills.category.all'), icon: '' },
    { value: 'analytics' as SkillCategory, label: t('skills.category.analytics'), icon: '📊' },
    { value: 'processing' as SkillCategory, label: t('skills.category.processing'), icon: '🔄' },
    { value: 'invoker' as SkillCategory, label: t('skills.category.invoker'), icon: '🔗' },
    { value: 'transform' as SkillCategory, label: t('skills.category.transform'), icon: '⚙️' }
  ])

  // Risk level filter options
  const riskOptions = computed(() => [
    { value: '' as SkillRiskLevel | '', label: t('skills.risk.all'), icon: '' },
    { value: 'low' as SkillRiskLevel, label: t('skills.risk.low'), icon: '🟢' },
    { value: 'medium' as SkillRiskLevel, label: t('skills.risk.medium'), icon: '🟡' },
    { value: 'high' as SkillRiskLevel, label: t('skills.risk.high'), icon: '🔴' }
  ])

  // Fetch skills on mount
  onMounted(async () => {
    await skillsStore.fetchSkills()
  })

  // Filtered skills based on store filter
  const filteredSkills = computed(() => {
    return skillsStore.filteredSkills
  })

  // Apply filters to store
  function handleSearch() {
    skillsStore.setFilter({ keyword: searchKeyword.value })
  }

  function handleFilterChange() {
    skillsStore.setFilter({
      category: categoryFilter.value || undefined,
      riskLevel: riskFilter.value || undefined
    })
  }

  // Category helpers
  const categoryIcons: Record<SkillCategory, string> = {
    analytics: '📊',
    processing: '🔄',
    invoker: '🔗',
    transform: '⚙️'
  }

  const categoryLabels: Record<SkillCategory, string> = {
    analytics: t('skills.category.analytics'),
    processing: t('skills.category.processing'),
    invoker: t('skills.category.invoker'),
    transform: t('skills.category.transform')
  }

  function getCategoryIcon(category: SkillCategory): string {
    return categoryIcons[category] || '📦'
  }

  function getCategoryLabel(category: SkillCategory): string {
    return categoryLabels[category] || category
  }

  // Risk level helpers
  function getRiskLabel(riskLevel: SkillRiskLevel, requiresApproval: boolean): string {
    const baseLabel = t(`skills.risk.${riskLevel}`)
    if (requiresApproval) {
      return `${baseLabel} (${t('skills.requiresApproval')})`
    }
    return baseLabel
  }

  // Number formatting
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Action handlers
  function handleCreate() {
    editingSkill.value = null
    showFormDialog.value = true
  }

  function handleViewDetail(skill: Skill) {
    router.push({
      name: 'SkillDetail',
      params: { id: skill.id }
    })
  }

  async function handleTest(skill: Skill) {
    console.log('Test skill:', skill.id)
    const result = await skillsStore.testSkill(skill.id)
    if (result.success) {
      alert(t('skills.test.success'))
    } else {
      alert(t('skills.test.failed', { error: result.error }))
    }
  }

  function handleEdit(skill: Skill) {
    editingSkill.value = skill
    showFormDialog.value = true
  }

  async function handleDelete(skill: Skill) {
    if (confirm(t('skills.delete.confirm', { name: skill.displayName }))) {
      try {
        await skillsStore.deleteSkill(skill.id)
      } catch (error) {
        alert(t('skills.delete.failed', { error: skillsStore.error || 'Unknown error' }))
      }
    }
  }

  // Form dialog handlers
  async function handleFormSubmit(formData: any) {
    try {
      if (editingSkill.value) {
        // Update existing skill
        await skillsStore.updateSkill(editingSkill.value.id, {
          name: formData.name,
          description: formData.description,
          config: formData.config
        })
      } else {
        // Create new skill
        await skillsStore.createSkill({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          config: formData.config
        })
      }
      showFormDialog.value = false
      editingSkill.value = null
    } catch (error) {
      // Error is handled in the store
    }
  }

  function handleFormClose() {
    showFormDialog.value = false
    editingSkill.value = null
  }
</script>

<style scoped lang="scss">
  .skills-management {
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
  }

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
      margin: 0;
    }
  }

  // ================================
  // 统计栏
  // ================================
  .stats-bar {
    display: flex;
    gap: $spacing-xl;
    margin-bottom: $spacing-lg;
    padding: $spacing-md $spacing-lg;
    background: $bg-primary;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-light;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

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

  // ================================
  // 筛选标签
  // ================================
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
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

    .tag-icon {
      font-size: 14px;
    }

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

  // ================================
  // 区块标题（标题 + 搜索框）
  // ================================
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-lg;
    margin-top: $spacing-md;
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
  // Skills Grid
  // ================================
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  // Skill Card
  .skill-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;

    &.status--enabled {
      background: #52c41a;
    }

    &.status--partial {
      background: #faad14;
    }

    &.status--disabled {
      background: #f5222d;
    }
  }

  .skill-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-divider {
    height: 1px;
    background: $border-color-light;
    margin: $spacing-md 0;
  }

  .skill-meta {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;
  }

  .category-badge {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-secondary;

    .category-icon {
      font-size: 14px;
    }
  }

  .version {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .skill-author {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-md;
  }

  .skill-stats {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $font-size-sm;

    .stat-label {
      color: $text-tertiary;
    }

    .stat-value {
      font-weight: $font-weight-medium;
      color: $text-primary;

      &.text-warning {
        color: #faad14;
      }

      &.text-danger {
        color: #f5222d;
      }
    }
  }

  // Risk Badge
  .risk-badge {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    margin-bottom: $spacing-md;

    .risk-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .risk-label {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
    }

    &.risk--low {
      background: rgba(82, 196, 26, 0.1);

      .risk-indicator {
        background: #52c41a;
      }

      .risk-label {
        color: #52c41a;
      }
    }

    &.risk--medium {
      background: rgba(250, 173, 20, 0.1);

      .risk-indicator {
        background: #faad14;
      }

      .risk-label {
        color: #faad14;
      }
    }

    &.risk--high {
      background: rgba(245, 34, 45, 0.1);

      .risk-indicator {
        background: #f5222d;
      }

      .risk-label {
        color: #f5222d;
      }
    }
  }

  // Card Actions
  .card-actions {
    display: flex;
    gap: $spacing-sm;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    .action-icon {
      font-size: 10px;
    }

    &:hover {
      background: $bg-tertiary;
      border-color: $primary-color;
      color: $primary-color;
    }

    &.action-delete:hover {
      border-color: #f5222d;
      color: #f5222d;
    }
  }

  // Empty State
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
  }

  .empty-text {
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin: 0 0 $spacing-xs;
  }

  .empty-subtext {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin: 0;
  }

  // Pagination
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .pagination-info {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .pagination-controls {
    display: flex;
    gap: $spacing-xs;
  }

  .page-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 $spacing-sm;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-primary;
    font-size: $font-size-sm;
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
</style>
