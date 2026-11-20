/**
 * Reads a relative table width, in percent, from `style="width: 50%"` or `width="50%"`.
 *
 * A width in any other unit returns `null`: a fixed table is as wide as its columns.
 */
export function parseTableWidth(element: HTMLElement): number | null {
  const value = (element.style.width || element.getAttribute('width') || '').trim()

  if (!value.endsWith('%')) {
    return null
  }

  const percent = parseFloat(value)

  return Number.isFinite(percent) && percent > 0 ? percent : null
}
