import { Extension, textInputRule } from '@tiptap/core'

export interface TypographyOptions {
  /**
   * The em dash character.
   * @default '—'
   */
  emDash: false | string,

  /**
   * The ellipsis character.
   * @default '…'
   */
  ellipsis: false | string,

  /**
   * The open double quote character.
   * @default '“'
   */
  openDoubleQuote: false | string,

  /**
   * The close double quote character.
   * @default '”'
   */
  closeDoubleQuote: false | string,

  /**
   * The open single quote character.
   * @default '‘'
   */
  openSingleQuote: false | string,

  /**
   * The close single quote character.
   * @default '’'
   */
  closeSingleQuote: false | string,

  /**
   * The left arrow character.
   * @default '←'
   */
  leftArrow: false | string,

  /**
   * The right arrow character.
   * @default '→'
   */
  rightArrow: false | string,

  /**
   * The copyright character.
   * @default '©'
   */
  copyright: false | string,

  /**
   * The trademark character.
   * @default '™'
   */
  trademark: false | string,

  /**
   * The servicemark character.
   * @default '℠'
   */
  servicemark: false | string,

  /**
   * The registered trademark character.
   * @default '®'
   */
  registeredTrademark: false | string,

  /**
   * The one half character.
   * @default '½'
   */
  oneHalf: false | string,

  /**
   * The plus minus character.
   * @default '±'
   */
  plusMinus: false | string,

  /**
   * The not equal character.
   * @default '≠'
   */
  notEqual: false | string,

  /**
   * The laquo character.
   * @default '«'
   */
  laquo: false | string,

  /**
   * The raquo character.
   * @default '»'
   */
  raquo: false | string,

  /**
   * The multiplication character.
   * @default '×'
   */
  multiplication: false | string,

  /**
   * The superscript two character.
   * @default '²'
   */
  superscriptTwo: false | string,

  /**
   * The superscript three character.
   * @default '³'
   */
  superscriptThree: false | string,

  /**
   * The one quarter character.
   * @default '¼'
   */
  oneQuarter: false | string,

  /**
   * The three quarters character.
   * @default '¾'
   */
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
  find: /(?:^|\s)(1\/2)\s$/,
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
  find: /(?:^|\s)(1\/4)\s$/,
  replace: override ?? '¼',
})

export const threeQuarters = (override?: string) => textInputRule({
  find: /(?:^|\s)(3\/4)\s$/,
  replace: override ?? '¾',
})

/**
 * This extension allows you to add typography replacements for specific characters.
 * @see https://www.tiptap.dev/api/extensions/typography
 */
export const Typography = Extension.create<TypographyOptions>({
  name: 'typography',

  addOptions() {
    return {
      closeDoubleQuote: '”',
      closeSingleQuote: '’',
      copyright: '©',
      ellipsis: '…',
      emDash: '—',
      laquo: '«',
      leftArrow: '←',
      multiplication: '×',
      notEqual: '≠',
      oneHalf: '½',
      oneQuarter: '¼',
      openDoubleQuote: '“',
      openSingleQuote: '‘',
      plusMinus: '±',
      raquo: '»',
      registeredTrademark: '®',
      rightArrow: '→',
      servicemark: '℠',
      superscriptThree: '³',
      superscriptTwo: '²',
      threeQuarters: '¾',
      trademark: '™',
    }
  },

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
