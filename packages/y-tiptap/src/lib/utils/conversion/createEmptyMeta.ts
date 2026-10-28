import type { BindingMetadata } from '../../../types/BindingMetadata.js'

export const createEmptyMeta = (): BindingMetadata => ({
  mapping: new Map(),
  isOMark: new Map(),
})
