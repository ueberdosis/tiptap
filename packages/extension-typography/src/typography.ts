import { Extension, textInputRule } from '@tiptap/core'

export interface TypographyOptions {
  emDash: false | string,
  ellipsis: false | string,
  openDoubleQuote: false | string,
  closeDoubleQuote: false | string,
  openSingleQuote: false | string,
  closeSingleQuote: false | string,
  leftArrow: false | string,
  rightArrow: false | string,
  copyright: false | string,
  trademark: false | string,
  servicemark: false | string,
  registeredTrademark: false | string,
  oneHalf: false | string,
  plusMinus: false | string,
  notEqual: false | string,
  laquo: false | string,
  raquo: false | string,
  multiplication: false | string,
  superscriptTwo: false | string,
  superscriptThree: false | string,
  oneQuarter: false | string,
  threeQuarters: false | string,
}

export const emDash = (override?: string) => textInputRule({
  find: /--$/,
  replace: override ?? '—',
})

export const ellipsis = (override?: string) => textInputRule({
  find: /\.\.\.$/,
  replace: override ?? '…',
})

export const openDoubleQuote = (override?: string) => textInputRule({
  find: /(?:^|[\s{[(<'"\u2018\u201C])(")$/,
  replace: override ?? '“',
})

export const closeDoubleQuote = (override?: string) => textInputRule({
  find: /"$/,
  replace: override ?? '”',
})

export const openSingleQuote = (override?: string) => textInputRule({
  find: /(?:^|[\s{[(<'"\u2018\u201C])(')$/,
  replace: override ?? '‘',
})

export const closeSingleQuote = (override?: string) => textInputRule({
  find: /'$/,
  replace: override ?? '’',
})

export const leftArrow = (override?: string) => textInputRule({
  find: /<-$/,
  replace: override ?? '←',
})

export const rightArrow = (override?: string) => textInputRule({
  find: /->$/,
  replace: override ?? '→',
})

export const copyright = (override?: string) => textInputRule({
  find: /\(c\)$/,
  replace: override ?? '©',
})

export const trademark = (override?: string) => textInputRule({
  find: /\(tm\)$/,
  replace: override ?? '™',
})

export const servicemark = (override?: string) => textInputRule({
  find: /\(sm\)$/,
  replace: override ?? '℠',
})

export const registeredTrademark = (override?: string) => textInputRule({
  find: /\(r\)$/,
  replace: override ?? '®',
})

export const oneHalf = (override?: string) => textInputRule({
  find: /(?:^|\s)(1\/2)$/,
  replace: override ?? '½',
})

export const plusMinus = (override?: string) => textInputRule({
  find: /\+\/-$/,
  replace: override ?? '±',
})

export const notEqual = (override?: string) => textInputRule({
  find: /!=$/,
  replace: override ?? '≠',
})

export const laquo = (override?: string) => textInputRule({
  find: /<<$/,
  replace: override ?? '«',
})

export const raquo = (override?: string) => textInputRule({
  find: />>$/,
  replace: override ?? '»',
})

export const multiplication = (override?: string) => textInputRule({
  find: /\d+\s?([*x])\s?\d+$/,
  replace: override ?? '×',
})

export const superscriptTwo = (override?: string) => textInputRule({
  find: /\^2$/,
  replace: override ?? '²',
})

export const superscriptThree = (override?: string) => textInputRule({
  find: /\^3$/,
  replace: override ?? '³',
})

export const oneQuarter = (override?: string) => textInputRule({
  find: /(?:^|\s)(1\/4)$/,
  replace: override ?? '¼',
})

export const threeQuarters = (override?: string) => textInputRule({
  find: /(?:^|\s)(3\/4)$/,
  replace: override ?? '¾',
})

export const Typography = Extension.create<TypographyOptions>({
  name: 'typography',

  addInputRules() {
    const rules = []

    if (this.options.emDash !== false) {
      rules.push(emDash(this.options.emDash))
    }

    if (this.options.ellipsis !== false) {
      rules.push(ellipsis(this.options.ellipsis))
    }

    if (this.options.openDoubleQuote !== false) {
      rules.push(openDoubleQuote(this.options.openDoubleQuote))
    }

    if (this.options.closeDoubleQuote !== false) {
      rules.push(closeDoubleQuote(this.options.closeDoubleQuote))
    }

    if (this.options.openSingleQuote !== false) {
      rules.push(openSingleQuote(this.options.openSingleQuote))
    }

    if (this.options.closeSingleQuote !== false) {
      rules.push(closeSingleQuote(this.options.closeSingleQuote))
    }

    if (this.options.leftArrow !== false) {
      rules.push(leftArrow(this.options.leftArrow))
    }

    if (this.options.rightArrow !== false) {
      rules.push(rightArrow(this.options.rightArrow))
    }

    if (this.options.copyright !== false) {
      rules.push(copyright(this.options.copyright))
    }

    if (this.options.trademark !== false) {
      rules.push(trademark(this.options.trademark))
    }

    if (this.options.servicemark !== false) {
      rules.push(servicemark(this.options.servicemark))
    }

    if (this.options.registeredTrademark !== false) {
      rules.push(registeredTrademark(this.options.registeredTrademark))
    }

    if (this.options.oneHalf !== false) {
      rules.push(oneHalf(this.options.oneHalf))
    }

    if (this.options.plusMinus !== false) {
      rules.push(plusMinus(this.options.plusMinus))
    }

    if (this.options.notEqual !== false) {
      rules.push(notEqual(this.options.notEqual))
    }

    if (this.options.laquo !== false) {
      rules.push(laquo(this.options.laquo))
    }

    if (this.options.raquo !== false) {
      rules.push(raquo(this.options.raquo))
    }

    if (this.options.multiplication !== false) {
      rules.push(multiplication(this.options.multiplication))
    }

    if (this.options.superscriptTwo !== false) {
      rules.push(superscriptTwo(this.options.superscriptTwo))
    }

    if (this.options.superscriptThree !== false) {
      rules.push(superscriptThree(this.options.superscriptThree))
    }

    if (this.options.oneQuarter !== false) {
      rules.push(oneQuarter(this.options.oneQuarter))
    }

    if (this.options.threeQuarters !== false) {
      rules.push(threeQuarters(this.options.threeQuarters))
    }

    return rules
  },
})
