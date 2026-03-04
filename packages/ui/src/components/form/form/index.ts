import SlForm from './form.vue'
import type { App } from 'vue'

SlForm.install = (app: App) => {
  app.component('SlForm', SlForm)
}

export default SlForm
