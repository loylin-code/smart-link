import SlSwitch from './src/switch.vue'
import type { App } from 'vue'

SlSwitch.install = (app: App) => {
  app.component('SlSwitch', SlSwitch)
}

export default SlSwitch
