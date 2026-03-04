import SlCol from './col.vue'
import type { App } from 'vue'

SlCol.install = (app: App) => {
  app.component('SlCol', SlCol)
}

export default SlCol
