import SlContainer from './container.vue'
import type { App } from 'vue'

SlContainer.install = (app: App) => {
  app.component('SlContainer', SlContainer)
}

export default SlContainer
