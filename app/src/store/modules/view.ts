import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InteractionView } from '@/types'

export const useViewStore = defineStore('view', () => {
  // State
  const views = ref<Map<string, InteractionView>>(new Map())

  // Getters
  const allViews = computed(() => Array.from(views.value.values()))

  // Actions
  function getView(id: string): InteractionView | undefined {
    return views.value.get(id)
  }

  function setView(view: InteractionView) {
    views.value.set(view.id, { ...view, updatedAt: Date.now() })
  }

  function updateViewSchema(id: string, schema: Record<string, unknown>) {
    const view = views.value.get(id)
    if (view) {
      view.schema = schema
      view.updatedAt = Date.now()
    }
  }

  function deleteView(id: string) {
    views.value.delete(id)
  }

  function setViews(newViews: InteractionView[]) {
    views.value.clear()
    newViews.forEach((view) => {
      views.value.set(view.id, view)
    })
  }

  function getViewsAsArray(): InteractionView[] {
    return Array.from(views.value.values())
  }

  return {
    views,
    allViews,
    getView,
    setView,
    updateViewSchema,
    deleteView,
    setViews,
    getViewsAsArray
  }
})
