import { baseKeymap } from 'prosemirror-commands'
import { createExtension } from '../Extension'

export const BaseKeymap = createExtension({
  addKeyboardShortcuts() {
    return baseKeymap
  },
})

declare module '../Editor' {
  interface AllExtensions {
    BaseKeymap: typeof BaseKeymap,
  }
}
