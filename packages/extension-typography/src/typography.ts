import { Extension, textInputRule } from '@tiptap/core'

export interface TypographyOptions {
  emDash: false,
  ellipsis: false,
  openDoubleQuote: false,
  closeDoubleQuote: false,
  openSingleQuote: false,
  closeSingleQuote: false,
  leftArrow: false,
  rightArrow: false,
  copyright: false,
  trademark: false,
  registeredTrademark: false,
  oneHalf: false,
  plusMinus: false,
  notEqual: false,
  laquo: false,
  raquo: false,
  multiplication: false,
  superscriptTwo: false,
  superscriptThree: false,
  oneQuarter: false,
  threeQuarters: false,
}

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

export const Typography = Extension.create<TypographyOptions>({
  name: 'typography',

  addInputRules() {
    const rules = []

    if (this.options.emDash !== false) {
      rules.push(emDash)
    }

    if (this.options.ellipsis !== false) {
      rules.push(ellipsis)
    }

    if (this.options.openDoubleQuote !== false) {
      rules.push(openDoubleQuote)
    }

    if (this.options.closeDoubleQuote !== false) {
      rules.push(closeDoubleQuote)
    }

    if (this.options.openSingleQuote !== false) {
      rules.push(openSingleQuote)
    }

    if (this.options.closeSingleQuote !== false) {
      rules.push(closeSingleQuote)
    }

    if (this.options.leftArrow !== false) {
      rules.push(leftArrow)
    }

    if (this.options.rightArrow !== false) {
      rules.push(rightArrow)
    }

    if (this.options.copyright !== false) {
      rules.push(copyright)
    }

    if (this.options.trademark !== false) {
      rules.push(trademark)
    }

    if (this.options.registeredTrademark !== false) {
      rules.push(registeredTrademark)
    }

    if (this.options.oneHalf !== false) {
      rules.push(oneHalf)
    }

    if (this.options.plusMinus !== false) {
      rules.push(plusMinus)
    }

    if (this.options.notEqual !== false) {
      rules.push(notEqual)
    }

    if (this.options.laquo !== false) {
      rules.push(laquo)
    }

    if (this.options.raquo !== false) {
      rules.push(raquo)
    }

    if (this.options.multiplication !== false) {
      rules.push(multiplication)
    }

    if (this.options.superscriptTwo !== false) {
      rules.push(superscriptTwo)
    }

    if (this.options.superscriptThree !== false) {
      rules.push(superscriptThree)
    }

    if (this.options.oneQuarter !== false) {
      rules.push(oneQuarter)
    }

    if (this.options.threeQuarters !== false) {
      rules.push(threeQuarters)
    }

    return rules
  },
})
