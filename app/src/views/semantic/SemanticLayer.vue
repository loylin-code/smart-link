<template>
  <div class="semantic-layer">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('sidebar.semanticConfig') }}</h1>
        <span class="page-desc">{{ t('semantic.config.description') }}</span>
      </div>
      <div class="header-actions">
        <button class="action-btn primary" @click="handleAddDomain">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>{{ t('semantic.config.addDomain') }}</span>
        </button>
      </div>
    </header>

    <!-- 领域配置列表 -->
    <section class="domain-section">
      <div class="section-header">
        <h2 class="section-title">{{ t('semantic.config.domainConfig') }}</h2>
        <span class="section-count">({{ store.configCount }})</span>
      </div>

      <div class="domain-grid">
        <div v-for="config in store.configs" :key="config.id" class="domain-card">
          <div class="card-header">
            <div class="domain-info">
              <div class="domain-icon">{{ getDomainIcon(config.domain) }}</div>
              <div class="domain-name">
                <h3>{{ config.domainName }}</h3>
                <span class="domain-key">{{ config.domain }}</span>
              </div>
            </div>
            <div class="domain-status">
              <span :class="['status-badge', config.enabled ? 'enabled' : 'disabled']">
                {{ config.enabled ? t('common.enabled') : t('common.disabled') }}
              </span>
            </div>
          </div>

          <div class="card-body">
            <p class="domain-desc">{{ config.description }}</p>
            <div class="domain-stats">
              <div class="stat-item">
                <span class="stat-value">{{ config.mappingRules.length }}</span>
                <span class="stat-label">{{ t('semantic.config.mappingRules') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ config.agentBindings.length }}</span>
                <span class="stat-label">{{ t('semantic.config.agentCount') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ config.priority }}</span>
                <span class="stat-label">{{ t('semantic.config.priority') }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="switch-wrapper">
              <span class="switch-label">{{ t('common.enabled') }}</span>
              <button
                :class="['toggle-switch', { active: config.enabled }]"
                @click="toggleConfig(config)"
              >
                <span class="switch-thumb"></span>
              </button>
            </div>
            <div class="card-actions">
              <button class="btn-text" @click="handleBindAgent(config)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ t('semantic.config.bindAgent') }}
              </button>
              <button class="btn-icon" @click="handleEditConfig(config)" :title="t('common.edit')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="store.configs.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M3 9h18M9 21V9" stroke="currentColor" stroke-width="2"/>
        </svg>
        <p>{{ t('semantic.config.emptyDomains') }}</p>
      </div>
    </section>

    <!-- 映射规则管理 -->
    <section class="rules-section">
      <div class="section-header">
        <div class="header-left">
          <h2 class="section-title">{{ t('semantic.config.mappingRules') }}</h2>
          <span class="section-count">({{ allMappingRules.length }})</span>
        </div>
        <button class="btn-text" @click="handleAddRule">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ t('semantic.config.addRule') }}
        </button>
      </div>

      <div class="rules-list">
        <div v-for="rule in allMappingRules" :key="rule.id" class="rule-item">
          <div class="rule-info">
            <div class="rule-header">
              <span class="rule-name">{{ rule.name }}</span>
              <span :class="['rule-status', rule.enabled ? 'enabled' : 'disabled']">
                {{ rule.enabled ? t('common.enabled') : t('common.disabled') }}
              </span>
            </div>
            <div class="rule-pattern">
              <span class="pattern-label">{{ t('semantic.config.pattern') }}:</span>
              <code class="pattern-value">{{ rule.pattern }}</code>
            </div>
            <div class="rule-template">
              <span class="template-label">{{ t('semantic.config.template') }}:</span>
              <code class="template-value">{{ rule.template }}</code>
            </div>
          </div>
          <div class="rule-meta">
            <div class="confidence-badge">
              <span class="confidence-label">{{ t('semantic.config.confidence') }}</span>
              <span class="confidence-value">{{ Math.round(rule.confidence * 100) }}%</span>
            </div>
            <div class="rule-actions">
              <button class="btn-icon" @click="handleEditRule(rule)" :title="t('common.edit')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="btn-icon danger" @click="handleDeleteRule(rule)" :title="t('common.delete')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="allMappingRules.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>{{ t('semantic.config.emptyRules') }}</p>
      </div>
    </section>

    <!-- Agent 绑定管理 -->
    <section class="bindings-section">
      <div class="section-header">
        <h2 class="section-title">{{ t('semantic.config.agentBindings') }}</h2>
        <span class="section-desc">{{ t('semantic.config.agentBindingsDesc') }}</span>
      </div>

      <div class="bindings-list">
        <div v-for="config in store.configs.filter(c => c.agentBindings.length > 0)" :key="config.id" class="binding-card">
          <div class="binding-domain">
            <span class="domain-badge">{{ config.domainName }}</span>
          </div>
          <div class="binding-agents">
            <div v-for="agentId in config.agentBindings" :key="agentId" class="agent-tag">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Agent-{{ agentId.slice(-4) }}</span>
              <button class="btn-icon-sm" @click="handleUnbindAgent(config, agentId)">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="store.configs.filter(c => c.agentBindings.length > 0).length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>{{ t('semantic.config.emptyBindings') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSemanticStore, type SemanticConfig, type MappingRule } from '@/store/modules/semantic'

const { t } = useI18n()
const store = useSemanticStore()

// Computed
const allMappingRules = computed(() => {
  const rules: (MappingRule & { configId: string })[] = []
  store.configs.forEach(config => {
    config.mappingRules.forEach(rule => {
      rules.push({ ...rule, configId: config.id })
    })
  })
  return rules
})

// Methods
const getDomainIcon = (domain: string) => {
  const icons: Record<string, string> = {
    finance: '💰',
    medical: '🏥',
    retail: '🛒',
    manufacture: '🏭',
    education: '📚',
    other: '📋'
  }
  return icons[domain] || '📋'
}

const toggleConfig = (config: SemanticConfig) => {
  const updated = { ...config, enabled: !config.enabled }
  store.updateConfig(config.id, updated)
}

const handleAddDomain = () => {
  // TODO: Implement add domain
  console.log('Add domain')
}

const handleEditConfig = (config: SemanticConfig) => {
  // TODO: Implement edit config
  console.log('Edit config', config)
}

const handleBindAgent = (config: SemanticConfig) => {
  // TODO: Implement bind agent
  console.log('Bind agent to', config.domain)
}

const handleUnbindAgent = (config: SemanticConfig, agentId: string) => {
  // TODO: Implement unbind agent
  console.log('Unbind agent', agentId, 'from', config.domain)
}

const handleAddRule = () => {
  // TODO: Implement add rule
  console.log('Add mapping rule')
}

const handleEditRule = (rule: MappingRule) => {
  // TODO: Implement edit rule
  console.log('Edit rule', rule)
}

const handleDeleteRule = (rule: MappingRule) => {
  // TODO: Implement delete rule
  console.log('Delete rule', rule)
}
</script>

<style scoped lang="scss">
.semantic-layer {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  height: 100%;
  overflow: auto;
  background: $bg-secondary;
  padding: $spacing-xl;
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

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
    .action-btn {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-sm $spacing-md;
      background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
      border: none;
      border-radius: $border-radius-md;
      color: #fff;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: all $transition-base ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
      }
    }
  }
}

// 区块通用样式
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    .section-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }

    .section-count {
      font-size: $font-size-sm;
      color: $text-tertiary;
    }
  }

  .section-desc {
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}

// 领域配置
.domain-section {
  background: $bg-primary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
}

.domain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-md;
}

.domain-card {
  background: $bg-secondary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  transition: all $transition-base ease;

  &:hover {
    border-color: $primary-color;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-md;

    .domain-info {
      display: flex;
      align-items: center;
      gap: $spacing-md;

      .domain-icon {
        font-size: 32px;
      }

      .domain-name {
        h3 {
          font-size: $font-size-base;
          font-weight: $font-weight-semibold;
          color: $text-primary;
          margin: 0 0 2px 0;
        }

        .domain-key {
          font-size: $font-size-xs;
          color: $text-tertiary;
          text-transform: uppercase;
        }
      }
    }

    .status-badge {
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-sm;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;

      &.enabled {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }

      &.disabled {
        background: rgba(107, 114, 128, 0.1);
        color: #6b7280;
      }
    }
  }

  .card-body {
    margin-bottom: $spacing-md;

    .domain-desc {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin: 0 0 $spacing-md 0;
      line-height: 1.5;
    }

    .domain-stats {
      display: flex;
      gap: $spacing-lg;

      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-value {
          font-size: $font-size-lg;
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

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: $spacing-md;
    border-top: 1px solid $border-color-light;

    .switch-wrapper {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      .switch-label {
        font-size: $font-size-sm;
        color: $text-secondary;
      }

      .toggle-switch {
        width: 44px;
        height: 24px;
        background: $border-color-base;
        border: none;
        border-radius: $border-radius-full;
        cursor: pointer;
        position: relative;
        transition: background $transition-base ease;

        .switch-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: transform $transition-base ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        &.active {
          background: $success;

          .switch-thumb {
            transform: translateX(20px);
          }
        }
      }
    }

    .card-actions {
      display: flex;
      gap: $spacing-xs;

      .btn-text {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        padding: $spacing-xs $spacing-sm;
        background: transparent;
        border: 1px solid $border-color-base;
        border-radius: $border-radius-md;
        font-size: $font-size-sm;
        color: $text-secondary;
        cursor: pointer;
        transition: all $transition-base ease;

        svg {
          width: 14px;
          height: 14px;
        }

        &:hover {
          border-color: $primary-color;
          color: $primary-color;
        }
      }

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
          background: $bg-tertiary;
          border-color: $border-color-base;

          svg {
            color: $primary-color;
          }
        }
      }
    }
  }
}

// 映射规则
.rules-section {
  background: $bg-primary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  background: transparent;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-md;
  font-size: $font-size-sm;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-base ease;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: $spacing-md;
  background: $bg-secondary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-md;
  transition: all $transition-base ease;

  &:hover {
    border-color: $primary-color;
  }

  .rule-info {
    flex: 1;
    min-width: 0;

    .rule-header {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      margin-bottom: $spacing-xs;

      .rule-name {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        color: $text-primary;
      }

      .rule-status {
        padding: 2px $spacing-xs;
        border-radius: $border-radius-sm;
        font-size: $font-size-xs;

        &.enabled {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        &.disabled {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }
      }
    }

    .rule-pattern,
    .rule-template {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      margin-bottom: 2px;

      .pattern-label,
      .template-label {
        font-size: $font-size-xs;
        color: $text-tertiary;
        white-space: nowrap;
      }

      .pattern-value,
      .template-value {
        font-size: $font-size-xs;
        color: $primary-color;
        background: rgba(59, 130, 246, 0.1);
        padding: 2px $spacing-xs;
        border-radius: $border-radius-sm;
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .template-value {
        color: $text-secondary;
        background: $bg-tertiary;
      }
    }
  }

  .rule-meta {
    display: flex;
    align-items: center;
    gap: $spacing-md;

    .confidence-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;

      .confidence-label {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }

      .confidence-value {
        font-size: $font-size-sm;
        font-weight: $font-weight-semibold;
        color: $primary-color;
      }
    }

    .rule-actions {
      display: flex;
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
          background: $bg-tertiary;
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

// Agent 绑定
.bindings-section {
  background: $bg-primary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  padding: $spacing-lg;
}

.bindings-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.binding-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background: $bg-secondary;
  border: 1px solid $border-color-light;
  border-radius: $border-radius-md;

  .binding-domain {
    .domain-badge {
      display: inline-flex;
      padding: $spacing-xs $spacing-sm;
      background: rgba(59, 130, 246, 0.1);
      border-radius: $border-radius-sm;
      font-size: $font-size-sm;
      font-weight: $font-weight-medium;
      color: $primary-color;
    }
  }

  .binding-agents {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;

    .agent-tag {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-xs $spacing-sm;
      background: $bg-primary;
      border: 1px solid $border-color-base;
      border-radius: $border-radius-full;
      font-size: $font-size-xs;
      color: $text-secondary;

      svg {
        width: 12px;
        height: 12px;
      }

      .btn-icon-sm {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        padding: 0;
        margin-left: 2px;

        svg {
          width: 10px;
          height: 10px;
          color: $text-tertiary;
        }

        &:hover {
          background: rgba(239, 68, 68, 0.1);

          svg {
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
  padding: $spacing-2xl;
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
    margin: 0;
  }
}
</style>
