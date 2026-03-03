import SlCheckbox from './src/checkbox.vue'
import type { App } from 'vue'

SlCheckbox.install = (app: App) => {
  app.component('SlCheckbox', SlCheckbox)
}

export default SlCheckbox
