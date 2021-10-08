import { Extension, textInputRule } from '@tiptap/core'

export const emDash = textInputRule({
  find: /--$/,
  replace: '—',
})

export const ellipsis = textInputRule({
  find: /\.\.\.$/,
  replace: '…',
})

export const openDoubleQuote = textInputRule({
  find: /(?:^|[\s{[(<'"\u2018\u201C])(")$/,
  replace: '“',
})

export const closeDoubleQuote = textInputRule({
  find: /"$/,
  replace: '”',
})

export const openSingleQuote = textInputRule({
  find: /(?:^|[\s{[(<'"\u2018\u201C])(')$/,
  replace: '‘',
})

export const closeSingleQuote = textInputRule({
  find: /'$/,
  replace: '’',
})

export const leftArrow = textInputRule({
  find: /<-$/,
  replace: '←',
})

export const rightArrow = textInputRule({
  find: /->$/,
  replace: '→',
})

export const copyright = textInputRule({
  find: /\(c\)$/,
  replace: '©',
})

export const trademark = textInputRule({
  find: /\(tm\)$/,
  replace: '™',
})

export const registeredTrademark = textInputRule({
  find: /\(r\)$/,
  replace: '®',
})

export const oneHalf = textInputRule({
  find: /1\/2$/,
  replace: '½',
})

export const plusMinus = textInputRule({
  find: /\+\/-$/,
  replace: '±',
})

export const notEqual = textInputRule({
  find: /!=$/,
  replace: '≠',
})

export const laquo = textInputRule({
  find: /<<$/,
  replace: '«',
})

export const raquo = textInputRule({
  find: />>$/,
  replace: '»',
})

export const multiplication = textInputRule({
  find: /\d+\s?([*x])\s?\d+$/,
  replace: '×',
})

export const superscriptTwo = textInputRule({
  find: /\^2$/,
  replace: '²',
})

export const superscriptThree = textInputRule({
  find: /\^3$/,
  replace: '³',
})

export const oneQuarter = textInputRule({
  find: /1\/4$/,
  replace: '¼',
})

export const threeQuarters = textInputRule({
  find: /3\/4$/,
  replace: '¾',
})

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
      trademark,
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
