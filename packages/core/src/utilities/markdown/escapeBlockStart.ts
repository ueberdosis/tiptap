/**
 * Escape markdown block markers at the start of each line so serialized text
 * parses back as plain text instead of a heading, list, quote, or rule.
 *
 * Only the first character of a marker is escaped, and only when it would
 * otherwise start a block: `#` before a space, `-`/`+` before a space or a
 * second marker, `*` before a space, `>` anywhere, and digits followed by
 * `.` or `)` and a space. Lines that are only a thematic break run are
 * escaped as well. A line of only `=` signs after a text line is escaped so
 * it is not read as a Setext underline, and the pipes of a GFM table
 * delimiter row are escaped so the text is not read as a table. A line
 * ending inside an inline code span becomes a space when a later line
 * would otherwise start a block, matching how a parser folds it, so a
 * marker on a later line cannot start a block. Other line endings inside
 * backtick pairs are left alone, since link titles keep them. Other text
 * inside code spans is left alone, since backslashes there stay literal.
 * Emphasis delimiters and mid-text markers are left alone.
 *
 * @param text The rendered markdown to escape
 * @returns The text with block-start markers escaped
 * @example
 * ```ts
 * escapeBlockStart('1. January') // '1\\. January'
 * escapeBlockStart('# not a heading') // '\\# not a heading'
 * escapeBlockStart('Title\n===') // 'Title\n\\==='
 * ```
 */
export function escapeBlockStart(text: string): string {
  const lines = splitLines(flattenCodeSpans(splitCodeSpans(text)))

  return lines
    .map((line, index) => {
      const previousLine = index > 0 ? lines[index - 1].map(part => part.text).join('') : ''
      const hasPreviousTextLine = previousLine.trim() !== ''

      return escapeLine(line, hasPreviousTextLine)
    })
    .join('\n')
}

type Segment = {
  code: boolean
  text: string
}

// Block parsing runs before inline code, so a marker on a later line of a
// multiline code span would start a block. Parsers fold the line ending to
// a space, so flattening it keeps the parsed text unchanged. Backtick pairs
// in link titles are not code spans and keep their line endings, so only
// flatten a span whose later lines would start a block.
function flattenCodeSpans(segments: Segment[]): Segment[] {
  return segments.map(segment =>
    segment.code && codeSpanStartsBlock(segment.text)
      ? { ...segment, text: segment.text.replace(/\r\n|\r|\n/g, ' ') }
      : segment,
  )
}

function codeSpanStartsBlock(text: string): boolean {
  const lines = text.split(/\r\n|\r|\n/)

  // A blank line inside the span ends the paragraph
  if (lines.slice(1, -1).some(line => line.trim() === '')) {
    return true
  }

  return lines.slice(1).some(line => {
    const rest = line.replace(/^[ \t]*/, '').replace(/`+$/, '')

    return escapeMarker(rest) !== rest || /^=+[ \t]*$/.test(rest) || isTableDelimiterRow(rest)
  })
}

function splitCodeSpans(text: string): Segment[] {
  const segments: Segment[] = []
  let current: Segment | null = null
  let index = 0

  const append = (code: boolean, chunk: string) => {
    if (current && current.code === code) {
      current.text += chunk
    } else {
      current = { code, text: chunk }
      segments.push(current)
    }
  }

  while (index < text.length) {
    const char = text[index]

    // A backslash-escaped character is literal text, never a fence
    if (char === '\\' && index + 1 < text.length) {
      append(false, text.slice(index, index + 2))
      index += 2
      continue
    }

    if (char !== '`') {
      append(false, char)
      index += 1
      continue
    }

    let end = index

    while (text[end] === '`') {
      end += 1
    }

    const fenceLength = end - index
    const closing = findClosingRun(text, end, fenceLength)

    // A run without a matching closing run is literal text
    if (closing === -1) {
      append(false, text.slice(index, end))
      index = end
      continue
    }

    append(true, text.slice(index, closing + fenceLength))
    index = closing + fenceLength
  }

  return segments
}

function findClosingRun(text: string, from: number, fenceLength: number): number {
  let index = from

  while (index < text.length) {
    if (text[index] !== '`') {
      index += 1
      continue
    }

    let end = index

    while (text[end] === '`') {
      end += 1
    }

    if (end - index === fenceLength) {
      return index
    }

    index = end
  }

  return -1
}

function splitLines(segments: Segment[]): Segment[][] {
  const lines: Segment[][] = [[]]

  segments.forEach(segment => {
    segment.text.split('\n').forEach((part, partIndex) => {
      if (partIndex > 0) {
        lines.push([])
      }

      if (part !== '') {
        lines[lines.length - 1].push({ code: segment.code, text: part })
      }
    })
  })

  return lines
}

function escapeLine(line: Segment[], hasPreviousTextLine: boolean): string {
  if (line.length === 0) {
    return ''
  }

  const first = line[0]

  if (line.some(part => part.code)) {
    // Only a marker before the first code span starts a block
    if (!first.code) {
      return (
        escapeFirstMarker(first.text) +
        line
          .slice(1)
          .map(part => part.text)
          .join('')
      )
    }

    return line.map(part => part.text).join('')
  }

  const text = line.map(part => part.text).join('')
  const match = /^([ \t]*)(.*)$/.exec(text)

  if (!match) {
    return text
  }

  const [, indent, rest] = match

  if (hasPreviousTextLine && isTableDelimiterRow(rest)) {
    return indent + escapeMarker(escapePipes(rest))
  }

  if (hasPreviousTextLine && /^=+[ \t]*$/.test(rest)) {
    return `${indent}\\${rest}`
  }

  const escaped = escapeMarker(rest)

  return escaped === rest ? text : indent + escaped
}

function escapeFirstMarker(text: string): string {
  const match = /^([ \t]*)(.*)$/.exec(text)

  if (!match) {
    return text
  }

  const [, indent, rest] = match
  const escaped = escapeMarker(rest)

  return escaped === rest ? text : indent + escaped
}

function isTableDelimiterRow(rest: string): boolean {
  if (!rest.includes('|')) {
    return false
  }

  const compact = rest.replace(/[ \t]/g, '')

  return /^(\|)?(:?-+:?)(\|:?-+:?)*\|?$/.test(compact)
}

function escapePipes(rest: string): string {
  let result = ''
  let backslashes = 0

  for (const char of rest) {
    if (char === '\\') {
      backslashes += 1
      result += char
      continue
    }

    if (char === '|' && backslashes % 2 === 0) {
      result += '\\|'
    } else {
      result += char
    }

    backslashes = 0
  }

  return result
}

function escapeMarker(rest: string): string {
  if (rest.startsWith('>')) {
    return `\\${rest}`
  }

  if (/^#{1,6}(?:[ \t]|$)/.test(rest)) {
    return `\\${rest}`
  }

  if (/^[-+](?:[ \t]|$|[-+])/.test(rest)) {
    return `\\${rest}`
  }

  if (/^\*(?:[ \t]|$)/.test(rest) || /^[ \t]*(\*[ \t]*){3,}$/.test(rest)) {
    return `\\${rest}`
  }

  if (/^(_[ \t]*){3,}$/.test(rest)) {
    return `\\${rest}`
  }

  const ordered = /^(\d+)([.)])(?:[ \t]|$)/.exec(rest)

  if (ordered) {
    return `${ordered[1]}\\${ordered[2]}${rest.slice(ordered[1].length + 1)}`
  }

  return rest
}
