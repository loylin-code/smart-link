export interface ComponentMeta {
  type: string
  name: string
  category: 'basic' | 'form' | 'layout' | 'data' | 'business'
  description: string
  icon: string
  props: PropMeta[]
  events: EventMeta[]
  slots: SlotMeta[]
}

export interface PropMeta {
  name: string
  type: string
  default?: any
  required?: boolean
  description: string
  options?: string[]
}

export interface EventMeta {
  name: string
  params: string
  description: string
}

export interface SlotMeta {
  name: string
  description: string
}

export interface ExampleMeta {
  title: string
  description?: string
  code: string
}

export interface ComponentMeta {
  type: string
  name: string
  category: 'basic' | 'form' | 'layout' | 'data' | 'business'
  description: string
  icon: string
  props: PropMeta[]
  events: EventMeta[]
  slots: SlotMeta[]
  examples?: ExampleMeta[]
}
