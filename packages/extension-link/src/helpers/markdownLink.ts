import type { InputRuleMatch, PasteRuleMatch } from '@tiptap/core'
import { InputRule, markInputRule, markPasteRule, PasteRule } from '@tiptap/core'
import type { MarkType } from '@tiptap/pm/model'

/**
 * Matches a Markdown link with an optional quoted title.
 * for ex: [Tiptap](https://tiptap.dev) or [Tiptap](https://tiptap.dev "some title")
 * the URL may also contain one level of balanced parentheses, as in CommonMark
 * (titles accept curly quotes too, the Typography extension swaps them in while typing)
 * the title delimiters must come in matching pairs
 */
const MARKDOWN_LINK_INPUT_REGEX =
  /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+(?:(["'])(.*?)\3|“(.*?)”|‘(.*?)’))?\)$/

/**
 * Same as the input regex but global, to find every Markdown link in pasted text.
 */
const MARKDOWN_LINK_PASTE_REGEX =
  /\[([^[\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)(?:\s+(?:(["'])(.*?)\3|“(.*?)”|‘(.*?)’))?\)/g

export interface MarkdownLinkRuleConfig {
  type: MarkType

  /**
   * Return `false` to leave the Markdown syntax untouched.
   */
  isAllowedHref: (href: string) => boolean
}

export interface MarkdownLinkPasteRuleConfig extends MarkdownLinkRuleConfig {
  /**
   * Finds plain URLs to link in the same pass. Matches overlapping a
   * converted Markdown link are dropped so its href is kept.
   */
  findPlainUrls?: (text: string) => PasteRuleMatch[]
}

function isEscaped(text: string, index: number): boolean {
  let backslashes = 0

  for (let position = index - 1; position >= 0 && text[position] === '\\'; position -= 1) {
    backslashes += 1
  }

  return backslashes % 2 === 1
}

/**
 * Pairs the backtick runs before the match by length, as CommonMark does.
 * A run left open means the match sits in an unfinished code span.
 */
function isInsideCodeSpan(text: string, matchIndex: number): boolean {
  let openRunLength = 0
  let index = 0

  while (index < matchIndex) {
    if (text[index] !== '`') {
      index += 1
      continue
    }

    // escapes only apply outside code spans
    if (openRunLength === 0 && isEscaped(text, index)) {
      index += 1
      continue
    }

    let runLength = 0

    while (index < matchIndex && text[index] === '`') {
      runLength += 1
      index += 1
    }

    if (openRunLength === 0) {
      openRunLength = runLength
    } else if (runLength === openRunLength) {
      openRunLength = 0
    }
  }

  return openRunLength > 0
}

function isConvertibleLink(
  text: string,
  match: RegExpMatchArray,
  isAllowedHref: MarkdownLinkRuleConfig['isAllowedHref'],
): boolean {
  const [, linkText, href] = match
  const characterBefore = match.index ? text[match.index - 1] : undefined

  // `!` is the Markdown image syntax, `\` may escape the opening bracket
  if (characterBefore === '!' || isEscaped(text, match.index ?? 0)) {
    return false
  }

  if (isInsideCodeSpan(text, match.index ?? 0)) {
    return false
  }

  return !!linkText.trim() && isAllowedHref(href)
}

function toRuleMatch(match: RegExpMatchArray): InputRuleMatch & PasteRuleMatch {
  const [linkSyntax, linkText, href, , straightQuotedTitle, curlyDoubleTitle, curlySingleTitle] =
    match
  const title = straightQuotedTitle ?? curlyDoubleTitle ?? curlySingleTitle

  return {
    index: match.index ?? 0,
    text: linkSyntax,
    replaceWith: linkText,
    data: {
      href,
      // an empty title ("") counts as no title, as in CommonMark
      title: title || null,
      markdown: true,
    },
  }
}

function matchesOverlap(a: PasteRuleMatch, b: PasteRuleMatch): boolean {
  return a.index < b.index + b.text.length && b.index < a.index + a.text.length
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
 * Same for pasting, converts every Markdown link found in the pasted text
 * and links the plain URLs from `findPlainUrls`.
 */
export function markdownLinkPasteRule(config: MarkdownLinkPasteRuleConfig): PasteRule {
  const rule = markPasteRule({
    find: text => {
      const markdownMatches: PasteRuleMatch[] = []

      for (const match of text.matchAll(MARKDOWN_LINK_PASTE_REGEX)) {
        if (isConvertibleLink(text, match, config.isAllowedHref)) {
          markdownMatches.push(toRuleMatch(match))
        }
      }

      const plainUrlMatches = (config.findPlainUrls?.(text) ?? []).filter(
        urlMatch => !markdownMatches.some(markdownMatch => matchesOverlap(markdownMatch, urlMatch)),
      )

      return [...markdownMatches, ...plainUrlMatches]
    },
    type: config.type,
    getAttributes: getMarkdownLinkAttributes,
  })

  return new PasteRule({
    find: rule.find,
    handler: props => {
      const result = rule.handler(props)

      // only Markdown conversions suppress autolink
      if (result !== null && props.state.tr.steps.length && props.match.data?.markdown) {
        props.state.tr.setMeta('preventAutolink', true)
      }

      return result
    },
  })
}
