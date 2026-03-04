import SlDivider from './divider.vue'
import type { App } from 'vue'

SlDivider.install = (app: App) => {
  app.component('SlDivider', SlDivider)
}

export default SlDivider
