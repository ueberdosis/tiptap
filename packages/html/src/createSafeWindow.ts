import type { Window as HappyDOMWindow } from 'happy-dom-without-node'

import { preserveAndRestoreNodeInternals } from './preserveAndRestoreNodeInternals.js'

/**
 * Creates a new `Window` instance using `happy-dom` and ensures that the original
 * `process` object is restored after the operation. This function wraps the
 * creation of the `Window` object to provide a safe environment for DOM manipulation.
 *
 * @returns {HappyDOMWindow} A new `Window` instance from `happy-dom`.
 */
export function createSafeWindow() {
  return preserveAndRestoreNodeInternals(() => {
    const { Window } = require('happy-dom-without-node')
    return new Window() as HappyDOMWindow
  })
}
