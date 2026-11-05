const VERSION_HEADING_PREFIX = '## '
const BUMP_TYPE_HEADING = /^### /m
const HEADING = /^(#{1,5})\s/gm

/**
 * Copies one version from a package changelog for use in the root changelog.
 *
 * @param {string} changelog - Content of the package CHANGELOG.md.
 * @param {string} version - Version to copy, without a leading `v`.
 * @returns {string} The notes with headings one level deeper. Empty when the package has no changes in this version.
 */
export function getPackageReleaseNotes(changelog, version) {
  const lines = changelog.split('\n')
  const start = lines.indexOf(`${VERSION_HEADING_PREFIX}${version}`)

  if (start === -1) return ''

  const length = lines.slice(start + 1).findIndex(line => line.startsWith(VERSION_HEADING_PREFIX))
  const end = length === -1 ? lines.length : start + 1 + length
  const notes = lines
    .slice(start + 1, end)
    .join('\n')
    .trim()

  // Changesets writes a placeholder sentence for versions without changes
  if (!BUMP_TYPE_HEADING.test(notes)) return ''

  return notes.replace(HEADING, '$1# ')
}
