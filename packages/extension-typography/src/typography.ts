import { Extension, textInputRule } from '@tiptap/core'

export const emDash = textInputRule({
  matcher: /--$/,
  text: '—',
})

export const ellipsis = textInputRule({
  matcher: /\.\.\.$/,
  text: '…',
})

export const openDoubleQuote = textInputRule({
  matcher: /(?:^|[\s{[(<'"\u2018\u201C])(")$/,
  text: '“',
})

export const closeDoubleQuote = textInputRule({
  matcher: /"$/,
  text: '”',
})

export const openSingleQuote = textInputRule({
  matcher: /(?:^|[\s{[(<'"\u2018\u201C])(')$/,
  text: '‘',
})

export const closeSingleQuote = textInputRule({
  matcher: /'$/,
  text: '’',
})

export const leftArrow = textInputRule({
  matcher: /<-$/,
  text: '←',
})

export const rightArrow = textInputRule({
  matcher: /->$/,
  text: '→',
})

export const copyright = textInputRule({
  matcher: /\(c\)$/,
  text: '©',
})

export const trademark = textInputRule({
  matcher: /\(tm\)$/,
  text: '™',
})

export const registeredTrademark = textInputRule({
  matcher: /\(r\)$/,
  text: '®',
})

export const oneHalf = textInputRule({
  matcher: /1\/2$/,
  text: '½',
})

export const plusMinus = textInputRule({
  matcher: /\+\/-$/,
  text: '±',
})

export const notEqual = textInputRule({
  matcher: /!=$/,
  text: '≠',
})

export const laquo = textInputRule({
  matcher: /<<$/,
  text: '«',
})

export const raquo = textInputRule({
  matcher: />>$/,
  text: '»',
})

export const multiplication = textInputRule({
  matcher: /\d+\s?([*x])\s?\d+$/,
  text: '×',
})

export const superscriptTwo = textInputRule({
  matcher: /\^2$/,
  text: '²',
})

export const superscriptThree = textInputRule({
  matcher: /\^3$/,
  text: '³',
})

export const oneQuarter = textInputRule({
  matcher: /1\/4$/,
  text: '¼',
})

export const threeQuarters = textInputRule({
  matcher: /3\/4$/,
  text: '¾',
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
