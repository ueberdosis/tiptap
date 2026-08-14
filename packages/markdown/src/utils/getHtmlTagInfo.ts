export type HtmlTagInfo = {
  isClosing: boolean
  isSelfClosing: boolean
  tagName: string | null
}

/**
 * Extract closing, self-closing, and tag name details from raw HTML.
 * @param raw The raw HTML source.
 * @returns Whether the tag is a closing or self-closing tag, and its tag name.
 */
export function getHtmlTagInfo(raw: string): HtmlTagInfo {
  // oxlint-disable-next-line prefer-string-starts-ends-with
  const isClosing = /^<\/[\s]*[\w-]+/i.test(raw)
  const openMatch = raw.match(/^<[\s]*([\w-]+)(\s|>|\/|$)/i)

  return {
    isClosing,
    isSelfClosing: raw.endsWith('/>'),
    tagName: openMatch ? openMatch[1] : null,
  }
}
