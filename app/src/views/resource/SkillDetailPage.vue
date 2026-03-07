<template>
  <div class="skill-detail-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>{{ t('common.back') }}</span>
        </button>
        <div class="header-title" v-if="skill">
          <span class="status-indicator" :class="`status--${skill.status}`" />
          <h1 class="skill-name">{{ skill.displayName }}</h1>
        </div>
      </div>
      <button class="save-btn" @click="handleSave">
        <span class="save-icon">💾</span>
        <span>{{ t('common.save') }}</span>
      </button>
    </div>

    <div v-if="skill" class="detail-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Basic Info Section -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('skillDetail.basicInfo.title') }}</h2>
          <div class="info-card">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.name') }}:</span>
                <span class="info-value">{{ skill.displayName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.uniqueId') }}:</span>
                <span class="info-value">{{ skill.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.version') }}:</span>
                <span class="info-value">v{{ skill.version }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.displayName') }}:</span>
                <span class="info-value">{{ skill.displayName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.category') }}:</span>
                <span class="info-value category-value">
                  <span class="category-icon">{{ getCategoryIcon(skill.category) }}</span>
                  {{ getCategoryLabel(skill.category) }}
                </span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">{{ t('skillDetail.basicInfo.description') }}:</span>
                <span class="info-value description">{{ skill.description }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">{{ t('skillDetail.basicInfo.tags') }}:</span>
                <div class="tags-list">
                  <span v-for="tag in skill.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.author') }}:</span>
                <span class="info-value">{{ skill.author }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.maintainer') }}:</span>
                <span class="info-value">{{ skill.maintainer || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.lastUpdated') }}:</span>
                <span class="info-value">{{ formatDate(skill.lastUpdated) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.riskLevel') }}:</span>
                <span class="info-value risk-value" :class="`risk--${skill.riskLevel}`">
                  <span class="risk-dot" />
                  {{ getRiskLabel(skill.riskLevel) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('skillDetail.basicInfo.requiresApproval') }}:</span>
                <span class="info-value">{{
                  skill.requiresApproval ? t('common.yes') : t('common.no')
                }}</span>
              </div>
            </div>
            <div class="info-actions">
              <button class="info-action-btn" @click="handleEditBasicInfo">
                {{ t('skillDetail.basicInfo.edit') }}
              </button>
              <button class="info-action-btn" @click="handleViewChangelog">
                {{ t('skillDetail.basicInfo.changelog') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Schema Section -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('skillDetail.schema.title') }}</h2>
          <div class="schema-card">
            <!-- Input Schema -->
            <div class="schema-block">
              <h3 class="schema-title" @click="toggleInputSchema">
                <span class="toggle-icon" :class="{ 'is-open': showInputSchema }">▼</span>
                {{ t('skillDetail.schema.input') }} ({{
                  Object.keys(skill.inputSchema.properties || {}).length
                }})
              </h3>
              <div v-show="showInputSchema" class="schema-content">
                <div
                  v-for="(prop, key) in skill.inputSchema.properties"
                  :key="key"
                  class="schema-property"
                >
                  <div class="property-header">
                    <span class="property-icon">📥</span>
                    <span class="property-name">{{ key }}</span>
                    <span class="property-type"
                      >({{ prop.type
                      }}{{ prop.required ? ', ' + t('skillDetail.schema.required') : '' }})</span
                    >
                  </div>
                  <p class="property-desc">{{ prop.description }}</p>
                  <div v-if="prop.validation" class="property-constraints">
                    <span v-if="prop.validation.minLength"
                      >{{ t('skillDetail.schema.minLength') }}:
                      {{ prop.validation.minLength }}</span
                    >
                    <span v-if="prop.validation.maxLength"
                      >{{ t('skillDetail.schema.maxLength') }}:
                      {{ prop.validation.maxLength }}</span
                    >
                    <span v-if="prop.enum"
                      >{{ t('skillDetail.schema.enum') }}: {{ prop.enum.join(', ') }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Output Schema -->
            <div class="schema-block">
              <h3 class="schema-title" @click="toggleOutputSchema">
                <span class="toggle-icon" :class="{ 'is-open': showOutputSchema }">▼</span>
                {{ t('skillDetail.schema.output') }}
              </h3>
              <div v-show="showOutputSchema" class="schema-content">
                <div
                  v-for="(prop, key) in skill.outputSchema.properties"
                  :key="key"
                  class="schema-property"
                >
                  <div class="property-header">
                    <span class="property-icon">📤</span>
                    <span class="property-name">{{ key }}</span>
                    <span class="property-type">({{ prop.type }})</span>
                  </div>
                  <p class="property-desc">
                    {{ prop.description || t('skillDetail.schema.noDescription') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="schema-actions">
              <button class="schema-action-btn" @click="handleCopySchema">
                {{ t('skillDetail.schema.copySchema') }}
              </button>
              <button class="schema-action-btn" @click="handleImportExample">
                {{ t('skillDetail.schema.importExample') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Configuration Section -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('skillDetail.config.title') }}</h2>
          <div class="config-card">
            <!-- LLM Parameters -->
            <div class="config-block">
              <h3 class="config-subtitle">{{ t('skillDetail.config.llmParams') }}</h3>
              <div class="config-params">
                <div class="config-item">
                  <span class="config-label">{{ t('skillDetail.config.model') }}:</span>
                  <span class="config-value">{{ skill.config.model || '-' }}</span>
                </div>
                <div class="config-row">
                  <div class="config-item">
                    <span class="config-label">{{ t('skillDetail.config.temperature') }}:</span>
                    <span class="config-value">{{ skill.config.temperature ?? '-' }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">{{ t('skillDetail.config.maxTokens') }}:</span>
                    <span class="config-value">{{ skill.config.maxTokens ?? '-' }}</span>
                  </div>
                </div>
                <div class="config-item">
                  <span class="config-label">{{ t('skillDetail.config.topP') }}:</span>
                  <span class="config-value">{{ skill.config.topP ?? '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Tool Bindings -->
            <div class="config-block">
              <h3 class="config-subtitle">{{ t('skillDetail.config.toolBindings') }}</h3>
              <div class="tool-list">
                <label v-for="tool in skill.config.toolBindings" :key="tool" class="tool-item">
                  <input type="checkbox" checked disabled />
                  <span class="tool-name">{{ tool }}</span>
                  <span class="tool-badge required">{{ t('skillDetail.config.required') }}</span>
                </label>
              </div>
            </div>

            <!-- Guardrails -->
            <div class="config-block">
              <h3 class="config-subtitle">{{ t('skillDetail.config.guardrails') }}</h3>
              <div class="guardrail-list">
                <label class="guardrail-item">
                  <input
                    type="checkbox"
                    :checked="skill.config.guardrails?.validateInput"
                    disabled
                  />
                  <span>{{ t('skillDetail.config.validateInput') }}</span>
                </label>
                <label class="guardrail-item">
                  <input
                    type="checkbox"
                    :checked="skill.config.guardrails?.privacyCheck"
                    disabled
                  />
                  <span>{{ t('skillDetail.config.privacyCheck') }}</span>
                </label>
                <div class="config-item">
                  <span class="config-label">{{ t('skillDetail.config.maxRetries') }}:</span>
                  <span class="config-value">{{ skill.config.guardrails?.maxRetries ?? '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Resource Limits -->
            <div class="config-block">
              <h3 class="config-subtitle">{{ t('skillDetail.config.resources') }}</h3>
              <div class="config-params">
                <div class="config-item">
                  <span class="config-label">{{ t('skillDetail.config.timeout') }}:</span>
                  <span class="config-value">{{ skill.config.resources?.timeout ?? '-' }}s</span>
                </div>
                <div class="config-item">
                  <span class="config-label">{{ t('skillDetail.config.maxMemory') }}:</span>
                  <span class="config-value">{{ skill.config.resources?.maxMemory ?? '-' }}MB</span>
                </div>
                <div class="config-item">
                  <span class="config-label">{{ t('skillDetail.config.maxConcurrency') }}:</span>
                  <span class="config-value">{{
                    skill.config.resources?.maxConcurrency ?? '-'
                  }}</span>
                </div>
              </div>
            </div>

            <div class="config-actions">
              <button class="config-action-btn primary" @click="handleSaveConfig">
                {{ t('skillDetail.config.save') }}
              </button>
              <button class="config-action-btn" @click="handleResetConfig">
                {{ t('skillDetail.config.reset') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Dependencies Section -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('skillDetail.dependencies.title') }}</h2>
          <div class="dependencies-card">
            <!-- Skill Dependencies -->
            <div class="dependency-block">
              <h3 class="dependency-subtitle">{{ t('skillDetail.dependencies.skills') }}</h3>
              <div v-if="skill.dependencies.skills.length > 0" class="dependency-list">
                <div v-for="dep in skill.dependencies.skills" :key="dep.id" class="dependency-item">
                  <span class="dependency-status enabled" />
                  <span class="dependency-name">{{ dep.id }}</span>
                  <span class="dependency-version">v{{ dep.version }}</span>
                </div>
              </div>
              <p v-else class="dependency-empty">{{ t('skillDetail.dependencies.noSkills') }}</p>
            </div>

            <!-- Tool Dependencies -->
            <div class="dependency-block">
              <h3 class="dependency-subtitle">{{ t('skillDetail.dependencies.tools') }}</h3>
              <div v-if="skill.dependencies.tools.length > 0" class="dependency-list">
                <div v-for="tool in skill.dependencies.tools" :key="tool" class="dependency-item">
                  <span class="dependency-icon">🔧</span>
                  <span class="dependency-name">{{ tool }}</span>
                </div>
              </div>
              <p v-else class="dependency-empty">{{ t('skillDetail.dependencies.noTools') }}</p>
            </div>

            <!-- MCP Dependencies -->
            <div class="dependency-block">
              <h3 class="dependency-subtitle">{{ t('skillDetail.dependencies.mcpServers') }}</h3>
              <div v-if="skill.dependencies.mcpServers.length > 0" class="dependency-list">
                <div
                  v-for="mcp in skill.dependencies.mcpServers"
                  :key="mcp"
                  class="dependency-item"
                >
                  <span class="dependency-status enabled" />
                  <span class="dependency-name">{{ mcp }}</span>
                </div>
              </div>
              <p v-else class="dependency-empty">{{ t('skillDetail.dependencies.noMcp') }}</p>
            </div>

            <button class="add-dependency-btn" @click="handleAddDependency">
              + {{ t('skillDetail.dependencies.add') }}
            </button>
          </div>
        </section>

        <!-- Usage Stats Section -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('skillDetail.usage.title') }}</h2>
          <div class="usage-card">
            <div class="usage-grid">
              <div class="usage-item">
                <span class="usage-label">{{ t('skillDetail.usage.totalCalls') }}</span>
                <span class="usage-value">{{ formatNumber(skill.stats.totalCalls) }}</span>
              </div>
              <div class="usage-item">
                <span class="usage-label">{{ t('skillDetail.usage.successRate') }}</span>
                <span class="usage-value">{{ skill.stats.successRate }}%</span>
              </div>
              <div class="usage-item">
                <span class="usage-label">{{ t('skillDetail.usage.avgDuration') }}</span>
                <span class="usage-value">{{ skill.stats.avgDuration }}s</span>
              </div>
              <div class="usage-item">
                <span class="usage-label">{{ t('skillDetail.usage.p95Duration') }}</span>
                <span class="usage-value">-</span>
              </div>
              <div class="usage-item full-width">
                <span class="usage-label">{{ t('skillDetail.usage.tokens') }}</span>
                <span class="usage-value">
                  {{ t('skillDetail.usage.input') }}
                  {{ formatNumber(skill.stats.last30Days.tokens.input) }} /
                  {{ t('skillDetail.usage.output') }}
                  {{ formatNumber(skill.stats.last30Days.tokens.output) }}
                </span>
              </div>
              <div class="usage-item">
                <span class="usage-label">{{ t('skillDetail.usage.cost') }}</span>
                <span class="usage-value">${{ skill.stats.last30Days.cost.toFixed(2) }}</span>
              </div>
            </div>
            <div class="usage-actions">
              <button class="usage-action-btn" @click="handleViewStats">
                {{ t('skillDetail.usage.viewDetails') }}
              </button>
              <button class="usage-action-btn" @click="handleExportReport">
                {{ t('skillDetail.usage.exportReport') }}
              </button>
            </div>
          </div>
        </section>

        <!-- Composition Section -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('skillDetail.composition.title') }}</h2>
          <div class="composition-card">
            <p class="composition-desc">{{ t('skillDetail.composition.description') }}</p>
            <ul class="composition-list">
              <li class="composition-item">• 月度经营分析工作流</li>
              <li class="composition-item">• 销售数据自动报表</li>
              <li class="composition-item">• 用户行为分析管道</li>
            </ul>
            <button class="view-graph-btn" @click="handleViewGraph">
              {{ t('skillDetail.composition.viewGraph') }} →
            </button>
          </div>
        </section>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Execution Monitoring -->
        <section class="detail-section sticky-section">
          <h2 class="section-title">{{ t('skillDetail.monitoring.title') }}</h2>
          <div class="monitoring-card">
            <div class="monitoring-status">
              <span class="status-label">{{ t('skillDetail.monitoring.status') }}</span>
              <div class="status-display" :class="`status--${skill.status}`">
                <span class="status-dot" />
                <span class="status-text">{{ getStatusText(skill.status) }}</span>
              </div>
            </div>
            <div class="monitoring-stats">
              <div class="monitor-stat">
                <span class="monitor-label">{{ t('skillDetail.monitoring.todayCalls') }}</span>
                <span class="monitor-value">{{ formatNumber(skill.stats.last30Days.calls) }}</span>
              </div>
              <div class="monitor-stat">
                <span class="monitor-label">{{ t('skillDetail.monitoring.successRate') }}</span>
                <span class="monitor-value">{{ skill.stats.successRate }}%</span>
              </div>
              <div class="monitor-stat">
                <span class="monitor-label">{{ t('skillDetail.monitoring.avgLatency') }}</span>
                <span class="monitor-value">{{ skill.stats.avgDuration }}s</span>
              </div>
              <div class="monitor-stat">
                <span class="monitor-label">{{ t('skillDetail.monitoring.todayCost') }}</span>
                <span class="monitor-value">${{ skill.stats.last30Days.cost.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="detail-section">
          <h2 class="section-title">{{ t('skillDetail.quickActions.title') }}</h2>
          <div class="quick-actions-card">
            <button class="quick-action-btn primary" @click="handleTest">
              <span class="quick-action-icon">▶</span>
              <span>{{ t('skillDetail.quickActions.test') }}</span>
            </button>
            <button class="quick-action-btn" @click="handleViewLogs">
              <span class="quick-action-icon">📊</span>
              <span>{{ t('skillDetail.quickActions.viewLogs') }}</span>
            </button>
            <button class="quick-action-btn" @click="handleCopyConfig">
              <span class="quick-action-icon">📋</span>
              <span>{{ t('skillDetail.quickActions.copyConfig') }}</span>
            </button>
            <button class="quick-action-btn danger" @click="handleToggleStatus">
              <span class="quick-action-icon">⏹</span>
              <span>{{
                skill.status === 'enabled'
                  ? t('skillDetail.quickActions.pause')
                  : t('skillDetail.quickActions.enable')
              }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <div class="loading-spinner" />
      <p>{{ t('common.loading') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useSkillsStore } from '@/store/modules/skills'
  import type { Skill, SkillCategory, SkillStatus } from '@/types'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const skillsStore = useSkillsStore()

  // State
  const skill = computed<Skill | null>(() => skillsStore.currentSkill)
  const showInputSchema = ref(true)
  const showOutputSchema = ref(true)

  // Category helpers
  const categoryIcons: Record<SkillCategory, string> = {
    analytics: '📊',
    processing: '🔄',
    invoker: '🔗',
    transform: '⚙️'
  }

  function getCategoryIcon(category: SkillCategory): string {
    return categoryIcons[category] || '📦'
  }

  function getCategoryLabel(category: SkillCategory): string {
    return t(`skills.category.${category}`)
  }

  // Risk helpers
  function getRiskLabel(riskLevel: string): string {
    return t(`skills.risk.${riskLevel}`)
  }

  // Status helpers
  function getStatusText(status: SkillStatus): string {
    return t(`skills.status.${status}`)
  }

  // Formatting helpers
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Toggle handlers
  function toggleInputSchema() {
    showInputSchema.value = !showInputSchema.value
  }

  function toggleOutputSchema() {
    showOutputSchema.value = !showOutputSchema.value
  }

  // Action handlers
  function handleBack() {
    router.push({ name: 'Skills' })
  }

  function handleSave() {
    console.log('Save skill')
    // TODO: Save skill changes
  }

  function handleEditBasicInfo() {
    console.log('Edit basic info')
  }

  function handleViewChangelog() {
    console.log('View changelog')
  }

  function handleCopySchema() {
    navigator.clipboard.writeText(JSON.stringify(skill.value?.inputSchema, null, 2))
    alert(t('skillDetail.schema.copied'))
  }

  function handleImportExample() {
    console.log('Import example')
  }

  function handleSaveConfig() {
    console.log('Save config')
  }

  function handleResetConfig() {
    console.log('Reset config')
  }

  function handleAddDependency() {
    console.log('Add dependency')
  }

  function handleViewStats() {
    console.log('View stats')
  }

  function handleExportReport() {
    console.log('Export report')
  }

  function handleViewGraph() {
    console.log('View dependency graph')
  }

  async function handleTest() {
    if (!skill.value) return
    const result = await skillsStore.testSkill(skill.value.id)
    if (result.success) {
      alert(t('skills.test.success'))
    } else {
      alert(t('skills.test.failed', { error: result.error }))
    }
  }

  function handleViewLogs() {
    console.log('View logs')
  }

  function handleCopyConfig() {
    if (!skill.value) return
    navigator.clipboard.writeText(JSON.stringify(skill.value.config, null, 2))
    alert(t('skillDetail.quickActions.copied'))
  }

  function handleToggleStatus() {
    if (!skill.value) return
    const newStatus = skill.value.status === 'enabled' ? 'disabled' : 'enabled'
    skillsStore.updateSkill(skill.value.id, { status: newStatus as any })
  }

  // Load skill on mount
  onMounted(async () => {
    const skillId = route.params.id as string
    if (skillId) {
      // Try to get from store first
      let foundSkill = skillsStore.getSkillById(skillId)
      if (!foundSkill) {
        // If not in store, fetch from API
        foundSkill = (await skillsStore.fetchSkill(skillId)) ?? undefined
      } else {
        skillsStore.setCurrentSkill(foundSkill)
      }

      if (!foundSkill) {
        // Skill not found, redirect to list
        router.push({ name: 'Skills' })
      }
    }
  })
</script>

<style scoped lang="scss">
  .skill-detail-page {
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

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
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
    }
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;

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
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin: 0;
  }

  .save-btn {
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

    &:hover {
      background: $primary-light;
      border-color: $primary-light;
    }
  }

  // Detail Content Layout
  .detail-content {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: $spacing-xl;
    align-items: start;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  // Detail Section
  .detail-section {
    &.sticky-section {
      position: sticky;
      top: $spacing-lg;
    }
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color-light;
  }

  // Info Card
  .info-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    &.full-width {
      grid-column: 1 / -1;
    }
  }

  .info-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .info-value {
    font-size: $font-size-sm;
    color: $text-primary;

    &.description {
      line-height: 1.5;
    }

    &.category-value {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .category-icon {
        font-size: 14px;
      }
    }

    &.risk-value {
      display: flex;
      align-items: center;
      gap: $spacing-xs;

      .risk-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.risk--low .risk-dot {
        background: #52c41a;
      }

      &.risk--medium .risk-dot {
        background: #faad14;
      }

      &.risk--high .risk-dot {
        background: #f5222d;
      }
    }
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .tag {
    padding: $spacing-xs $spacing-sm;
    background: rgba($primary-color, 0.1);
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $primary-color;
  }

  .info-actions {
    display: flex;
    gap: $spacing-sm;
  }

  .info-action-btn {
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // Schema Card
  .schema-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .schema-block {
    margin-bottom: $spacing-lg;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .schema-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin: 0 0 $spacing-md;
    cursor: pointer;
    user-select: none;

    .toggle-icon {
      font-size: 10px;
      transition: transform $transition-base ease;

      &.is-open {
        transform: rotate(180deg);
      }
    }
  }

  .schema-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .schema-property {
    padding: $spacing-sm;
    background: $bg-tertiary;
    border-radius: $border-radius-sm;
  }

  .property-header {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-bottom: $spacing-xs;

    .property-icon {
      font-size: 12px;
    }

    .property-name {
      font-weight: $font-weight-medium;
      color: $text-primary;
    }

    .property-type {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .property-desc {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin: 0 0 $spacing-xs;
  }

  .property-constraints {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .schema-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-lg;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .schema-action-btn {
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // Config Card
  .config-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .config-block {
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color-light;

    &:last-of-type {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .config-subtitle {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin: 0 0 $spacing-md;
  }

  .config-params {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .config-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-md;
  }

  .config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: $font-size-sm;

    .config-label {
      color: $text-tertiary;
    }

    .config-value {
      color: $text-primary;
      font-weight: $font-weight-medium;
    }
  }

  .tool-list,
  .guardrail-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .tool-item,
  .guardrail-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-tertiary;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-primary;
    cursor: not-allowed;

    input[type='checkbox'] {
      cursor: not-allowed;
    }
  }

  .tool-badge {
    margin-left: auto;
    padding: $spacing-xs $spacing-sm;
    background: rgba($primary-color, 0.1);
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $primary-color;

    &.required {
      background: rgba(#f5222d, 0.1);
      color: #f5222d;
    }
  }

  .config-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-lg;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .config-action-btn {
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
        border-color: $primary-light;
      }
    }
  }

  // Dependencies Card
  dependencies-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .dependency-block {
    margin-bottom: $spacing-lg;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .dependency-subtitle {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin: 0 0 $spacing-md;
  }

  .dependency-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .dependency-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm;
    background: $bg-tertiary;
    border-radius: $border-radius-sm;
  }

  .dependency-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.enabled {
      background: #52c41a;
    }

    &.disabled {
      background: #f5222d;
    }
  }

  .dependency-icon {
    font-size: 12px;
  }

  .dependency-name {
    font-size: $font-size-sm;
    color: $text-primary;
  }

  .dependency-version {
    margin-left: auto;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .dependency-empty {
    padding: $spacing-md;
    background: $bg-tertiary;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-tertiary;
    text-align: center;
    margin: 0;
  }

  .add-dependency-btn {
    width: 100%;
    padding: $spacing-sm;
    background: transparent;
    border: 1px dashed $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;
    margin-top: $spacing-md;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // Usage Card
  .usage-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .usage-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .usage-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    &.full-width {
      grid-column: 1 / -1;
    }

    .usage-label {
      font-size: $font-size-xs;
      color: $text-tertiary;
    }

    .usage-value {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  .usage-actions {
    display: flex;
    gap: $spacing-sm;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .usage-action-btn {
    flex: 1;
    padding: $spacing-xs $spacing-sm;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // Composition Card
  .composition-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .composition-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin: 0 0 $spacing-md;
  }

  .composition-list {
    list-style: none;
    padding: 0;
    margin: 0 0 $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .composition-item {
    padding: $spacing-sm;
    background: $bg-tertiary;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    color: $text-primary;
  }

  .view-graph-btn {
    width: 100%;
    padding: $spacing-sm;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // Monitoring Card
  .monitoring-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .monitoring-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $border-color-light;
  }

  .status-label {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }

  .status-display {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .status-text {
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
    }

    &.status--enabled {
      .status-dot {
        background: #52c41a;
      }

      .status-text {
        color: #52c41a;
      }
    }

    &.status--partial {
      .status-dot {
        background: #faad14;
      }

      .status-text {
        color: #faad14;
      }
    }

    &.status--disabled {
      .status-dot {
        background: #f5222d;
      }

      .status-text {
        color: #f5222d;
      }
    }
  }

  .monitoring-stats {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .monitor-stat {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .monitor-label {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }

    .monitor-value {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
  }

  // Quick Actions Card
  .quick-actions-card {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .quick-action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-base ease;

    .quick-action-icon {
      font-size: 12px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }

    &.primary {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;

      &:hover {
        background: $primary-light;
        border-color: $primary-light;
      }
    }

    &.danger {
      &:hover {
        border-color: #f5222d;
        color: #f5222d;
      }
    }
  }

  // Loading State
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    color: $text-tertiary;

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid $border-color-base;
      border-top-color: $primary-color;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: $spacing-md;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  // Responsive
  @media (max-width: 1200px) {
    .detail-content {
      grid-template-columns: 1fr;
    }

    .right-column {
      order: -1;
    }

    .sticky-section {
      position: static;
    }
  }
</style>
