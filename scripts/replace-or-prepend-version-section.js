function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replace an existing section with the same heading in the changelog body, or prepend it.
 * The body passed in should not include the `# Releases` heading.
 *
 * @param {string} body - existing changelog body (without top heading)
 * @param {string} newSection - the section text starting with `## ` and ending with a newline
 * @param {string} heading - section heading without the leading `## `
 * @returns {string} updated changelog body including the new or replaced section
 */
export function replaceOrPrependVersionSection(body, newSection, heading) {
  const existing = body || ''
  const newTrim = newSection.trim()

  if (!existing.trim()) {
    return `${newTrim}\n\n`
  }

  const headerRe = new RegExp(`^## ${escapeRegExp(heading)}$`, 'm')
  const headerMatch = headerRe.exec(existing)

  if (!headerMatch) {
    return `${newTrim}\n\n${existing}`
  }

  const startIndex = headerMatch.index
  const rest = existing.slice(startIndex + headerMatch[0].length)
  const nextHeaderRe = /^#{1,2}\s.*$/m
  const nextMatch = nextHeaderRe.exec(rest)

  const endIndex = nextMatch
    ? startIndex + headerMatch[0].length + nextMatch.index
    : existing.length
  const before = existing.slice(0, startIndex)
  const after = existing.slice(endIndex)

  return `${before}${newTrim}\n\n${after}`
}
