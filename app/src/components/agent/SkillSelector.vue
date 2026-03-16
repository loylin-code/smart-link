<template>
  <div class="skill-selector">
    <!-- Empty State -->
    <div v-if="selectedSkills.length === 0" class="empty-state">
      <div class="empty-icon-wrapper">
        <span class="empty-icon">🧩</span>
      </div>
      <h3>{{ t('agent.design.skills.emptyTitle') }}</h3>
      <p>{{ t('agent.design.skills.emptyDesc') }}</p>
      <button class="add-skill-btn" @click="openModal">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ t('agent.design.skills.addSkill') }}
      </button>
    </div>

    <!-- Selected Skills List -->
    <div v-else class="skills-content">
      <div class="content-header">
        <h3>{{ t('agent.design.skills.selected') }}</h3>
        <span class="count-badge">{{ selectedSkills.length }}</span>
        <button class="add-more-btn" @click="openModal">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          {{ t('agent.design.skills.addMore') }}
        </button>
      </div>

      <TransitionGroup name="skill-list" tag="div" class="selected-list">
        <div v-for="skill in selectedSkills" :key="skill.id" class="selected-skill-card">
          <div class="skill-main">
            <div class="skill-icon" :class="`icon--${skill.category}`">
              {{ getCategoryIcon(skill.category) }}
            </div>
            <div class="skill-info">
              <span class="skill-name">{{ skill.displayName }}</span>
              <span class="skill-meta">
                <span class="skill-category">{{ getCategoryLabel(skill.category) }}</span>
                <span class="skill-version">v{{ skill.version }}</span>
              </span>
            </div>
          </div>
          <div class="skill-actions">
            <button
              class="toggle-btn"
              :class="{ active: skillBindingMap[skill.id]?.enabled !== false }"
              @click="toggleSkillEnabled(skill.id)"
              :title="
                skillBindingMap[skill.id]?.enabled !== false
                  ? t('agent.design.skills.disable')
                  : t('agent.design.skills.enable')
              "
            >
              <svg
                v-if="skillBindingMap[skill.id]?.enabled !== false"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </button>
            <button
              class="remove-btn"
              @click="removeSkill(skill.id)"
              :title="t('agent.design.skills.remove')"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Skill Selection Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-container">
            <!-- Modal Header -->
            <div class="modal-header">
              <h2>{{ t('agent.design.skills.selectTitle') }}</h2>
              <button class="close-btn" @click="closeModal">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Search & Filter -->
            <div class="modal-filter">
              <div class="search-box">
                <svg viewBox="0 0 24 24" fill="none">
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
                  :placeholder="t('agent.design.skills.search')"
                />
              </div>

              <!-- Category Tabs -->
              <div class="category-tabs">
                <button
                  v-for="cat in categories"
                  :key="cat.value"
                  class="cat-tab"
                  :class="{ active: categoryFilter === cat.value }"
                  @click="categoryFilter = cat.value"
                >
                  <span class="cat-icon">{{ cat.icon }}</span>
                  <span class="cat-label">{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- Skills Grid by Category -->
            <div class="modal-body">
              <div v-if="loading" class="loading-state">
                <span class="spinner" />
                <span>{{ t('common.loading') }}</span>
              </div>

              <div v-else-if="filteredSkills.length === 0" class="no-results">
                <span class="no-results-icon">🔍</span>
                <p>{{ t('agent.design.skills.noResults') }}</p>
              </div>

              <div v-else class="skills-grid">
                <div
                  v-for="skill in filteredSkills"
                  :key="skill.id"
                  class="skill-card"
                  :class="{
                    selected: isTempSelected(skill.id),
                    already: isSkillSelected(skill.id)
                  }"
                  @click="!isSkillSelected(skill.id) && toggleTempSelection(skill)"
                >
                  <div class="card-checkbox" :class="{ checked: isTempSelected(skill.id) }">
                    <svg v-if="isTempSelected(skill.id)" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <div class="card-icon" :class="`icon--${skill.category}`">
                    {{ getCategoryIcon(skill.category) }}
                  </div>
                  <div class="card-content">
                    <div class="card-header">
                      <span class="card-name">{{ skill.displayName }}</span>
                      <span class="card-version">v{{ skill.version }}</span>
                    </div>
                    <p class="card-desc">{{ skill.description }}</p>
                    <div class="card-tags">
                      <span v-for="tag in skill.tags.slice(0, 2)" :key="tag" class="tag">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                  <div v-if="isSkillSelected(skill.id)" class="already-badge">
                    {{ t('agent.design.skills.alreadySelected') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <div class="selection-info">
                <span class="selection-count">
                  {{ t('agent.design.skills.selectedCount', { count: tempSelected.length }) }}
                </span>
              </div>
              <div class="footer-actions">
                <button class="cancel-btn" @click="closeModal">
                  {{ t('common.cancel') }}
                </button>
                <button
                  class="confirm-btn"
                  :disabled="tempSelected.length === 0"
                  @click="confirmSelection"
                >
                  {{ t('agent.design.skills.confirmAdd') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { Skill, SkillCategory, SkillBinding } from '@/types'

  interface Props {
    bindings?: SkillBinding[]
  }

  const props = withDefaults(defineProps<Props>(), {
    bindings: () => []
  })

  const emit = defineEmits<{
    update: [bindings: SkillBinding[]]
  }>()

  const { t } = useI18n()

  // Mock skills data for testing
  const mockSkills: Skill[] = [
    {
      id: 'skill-001',
      name: 'data-analysis',
      displayName: '数据分析工具',
      version: '1.0.0',
      category: 'analytics',
      status: 'enabled',
      author: 'SmartLink',
      description: '强大的数据统计与分析引擎，支持多维度数据洞察',
      tags: ['数据', '统计', '分析', '报表'],
      riskLevel: 'low',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { data: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { result: { type: 'object' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-002',
      name: 'report-generator',
      displayName: '报表生成器',
      version: '2.1.0',
      category: 'analytics',
      status: 'enabled',
      author: 'SmartLink',
      description: '智能报表生成工具，支持多种格式导出',
      tags: ['报表', 'PDF', 'Excel'],
      riskLevel: 'low',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { template: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { file: { type: 'string' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-003',
      name: 'chart-visualizer',
      displayName: '图表可视化',
      version: '1.5.2',
      category: 'analytics',
      status: 'enabled',
      author: 'SmartLink',
      description: '丰富的图表类型，让数据呈现更直观',
      tags: ['图表', '可视化', 'ECharts'],
      riskLevel: 'low',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { data: { type: 'array' } } },
      outputSchema: { type: 'object', properties: { chart: { type: 'object' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-004',
      name: 'data-processing',
      displayName: '数据处理引擎',
      version: '1.5.0',
      category: 'processing',
      status: 'enabled',
      author: 'SmartLink',
      description: '高效的ETL数据处理流水线，支持大规模数据处理',
      tags: ['ETL', '数据', '流水线'],
      riskLevel: 'medium',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { source: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { result: { type: 'object' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-005',
      name: 'text-processor',
      displayName: '文本处理器',
      version: '2.0.1',
      category: 'processing',
      status: 'enabled',
      author: 'SmartLink',
      description: '自然语言处理与文本分析工具集',
      tags: ['NLP', '文本', '分词'],
      riskLevel: 'low',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { result: { type: 'object' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-006',
      name: 'image-processor',
      displayName: '图像处理器',
      version: '3.2.0',
      category: 'processing',
      status: 'enabled',
      author: 'SmartLink',
      description: '图像处理与特征提取能力',
      tags: ['图像', 'CV', '特征'],
      riskLevel: 'medium',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { image: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { features: { type: 'array' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-007',
      name: 'api-invoker',
      displayName: 'API调用器',
      version: '1.2.0',
      category: 'invoker',
      status: 'enabled',
      author: 'SmartLink',
      description: '外部API调用与集成工具，支持REST/GraphQL',
      tags: ['API', 'REST', '集成'],
      riskLevel: 'high',
      requiresApproval: true,
      inputSchema: { type: 'object', properties: { url: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { response: { type: 'any' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-008',
      name: 'database-query',
      displayName: '数据库查询',
      version: '2.3.0',
      category: 'invoker',
      status: 'enabled',
      author: 'SmartLink',
      description: '多数据库连接与查询执行能力',
      tags: ['数据库', 'SQL', '查询'],
      riskLevel: 'high',
      requiresApproval: true,
      inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { rows: { type: 'array' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-009',
      name: 'web-scraper',
      displayName: '网页采集器',
      version: '1.8.0',
      category: 'invoker',
      status: 'enabled',
      author: 'SmartLink',
      description: '智能网页内容提取与采集',
      tags: ['爬虫', '采集', '网页'],
      riskLevel: 'medium',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { url: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { content: { type: 'string' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-010',
      name: 'format-converter',
      displayName: '格式转换器',
      version: '3.0.0',
      category: 'transform',
      status: 'enabled',
      author: 'SmartLink',
      description: '多格式数据转换工具，支持JSON/XML/CSV等',
      tags: ['转换', '格式', 'JSON'],
      riskLevel: 'low',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { data: { type: 'any' } } },
      outputSchema: { type: 'object', properties: { result: { type: 'any' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-011',
      name: 'data-mapper',
      displayName: '数据映射器',
      version: '1.4.0',
      category: 'transform',
      status: 'enabled',
      author: 'SmartLink',
      description: '灵活的数据字段映射与转换规则',
      tags: ['映射', '字段', '规则'],
      riskLevel: 'low',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { mapping: { type: 'object' } } },
      outputSchema: { type: 'object', properties: { result: { type: 'object' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'skill-012',
      name: 'encoder-decoder',
      displayName: '编解码器',
      version: '2.1.0',
      category: 'transform',
      status: 'enabled',
      author: 'SmartLink',
      description: '数据编码与解码工具集',
      tags: ['编码', 'Base64', '加密'],
      riskLevel: 'low',
      requiresApproval: false,
      inputSchema: { type: 'object', properties: { data: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { result: { type: 'string' } } },
      config: {},
      dependencies: { skills: [], tools: [], mcpServers: [] },
      stats: {
        totalCalls: 0,
        successRate: 1,
        avgDuration: 0,
        last30Days: { calls: 0, tokens: { input: 0, output: 0 }, cost: 0 }
      },
      lastUpdated: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]

  // State
  const loading = ref(false)
  const showModal = ref(false)
  const searchKeyword = ref('')
  const categoryFilter = ref<string>('')
  const allSkills = ref<Skill[]>([])
  const selectedSkills = ref<Skill[]>([])
  const skillBindingMap = ref<Record<string, SkillBinding>>({})
  const tempSelected = ref<Skill[]>([])

  // Categories
  const categories: { value: string; icon: string; label: string }[] = [
    { value: '', icon: '📋', label: t('skills.category.all') },
    { value: 'analytics', icon: '📊', label: t('skills.category.analytics') },
    { value: 'processing', icon: '⚙️', label: t('skills.category.processing') },
    { value: 'invoker', icon: '🔗', label: t('skills.category.invoker') },
    { value: 'transform', icon: '🔄', label: t('skills.category.transform') }
  ]

  // Computed
  const filteredSkills = computed(() => {
    let result = allSkills.value

    if (categoryFilter.value) {
      result = result.filter((skill) => skill.category === categoryFilter.value)
    }

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(
        (skill) =>
          skill.displayName.toLowerCase().includes(keyword) ||
          skill.description.toLowerCase().includes(keyword) ||
          skill.tags.some((tag) => tag.toLowerCase().includes(keyword))
      )
    }

    return result
  })

  // Methods
  function getCategoryIcon(category: SkillCategory): string {
    const icons: Record<SkillCategory, string> = {
      analytics: '📊',
      processing: '⚙️',
      invoker: '🔗',
      transform: '🔄'
    }
    return icons[category] || '🎯'
  }

  function getCategoryLabel(category: SkillCategory): string {
    const labels: Record<SkillCategory, string> = {
      analytics: t('skills.category.analytics'),
      processing: t('skills.category.processing'),
      invoker: t('skills.category.invoker'),
      transform: t('skills.category.transform')
    }
    return labels[category] || category
  }

  function isSkillSelected(skillId: string): boolean {
    return selectedSkills.value.some((s) => s.id === skillId)
  }

  function isTempSelected(skillId: string): boolean {
    return tempSelected.value.some((s) => s.id === skillId)
  }

  function toggleTempSelection(skill: Skill) {
    const index = tempSelected.value.findIndex((s) => s.id === skill.id)
    if (index > -1) {
      tempSelected.value.splice(index, 1)
    } else {
      tempSelected.value.push(skill)
    }
  }

  function openModal() {
    tempSelected.value = []
    showModal.value = true
  }

  function closeModal() {
    showModal.value = false
    tempSelected.value = []
  }

  function confirmSelection() {
    tempSelected.value.forEach((skill) => {
      if (!isSkillSelected(skill.id)) {
        selectedSkills.value.push(skill)
        skillBindingMap.value[skill.id] = {
          skillId: skill.id,
          version: skill.version,
          enabled: true,
          parameters: {}
        }
      }
    })
    emitUpdate()
    closeModal()
  }

  function removeSkill(skillId: string) {
    const index = selectedSkills.value.findIndex((s) => s.id === skillId)
    if (index > -1) {
      selectedSkills.value.splice(index, 1)
      delete skillBindingMap.value[skillId]
      emitUpdate()
    }
  }

  function toggleSkillEnabled(skillId: string) {
    if (skillBindingMap.value[skillId]) {
      skillBindingMap.value[skillId].enabled = !skillBindingMap.value[skillId].enabled
      emitUpdate()
    }
  }

  function emitUpdate() {
    const bindings = Object.values(skillBindingMap.value)
    emit('update', bindings)
  }

  async function loadSkills() {
    loading.value = true
    try {
      // Use mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300))
      allSkills.value = mockSkills
    } catch (error) {
      console.error('Failed to load skills:', error)
    } finally {
      loading.value = false
    }
  }

  // Initialize from props
  function initFromBindings() {
    if (!props.bindings?.length) return

    const bindingMap: Record<string, SkillBinding> = {}
    props.bindings.forEach((binding) => {
      bindingMap[binding.skillId] = binding
    })
    skillBindingMap.value = bindingMap

    // Find skill details from mock data
    props.bindings.forEach((binding) => {
      const skill = mockSkills.find((s) => s.id === binding.skillId)
      if (skill && !isSkillSelected(skill.id)) {
        selectedSkills.value.push(skill)
      }
    })
  }

  // Watch props changes
  watch(
    () => props.bindings,
    () => {
      initFromBindings()
    },
    { deep: true }
  )

  onMounted(() => {
    loadSkills()
    initFromBindings()
  })
</script>

<style scoped lang="scss">
  .skill-selector {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  // Empty State
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    text-align: center;

    .empty-icon-wrapper {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border-radius: 50%;
      margin-bottom: $spacing-lg;
    }

    .empty-icon {
      font-size: 40px;
      opacity: 0.8;
    }

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-sm 0;
    }

    p {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0 0 $spacing-xl 0;
      max-width: 280px;
    }
  }

  .add-skill-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-xl;
    background: linear-gradient(135deg, $primary-color 0%, #8b5cf6 100%);
    border: none;
    border-radius: $border-radius-lg;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // Skills Content
  .skills-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .content-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-color-lighter;

    h3 {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: $primary-color;
    color: #fff;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    border-radius: 10px;
  }

  .add-more-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    margin-left: auto;
    padding: $spacing-xs $spacing-md;
    background: transparent;
    border: 1px solid $primary-color;
    border-radius: $border-radius-md;
    color: $primary-color;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(59, 130, 246, 0.1);
    }
  }

  .selected-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    padding-top: $spacing-md;
  }

  .selected-skill-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-sm $spacing-md;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    transition: all 0.2s ease;

    &:hover {
      border-color: $primary-color;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }
  }

  .skill-main {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .skill-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border-radius: $border-radius-md;
    background: $bg-secondary;

    &.icon--analytics {
      background: rgba(59, 130, 246, 0.1);
    }

    &.icon--processing {
      background: rgba(16, 185, 129, 0.1);
    }

    &.icon--invoker {
      background: rgba(245, 158, 11, 0.1);
    }

    &.icon--transform {
      background: rgba(139, 92, 246, 0.1);
    }
  }

  .skill-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .skill-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .skill-meta {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-xs;
    color: $text-tertiary;
  }

  .skill-category {
    padding: 1px 6px;
    background: $bg-secondary;
    border-radius: 4px;
  }

  .skill-actions {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .toggle-btn,
  .remove-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-sm;
    color: $text-tertiary;
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
  }

  .toggle-btn.active {
    background: rgba(16, 185, 129, 0.1);
    border-color: $success;
    color: $success;
  }

  .remove-btn:hover {
    border-color: $error;
    color: $error;
    background: rgba(220, 38, 38, 0.05);
  }

  // Modal
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: $spacing-xl;
  }

  .modal-container {
    width: 100%;
    max-width: 800px;
    max-height: 80vh;
    background: $bg-primary;
    border-radius: $border-radius-xl;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg $spacing-xl;
    border-bottom: 1px solid $border-color-lighter;

    h2 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: none;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }
  }

  .modal-filter {
    padding: $spacing-md $spacing-xl;
    border-bottom: 1px solid $border-color-lighter;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-md;

    svg {
      width: 16px;
      height: 16px;
      color: $text-tertiary;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: $font-size-sm;
      color: $text-primary;
      outline: none;

      &::placeholder {
        color: $text-tertiary;
      }
    }
  }

  .category-tabs {
    display: flex;
    gap: $spacing-xs;
    flex-wrap: wrap;
  }

  .cat-tab {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid transparent;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
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

  .cat-icon {
    font-size: 14px;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-lg $spacing-xl;
  }

  .loading-state,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-2xl;
    color: $text-tertiary;
    gap: $spacing-sm;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid $border-color-base;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .no-results-icon {
    font-size: 32px;
    opacity: 0.5;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }

  .skill-card {
    position: relative;
    display: flex;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(.already) {
      border-color: $primary-color;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    &.selected {
      border-color: $primary-color;
      background: rgba(59, 130, 246, 0.05);
    }

    &.already {
      opacity: 0.6;
      cursor: default;
    }
  }

  .card-checkbox {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-secondary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-sm;
    transition: all 0.2s ease;

    &.checked {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .card-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border-radius: $border-radius-md;
    background: $bg-secondary;

    &.icon--analytics {
      background: rgba(59, 130, 246, 0.1);
    }

    &.icon--processing {
      background: rgba(16, 185, 129, 0.1);
    }

    &.icon--invoker {
      background: rgba(245, 158, 11, 0.1);
    }

    &.icon--transform {
      background: rgba(139, 92, 246, 0.1);
    }
  }

  .card-content {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-xs;
  }

  .card-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .card-version {
    font-size: $font-size-xs;
    color: $text-tertiary;
    padding: 1px 6px;
    background: $bg-secondary;
    border-radius: 4px;
  }

  .card-desc {
    font-size: $font-size-xs;
    color: $text-secondary;
    margin: 0 0 $spacing-sm 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-tags {
    display: flex;
    gap: $spacing-xs;
    flex-wrap: wrap;

    .tag {
      padding: 2px 8px;
      background: $bg-secondary;
      border-radius: 4px;
      font-size: $font-size-xs;
      color: $text-tertiary;
    }
  }

  .already-badge {
    position: absolute;
    bottom: $spacing-sm;
    right: $spacing-sm;
    padding: 2px 8px;
    background: rgba(16, 185, 129, 0.1);
    color: $success;
    font-size: $font-size-xs;
    border-radius: 4px;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-xl;
    border-top: 1px solid $border-color-lighter;
    background: $bg-secondary;
  }

  .selection-count {
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  .footer-actions {
    display: flex;
    gap: $spacing-sm;
  }

  .cancel-btn {
    padding: $spacing-sm $spacing-lg;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $text-tertiary;
      color: $text-primary;
    }
  }

  .confirm-btn {
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: #2563eb;
    }
  }

  // Transitions
  .skill-list-enter-active,
  .skill-list-leave-active {
    transition: all 0.2s ease;
  }

  .skill-list-enter-from,
  .skill-list-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.25s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;

    .modal-container {
      transform: scale(0.95) translateY(20px);
    }
  }

  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container {
    transition: all 0.25s ease;
  }
</style>
