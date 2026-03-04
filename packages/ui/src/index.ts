import type { App, Plugin } from 'vue'
import * as components from './components'

export * from './components'
export * from './styles'

export { components }

const install = (app: App): void => {
  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component)
  })
}

export default {
  install,
  version: '1.0.0'
} as Plugin & { version: string }
