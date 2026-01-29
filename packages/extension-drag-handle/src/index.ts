import { DragHandle } from './drag-handle.js'

export * from './drag-handle.js'
export * from './drag-handle-plugin.js'
export { defaultRules } from './helpers/defaultRules.js'
export { normalizeNestedOptions } from './helpers/normalizeOptions.js'
export type {
  EdgeDetectionConfig,
  EdgeDetectionPreset,
  NestedOptions,
  NormalizedNestedOptions,
} from './types/options.js'
export type { DragHandleRule, RuleContext } from './types/rules.js'

export default DragHandle
