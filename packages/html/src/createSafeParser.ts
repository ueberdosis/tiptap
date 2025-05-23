import type { DOMParser as HappyDOMParser, Window as HappyDOMWindow } from 'happy-dom-without-node'

export function createSafeParser(window: HappyDOMWindow) {
  // store the original process object
  // see https://github.com/ueberdosis/tiptap/issues/6368
  // eslint-disable-next-line
  const originalProcess = globalThis?.process

  const { DOMParser } = require('happy-dom-without-node')

  // eslint-disable-next-line
  globalThis.process = originalProcess

  return new DOMParser(window) as HappyDOMParser
}
