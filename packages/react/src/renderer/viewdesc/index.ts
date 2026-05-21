/**
 * React-owned view descriptor tree.
 *
 * Parallel copy of ProseMirror's internal `ViewDesc` tree. PM-view
 * still reads it (for hit-testing, selection sync, etc.), but here
 * React owns the DOM and the DOM-mutating methods are no-ops.
 */

export * from './base.js'
export * from './custom-node.js'
export * from './mark.js'
export * from './node.js'
export * from './text.js'
export * from './trailing-hack.js'
export * from './types.js'
export * from './widget.js'
