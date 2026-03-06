<template>
  <div class="model-detail-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t('model.detail.backToList') }}</span>
        </button>
        <div v-if="model" class="header-model-info">
          <span class="status-indicator" :class="model.status"></span>
          <span class="model-name">{{ model.name }}</span>
        </div>
      </div>
      <button v-if="model" class="save-btn" @click="handleSave">
        <span>💾</span>
        <span>{{ t('common.save') }}</span>
      </button>
    </div>

    <!-- Content -->
    <div v-if="model" class="page-content">
      <!-- Left Column -->
      <div class="content-left">
        <!-- Basic Info Section -->
        <div class="info-section">
          <h2 class="section-title">{{ t('model.detail.basicInfo') }}</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.modelName') }}</span>
              <span class="info-value">{{ model.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.uniqueId') }}</span>
              <code class="info-value code">{{ model.uniqueId }}</code>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.provider') }}</span>
              <span class="info-value">
                <span class="provider-icon" :class="model.provider">{{
                  getProviderIcon(model.provider)
                }}</span>
                {{ getProviderLabel(model.provider) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.series') }}</span>
              <span class="info-value">{{ model.series }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.version') }}</span>
              <span class="info-value">{{ model.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.type') }}</span>
              <span class="info-value">
                <span class="type-icon">{{ getTypeIcon(model.type) }}</span>
                {{ getTypeLabel(model.type) }}
                <span v-if="hasMultimodal(model)" class="feature-tag">{{
                  t('model.card.multimodal')
                }}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.status') }}</span>
              <span class="info-value">
                <span class="status-badge" :class="model.status">{{
                  getStatusLabel(model.status)
                }}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ t('model.detail.availability') }}</span>
              <span class="info-value">{{ getAvailabilityText(model) }}</span>
            </div>
          </div>

          <!-- Capabilities -->
          <div class="capabilities-section">
            <h3 class="subsection-title">{{ t('model.detail.capabilities') }}</h3>
            <div class="capabilities-grid">
              <div
                v-for="cap in allCapabilities"
                :key="cap.key"
                class="capability-item"
                :class="{ enabled: model.capabilities[cap.key] }"
              >
                <span class="capability-icon">{{ model.capabilities[cap.key] ? '✅' : '❌' }}</span>
                <span class="capability-name">{{ cap.label }}</span>
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="action-btn secondary" @click="editBasicInfo">
              {{ t('model.detail.editBasicInfo') }}
            </button>
            <button class="action-btn secondary" @click="viewDocs">
              {{ t('model.detail.viewDocs') }}
            </button>
          </div>
        </div>

        <!-- Connection Config Section -->
        <div class="info-section">
          <h2 class="section-title">{{ t('model.detail.connectionConfig') }}</h2>
          <div class="config-form">
            <div class="form-item">
              <label class="form-label">{{ t('model.detail.apiEndpoint') }}</label>
              <div class="form-input-wrapper">
                <input
                  v-model="configForm.baseUrl"
                  type="text"
                  class="form-input"
                  :placeholder="t('model.detail.apiEndpointPlaceholder')"
                />
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">{{ t('model.detail.apiKey') }}</label>
              <div class="form-input-wrapper with-action">
                <input
                  v-model="configForm.apiKey"
                  type="password"
                  class="form-input"
                  :placeholder="t('model.detail.apiKeyPlaceholder')"
                />
                <button class="input-action-btn" @click="testConnection">
                  {{ t('model.actions.test') }}
                </button>
              </div>
            </div>
            <div class="form-item">
              <label class="form-label">{{ t('model.detail.orgId') }}</label>
              <input
                v-model="configForm.organizationId"
                type="text"
                class="form-input"
                :placeholder="t('model.detail.orgIdPlaceholder')"
              />
            </div>
          </div>

          <!-- Default Params -->
          <div class="params-section">
            <h3 class="subsection-title">{{ t('model.detail.defaultParams') }}</h3>
            <div class="params-grid">
              <div class="param-item">
                <label class="param-label">{{ t('model.detail.temperature') }}</label>
                <input
                  v-model.number="configForm.defaultParams.temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  class="param-input"
                />
              </div>
              <div class="param-item">
                <label class="param-label">{{ t('model.detail.maxTokens') }}</label>
                <input
                  v-model.number="configForm.defaultParams.maxTokens"
                  type="number"
                  class="param-input"
                />
              </div>
              <div class="param-item">
                <label class="param-label">{{ t('model.detail.topP') }}</label>
                <input
                  v-model.number="configForm.defaultParams.topP"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  class="param-input"
                />
              </div>
              <div class="param-item">
                <label class="param-label">{{ t('model.detail.frequencyPenalty') }}</label>
                <input
                  v-model.number="configForm.defaultParams.frequencyPenalty"
                  type="number"
                  step="0.1"
                  min="-2"
                  max="2"
                  class="param-input"
                />
              </div>
              <div class="param-item">
                <label class="param-label">{{ t('model.detail.presencePenalty') }}</label>
                <input
                  v-model.number="configForm.defaultParams.presencePenalty"
                  type="number"
                  step="0.1"
                  min="-2"
                  max="2"
                  class="param-input"
                />
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="action-btn primary" @click="saveConfig">{{ t('common.save') }}</button>
            <button class="action-btn secondary" @click="testConnection">
              {{ t('model.detail.testConnection') }}
            </button>
          </div>
        </div>

        <!-- Rate Limits & Quotas Section -->
        <div class="info-section">
          <h2 class="section-title">{{ t('model.detail.rateLimitsAndQuotas') }}</h2>

          <!-- Rate Limits -->
          <div class="subsection">
            <h3 class="subsection-title">{{ t('model.detail.rateLimits') }}</h3>
            <div class="limit-cards">
              <div class="limit-card">
                <div class="limit-header">
                  <span class="limit-name">{{ t('model.detail.rpm') }}</span>
                  <span class="limit-value">{{ model.config.rateLimit.rpm }}</span>
                </div>
                <div v-if="model.config.rateLimit.currentRpm !== undefined" class="limit-usage">
                  <div class="usage-bar">
                    <div
                      class="usage-fill"
                      :style="{
                        width: `${(model.config.rateLimit.currentRpm / model.config.rateLimit.rpm) * 100}%`
                      }"
                    ></div>
                  </div>
                  <span class="usage-text"
                    >{{ model.config.rateLimit.currentRpm }} /
                    {{ model.config.rateLimit.rpm }}</span
                  >
                </div>
              </div>
              <div class="limit-card">
                <div class="limit-header">
                  <span class="limit-name">{{ t('model.detail.tpm') }}</span>
                  <span class="limit-value">{{ formatNumber(model.config.rateLimit.tpm) }}</span>
                </div>
                <div v-if="model.config.rateLimit.currentTpm !== undefined" class="limit-usage">
                  <div class="usage-bar">
                    <div
                      class="usage-fill"
                      :style="{
                        width: `${(model.config.rateLimit.currentTpm / model.config.rateLimit.tpm) * 100}%`
                      }"
                    ></div>
                  </div>
                  <span class="usage-text"
                    >{{ formatNumber(model.config.rateLimit.currentTpm) }} /
                    {{ formatNumber(model.config.rateLimit.tpm) }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Quotas -->
          <div class="subsection">
            <h3 class="subsection-title">{{ t('model.detail.quotaManagement') }}</h3>
            <div class="quota-list">
              <div v-if="model.config.quota.daily" class="quota-item">
                <span class="quota-label">{{ t('model.detail.dailyQuota') }}</span>
                <span class="quota-value"
                  >{{ formatNumber(model.config.quota.daily) }}
                  {{ t('model.detail.requests') }}</span
                >
              </div>
              <div v-if="model.config.quota.monthly" class="quota-item">
                <span class="quota-label">{{ t('model.detail.monthlyQuota') }}</span>
                <span class="quota-value">{{
                  formatCurrency(model.config.quota.monthly, model.pricing.currency)
                }}</span>
              </div>
              <div v-if="model.config.quota.remaining !== undefined" class="quota-item">
                <span class="quota-label">{{ t('model.detail.remaining') }}</span>
                <span class="quota-value" :class="{ warning: model.config.quota.remaining <= 0 }">
                  {{ formatCurrency(model.config.quota.remaining, model.pricing.currency) }}
                </span>
              </div>
              <div class="quota-item">
                <span class="quota-label">{{ t('model.detail.alertThreshold') }}</span>
                <span class="quota-value">{{ model.config.quota.alertThreshold }}%</span>
                <button class="edit-btn" @click="editThreshold">{{ t('common.edit') }}</button>
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="action-btn primary" @click="saveLimits">
              {{ t('model.detail.saveLimits') }}
            </button>
          </div>
        </div>

        <!-- Routing & Fallback Section -->
        <div class="info-section">
          <h2 class="section-title">{{ t('model.detail.routingAndFallback') }}</h2>

          <div class="priority-setting">
            <span class="setting-label">{{ t('model.detail.priority') }}</span>
            <span class="setting-value">{{ priority }} ({{ t('model.detail.priorityHint') }})</span>
          </div>

          <!-- Fallback Chain -->
          <div class="fallback-section">
            <h3 class="subsection-title">{{ t('model.detail.fallbackChain') }}</h3>
            <div class="fallback-chain">
              <div class="fallback-item current">
                <div class="fallback-number">1</div>
                <div class="fallback-info">
                  <span class="fallback-name">{{ model.name }}</span>
                  <span class="fallback-condition">{{ t('model.detail.primaryModel') }}</span>
                </div>
                <span class="status-indicator available"></span>
              </div>
              <div
                v-for="(fallbackId, index) in model.fallbackChain"
                :key="fallbackId"
                class="fallback-item"
              >
                <div class="fallback-number">{{ index + 2 }}</div>
                <div class="fallback-info">
                  <span class="fallback-name">{{ getFallbackName(fallbackId) }}</span>
                  <span class="fallback-condition">{{ getFallbackCondition(index) }}</span>
                </div>
                <span class="status-indicator available"></span>
              </div>
            </div>
          </div>

          <!-- Retry Settings -->
          <div class="retry-section">
            <div class="retry-item">
              <span class="retry-label">{{ t('model.detail.maxRetries') }}</span>
              <span class="retry-value">{{ maxRetries }} {{ t('model.detail.times') }}</span>
            </div>
            <div class="retry-item">
              <span class="retry-label">{{ t('model.detail.retryInterval') }}</span>
              <span class="retry-value">{{ t('model.detail.exponentialBackoff') }}</span>
            </div>
          </div>

          <div class="section-actions">
            <button class="action-btn secondary" @click="addFallbackModel">
              {{ t('model.detail.addFallback') }}
            </button>
            <button class="action-btn secondary" @click="adjustOrder">
              {{ t('model.detail.adjustOrder') }}
            </button>
          </div>
        </div>

        <!-- Access Control Section -->
        <div class="info-section">
          <h2 class="section-title">{{ t('model.detail.accessControl') }}</h2>

          <!-- Access Mode -->
          <div class="access-mode">
            <span class="mode-label">{{ t('model.detail.accessMode') }}</span>
            <div class="mode-options">
              <label class="mode-option">
                <input v-model="accessMode" type="radio" value="allow" />
                <span>{{ t('model.detail.allowList') }}</span>
              </label>
              <label class="mode-option">
                <input v-model="accessMode" type="radio" value="deny" />
                <span>{{ t('model.detail.denyList') }}</span>
              </label>
            </div>
          </div>

          <!-- Allowed Teams -->
          <div class="teams-section">
            <h3 class="subsection-title">{{ t('model.detail.allowedTeams') }}</h3>
            <div class="teams-list">
              <div v-for="team in allowedTeams" :key="team" class="team-item">
                <span class="team-icon">👥</span>
                <span class="team-name">{{ team }}</span>
              </div>
            </div>
          </div>

          <!-- Fallback Model for Quota -->
          <div class="fallback-model-section">
            <span class="setting-label">{{ t('model.detail.fallbackWhenQuota') }}</span>
            <span class="setting-value">{{ fallbackModel || t('model.detail.none') }}</span>
          </div>

          <div class="section-actions">
            <button class="action-btn secondary" @click="addTeam">
              {{ t('model.detail.addTeam') }}
            </button>
            <button class="action-btn primary" @click="savePermissions">
              {{ t('model.detail.savePermissions') }}
            </button>
          </div>
        </div>

        <!-- Usage Stats Section -->
        <div class="info-section">
          <h2 class="section-title">{{ t('model.detail.usageStats') }}</h2>

          <!-- Request Stats -->
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-label">{{ t('model.detail.totalRequests') }}</span>
              <span class="stat-value">{{ formatNumber(model.stats.monthlyCalls) }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">{{ t('model.detail.successCount') }}</span>
              <span class="stat-value success">{{
                formatNumber(Math.floor(model.stats.monthlyCalls * (model.stats.successRate / 100)))
              }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">{{ t('model.detail.successRate') }}</span>
              <span class="stat-value">{{ model.stats.successRate }}%</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">{{ t('model.detail.failureCount') }}</span>
              <span class="stat-value error">{{
                formatNumber(
                  Math.floor(model.stats.monthlyCalls * ((100 - model.stats.successRate) / 100))
                )
              }}</span>
            </div>
          </div>

          <!-- Token Consumption -->
          <div class="stats-subsection">
            <h3 class="subsection-title">{{ t('model.detail.tokenConsumption') }}</h3>
            <div class="token-stats">
              <div class="token-item">
                <span class="token-label">{{ t('model.detail.inputTokens') }}</span>
                <span class="token-value">42.5M tokens</span>
              </div>
              <div class="token-item">
                <span class="token-label">{{ t('model.detail.outputTokens') }}</span>
                <span class="token-value">18.7M tokens</span>
              </div>
              <div class="token-item">
                <span class="token-label">{{ t('model.detail.totalTokens') }}</span>
                <span class="token-value">61.2M tokens</span>
              </div>
              <div class="token-item">
                <span class="token-label">{{ t('model.detail.avgTokens') }}</span>
                <span class="token-value">4,915 {{ t('model.detail.perRequest') }}</span>
              </div>
            </div>
          </div>

          <!-- Cost Stats -->
          <div class="stats-subsection">
            <h3 class="subsection-title">{{ t('model.detail.costStats') }}</h3>
            <div class="cost-breakdown">
              <div class="cost-item">
                <span class="cost-label">{{ t('model.detail.inputCost') }}</span>
                <span class="cost-value">{{
                  formatCurrency(model.stats.monthlyCost * 0.3, model.pricing.currency)
                }}</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">{{ t('model.detail.outputCost') }}</span>
                <span class="cost-value">{{
                  formatCurrency(model.stats.monthlyCost * 0.7, model.pricing.currency)
                }}</span>
              </div>
              <div class="cost-item total">
                <span class="cost-label">{{ t('model.detail.totalCost') }}</span>
                <span class="cost-value">{{
                  formatCurrency(model.stats.monthlyCost, model.pricing.currency)
                }}</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">{{ t('model.detail.avgCost') }}</span>
                <span class="cost-value"
                  >{{
                    formatCurrency(
                      model.stats.monthlyCost / model.stats.monthlyCalls,
                      model.pricing.currency
                    )
                  }}
                  {{ t('model.detail.perRequest') }}</span
                >
              </div>
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="stats-subsection">
            <h3 class="subsection-title">{{ t('model.detail.performanceMetrics') }}</h3>
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-label">P50 {{ t('model.detail.latency') }}</span>
                <span class="metric-value"
                  >{{ model.stats.p50Latency || model.stats.avgLatency }}s</span
                >
              </div>
              <div class="metric-item">
                <span class="metric-label">P90 {{ t('model.detail.latency') }}</span>
                <span class="metric-value"
                  >{{ model.stats.p90Latency || model.stats.avgLatency * 1.5 }}s</span
                >
              </div>
              <div class="metric-item">
                <span class="metric-label">P95 {{ t('model.detail.latency') }}</span>
                <span class="metric-value"
                  >{{
                    model.stats.p99Latency
                      ? model.stats.p99Latency * 0.9
                      : model.stats.avgLatency * 2
                  }}s</span
                >
              </div>
              <div class="metric-item">
                <span class="metric-label">P99 {{ t('model.detail.latency') }}</span>
                <span class="metric-value"
                  >{{ model.stats.p99Latency || model.stats.avgLatency * 3 }}s</span
                >
              </div>
              <div class="metric-item">
                <span class="metric-label">{{ t('model.detail.throughput') }}</span>
                <span class="metric-value">{{ model.stats.throughput }} tokens/s</span>
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="action-btn secondary" @click="viewDetailedReport">
              {{ t('model.detail.detailedReport') }}
            </button>
            <button class="action-btn secondary" @click="exportCSV">
              {{ t('model.detail.exportCSV') }}
            </button>
            <button class="action-btn secondary" @click="subscribe">
              {{ t('model.detail.subscribe') }}
            </button>
          </div>
        </div>

        <!-- Error Analysis Section -->
        <div class="info-section">
          <h2 class="section-title">{{ t('model.detail.errorAnalysis') }}</h2>

          <!-- Error Distribution -->
          <div class="error-distribution">
            <h3 class="subsection-title">{{ t('model.detail.errorDistribution') }}</h3>
            <div class="error-list">
              <div class="error-item">
                <span class="error-type">{{ t('model.errors.rateLimit') }}</span>
                <div class="error-bar">
                  <div class="error-fill" style="width: 48%"></div>
                </div>
                <span class="error-count">45 (48%)</span>
              </div>
              <div class="error-item">
                <span class="error-type">{{ t('model.errors.timeout') }}</span>
                <div class="error-bar">
                  <div class="error-fill" style="width: 30%"></div>
                </div>
                <span class="error-count">28 (30%)</span>
              </div>
              <div class="error-item">
                <span class="error-type">{{ t('model.errors.auth') }}</span>
                <div class="error-bar">
                  <div class="error-fill" style="width: 13%"></div>
                </div>
                <span class="error-count">12 (13%)</span>
              </div>
              <div class="error-item">
                <span class="error-type">{{ t('model.errors.other') }}</span>
                <div class="error-bar">
                  <div class="error-fill" style="width: 9%"></div>
                </div>
                <span class="error-count">9 (9%)</span>
              </div>
            </div>
          </div>

          <!-- Recent Errors -->
          <div class="recent-errors">
            <h3 class="subsection-title">{{ t('model.detail.recentErrors') }}</h3>
            <div class="error-log">
              <div class="log-item">
                <span class="log-time">10:30:25</span>
                <span class="log-type error">RateLimitError:</span>
                <span class="log-message">{{ t('model.errors.tpmLimitReached') }}</span>
              </div>
              <div class="log-item">
                <span class="log-time">10:28:12</span>
                <span class="log-type error">TimeoutError:</span>
                <span class="log-message">{{ t('model.errors.requestTimeout') }}</span>
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="action-btn secondary" @click="viewFullLogs">
              {{ t('model.detail.viewFullLogs') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="content-right">
        <!-- Real-time Monitoring -->
        <div class="monitor-card">
          <h3 class="monitor-title">{{ t('model.detail.realtimeMonitoring') }}</h3>
          <div class="health-status">
            <div class="health-header">
              <span class="health-label">{{ t('model.detail.healthStatus') }}</span>
            </div>
            <div class="health-value" :class="model.status">
              <span class="health-indicator" :class="model.status"></span>
              {{ getStatusLabel(model.status) }}
            </div>
          </div>

          <div class="monitor-metrics">
            <div class="monitor-metric">
              <span class="metric-label">{{ t('model.detail.latencyP90') }}</span>
              <span class="metric-value"
                >{{ model.stats.p90Latency || model.stats.avgLatency * 1.5 }}s</span
              >
            </div>
            <div class="monitor-metric">
              <span class="metric-label">{{ t('model.detail.throughput') }}</span>
              <span class="metric-value">{{ model.stats.throughput }} tok/s</span>
            </div>
            <div class="monitor-metric">
              <span class="metric-label">{{ t('model.detail.successRate') }}</span>
              <span class="metric-value">{{ model.stats.successRate }}%</span>
            </div>
            <div class="monitor-metric">
              <span class="metric-label">{{ t('model.detail.currentRPM') }}</span>
              <span class="metric-value"
                >{{ model.config.rateLimit.currentRpm || 0 }}/{{ model.config.rateLimit.rpm }}</span
              >
            </div>
            <div class="monitor-metric">
              <span class="metric-label">{{ t('model.detail.currentTPM') }}</span>
              <span class="metric-value"
                >{{ formatNumber(model.config.rateLimit.currentTpm || 0) }}/{{
                  formatNumber(model.config.rateLimit.tpm)
                }}</span
              >
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-card">
          <h3 class="monitor-title">{{ t('model.detail.quickActions') }}</h3>
          <div class="quick-actions">
            <button class="quick-action-btn" @click="testConnection">
              <span class="action-icon">🧪</span>
              <span>{{ t('model.detail.testConnection') }}</span>
            </button>
            <button class="quick-action-btn" @click="viewLogs">
              <span class="action-icon">📊</span>
              <span>{{ t('model.detail.viewLogs') }}</span>
            </button>
            <button class="quick-action-btn" @click="copyConfig">
              <span class="action-icon">📋</span>
              <span>{{ t('model.detail.copyConfig') }}</span>
            </button>
            <button class="quick-action-btn" @click="setAsDefault">
              <span class="action-icon">⚙️</span>
              <span>{{ t('model.detail.setDefault') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
      <p>{{ t('model.detail.modelNotFound') }}</p>
      <button class="back-btn" @click="goBack">{{ t('model.detail.backToList') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, reactive } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useModelStore } from '@/store/modules/model'
  import type { LLMModel, ModelProvider, ModelType, ModelStatus, ModelCapabilities } from '@/types'

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  const modelStore = useModelStore()

  const model = ref<LLMModel | null>(null)
  const priority = ref(1)
  const maxRetries = ref(3)
  const accessMode = ref<'allow' | 'deny'>('allow')
  const allowedTeams = ref<string[]>([])
  const fallbackModel = ref('')

  const configForm = reactive({
    baseUrl: '',
    apiKey: '',
    organizationId: '',
    defaultParams: {
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stopSequences: [] as string[]
    }
  })

  const allCapabilities = [
    { key: 'chat' as keyof ModelCapabilities, label: 'Chat' },
    { key: 'streaming' as keyof ModelCapabilities, label: 'Streaming' },
    { key: 'vision' as keyof ModelCapabilities, label: 'Vision' },
    { key: 'tools' as keyof ModelCapabilities, label: 'Tools (max 5)' },
    { key: 'json' as keyof ModelCapabilities, label: 'JSON Mode' },
    { key: 'reasoning' as keyof ModelCapabilities, label: 'Reasoning' },
    { key: 'audio' as keyof ModelCapabilities, label: 'Audio' },
    { key: 'video' as keyof ModelCapabilities, label: 'Video' }
  ]

  const loadModel = () => {
    const id = route.params.id as string
    const found = modelStore.getModelById(id)
    if (found) {
      model.value = found
      // Initialize form values
      configForm.baseUrl = found.config.baseUrl || ''
      configForm.apiKey = found.config.apiKey || ''
      configForm.organizationId = found.config.organizationId || ''
      configForm.defaultParams = {
        temperature: found.config.defaultParams.temperature,
        maxTokens: found.config.defaultParams.maxTokens,
        topP: found.config.defaultParams.topP,
        frequencyPenalty: found.config.defaultParams.frequencyPenalty ?? 0,
        presencePenalty: found.config.defaultParams.presencePenalty ?? 0,
        stopSequences: found.config.defaultParams.stopSequences ?? []
      }
      accessMode.value = found.accessControl?.mode || 'allow'
      allowedTeams.value = found.accessControl?.teams || []
      fallbackModel.value = found.accessControl?.fallbackModel || ''
    }
  }

  const getProviderIcon = (provider: ModelProvider) => {
    const icons: Record<ModelProvider, string> = {
      openai: '🟢',
      anthropic: '🟣',
      google: '🔵',
      alibaba: '🟠',
      ollama: '⚪',
      custom: '⚫'
    }
    return icons[provider] || '⚫'
  }

  const getProviderLabel = (provider: ModelProvider) => {
    const labels: Record<ModelProvider, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      alibaba: t('model.providers.alibaba'),
      ollama: 'Ollama',
      custom: t('model.providers.custom')
    }
    return labels[provider] || provider
  }

  const getTypeIcon = (type: ModelType) => {
    const icons: Record<ModelType, string> = {
      chat: '💬',
      completion: '📝',
      image: '🖼️',
      audio: '🔊'
    }
    return icons[type] || '💬'
  }

  const getTypeLabel = (type: ModelType) => {
    const labels: Record<ModelType, string> = {
      chat: t('model.types.chat'),
      completion: t('model.types.completion'),
      image: t('model.types.image'),
      audio: t('model.types.audio')
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: ModelStatus) => {
    const labels: Record<ModelStatus, string> = {
      available: t('model.status.available'),
      degraded: t('model.status.degraded'),
      unavailable: t('model.status.unavailable'),
      'quota-warning': t('model.status.quotaWarning')
    }
    return labels[status] || status
  }

  const hasMultimodal = (m: LLMModel) => {
    return m.capabilities.vision || m.capabilities.audio || m.capabilities.video
  }

  const getAvailabilityText = (m: LLMModel) => {
    if (m.deployment?.type === 'local') {
      return t('model.detail.localDeployment')
    }
    const envs = m.deployment?.environments || ['production']
    const region = m.deployment?.region || 'global'
    return `${envs.join(', ')}, ${region}`
  }

  const getFallbackName = (id: string) => {
    const found = modelStore.models.find((m) => m.uniqueId === id || m.id === id)
    return found?.name || id
  }

  const getFallbackCondition = (index: number) => {
    const conditions = [t('model.detail.triggerRateLimit'), t('model.detail.triggerErrorQuota')]
    return conditions[index % conditions.length]
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'CNY' ? '¥' : '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  const goBack = () => {
    router.push('/app/resource/models')
  }

  const handleSave = () => {
    console.log('Saving model...')
  }

  const editBasicInfo = () => {
    console.log('Editing basic info...')
  }

  const viewDocs = () => {
    console.log('Viewing docs...')
  }

  const testConnection = async () => {
    if (!model.value) return
    const result = await modelStore.testConnection(model.value.id)
    alert(result.message)
  }

  const saveConfig = () => {
    console.log('Saving config...', configForm)
  }

  const saveLimits = () => {
    console.log('Saving limits...')
  }

  const editThreshold = () => {
    console.log('Editing threshold...')
  }

  const addFallbackModel = () => {
    console.log('Adding fallback model...')
  }

  const adjustOrder = () => {
    console.log('Adjusting order...')
  }

  const addTeam = () => {
    console.log('Adding team...')
  }

  const savePermissions = () => {
    console.log('Saving permissions...')
  }

  const viewDetailedReport = () => {
    console.log('Viewing detailed report...')
  }

  const exportCSV = () => {
    console.log('Exporting CSV...')
  }

  const subscribe = () => {
    console.log('Subscribing...')
  }

  const viewFullLogs = () => {
    console.log('Viewing full logs...')
  }

  const viewLogs = () => {
    console.log('Viewing logs...')
  }

  const copyConfig = () => {
    console.log('Copying config...')
  }

  const setAsDefault = () => {
    console.log('Setting as default...')
  }

  onMounted(() => {
    loadModel()
  })
</script>

<style scoped lang="scss">
  .model-detail-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: $bg-primary;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-xl;
    background: $bg-primary;
    border-bottom: 1px solid $border-color-light;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-lg;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .header-model-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.available {
      background: $success;
      box-shadow: 0 0 0 3px rgba($success, 0.2);
    }

    &.degraded {
      background: $warning;
      box-shadow: 0 0 0 3px rgba($warning, 0.2);
    }

    &.unavailable {
      background: $error;
      box-shadow: 0 0 0 3px rgba($error, 0.2);
    }

    &.quota-warning {
      background: $warning-dark;
      box-shadow: 0 0 0 3px rgba($warning-dark, 0.2);
    }
  }

  .model-name {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .save-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-sm $spacing-md;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    color: white;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover {
      background: darken($primary-color, 10%);
    }
  }

  .page-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: $spacing-xl;
    padding: $spacing-xl;
    overflow-y: auto;
  }

  .content-left {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
  }

  .content-right {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    position: sticky;
    top: $spacing-xl;
    height: fit-content;
  }

  .info-section {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
    padding-bottom: $spacing-sm;
    border-bottom: 2px solid $primary-color;
    display: inline-block;
  }

  .subsection-title {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    margin: $spacing-lg 0 $spacing-md 0;
  }

  .subsection {
    margin-bottom: $spacing-lg;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .info-value {
    font-size: $font-size-sm;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    &.code {
      font-family: 'Fira Code', monospace;
      background: $bg-tertiary;
      padding: 4px 8px;
      border-radius: $border-radius-sm;
    }
  }

  .provider-icon {
    font-size: 14px;
  }

  .type-icon {
    font-size: 14px;
  }

  .feature-tag {
    font-size: $font-size-xs;
    color: $primary-color;
    background: rgba($primary-color, 0.1);
    padding: 2px 6px;
    border-radius: $border-radius-sm;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &.available {
      background: rgba($success, 0.1);
      color: $success;
    }

    &.degraded {
      background: rgba($warning, 0.1);
      color: $warning;
    }

    &.unavailable {
      background: rgba($error, 0.1);
      color: $error;
    }

    &.quota-warning {
      background: rgba($warning-dark, 0.1);
      color: $warning-dark;
    }
  }

  .capabilities-section {
    margin-top: $spacing-lg;
  }

  .capabilities-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-sm;
  }

  .capability-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-xs $spacing-sm;
    background: $bg-tertiary;
    border-radius: $border-radius-sm;
    font-size: $font-size-xs;
    color: $text-tertiary;

    &.enabled {
      color: $success;
      background: rgba($success, 0.1);
    }
  }

  .section-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-lg;
    padding-top: $spacing-lg;
    border-top: 1px solid $border-color-light;
  }

  .action-btn {
    padding: $spacing-xs $spacing-md;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;

    &.primary {
      background: $primary-color;
      border: none;
      color: white;

      &:hover {
        background: darken($primary-color, 10%);
      }
    }

    &.secondary {
      background: $bg-tertiary;
      border: 1px solid $border-color-base;
      color: $text-secondary;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }

  // Form Styles
  .config-form {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-label {
    font-size: $font-size-xs;
    color: $text-secondary;
  }

  .form-input-wrapper {
    position: relative;

    &.with-action {
      display: flex;
      gap: $spacing-sm;

      .form-input {
        flex: 1;
      }
    }
  }

  .form-input {
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;
    transition: all $transition-fast ease;

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
    }
  }

  .input-action-btn {
    padding: $spacing-xs $spacing-md;
    background: $bg-tertiary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-fast ease;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .params-section {
    margin-top: $spacing-lg;
  }

  .params-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-md;
  }

  .param-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .param-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .param-input {
    padding: $spacing-xs $spacing-sm;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-primary;
    font-size: $font-size-sm;
    outline: none;

    &:focus {
      border-color: $primary-color;
    }
  }

  // Rate Limits
  .limit-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .limit-card {
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    padding: $spacing-md;
  }

  .limit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;
  }

  .limit-name {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .limit-value {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  .limit-usage {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .usage-bar {
    flex: 1;
    height: 6px;
    background: $bg-tertiary;
    border-radius: $border-radius-full;
    overflow: hidden;
  }

  .usage-fill {
    height: 100%;
    background: linear-gradient(90deg, $success, $primary-color);
    border-radius: $border-radius-full;
    transition: width $transition-base ease;
  }

  .usage-text {
    font-size: $font-size-xs;
    color: $text-secondary;
    min-width: 80px;
    text-align: right;
  }

  // Quotas
  .quota-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .quota-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-sm;
    background: $bg-primary;
    border-radius: $border-radius-sm;
  }

  .quota-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    min-width: 100px;
  }

  .quota-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
    flex: 1;

    &.warning {
      color: $error;
    }
  }

  .edit-btn {
    padding: 4px 8px;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
    font-size: $font-size-xs;
    cursor: pointer;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  // Fallback Chain
  .priority-setting {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
  }

  .setting-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .setting-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }

  .fallback-chain {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .fallback-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;

    &.current {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
    }
  }

  .fallback-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary-color;
    color: white;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    border-radius: 50%;
  }

  .fallback-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .fallback-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .fallback-condition {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .retry-section {
    margin-top: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .retry-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm;
    background: $bg-primary;
    border-radius: $border-radius-sm;
  }

  .retry-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .retry-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }

  // Access Control
  .access-mode {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
  }

  .mode-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .mode-options {
    display: flex;
    gap: $spacing-lg;
  }

  .mode-option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-sm;
    color: $text-primary;
    cursor: pointer;

    input {
      accent-color: $primary-color;
    }
  }

  .teams-section {
    margin-bottom: $spacing-lg;
  }

  .teams-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .team-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: $spacing-xs $spacing-sm;
    background: rgba($primary-color, 0.1);
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $primary-color;
  }

  .team-icon {
    font-size: 12px;
  }

  .fallback-model-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
  }

  // Stats
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
    text-align: center;
  }

  .stat-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;

    &.success {
      color: $success;
    }

    &.error {
      color: $error;
    }
  }

  .stats-subsection {
    margin-top: $spacing-lg;
  }

  .token-stats,
  .cost-breakdown {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-sm;
  }

  .token-item,
  .cost-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-sm;

    &.total {
      background: rgba($primary-color, 0.1);
      .token-value,
      .cost-value {
        color: $primary-color;
        font-weight: $font-weight-bold;
      }
    }
  }

  .token-label,
  .cost-label {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .token-value,
  .cost-value {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-sm;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
    text-align: center;
  }

  .metric-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }

  // Error Analysis
  .error-list {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .error-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-sm;
  }

  .error-type {
    font-size: $font-size-sm;
    color: $text-secondary;
    min-width: 120px;
  }

  .error-bar {
    flex: 1;
    height: 8px;
    background: $bg-tertiary;
    border-radius: $border-radius-full;
    overflow: hidden;
  }

  .error-fill {
    height: 100%;
    background: $error;
    border-radius: $border-radius-full;
  }

  .error-count {
    font-size: $font-size-xs;
    color: $text-tertiary;
    min-width: 60px;
    text-align: right;
  }

  .recent-errors {
    margin-top: $spacing-lg;
  }

  .error-log {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
    font-family: 'Fira Code', monospace;
    font-size: $font-size-xs;
  }

  .log-item {
    display: flex;
    gap: $spacing-md;
  }

  .log-time {
    color: $text-tertiary;
    min-width: 70px;
  }

  .log-type {
    color: $error;
    min-width: 100px;

    &.error {
      font-weight: $font-weight-medium;
    }
  }

  .log-message {
    color: $text-secondary;
  }

  // Right Sidebar
  .monitor-card,
  .quick-actions-card {
    background: $bg-secondary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
  }

  .monitor-title {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0 0 $spacing-md 0;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid $border-color-light;
  }

  .health-status {
    margin-bottom: $spacing-lg;
  }

  .health-header {
    margin-bottom: $spacing-sm;
  }

  .health-label {
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .health-value {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;

    &.available {
      color: $success;
    }

    &.degraded {
      color: $warning;
    }

    &.unavailable {
      color: $error;
    }

    &.quota-warning {
      color: $warning-dark;
    }
  }

  .health-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;

    &.available {
      background: $success;
    }

    &.degraded {
      background: $warning;
    }

    &.unavailable {
      background: $error;
    }

    &.quota-warning {
      background: $warning-dark;
    }
  }

  .monitor-metrics {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .monitor-metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm 0;
    border-bottom: 1px solid $border-color-light;

    &:last-child {
      border-bottom: none;
    }
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .quick-action-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-light;
    border-radius: $border-radius-md;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast ease;
    text-align: left;

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
    }
  }

  .action-icon {
    font-size: 16px;
  }

  // Not Found
  .not-found {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-lg;
    color: $text-tertiary;
    font-size: $font-size-lg;
  }
</style>
