import { getMarksBetween, PasteRule } from '@tiptap/core'
import type { MarkType, Node as ProseMirrorNode } from '@tiptap/pm/model'

// Only used where no DOM parser exists. It stops at a `>` inside a quoted
// attribute value, so the DOM check below is preferred.
const HTML_LINK_FALLBACK_REGEX = /<a\s[^>]*\bhref\s*=/i

/**
 * Whether the pasted HTML contains a link.
 * Parses the HTML, so attribute values that contain `>` or quotes don't hide a link.
 */
function containsLink(html: string): boolean {
  if (typeof DOMParser === 'undefined') {
    return HTML_LINK_FALLBACK_REGEX.test(html)
  }

  return new DOMParser().parseFromString(html, 'text/html').querySelector('a[href]') !== null
}

/**
 * Whether every position between `from` and `to` carries a link mark.
 * A link with inline formatting is split into several text nodes, so the link
 * marks are checked together instead of looking for one mark that spans the range.
 */
function isCoveredByLinks(doc: ProseMirrorNode, type: MarkType, from: number, to: number): boolean {
  const linkRanges = getMarksBetween(from, to, doc)
    .filter(item => item.mark.type === type)
    .sort((a, b) => a.from - b.from)

  let coveredUntil = from

  for (const range of linkRanges) {
    if (range.from > coveredUntil) {
      return false
    }

    coveredUntil = Math.max(coveredUntil, range.to)

    if (coveredUntil >= to) {
      return true
    }
  }

  return false
}

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
      if (!html || match.data?.markdown || !containsLink(html)) {
        return rule.handler(props)
      }

      if (isCoveredByLinks(state.doc, type, range.from, range.to)) {
        return
      }

      return rule.handler(props)
    },
  })
}
