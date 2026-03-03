export interface Identity {
  id: string
  name: string
}

export type Nullable<T> = T | null
export type Optional<T> = T | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export * from './component-meta'
