<template>
  <div class="skills-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('skills.title') }}</h1>
        <span class="page-desc">{{ t('skills.description') }}</span>
      </div>
      <div class="header-right">
        <button class="create-btn" @click="handleCreate">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ t('skills.create') }}</span>
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
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
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ skillsStore.stats.total }}</div>
          <div class="stat-label">{{ t('skills.stats.total') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon enabled">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ skillsStore.stats.enabled }}</div>
          <div class="stat-label">{{ t('skills.stats.enabled') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon calls">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(skillsStore.stats.totalCalls) }}</div>
          <div class="stat-label">{{ t('skills.stats.totalCalls') }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ skillsStore.stats.avgSuccessRate }}%</div>
          <div class="stat-label">{{ t('skills.stats.avgSuccessRate') }}</div>
        </div>
      </div>
    </div>

    <!-- 分类筛选标签 -->
    <div class="filter-tags">
      <button
        v-for="cat in categoryOptions"
        :key="cat.value"
        class="filter-tag"
        :class="{ active: categoryFilter === cat.value }"
        @click="
          () => {
            categoryFilter = cat.value
            handleFilterChange()
          }
        "
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
        @click="
          () => {
            riskFilter = risk.value
            handleFilterChange()
          }
        "
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
          <div class="card-icon">{{ getCategoryIcon(skill.category) }}</div>
          <div class="card-header-info">
            <h3 class="card-name">{{ skill.displayName }}</h3>
            <div class="card-tags">
              <span class="model-type">{{ getCategoryLabel(skill.category) }}</span>
              <span class="version">v{{ skill.version }}</span>
            </div>
          </div>
        </div>

        <!-- Card Stats -->
        <div class="card-stats">
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
          <div class="stat-row">
            <span class="stat-label">{{ t('skills.risk.label') }}:</span>
            <span class="stat-value risk-value" :class="`risk--${skill.riskLevel}`">
              {{ getRiskLabel(skill.riskLevel, skill.requiresApproval) }}
            </span>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="card-footer">
          <span class="status-dot" :class="`status--${skill.status}`" />
          <span class="update-time">{{ t('skills.author') }}: {{ skill.author }}</span>
        </div>

        <!-- 悬浮操作按钮 -->
        <div class="card-actions" @click.stop>
          <button class="action-btn primary" @click="handleTest(skill)">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
            </svg>
            <span>{{ t('skills.actions.test') }}</span>
          </button>
          <button class="action-btn" @click="handleEdit(skill)" :title="t('skills.actions.edit')">
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
          </button>
          <button
            class="action-btn"
            @click="handleDelete(skill)"
            :title="t('skills.actions.delete')"
          >
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
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    .page-title {
      font-size: $font-size-3xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      margin: 0;
      text-align: left;
    }

    .page-desc {
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
  // 统计卡片
  // ================================
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg;
    background: $bg-primary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-base;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-lg;
    flex-shrink: 0;

    svg {
      width: 28px;
      height: 28px;
    }

    &.total {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.15) 0%,
        rgba(139, 92, 246, 0.15) 100%
      );
      color: $primary-color;
    }

    &.enabled {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.15) 0%,
        rgba(52, 211, 153, 0.15) 100%
      );
      color: #10b981;
    }

    &.calls {
      background: linear-gradient(
        135deg,
        rgba(245, 158, 11, 0.15) 0%,
        rgba(251, 191, 36, 0.15) 100%
      );
      color: #f59e0b;
    }

    &.success {
      background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.15) 0%,
        rgba(167, 139, 250, 0.15) 100%
      );
      color: #8b5cf6;
    }
  }

  .stat-content {
    .stat-value {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      color: $text-primary;
      line-height: 1.2;
    }

    .stat-label {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin-top: 4px;
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
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;
    margin-bottom: $spacing-xl;
  }

  // Skill Card
  .skill-card {
    position: relative;
    background: $bg-primary;
    border: 1px solid $border-color-base;
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

  // ================================
  // 卡片头部
  // ================================
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

  // ================================
  // 卡片统计
  // ================================
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

    &.text-warning {
      color: #faad14;
    }

    &.text-danger {
      color: #f5222d;
    }

    &.risk-value {
      &.risk--low {
        color: #52c41a;
      }

      &.risk--medium {
        color: #faad14;
      }

      &.risk--high {
        color: #f5222d;
      }
    }
  }

  // ================================
  // 卡片底部
  // ================================
  .card-footer {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .status-dot {
    width: 8px;
    height: 8px;
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

  // ================================
  // 响应式
  // ================================
  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .skills-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .skills-management {
      padding: $spacing-md;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-md;

      .header-right {
        width: 100%;

        .create-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .skills-grid {
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

    .card-actions {
      opacity: 1;
      transform: translateY(0);
      position: static;
      background: $bg-secondary;
      backdrop-filter: none;
    }
  }

  // ================================
  // 深色模式适配
  // ================================
  [data-theme='dark'] {
    .skill-card {
      background: $bg-secondary;
      border-color: $border-color-base;
    }

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
  }
</style>
