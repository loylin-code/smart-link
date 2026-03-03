import SlRadio from './src/radio.vue'
import type { App } from 'vue'

SlRadio.install = (app: App) => {
  app.component('SlRadio', SlRadio)
}

export default SlRadio
