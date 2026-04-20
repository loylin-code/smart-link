import { defineStore } from 'pinia'

interface AppState {
  sidebar: {
    collapsed: boolean
  }
  console: {
    visible: boolean
    height: number
    activeTab: string
  }
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebar: {
      collapsed: false
    },
    console: {
      visible: true,
      height: 200,
      activeTab: 'console'
    }
  }),

  getters: {
    isSidebarCollapsed: (state) => state.sidebar.collapsed,
    isConsoleVisible: (state) => state.console.visible,
    consoleHeight: (state) => state.console.height,
    consoleActiveTab: (state) => state.console.activeTab
  },

  actions: {
    toggleSidebar() {
      this.sidebar.collapsed = !this.sidebar.collapsed
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.sidebar.collapsed = collapsed
    },

    toggleConsole() {
      this.console.visible = !this.console.visible
    },

    setConsoleVisible(visible: boolean) {
      this.console.visible = visible
    },

    setConsoleHeight(height: number) {
      this.console.height = height
    },

    setConsoleTab(tab: string) {
      this.console.activeTab = tab
    }
  },

  persist: {
    key: 'smart-link-app',
    paths: ['sidebar.collapsed', 'console.visible', 'console.height']
  }
})
