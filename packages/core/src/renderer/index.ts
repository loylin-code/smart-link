import type { Schema } from '../index'

export interface RenderContext {
  state: Record<string, any>
  methods: Record<string, (...args: any[]) => any>
}

export default function createRenderer() {
  const render = (schema: Schema, _context: RenderContext) => {
    return schema
  }

  return { render }
}
