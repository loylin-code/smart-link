import SlRow from './src/row.vue'
import type { App } from 'vue'

SlRow.install = (app: App) => {
  app.component('SlRow', SlRow)
}

export default SlRow
