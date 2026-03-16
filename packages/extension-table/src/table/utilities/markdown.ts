import type { JSONContent, MarkdownRendererHelpers } from '@tiptap/core'

export const DEFAULT_CELL_LINE_SEPARATOR = '\u001F'

function collapseWhitespace(s: string) {
  return (s || '').replace(/\s+/g, ' ').trim()
}

export function renderTableToMarkdown(
  node: JSONContent,
  h: MarkdownRendererHelpers,
  options: { cellLineSeparator?: string } = {},
) {
  const cellSep = options.cellLineSeparator ?? DEFAULT_CELL_LINE_SEPARATOR

  if (!node || !node.content || node.content.length === 0) {
    return ''
  }

  // Build rows: each cell is { text, isHeader }
  const rows: { text: string; isHeader: boolean }[][] = []

  node.content.forEach(rowNode => {
    const cells: { text: string; isHeader: boolean }[] = []

    if (rowNode.content) {
      rowNode.content.forEach(cellNode => {
        let raw = ''

        if (cellNode.content && Array.isArray(cellNode.content) && cellNode.content.length > 1) {
          // Render each direct child separately and join with separator so we can split again later
          const parts = cellNode.content.map(child => h.renderChildren(child as unknown as JSONContent))
          raw = parts.join(cellSep)
        } else {
          raw = cellNode.content ? h.renderChildren(cellNode.content as unknown as JSONContent[]) : ''
        }

        const text = collapseWhitespace(raw)
        const isHeader = cellNode.type === 'tableHeader'

        cells.push({ text, isHeader })
      })
    }

    rows.push(cells)
  })

  const columnCount = rows.reduce((max, r) => Math.max(max, r.length), 0)

  if (columnCount === 0) {
    return ''
  }

  // Compute max width for each column
  const colWidths = new Array(columnCount).fill(0)

  rows.forEach(r => {
    for (let i = 0; i < columnCount; i += 1) {
      const cell = r[i]?.text || ''
      const len = cell.length
      if (len > colWidths[i]) {
        colWidths[i] = len
      }

      if (colWidths[i] < 3) {
        colWidths[i] = 3
      }
    }
  })

  const pad = (s: string, width: number) => s + ' '.repeat(Math.max(0, width - s.length))

  const headerRow = rows[0]
  const hasHeader = headerRow.some(c => c.isHeader)

  let out = '\n'

  // Render header: if the document has a header row (tableHeader cells) use it,
  // otherwise emit an empty header row so most Markdown parsers will recognize
  // the table (this makes roundtripping to Markdown -> JSON more reliable).
  const headerTexts = new Array(columnCount)
    .fill(0)
    .map((_, i) => (hasHeader ? (headerRow[i] && headerRow[i].text) || '' : ''))

  out += `| ${headerTexts.map((t, i) => pad(t, colWidths[i])).join(' | ')} |\n`

  // Separator (use at least 3 dashes per column)
  out += `| ${colWidths.map(w => '-'.repeat(Math.max(3, w))).join(' | ')} |\n`

  // Body rows: if we had a header, skip the first row; otherwise render all rows
  const body = hasHeader ? rows.slice(1) : rows
  body.forEach(r => {
    out += `| ${new Array(columnCount)
      .fill(0)
      .map((_, i) => pad((r[i] && r[i].text) || '', colWidths[i]))
      .join(' | ')} |\n`
  })

  return out
}

export default renderTableToMarkdown
