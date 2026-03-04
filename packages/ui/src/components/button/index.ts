import SlButton from './button.vue'
import type { App } from 'vue'

SlButton.install = (app: App) => {
  app.component(SlButton.name || 'SlButton', SlButton)
}

export default SlButton
