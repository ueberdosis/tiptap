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

/** Opening or closing tag name capture; applied after noise stripping. */
const HTML_TAG_NAME_PATTERN = /<\/?([a-zA-Z][\w-]*)/g

/** Opening tags with attribute text, for schema attribute-selector matching. */
const HTML_OPEN_TAG_PATTERN = /<([a-zA-Z][\w-]*)((?:\s[^>]*)?)\/?>/g

export type SchemaParseDomHints = {
  /** Lower-cased bare tag names from parseDOM rules that start with a tag. */
  tagNames: Set<string>
  /** Attribute-only parseDOM selectors such as `[data-kind="widget"]`. */
  attrSelectors: string[]
}

/**
 * Remove HTML comments and quoted attribute values so tag-like text inside
 * them is not mistaken for real markup boundaries.
 */
export function stripHtmlNoise(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/="[^"]*"/g, '=""')
    .replace(/='[^']*'/g, "=''")
}

/**
 * Extract lower-cased tag names from an HTML fragment (opening and closing tags).
 * Comments and attribute values are ignored so placeholders inside them do not
 * trigger the unrecognized-tag fallback.
 */
export function extractHtmlTagNames(html: string): string[] {
  const tagNames: string[] = []
  const source = stripHtmlNoise(html)

  let match: RegExpExecArray | null
  HTML_TAG_NAME_PATTERN.lastIndex = 0

  while ((match = HTML_TAG_NAME_PATTERN.exec(source)) !== null) {
    tagNames.push(match[1].toLowerCase())
  }

  return tagNames
}

/**
 * Returns true when the tag name is non-hyphenated and not in the
 * STANDARD_HTML_TAGS allowlist (i.e. would be treated as unrecognized).
 * Hyphenated names match browser custom-element classification here; whether
 * an unsupported custom element is preserved as literal text is decided in
 * `htmlContainsUnrecognizedTag`.
 */
export function isHtmlUnknownTagName(tagName: string): boolean {
  const lower = tagName.toLowerCase()

  if (lower.includes('-')) {
    return false
  }

  return !STANDARD_HTML_TAGS.has(lower)
}

function matchesAttrSelector(openTag: string, selector: string): boolean {
  const bracket = selector.match(/^\[([^\]]+)\]$/)
  if (!bracket) {
    return false
  }

  const inner = bracket[1].trim()
  const eq = inner.match(/^([^\s=~|^$*]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]]*))$/)

  if (!eq) {
    // Presence selector: [attr]
    return new RegExp(`\\s${inner}(?:\\s|=|/|>|$)`, 'i').test(openTag)
  }

  const attr = eq[1]
  const value = eq[2] ?? eq[3] ?? eq[4] ?? ''
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`${attr}\\s*=\\s*(["'])${escaped}\\1`, 'i').test(openTag)
}

function elementMatchesSchema(
  tagName: string,
  openTag: string | undefined,
  schema: SchemaParseDomHints,
): boolean {
  if (schema.tagNames.has(tagName)) {
    return true
  }

  if (!openTag || schema.attrSelectors.length === 0) {
    return false
  }

  return schema.attrSelectors.some(selector => matchesAttrSelector(openTag, selector))
}

/**
 * Returns true when the HTML contains a tag that should be preserved as
 * literal text: a non-standard non-hyphenated name, or a hyphenated custom
 * element that is not covered by the schema's parseDOM rules (including
 * attribute selectors). Tag-like text inside attributes and comments is ignored.
 */
export function htmlContainsUnrecognizedTag(
  html: string,
  schemaTags: Set<string> | SchemaParseDomHints,
): boolean {
  const schema: SchemaParseDomHints =
    schemaTags instanceof Set ? { tagNames: schemaTags, attrSelectors: [] } : schemaTags

  const source = stripHtmlNoise(html)
  const openTags = new Map<string, string>()

  HTML_OPEN_TAG_PATTERN.lastIndex = 0
  let openMatch: RegExpExecArray | null
  while ((openMatch = HTML_OPEN_TAG_PATTERN.exec(html.replace(/<!--[\s\S]*?-->/g, ''))) !== null) {
    openTags.set(openMatch[1].toLowerCase(), openMatch[0])
  }

  const tagNames = extractHtmlTagNames(source)

  return tagNames.some(tagName => {
    if (elementMatchesSchema(tagName, openTags.get(tagName), schema)) {
      return false
    }

    // Unsupported custom elements (hyphenated, not in schema) stay as text.
    if (tagName.includes('-')) {
      return true
    }

    return isHtmlUnknownTagName(tagName)
  })
}
