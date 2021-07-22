import { Extension } from '@tiptap/core'
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
export const multiplication = new InputRule(/\d+\s?([*x])\s?\d+$/, '×')
export const superscriptTwo = new InputRule(/\^2$/, '²')
export const superscriptThree = new InputRule(/\^3$/, '³')
export const oneQuarter = new InputRule(/1\/4$/, '¼')
export const threeQuarters = new InputRule(/3\/4$/, '¾')

export const Typography = Extension.create({
  name: 'typography',

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
      multiplication,
      superscriptTwo,
      superscriptThree,
      oneQuarter,
      threeQuarters,
    ]
  },
})
