<template>
  <div class="view-selector">
    <!-- Empty State -->
    <Transition name="fade-scale" mode="out-in">
      <div v-if="filteredViews.length === 0" key="empty" class="empty-state">
        <div class="empty-icon-wrapper">
          <span class="empty-icon">{{
            activeFilter === 'all' ? '🎨' : getFilterIcon(activeFilter)
          }}</span>
        </div>
        <h3>{{ emptyStateTitle }}</h3>
        <p>{{ emptyStateDesc }}</p>
        <button class="add-view-btn" @click="openCreateDialog">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          {{ t('agent.design.view.addView') }}
        </button>
      </div>

      <!-- Views Content -->
      <div v-else key="content" class="views-content">
        <!-- Filter Tabs -->
        <div class="filter-section">
          <div class="filter-tabs">
            <button
              v-for="filter in viewFilters"
              :key="filter.value"
              class="filter-tab"
              :class="{ active: activeFilter === filter.value }"
              @click="setFilter(filter.value)"
            >
              <span class="filter-icon">{{ filter.icon }}</span>
              <span class="filter-label">{{ filter.label }}</span>
              <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
            </button>
          </div>
        </div>

        <div class="content-header">
          <h3>{{ t('agent.design.view.created') }}</h3>
          <span class="count-badge">{{ filteredViews.length }}</span>
          <button class="add-more-btn" @click="openCreateDialog">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ t('agent.design.view.addView') }}
          </button>
        </div>

        <TransitionGroup
          name="view-list"
          tag="div"
          class="views-grid"
          @before-leave="onBeforeLeave"
        >
          <div
            v-for="(view, index) in filteredViews"
            :key="view.id"
            class="view-card"
            :class="{ 'is-deleting': deletingId === view.id }"
            :style="getCardStyle(index)"
            @click="editView(view)"
            @keydown.enter="editView(view)"
            @keydown.delete="deleteView(view)"
            tabindex="0"
          >
            <div class="card-thumbnail">
              <div class="thumbnail-gradient" :class="`type--${view.type}`">
                <div class="gradient-overlay"></div>
                <span class="type-icon-large">{{ getViewTypeIcon(view.type) }}</span>
              </div>
              <div v-if="getElementsCount(view) > 0" class="elements-count">
                <svg viewBox="0 0 24 24" fill="none" class="count-icon">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{{ getElementsCount(view) }}</span>
              </div>
              <div v-else class="elements-count empty">
                <span>{{ t('agent.design.view.emptyComponents') }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="card-header">
                <span class="view-name">{{ view.name }}</span>
                <span class="view-type-tag" :class="`tag--${view.type}`">{{
                  getViewTypeLabel(view.type)
                }}</span>
              </div>
              <p class="view-desc">
                {{ view.description || t('agent.design.view.noDescription') }}
              </p>
              <div class="card-meta">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" class="meta-icon">
                    <path
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  {{ formatDate(view.updatedAt) }}
                </span>
              </div>
            </div>
            <div class="card-actions" @click.stop>
              <button class="action-btn edit" @click="editView(view)" :title="t('common.edit')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <span>{{ t('common.edit') }}</span>
              </button>
              <button
                class="action-btn delete"
                @click="deleteView(view)"
                :title="t('common.delete')"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{{ t('common.delete') }}</span>
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Transition>

    <!-- Create View Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateDialog" class="modal-overlay" @click.self="closeCreateDialog">
          <div
            class="modal-container create-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div class="modal-header">
              <div class="header-content">
                <h2 id="dialog-title">{{ t('agent.design.view.createTitle') }}</h2>
                <p class="header-subtitle">{{ t('agent.design.view.createDesc') }}</p>
              </div>
              <button class="close-btn" @click="closeCreateDialog" aria-label="Close">
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

            <div class="modal-body">
              <div class="create-form">
                <!-- 左侧：视图类型选择 -->
                <div class="form-section types-section">
                  <div class="section-title">
                    <span class="section-icon">🎨</span>
                    <span>{{ t('agent.design.view.selectType') }}</span>
                  </div>
                  <div class="type-grid">
                    <button
                      v-for="type in viewTypeCards"
                      :key="type.value"
                      class="type-option"
                      :class="{ active: newView.type === type.value }"
                      @click="newView.type = type.value"
                    >
                      <div class="type-preview" :class="`preview--${type.value}`">
                        <span class="preview-icon">{{ type.icon }}</span>
                      </div>
                      <div class="type-info">
                        <span class="type-name">{{ type.label }}</span>
                        <span class="type-desc">{{ type.shortDesc }}</span>
                      </div>
                      <div v-if="newView.type === type.value" class="type-check">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 13l4 4L19 7"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- 右侧：基本信息 -->
                <div class="form-section info-section">
                  <div class="section-title">
                    <span class="section-icon">📝</span>
                    <span>{{ t('agent.design.view.basicInfo') }}</span>
                  </div>

                  <div class="form-fields">
                    <div class="field-group">
                      <label class="field-label">{{ t('agent.design.view.viewName') }}</label>
                      <div class="field-input-wrapper">
                        <input
                          ref="nameInputRef"
                          v-model="newView.name"
                          type="text"
                          class="field-input"
                          :placeholder="t('agent.design.view.viewNamePlaceholder')"
                          @keydown.enter="createView"
                        />
                      </div>
                    </div>

                    <div class="field-group">
                      <label class="field-label">{{
                        t('agent.design.view.viewDescription')
                      }}</label>
                      <div class="field-input-wrapper">
                        <textarea
                          v-model="newView.description"
                          class="field-textarea"
                          :placeholder="t('agent.design.view.viewDescPlaceholder')"
                          rows="3"
                        />
                      </div>
                    </div>

                    <!-- 预览卡片 -->
                    <div class="preview-card">
                      <div class="preview-header">
                        <span class="preview-label">{{ t('agent.design.view.preview') }}</span>
                      </div>
                      <div class="preview-content">
                        <div class="mini-card" :class="`mini--${newView.type}`">
                          <div class="mini-thumb">
                            <span>{{ getViewTypeIcon(newView.type) }}</span>
                          </div>
                          <div class="mini-body">
                            <span class="mini-name">{{
                              newView.name || t('agent.design.view.unnamed')
                            }}</span>
                            <span class="mini-type">{{ getViewTypeLabel(newView.type) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="cancel-btn" @click="closeCreateDialog">
                {{ t('common.cancel') }}
              </button>
              <button class="confirm-btn" :disabled="!newView.name.trim()" @click="createView">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                {{ t('agent.design.view.createAndDesign') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, onMounted, computed, nextTick } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useViewStore } from '@/store/modules/view'
  import type { InteractionView } from '@/types'

  interface Props {
    modelValue?: InteractionView[]
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => []
  })

  const emit = defineEmits<{
    'update:modelValue': [views: InteractionView[]]
  }>()

  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()
  const viewStore = useViewStore()

  // Get agentId from route params
  const agentId = computed(() => route.params.id as string)

  // State
  const views = ref<InteractionView[]>([...props.modelValue])
  const showCreateDialog = ref(false)
  const deletingId = ref<string | null>(null)
  const activeFilter = ref<InteractionView['type'] | 'all'>('all')
  const nameInputRef = ref<HTMLInputElement | null>(null)

  const newView = reactive({
    name: '',
    description: '',
    type: 'dashboard' as InteractionView['type']
  })

  // View type definitions with enhanced metadata
  const viewTypeCards = [
    {
      value: 'dashboard' as InteractionView['type'],
      icon: '📊',
      label: t('agent.design.view.types.dashboard'),
      shortDesc: t('agent.design.view.shortDesc.dashboard'),
      description: t('agent.design.view.typeDesc.dashboard'),
      color: '#3b82f6'
    },
    {
      value: 'chart' as InteractionView['type'],
      icon: '📈',
      label: t('agent.design.view.types.chart'),
      shortDesc: t('agent.design.view.shortDesc.chart'),
      description: t('agent.design.view.typeDesc.chart'),
      color: '#10b981'
    },
    {
      value: 'table' as InteractionView['type'],
      icon: '📋',
      label: t('agent.design.view.types.table'),
      shortDesc: t('agent.design.view.shortDesc.table'),
      description: t('agent.design.view.typeDesc.table'),
      color: '#f59e0b'
    },
    {
      value: 'form' as InteractionView['type'],
      icon: '📝',
      label: t('agent.design.view.types.form'),
      shortDesc: t('agent.design.view.shortDesc.form'),
      description: t('agent.design.view.typeDesc.form'),
      color: '#ec4899'
    },
    {
      value: 'custom' as InteractionView['type'],
      icon: '🎨',
      label: t('agent.design.view.types.custom'),
      shortDesc: t('agent.design.view.shortDesc.custom'),
      description: t('agent.design.view.typeDesc.custom'),
      color: '#a855f7'
    }
  ]

  // Computed: Filtered views
  const filteredViews = computed(() => {
    if (activeFilter.value === 'all') return views.value
    return views.value.filter((v) => v.type === activeFilter.value)
  })

  // Computed: View filters with counts
  const viewFilters = computed(() => {
    const allCount = views.value.length
    const filters: Array<{
      value: 'all' | InteractionView['type']
      icon: string
      label: string
      count: number
    }> = [
      {
        value: 'all',
        icon: '⊞',
        label: t('agent.design.view.filters.all'),
        count: allCount
      }
    ]
    viewTypeCards.forEach((type) => {
      const count = views.value.filter((v) => v.type === type.value).length
      filters.push({
        value: type.value,
        icon: type.icon,
        label: type.label,
        count
      })
    })
    return filters
  })

  // Computed: Empty state content
  const emptyStateTitle = computed(() => {
    if (activeFilter.value === 'all') return t('agent.design.view.emptyTitle')
    return t('agent.design.view.emptyFilterTitle', { type: getViewTypeLabel(activeFilter.value) })
  })

  const emptyStateDesc = computed(() => {
    if (activeFilter.value === 'all') return t('agent.design.view.emptyDesc')
    return t('agent.design.view.emptyFilterDesc', { type: getViewTypeLabel(activeFilter.value) })
  })

  // Methods
  function getViewTypeIcon(type: InteractionView['type']): string {
    const typeInfo = viewTypeCards.find((t) => t.value === type)
    return typeInfo?.icon || '🎨'
  }

  function getViewTypeLabel(type: InteractionView['type'] | 'all'): string {
    if (type === 'all') return t('agent.design.view.filters.all')
    const typeInfo = viewTypeCards.find((t) => t.value === type)
    return typeInfo?.label || type
  }

  function getFilterIcon(filter: InteractionView['type'] | 'all'): string {
    if (filter === 'all') return '⊞'
    return getViewTypeIcon(filter as InteractionView['type'])
  }

  function setFilter(filter: InteractionView['type'] | 'all') {
    activeFilter.value = filter
  }

  function openCreateDialog() {
    showCreateDialog.value = true
    newView.name = ''
    newView.description = ''
    newView.type = 'dashboard'
    nextTick(() => {
      nameInputRef.value?.focus()
    })
  }

  function closeCreateDialog() {
    showCreateDialog.value = false
    newView.name = ''
    newView.description = ''
    newView.type = 'dashboard'
  }

  function createView() {
    if (!newView.name.trim()) return

    // Create default schema for the view
    const defaultSchema = viewStore.createDefaultSchema(newView.type)

    const view: InteractionView = {
      id: `view-${Date.now()}`,
      name: newView.name.trim(),
      description: newView.description.trim(),
      type: newView.type,
      schema: defaultSchema as unknown as Record<string, unknown>,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    views.value.push(view)
    viewStore.setView(view)
    emitUpdate()
    closeCreateDialog()

    router.push({
      path: `/app/agent/view/${agentId.value}/${view.id}`
    })
  }

  function editView(view: InteractionView) {
    router.push({
      path: `/app/agent/view/${agentId.value}/${view.id}`
    })
  }

  function deleteView(view: InteractionView) {
    deletingId.value = view.id
    setTimeout(() => {
      const index = views.value.findIndex((v) => v.id === view.id)
      if (index > -1) {
        views.value.splice(index, 1)
        viewStore.deleteView(view.id)
        emitUpdate()
      }
      deletingId.value = null
    }, 300)
  }

  function onBeforeLeave(el: Element) {
    const htmlEl = el as HTMLElement
    htmlEl.style.position = 'absolute'
    htmlEl.style.width = htmlEl.offsetWidth + 'px'
  }

  function getElementsCount(view: InteractionView): number {
    if (view.schema && Array.isArray((view.schema as { elements?: unknown[] }).elements)) {
      return (view.schema as { elements: unknown[] }).elements.length
    }
    return 0
  }

  function getCardStyle(index: number) {
    return {
      animationDelay: `${index * 50}ms`
    }
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        if (minutes === 0) return t('common.justNow')
        return t('common.minutesAgo', { count: minutes })
      }
      return t('common.hoursAgo', { count: hours })
    }
    if (days === 1) return t('common.yesterday')
    if (days < 7) return t('common.daysAgo', { count: days })

    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  function emitUpdate() {
    emit('update:modelValue', [...views.value])
  }

  function syncFromStore() {
    const storeViews = viewStore.getViewsAsArray()
    if (storeViews.length > 0) {
      views.value = storeViews.map((v) => ({ ...v }))
      emitUpdate()
    }
  }

  // Watch props
  watch(
    () => props.modelValue,
    (newValue) => {
      views.value = [...newValue]
      if (newValue.length > 0) {
        viewStore.setViews(newValue)
      }
    },
    { deep: true }
  )

  // Initialize
  onMounted(() => {
    if (props.modelValue.length > 0) {
      viewStore.setViews(props.modelValue)
    }
    syncFromStore()
  })
</script>

<style scoped lang="scss">
  .view-selector {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  // Filter Section
  .filter-section {
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $border-color-lighter;
    background: $bg-primary;
  }

  .filter-tabs {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  .filter-tab {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-xs $spacing-md;
    background: $bg-secondary;
    border: 1px solid transparent;
    border-radius: $border-radius-full;
    color: $text-secondary;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all 0.2s ease;

    .filter-icon {
      font-size: 14px;
    }

    .filter-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: rgba($text-secondary, 0.15);
      color: $text-secondary;
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      border-radius: $border-radius-full;
    }

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba($primary-color, 0.1);
      border-color: $primary-color;
      color: $primary-color;

      .filter-count {
        background: $primary-color;
        color: #fff;
      }
    }
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
      width: 96px;
      height: 96px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(
        135deg,
        rgba($primary-color, 0.1) 0%,
        rgba($secondary-color, 0.1) 100%
      );
      border-radius: 50%;
      margin-bottom: $spacing-xl;
      animation: float 3s ease-in-out infinite;
    }

    .empty-icon {
      font-size: 48px;
      opacity: 0.9;
    }

    h3 {
      font-size: $font-size-xl;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0 0 $spacing-sm 0;
    }

    p {
      font-size: $font-size-sm;
      color: $text-tertiary;
      margin: 0 0 $spacing-xl 0;
      max-width: 360px;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .add-view-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-xl;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    border: none;
    border-radius: $border-radius-lg;
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba($primary-color, 0.3);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba($primary-color, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }

  // Views Content
  .views-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .content-header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg $spacing-xl $spacing-md;

    h3 {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      margin: 0;
    }
  }

  .count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    color: #fff;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
    border-radius: 12px;
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
      background: rgba($primary-color, 0.1);
    }
  }

  .views-grid {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: $spacing-lg;
    padding: $spacing-md $spacing-xl $spacing-xl;
    align-content: start;
    position: relative;
  }

  .view-card {
    display: flex;
    flex-direction: column;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-xl;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: card-enter 0.4s ease backwards;
    outline: none;

    &:hover,
    &:focus {
      transform: translateY(-4px);
      border-color: $primary-color;
      box-shadow: 0 8px 24px rgba($primary-color, 0.15);

      .card-actions {
        opacity: 1;
        transform: translateY(0);
      }

      .thumbnail-gradient .gradient-overlay {
        opacity: 0.3;
      }
    }

    &:focus-visible {
      outline: 2px solid $primary-color;
      outline-offset: 2px;
    }

    &.is-deleting {
      animation: card-delete 0.3s ease forwards;
    }
  }

  @keyframes card-enter {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes card-delete {
    to {
      opacity: 0;
      transform: scale(0.9);
      margin-bottom: -100%;
    }
  }

  .card-thumbnail {
    height: 140px;
    position: relative;
    overflow: hidden;
  }

  .thumbnail-gradient {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    &.type--dashboard {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    }

    &.type--chart {
      background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    }

    &.type--table {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    }

    &.type--form {
      background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
    }

    &.type--custom {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
    }

    .type-icon-large {
      font-size: 48px;
      z-index: 1;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }
  }

  .elements-count {
    position: absolute;
    bottom: $spacing-sm;
    right: $spacing-sm;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.95);
    color: $text-primary;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    border-radius: $border-radius-full;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 2;

    .count-icon {
      width: 12px;
      height: 12px;
    }

    &.empty {
      background: rgba(255, 255, 255, 0.7);
      color: $text-tertiary;
    }
  }

  .card-body {
    padding: $spacing-md;
    flex: 1;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;
    margin-bottom: $spacing-xs;
  }

  .view-name {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .view-type-tag {
    font-size: $font-size-xs;
    padding: 3px 10px;
    border-radius: $border-radius-full;
    flex-shrink: 0;
    font-weight: $font-weight-medium;

    &.tag--dashboard {
      background: rgba(#3b82f6, 0.1);
      color: #3b82f6;
    }

    &.tag--chart {
      background: rgba(#10b981, 0.1);
      color: #10b981;
    }

    &.tag--table {
      background: rgba(#f59e0b, 0.1);
      color: #f59e0b;
    }

    &.tag--form {
      background: rgba(#ec4899, 0.1);
      color: #ec4899;
    }

    &.tag--custom {
      background: rgba(#a855f7, 0.1);
      color: #a855f7;
    }
  }

  .view-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin: 0 0 $spacing-sm 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-xs;
    color: $text-tertiary;

    .meta-icon {
      width: 12px;
      height: 12px;
    }
  }

  .card-actions {
    display: flex;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    border-top: 1px solid $border-color-lighter;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    background: $bg-secondary;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: $spacing-xs $spacing-sm;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      border-color: $primary-color;
      color: $primary-color;
      background: rgba($primary-color, 0.05);
    }

    &.delete:hover {
      border-color: $error;
      color: $error;
      background: rgba($error, 0.05);
    }
  }

  // Modal
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: $spacing-xl;
  }

  .modal-container {
    width: 100%;
    max-width: 880px;
    background: $bg-primary;
    border-radius: $border-radius-xl;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: $spacing-xl;
    border-bottom: 1px solid $border-color-lighter;
    background: linear-gradient(180deg, $bg-secondary 0%, $bg-primary 100%);

    .header-content {
      h2 {
        font-size: $font-size-2xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        margin: 0 0 $spacing-xs 0;
      }

      .header-subtitle {
        font-size: $font-size-sm;
        color: $text-tertiary;
        margin: 0;
      }
    }
  }

  .close-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    color: $text-tertiary;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      background: $bg-tertiary;
      border-color: $text-tertiary;
      color: $text-primary;
    }
  }

  .modal-body {
    padding: 0;
  }

  .create-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 420px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-section {
    padding: $spacing-xl;
    display: flex;
    flex-direction: column;

    &:first-child {
      border-right: 1px solid $border-color-lighter;
      background: $bg-secondary;

      @media (max-width: 768px) {
        border-right: none;
        border-bottom: 1px solid $border-color-lighter;
      }
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;

    .section-icon {
      font-size: 20px;
    }

    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }

  // Type selection grid
  .type-grid {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    flex: 1;
  }

  .type-option {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md $spacing-lg;
    background: $bg-primary;
    border: 2px solid $border-color-base;
    border-radius: $border-radius-lg;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;

    &:hover {
      border-color: $text-tertiary;
      transform: translateX(4px);
    }

    &.active {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1);

      .type-preview {
        transform: scale(1.05);
      }
    }

    .type-preview {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius-md;
      transition: transform 0.2s ease;
      flex-shrink: 0;

      .preview-icon {
        font-size: 24px;
      }

      &.preview--dashboard {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      }

      &.preview--chart {
        background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
      }

      &.preview--table {
        background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      }

      &.preview--form {
        background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
      }

      &.preview--custom {
        background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      }
    }

    .type-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      .type-name {
        font-size: $font-size-base;
        font-weight: $font-weight-medium;
        color: $text-primary;
      }

      .type-desc {
        font-size: $font-size-xs;
        color: $text-tertiary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .type-check {
      width: 24px;
      height: 24px;
      background: $primary-color;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      animation: check-scale 0.2s ease;

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  @keyframes check-scale {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  // Form fields
  .form-fields {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    flex: 1;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .field-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .field-input-wrapper {
    position: relative;
  }

  .field-input,
  .field-textarea {
    width: 100%;
    padding: $spacing-md $spacing-lg;
    background: $bg-secondary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
    color: $text-primary;
    outline: none;
    transition: all 0.2s ease;

    &::placeholder {
      color: $text-tertiary;
    }

    &:focus {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
      background: $bg-primary;
    }
  }

  .field-textarea {
    resize: none;
    min-height: 100px;
    line-height: 1.6;
  }

  // Preview card
  .preview-card {
    margin-top: auto;
    padding: $spacing-lg;
    background: $bg-secondary;
    border-radius: $border-radius-lg;
    border: 1px solid $border-color-lighter;
  }

  .preview-header {
    margin-bottom: $spacing-md;

    .preview-label {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      color: $text-tertiary;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .preview-content {
    display: flex;
    justify-content: center;
  }

  .mini-card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    background: $bg-primary;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-base;
    width: 100%;
    max-width: 240px;

    .mini-thumb {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: $border-radius-sm;
      font-size: 20px;
    }

    .mini-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      .mini-name {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mini-type {
        font-size: $font-size-xs;
        color: $text-tertiary;
      }
    }

    &.mini--dashboard .mini-thumb {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    }

    &.mini--chart .mini-thumb {
      background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    }

    &.mini--table .mini-thumb {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    }

    &.mini--form .mini-thumb {
      background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
    }

    &.mini--custom .mini-thumb {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-lg $spacing-xl;
    border-top: 1px solid $border-color-lighter;
    background: $bg-secondary;
  }

  .cancel-btn {
    padding: $spacing-sm $spacing-xl;
    background: $bg-primary;
    border: 1px solid $border-color-base;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: $text-tertiary;
      color: $text-primary;
    }
  }

  .confirm-btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-xl;
    background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
    border: none;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    svg {
      width: 16px;
      height: 16px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      box-shadow: 0 4px 16px rgba($primary-color, 0.4);
      transform: translateY(-1px);
    }
  }

  // Transitions
  .view-list-enter-active,
  .view-list-leave-active {
    transition: all 0.3s ease;
  }

  .view-list-enter-from,
  .view-list-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }

  .view-list-leave-active {
    position: absolute;
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
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
    transition: all 0.3s ease;
  }

  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: all 0.3s ease;
  }

  .fade-scale-enter-from,
  .fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.98);
  }
</style>
