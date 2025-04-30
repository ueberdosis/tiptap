/* eslint-disable @typescript-eslint/no-empty-object-type */

export * from './background-color/index.js'
export * from './color/index.js'
export * from './font-family/index.js'
export * from './font-size/index.js'
export * from './line-height/index.js'
export * from './text-style/index.js'
export * from './text-style-kit/index.js'

/**
 * The available text style attributes.
 */
export interface TextStyleAttributes extends Record<string, any> {}
