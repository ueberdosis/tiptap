/**
 * Escape markdown block markers at the start of each line so serialized text
 * parses back as plain text instead of a heading, list, quote, or rule.
 *
 * Only the first character of a marker is escaped, and only when it would
 * otherwise start a block: `#` before a space, `-`/`+` before a space or a
 * second marker, `*` before a space, `>` anywhere, and digits followed by
 * `.` or `)` and a space. Lines that are only a thematic break run are
 * escaped as well. Emphasis delimiters and mid-text markers are left alone.
 *
 * @param text The rendered markdown to escape
 * @returns The text with block-start markers escaped
 * @example
 * ```ts
 * escapeBlockStart('1. January') // '1\\. January'
 * escapeBlockStart('# not a heading') // '\\# not a heading'
 * ```
 */
export function escapeBlockStart(text: string): string {
  return text
    .split('\n')
    .map(line => {
      const match = /^([ \t]*)(.*)$/.exec(line)

      if (!match) {
        return line
      }

      const [, indent, rest] = match
      const escaped = escapeMarker(rest)

      return escaped === rest ? line : indent + escaped
    })
    .join('\n')
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
