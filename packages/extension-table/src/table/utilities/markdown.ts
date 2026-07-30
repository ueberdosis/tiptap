import type { JSONContent, MarkdownRendererHelpers } from '@tiptap/core'

import {
  type TableCellAlign as TableCellAlignType,
  normalizeTableCellAlignFromAttributes,
  TableCellAlign,
} from '../../utils/parseAlign.js'

export const DEFAULT_CELL_LINE_SEPARATOR = '\u001F'

/**
 * Walk a single table-row line and escape any `|` characters that appear
 * inside backtick code spans so marked's cell splitter ignores them.
 * Backslash escape sequences outside code spans are passed through untouched.
 * If a backtick run has no matching closer on the same line it is emitted
 * as-is — no over-escaping for malformed input.
 */
export function escapeTableCellPipes(line: string): string {
  let result = ''
  let i = 0
  while (i < line.length) {
    if (line[i] === '\\' && i + 1 < line.length) {
      result += line[i] + line[i + 1]
      i += 2
      continue
    }
    if (line[i] !== '`') {
      result += line[i++]
      continue
    }
    let runLen = 0
    while (i + runLen < line.length && line[i + runLen] === '`') runLen += 1
    let j = i + runLen
    let found = false
    while (j < line.length) {
      if (line[j] !== '`') {
        j += 1
        continue
      }
      let closeLen = 0
      while (j + closeLen < line.length && line[j + closeLen] === '`') closeLen += 1
      if (closeLen === runLen) {
        const spanContent = line.slice(i + runLen, j)
        result +=
          line.slice(i, i + runLen) +
          spanContent.replace(/(?<!\\)\|/g, '\\|') +
          line.slice(j, j + runLen)
        i = j + runLen
        found = true
        break
      }
      j += closeLen
    }
    if (!found) {
      result += line.slice(i, i + runLen)
      i += runLen
    }
  }
  return result
}

/**
 * Escape pipe characters inside backtick code spans on table-row lines.
 * marked's `splitCells` only recognises backslash-escaped pipes (`\|`) and
 * splits on every other `|`, so \`a || b\` in a table cell would be treated
 * as multiple column delimiters. Escaping them here lets `splitCells` skip
 * them; it already converts `\|` → `|` after splitting, so the cell content
 * is restored correctly.
 */
export function preprocessTablePipes(src: string): string {
  return src
    .split('\n')
    .map(line => {
      if (!line.includes('|') || !line.includes('`')) return line
      return escapeTableCellPipes(line)
    })
    .join('\n')
}

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

  // Build rows: each cell is { text, isHeader, align }
  const rows: { text: string; isHeader: boolean; align: TableCellAlignType | null }[][] = []

  node.content.forEach(rowNode => {
    const cells: { text: string; isHeader: boolean; align: TableCellAlignType | null }[] = []

    if (rowNode.content) {
      rowNode.content.forEach(cellNode => {
        let raw = ''

        if (cellNode.content && Array.isArray(cellNode.content) && cellNode.content.length > 1) {
          // Render each direct child separately and join with separator so we can split again later
          const parts = cellNode.content.map(child =>
            h.renderChildren(child as unknown as JSONContent),
          )
          raw = parts.join(cellSep)
        } else {
          raw = cellNode.content
            ? h.renderChildren(cellNode.content as unknown as JSONContent[])
            : ''
        }

        // Cells have to stay on a single line, so line breaks become <br> tags.
        // The parser already turns <br> back into hard breaks, so this round trips.
        const text = collapseWhitespace(
          raw
            .split(cellSep)
            .join('\n')
            .replace(/[ \t]*\r?\n[ \t]*/g, '<br>'),
        )
        const isHeader = cellNode.type === 'tableHeader'
        const align = normalizeTableCellAlignFromAttributes(cellNode.attrs)

        cells.push({ text, isHeader, align })
      })
    }

    rows.push(cells)
  })

  const columnCount = rows.reduce((max, r) => Math.max(max, r.length), 0)

  if (columnCount === 0) {
    return ''
  }

  // Compute max width for each column
  const colWidths = Array.from<number>({ length: columnCount }).fill(0)

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
  const colAlignments: Array<TableCellAlignType | null> = Array.from<TableCellAlignType | null>({
    length: columnCount,
  }).fill(null)

  rows.forEach(r => {
    for (let i = 0; i < columnCount; i += 1) {
      if (!colAlignments[i] && r[i]?.align) {
        colAlignments[i] = r[i].align
      }
    }
  })

  let out = '\n'

  // Render header: if the document has a header row (tableHeader cells) use it,
  // otherwise emit an empty header row so most Markdown parsers will recognize
  // the table (this makes roundtripping to Markdown -> JSON more reliable).
  const headerTexts = Array.from<number>({ length: columnCount }).map((_, i) =>
    hasHeader ? (headerRow[i] && headerRow[i].text) || '' : '',
  )

  out += `| ${headerTexts.map((t, i) => pad(t, colWidths[i])).join(' | ')} |\n`

  // Separator (use at least 3 dashes per column and include alignment markers)
  out += `| ${colWidths
    .map((w, index) => {
      const dashCount = Math.max(3, w)
      const alignment = colAlignments[index]

      if (alignment === TableCellAlign.Left) {
        return `:${'-'.repeat(dashCount)}`
      }

      if (alignment === TableCellAlign.Right) {
        return `${'-'.repeat(dashCount)}:`
      }

      if (alignment === TableCellAlign.Center) {
        return `:${'-'.repeat(dashCount)}:`
      }

      return '-'.repeat(dashCount)
    })
    .join(' | ')} |\n`

  // Body rows: if we had a header, skip the first row; otherwise render all rows
  const body = hasHeader ? rows.slice(1) : rows
  body.forEach(r => {
    out += `| ${Array.from<number>({ length: columnCount })
      .fill(0)
      .map((_, i) => pad((r[i] && r[i].text) || '', colWidths[i]))
      .join(' | ')} |\n`
  })

  return out
}

export default renderTableToMarkdown
