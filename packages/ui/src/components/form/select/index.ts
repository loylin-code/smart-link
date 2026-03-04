import SlSelect from './select.vue'
import type { App } from 'vue'

SlSelect.install = (app: App) => {
  app.component('SlSelect', SlSelect)
}

export default SlSelect
