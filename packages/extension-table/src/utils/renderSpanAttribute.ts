/**
 * Renders a cell span attribute only when it differs from the default of 1.
 *
 * `colspan` and `rowspan` default to 1 in the schema, so rendering them
 * unconditionally puts `colspan="1" rowspan="1"` on every cell and rewrites
 * table HTML on a parse/serialize round trip. prosemirror-tables omits them
 * for the same reason.
 */
export function renderSpanAttribute(name: 'colspan' | 'rowspan') {
  return (attributes: Record<string, any>): Record<string, any> => {
    const value = attributes[name]

    if (value === null || value === undefined || value === 1) {
      return {}
    }

    return { [name]: value }
  }
}
