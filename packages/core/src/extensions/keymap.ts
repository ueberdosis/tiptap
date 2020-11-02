import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { undoInputRule } from 'prosemirror-inputrules'
import { createExtension } from '../Extension'

export const Keymap = createExtension({
  addProseMirrorPlugins() {
    return [
      keymap({ Backspace: undoInputRule }),
      keymap(baseKeymap),
    ]
  },
})

declare module '../Editor' {
  interface AllExtensions {
    Keymap: typeof Keymap,
  }
}
