import { Fragment } from 'prosemirror-model'

export type PasteRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  [key: string]: any,
}

export class PasteRule {
  match: RegExp | ((text: string) => PasteRuleMatch[])

  handler: (props: {
    fragment: Fragment
    match: PasteRuleMatch,
  }) => Fragment

  constructor(
    match: RegExp | ((text: string) => PasteRuleMatch[]),
    handler: (props: {
      fragment: Fragment
      match: PasteRuleMatch,
    }) => Fragment,
  ) {
    this.match = match
    this.handler = handler
  }
}

// export class PasteRule {
//   match: RegExp | ((text: string) => PasteRuleMatch[])

//   handler: (props: {
//     fragment: Fragment
//     match: PasteRuleMatch,
//   }) => Fragment

//   constructor(config: {
//     match: RegExp | ((text: string) => PasteRuleMatch[]),
//     handler: (props: {
//       fragment: Fragment
//       match: PasteRuleMatch,
//     }) => Fragment,
//   }) {
//     this.match = config.match
//     this.handler = config.handler
//   }
// }
