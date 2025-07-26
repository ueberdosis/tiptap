import { Mathematics } from './mathematics.js'

export * from './extensions/index.js'
export * from './mathematics.js'
export * from './types.js'
export * from './utils.js'

// Export WebKit-compatible regex patterns for external use
export { blockMathInputRegex } from './block-math.js'
export { inlineMathInputRegex } from './inline-math.js'

export default Mathematics
