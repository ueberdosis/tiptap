/**
 * Renders the `colspan` or `rowspan` attribute of a table cell or header.
 *
 * Both attributes default to `1`, so rendering them unconditionally adds
 * markup every cell carries and makes a parse/serialize round-trip change the
 * document. The attribute is omitted when it holds the default value or is
 * missing, matching how prosemirror-tables serializes spans.
 *
 * @param name - The attribute name, `colspan` or `rowspan`
 * @param value - The attribute value
 * @returns - An object holding the attribute, or an empty object for the default
 */
export function renderSpanAttribute(
  name: 'colspan' | 'rowspan',
  value: unknown,
): Record<string, unknown> {
  return value === 1 || value === '1' || value === null || value === undefined
    ? {}
    : { [name]: value }
}
