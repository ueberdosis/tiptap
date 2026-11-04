/**
 * Names a changelog section after the packages it releases.
 *
 * @param {{ name: string, newVersion: string }[]} releases - Packages in the release.
 * @returns {string} `v<version>` when `@tiptap/core` is released. Otherwise each package and version.
 */
export function getReleaseHeading(releases) {
  const core = releases.find(release => release.name === '@tiptap/core')

  if (core) return `v${core.newVersion}`

  // Independently versioned packages have no shared version
  return releases.map(release => `${release.name}@${release.newVersion}`).join(', ')
}
