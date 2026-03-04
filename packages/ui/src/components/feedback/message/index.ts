import SlMessage from './message.vue'
import type { App } from 'vue'

SlMessage.install = (app: App) => {
  app.component('SlMessage', SlMessage)
}

export default SlMessage
