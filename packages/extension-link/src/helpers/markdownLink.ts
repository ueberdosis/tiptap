import type { InputRuleMatch, PasteRuleMatch } from '@tiptap/core'
import { InputRule, markInputRule, markPasteRule, PasteRule } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'

/**
 * Matches a Markdown link with an optional quoted title.
 * for ex: [Tiptap](https://tiptap.dev) or [Tiptap](https://tiptap.dev "some title")
 * the URL may also contain one level of balanced parentheses, as in CommonMark
 * (titles accept curly quotes too, the Typography extension swaps them in while typing)
 */
const MARKDOWN_LINK_INPUT_REGEX =
  /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+["'“‘](.*?)["'”’])?\)$/

/**
 * Same as the input regex but global, to find every Markdown link in pasted text.
 */
const MARKDOWN_LINK_PASTE_REGEX =
  /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+["'“‘](.*?)["'”’])?\)/g

export interface MarkdownLinkRuleConfig {
  type: MarkType

  /**
   * Return `false` to leave the Markdown syntax untouched.
   */
  isAllowedHref: (href: string) => boolean
}

/**
 * An odd number of backticks before the match means it sits in an unclosed
 * code span, either one still being typed or one from pasted text.
 */
function isInsideCodeSpan(text: string, matchIndex: number): boolean {
  let backticks = 0

  for (let index = 0; index < matchIndex; index += 1) {
    if (text[index] === '`') {
      backticks += 1
    }
  }

  return backticks % 2 === 1
}

function isConvertibleLink(
  text: string,
  match: RegExpMatchArray,
  isAllowedHref: MarkdownLinkRuleConfig['isAllowedHref'],
): boolean {
  const [, linkText, href] = match
  const characterBefore = match.index ? text[match.index - 1] : undefined

  // `!` is the Markdown image syntax, `\` an escaped bracket
  if (characterBefore === '!' || characterBefore === '\\') {
    return false
  }

  if (isInsideCodeSpan(text, match.index ?? 0)) {
    return false
  }

  return !!linkText.trim() && isAllowedHref(href)
}

function toRuleMatch(match: RegExpMatchArray): InputRuleMatch & PasteRuleMatch {
  const [linkSyntax, linkText, href, title] = match

  return {
    index: match.index ?? 0,
    text: linkSyntax,
    replaceWith: linkText,
    data: {
      href,
      // an empty title ("") counts as no title, as in CommonMark
      title: title || null,
    },
  }
}

function getMarkdownLinkAttributes(match: { data?: Record<string, any> }) {
  return {
    href: match.data?.href,
    title: match.data?.title ?? null,
  }
}

/**
 * Turns typed Markdown link syntax into a link mark as soon as the closing `)` comes in.
 * The transaction gets flagged so autolink doesn't touch the converted text again.
 */
export function markdownLinkInputRule(config: MarkdownLinkRuleConfig): InputRule {
  const rule = markInputRule({
    find: text => {
      const match = MARKDOWN_LINK_INPUT_REGEX.exec(text)

      if (!match || !isConvertibleLink(text, match, config.isAllowedHref)) {
        return null
      }

      return toRuleMatch(match)
    },
    type: config.type,
    getAttributes: getMarkdownLinkAttributes,
  })

  return new InputRule({
    find: rule.find,
    handler: props => {
      const result = rule.handler(props)

      if (result !== null && props.state.tr.steps.length) {
        props.state.tr.setMeta('preventAutolink', true)
      }

      return result
    },
  })
}

/**
 * Same for pasting, converts every Markdown link found in the pasted text.
 */
export function markdownLinkPasteRule(config: MarkdownLinkRuleConfig): PasteRule {
  const rule = markPasteRule({
    find: text => {
      const matches: PasteRuleMatch[] = []

      for (const match of text.matchAll(MARKDOWN_LINK_PASTE_REGEX)) {
        if (isConvertibleLink(text, match, config.isAllowedHref)) {
          matches.push(toRuleMatch(match))
        }
      }

      return matches
    },
    type: config.type,
    getAttributes: getMarkdownLinkAttributes,
  })

  return new PasteRule({
    find: rule.find,
    handler: props => {
      const result = rule.handler(props)

      if (result !== null && props.state.tr.steps.length) {
        props.state.tr.setMeta('preventAutolink', true)
      }

      return result
    },
  })
}
