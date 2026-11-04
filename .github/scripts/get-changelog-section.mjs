const isVersionHeading = line => line.startsWith('## ')

/**
 * Returns a version section of the root changelog, including its heading.
 *
 * @param {string} changelog - Content of the root CHANGELOG.md.
 * @param {string} [tag] - Version tag like `v3.32.0`. Defaults to the newest section.
 * @returns {string} The section, or an empty string when it does not exist.
 */
export function getChangelogSection(changelog, tag) {
  const lines = changelog.split('\n')
  const start = lines.findIndex(line => (tag ? line === `## ${tag}` : isVersionHeading(line)))

  if (start === -1) return ''

  const length = lines.slice(start + 1).findIndex(isVersionHeading)
  const end = length === -1 ? lines.length : start + 1 + length

  return lines.slice(start, end).join('\n').trim()
}
