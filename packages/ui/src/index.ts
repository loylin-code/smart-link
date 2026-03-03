import type { App } from 'vue'
import * as components from './components'

export * from './components'
export * from './styles'

export { components }

const install = (app: App) => {
  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component)
  })
}

export default {
  install,
  version: '1.0.0'
}
