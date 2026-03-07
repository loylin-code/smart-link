<template>
  <div class="skills-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">{{ t('skills.title') }}</h1>
      <button class="create-btn" @click="handleCreate">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ t('skills.create') }}</span>
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="filter-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
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
          :placeholder="t('skills.searchPlaceholder')"
          class="search-input"
          @input="handleSearch"
        />
      </div>

      <div class="filter-group">
        <select v-model="categoryFilter" class="filter-select" @change="handleFilterChange">
          <option value="">{{ t('skills.category.all') }}</option>
          <option value="analytics">{{ t('skills.category.analytics') }}</option>
          <option value="processing">{{ t('skills.category.processing') }}</option>
          <option value="invoker">{{ t('skills.category.invoker') }}</option>
          <option value="transform">{{ t('skills.category.transform') }}</option>
        </select>

        <select v-model="riskFilter" class="filter-select" @change="handleFilterChange">
          <option value="">{{ t('skills.risk.all') }}</option>
          <option value="low">{{ t('skills.risk.low') }}</option>
          <option value="medium">{{ t('skills.risk.medium') }}</option>
          <option value="high">{{ t('skills.risk.high') }}</option>
        </select>
      </div>
    </div>

    <!-- Stats Summary -->
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
    overflow-y: auto;
  }

  // Page Header
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

  // Filter Bar
  .filter-bar {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    flex-wrap: wrap;
  }

  .search-wrapper {
    position: relative;
    flex: 1;
    min-width: 280px;
    max-width: 400px;

    .search-icon {
      position: absolute;
      left: $spacing-md;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: $text-tertiary;
      pointer-events: none;
    }
  }

  .search-input {
    width: 100%;
    padding: $spacing-sm $spacing-md $spacing-sm $spacing-xl;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    transition: border-color $transition-base ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
      outline: none;
    }
  }

  .filter-group {
    display: flex;
    gap: $spacing-sm;
  }

  .filter-select {
    padding: $spacing-sm $spacing-md;
    padding-right: $spacing-xl;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7184' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right $spacing-sm center;
    transition: border-color $transition-base ease;

    &:focus {
      border-color: $primary-color;
      outline: none;
    }
  }

  // Stats Bar
  .stats-bar {
    display: flex;
    gap: $spacing-xl;
    margin-bottom: $spacing-lg;
    padding: $spacing-md $spacing-lg;
    background: $bg-secondary;
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

  // Skills Grid
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
