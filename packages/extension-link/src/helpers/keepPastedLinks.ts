import { getMarksBetween, PasteRule } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'

const HTML_LINK_REGEX = /<a\s[^>]*\bhref\s*=/i

/**
 * Wraps a paste rule so it leaves links alone that were pasted as HTML.
 *
 * Pasted HTML like `<a href="https://example.com/LICENSE.md">LICENSE.md</a>` is already
 * parsed into a link mark when the paste rules run. Without this, the link text is
 * matched as a URL of its own and the `href` from the HTML gets replaced.
 */
export function keepPastedLinks(rule: PasteRule, type: MarkType): PasteRule {
  return new PasteRule({
    find: rule.find,
    handler: props => {
      const { match, pasteEvent, range, state } = props
      const html = pasteEvent?.clipboardData?.getData('text/html')

      // Markdown links and plain text pastes are always handled by the rule.
      if (!html || match.data?.markdown || !HTML_LINK_REGEX.test(html)) {
        return rule.handler(props)
      }

      const isInsideLink = getMarksBetween(range.from, range.to, state.doc).some(
        item => item.mark.type === type && item.from <= range.from && item.to >= range.to,
      )

      if (isInsideLink) {
        return
      }

      return rule.handler(props)
    },
  })
}
