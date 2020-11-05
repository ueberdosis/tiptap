import { createExtension } from '@tiptap/core'
import {
  emDash,
  ellipsis,
  openDoubleQuote,
  closeDoubleQuote,
  openSingleQuote,
  closeSingleQuote,
  InputRule,
} from 'prosemirror-inputrules'

export const leftwardsArrow = new InputRule(/<-$/, '←')
export const rightwardsArrow = new InputRule(/->$/, '→')

const Typography = createExtension({
  addInputRules() {
    return [
      emDash,
      ellipsis,
      openDoubleQuote,
      closeDoubleQuote,
      openSingleQuote,
      closeSingleQuote,
      leftwardsArrow,
      rightwardsArrow,
    ]
  },
})

export default Typography

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Typography: typeof Typography,
  }
}
