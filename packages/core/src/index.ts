export interface Schema {
  type: string
  props?: Record<string, any>
  children?: Schema[]
}

export const version = '1.0.0'

export { default as createRenderer } from './renderer'
