import type { Window as HappyDOMWindow } from 'happy-dom-without-node'

import { preserveAndRestoreNodeInternals } from './preserveAndRestoreNodeInternals.js'

export function createSafeWindow() {
  return preserveAndRestoreNodeInternals(() => {
    const { Window } = require('happy-dom-without-node')
    return new Window() as HappyDOMWindow
  })
}
