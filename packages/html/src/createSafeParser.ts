import type { DOMParser as HappyDOMParser, Window as HappyDOMWindow } from 'happy-dom-without-node'

import { preserveAndRestoreNodeInternals } from './preserveAndRestoreNodeInternals.js'

export function createSafeParser(window: HappyDOMWindow) {
  return preserveAndRestoreNodeInternals(() => {
    const { DOMParser } = require('happy-dom-without-node')
    return new DOMParser(window) as HappyDOMParser
  })
}
