import SlModal from './src/modal.vue'
import type { App } from 'vue'

SlModal.install = (app: App) => {
  app.component('SlModal', SlModal)
}

export default SlModal
