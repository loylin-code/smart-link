import { defineStore } from 'pinia'
import type { Message, Conversation } from '@/types'

interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
  loading: boolean
}

export const useConversationStore = defineStore('conversation', {
  state: (): ConversationState => ({
    conversations: [],
    activeConversationId: null,
    loading: false
  }),

  getters: {
    activeConversation: (state): Conversation | undefined => {
      return state.conversations.find(c => c.id === state.activeConversationId)
    },

    conversationList: (state): Conversation[] => {
      return state.conversations
    },

    isLoading: (state): boolean => {
      return state.loading
    }
  },

  actions: {
    createConversation(title: string = '新对话') {
      const conversation: Conversation = {
        id: Date.now().toString(),
        title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.conversations.unshift(conversation)
      this.activeConversationId = conversation.id
      return conversation
    },

    deleteConversation(id: string) {
      const index = this.conversations.findIndex(c => c.id === id)
      if (index > -1) {
        this.conversations.splice(index, 1)
        if (this.activeConversationId === id) {
          this.activeConversationId = this.conversations[0]?.id || null
        }
      }
    },

    addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) {
      const conversation = this.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.messages.push({
          ...message,
          id: Date.now().toString(),
          timestamp: Date.now()
        })
        conversation.updatedAt = Date.now()
      }
    },

    setActiveConversation(id: string | null) {
      this.activeConversationId = id
    },

    updateConversationTitle(id: string, title: string) {
      const conversation = this.conversations.find(c => c.id === id)
      if (conversation) {
        conversation.title = title
        conversation.updatedAt = Date.now()
      }
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    clearConversations() {
      this.conversations = []
      this.activeConversationId = null
    }
  },

  persist: {
    key: 'smart-link-conversations',
    paths: ['conversations', 'activeConversationId']
  }
})
