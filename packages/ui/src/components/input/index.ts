import SlInput from './src/input.vue'
import type { App } from 'vue'

SlInput.install = (app: App) => {
  app.component(SlInput.name || 'SlInput', SlInput)
}

export default SlInput
