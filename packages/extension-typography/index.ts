import { createExtension } from '@tiptap/core'
import {
  emDash,
  ellipsis,
  openDoubleQuote,
  closeDoubleQuote,
  openSingleQuote,
  closeSingleQuote,
} from 'prosemirror-inputrules'

const Typography = createExtension({
  addInputRules() {
    return [
      emDash,
      ellipsis,
      openDoubleQuote,
      closeDoubleQuote,
      openSingleQuote,
      closeSingleQuote,
    ]
  },
})

export default Typography

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Typography: typeof Typography,
  }
}
