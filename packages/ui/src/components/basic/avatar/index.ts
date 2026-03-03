import SlAvatar from './src/avatar.vue'
import type { App } from 'vue'

SlAvatar.install = (app: App) => {
  app.component('SlAvatar', SlAvatar)
}

export default SlAvatar
