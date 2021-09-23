import { PasteRule } from '../PasteRule'
import { Slice, Fragment, MarkType } from 'prosemirror-model'

type MarkPasteRuleMatch = {
  index: number,
  text: string,
  replaceWith?: string,
  match?: RegExpMatchArray,
  [key: string]: any,
}

export default function markPasteRule(config: {
  matcher: RegExp | ((text: string) => MarkPasteRuleMatch[]),
  type: MarkType,
  getAttributes?:
    | Record<string, any>
    | ((match: MarkPasteRuleMatch) => Record<string, any>)
    | false
    | null
  ,
}) {
  return new PasteRule(config.matcher, ({ fragment }) => {
    return fragment
  })
}
