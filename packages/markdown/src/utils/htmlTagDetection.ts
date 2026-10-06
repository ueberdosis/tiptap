/**
 * Standard HTML and common SVG element names. Used to tell apart real
 * (but possibly empty) elements like `<em></em>` from genuinely unknown
 * angle-bracket text such as `<enter foo bar>` so the latter can be
 * preserved as literal text.
 *
 * Non-hyphenated tags not in this set are treated as unknown unless
 * declared in the schema's parseDOM rules. This does not claim full
 * parity with browser `HTMLUnknownElement` classification across all
 * namespaces (e.g. rare SVG filter elements, MathML).
 */
export const STANDARD_HTML_TAGS = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'search',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'svg',
  'circle',
  'clippath',
  'defs',
  'ellipse',
  'foreignobject',
  'g',
  'image',
  'line',
  'lineargradient',
  'mask',
  'path',
  'polygon',
  'polyline',
  'radialgradient',
  'rect',
  'stop',
  'switch',
  'symbol',
  'textpath',
  'tspan',
  'use',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
])

const HTML_TAG_NAME_PATTERN = /<\/?([a-zA-Z][\w-]*)/g

/**
 * Extract lower-cased tag names from an HTML fragment (opening and closing tags).
 */
export function extractHtmlTagNames(html: string): string[] {
  const tagNames: string[] = []

  let match: RegExpExecArray | null

  while ((match = HTML_TAG_NAME_PATTERN.exec(html)) !== null) {
    tagNames.push(match[1].toLowerCase())
  }

  return tagNames
}

/**
 * Returns true when the tag name is non-hyphenated and not in the
 * STANDARD_HTML_TAGS allowlist (i.e. would be treated as unrecognized).
 */
export function isHtmlUnknownTagName(tagName: string): boolean {
  const lower = tagName.toLowerCase()

  if (lower.includes('-')) {
    return false
  }

  return !STANDARD_HTML_TAGS.has(lower)
}

/**
 * Returns true when the HTML contains a tag that is neither a standard HTML
 * element nor declared in the schema's parseDOM rules.
 */
export function htmlContainsUnrecognizedTag(html: string, schemaTags: Set<string>): boolean {
  const tagNames = extractHtmlTagNames(html)

  return tagNames.some(tagName => {
    if (!isHtmlUnknownTagName(tagName)) {
      return false
    }

    return !schemaTags.has(tagName)
  })
}
