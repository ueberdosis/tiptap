import { undoInputRule } from 'prosemirror-inputrules'
import { createExtension } from '../Extension'

export const InputRules = createExtension({
  addKeyboardShortcuts() {
    return {
      Backspace: undoInputRule,
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    InputRules: typeof InputRules,
  }
}
