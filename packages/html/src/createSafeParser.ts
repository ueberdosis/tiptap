import type { DOMParser as HappyDOMParser, Window as HappyDOMWindow } from 'happy-dom-without-node'

import { preserveAndRestoreNodeInternals } from './preserveAndRestoreNodeInternals.js'

/**
 * Creates a safe DOMParser instance by wrapping `happy-dom`'s `DOMParser`.
 * This function ensures that the original `process` is preserved by using
 * `preserveAndRestoreNodeInternals`.
 *
 * @param {HappyDOMWindow} window - The `happy-dom` window object to use for the parser.
 * @returns {HappyDOMParser} A new instance of `happy-dom`'s `DOMParser`.
 */
export function createSafeParser(window: HappyDOMWindow) {
  return preserveAndRestoreNodeInternals(() => {
    const { DOMParser } = require('happy-dom-without-node')
    return new DOMParser(window) as HappyDOMParser
  })
}
