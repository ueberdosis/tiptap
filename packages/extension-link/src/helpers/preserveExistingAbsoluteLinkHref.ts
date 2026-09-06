import { getMarksBetween, PasteRule } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'

import { isUrlLike } from './isUrlLike.js'

/** Keep HTML-parsed absolute hrefs when linkify only matched the link label. */
export function preserveExistingAbsoluteLinkHref(rule: PasteRule, type: MarkType): PasteRule {
  return new PasteRule({
    find: rule.find,
    handler: props => {
      if (props.match.data?.markdown) {
        return rule.handler(props)
      }

      const existingLink = getMarksBetween(props.range.from, props.range.to, props.state.doc).find(
        item => item.mark.type === type,
      )
      const existingHref = existingLink?.mark.attrs.href

      if (
        typeof existingHref === 'string' &&
        /^https?:\/\//i.test(existingHref) &&
        !isUrlLike(props.match[0])
      ) {
        return null
      }

      return rule.handler(props)
    },
  })
}
