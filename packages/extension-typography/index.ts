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

export const leftArrow = new InputRule(/<-$/, '←')
export const rightArrow = new InputRule(/->$/, '→')
export const copyright = new InputRule(/\(c\)$/, '©')
export const registeredTrademark = new InputRule(/\(r\)$/, '®')
export const oneHalf = new InputRule(/1\/2$/, '½')
export const plusMinus = new InputRule(/\+\/-$/, '±')
export const notEqual = new InputRule(/!=$/, '≠')
export const laquo = new InputRule(/<<$/, '«')
export const raquo = new InputRule(/>>$/, '»')

const Typography = createExtension({
  addInputRules() {
    return [
      emDash,
      ellipsis,
      openDoubleQuote,
      closeDoubleQuote,
      openSingleQuote,
      closeSingleQuote,
      leftArrow,
      rightArrow,
      copyright,
      registeredTrademark,
      oneHalf,
      plusMinus,
      notEqual,
      laquo,
      raquo,
    ]
  },
})

export default Typography

declare module '@tiptap/core/src/Editor' {
  interface AllExtensions {
    Typography: typeof Typography,
  }
}
