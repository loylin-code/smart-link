import { defineStore } from 'pinia'
import type { Message, Conversation } from '@/types'

interface ExploreState {
  explores: Conversation[]
  activeExploreId: string | null
  loading: boolean
}

export const useExploreStore = defineStore('explore', {
  state: (): ExploreState => ({
    explores: [],
    activeExploreId: null,
    loading: false
  }),

  getters: {
    activeExplore: (state): Conversation | undefined => {
      return state.explores.find((c) => c.id === state.activeExploreId)
    },

    exploreList: (state): Conversation[] => {
      return state.explores
    },

    isLoading: (state): boolean => {
      return state.loading
    }
  },

  actions: {
    createExplore(title: string = '新对话') {
      const explore: Conversation = {
        id: Date.now().toString(),
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.explores.unshift(explore)
      this.activeExploreId = explore.id
      return explore
    },

    deleteExplore(id: string) {
      const index = this.explores.findIndex((c) => c.id === id)
      if (index > -1) {
        this.explores.splice(index, 1)
        if (this.activeExploreId === id) {
          this.activeExploreId = this.explores[0]?.id || null
        }
      }
    },

    addMessage(exploreId: string, message: Omit<Message, 'id' | 'timestamp'>) {
      const explore = this.explores.find((c) => c.id === exploreId)
      if (explore) {
        explore.messages.push({
          ...message,
          id: Date.now().toString(),
          timestamp: Date.now()
        })
        explore.updatedAt = Date.now()
      }
    },

    setActiveExplore(id: string | null) {
      this.activeExploreId = id
    },

    updateExploreTitle(id: string, title: string) {
      const explore = this.explores.find((c) => c.id === id)
      if (explore) {
        explore.title = title
        explore.updatedAt = Date.now()
      }
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    clearExplores() {
      this.explores = []
      this.activeExploreId = null
    }
  },

  persist: {
    key: 'smart-link-explores',
    paths: ['explores', 'activeExploreId']
  }
})
