import type { Window as HappyDOMWindow } from 'happy-dom-without-node'

export function createSafeWindow() {
  // store the original process object
  // see https://github.com/ueberdosis/tiptap/issues/6368
  // eslint-disable-next-line
  const originalProcess = globalThis?.process

  const { Window } = require('happy-dom-without-node')

  // eslint-disable-next-line
  globalThis.process = originalProcess

  return new Window() as HappyDOMWindow
}
