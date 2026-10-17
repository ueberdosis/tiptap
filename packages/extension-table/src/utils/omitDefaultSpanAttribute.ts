export function omitDefaultSpanAttribute(
  attributes: Record<string, unknown>,
  renderedAttributes: Record<string, unknown>,
  name: 'colspan' | 'rowspan',
): void {
  if (!(name in renderedAttributes)) {
    return
  }

  const value = renderedAttributes[name]

  if (value === 1 || value === '1' || value === null || value === undefined) {
    delete attributes[name]
  }
}
