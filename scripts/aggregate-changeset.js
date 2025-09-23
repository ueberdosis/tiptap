/* eslint-disable */

import { readFile, writeFile } from 'node:fs/promises'
import getReleasePlan from '@changesets/get-release-plan'

const TITLE_MAP = new Map([
  ['major', 'Major Changes'],
  ['minor', 'Minor Changes'],
  ['patch', 'Patch Changes'],
  ['none', 'Other Changes'],
])

const CHANGE_TYPE_ORDER = ['major', 'minor', 'patch', 'none']

/**
 * Small container for a package's accumulated changes.
 */
class PackageChanges {
  constructor(name) {
    this.name = name
    /** @type {Map<string, Array<ChangeEntry>>} */
    this.changes = new Map()
  }

  addChange(type, summary) {
    if (!this.changes.has(type)) this.changes.set(type, [])
    const summaryLines = summary.split('\n')
    // indent each line but not the first
    const indentedSummary = summaryLines.map((line, index) => (index === 0 ? line : `  ${line}`)).join('\n')
    this.changes.get(type).push(new ChangeEntry(type, indentedSummary))
  }
}

/**
 * Represents a single change summary for a package.
 */
class ChangeEntry {
  constructor(type, summary) {
    this.type = type
    this.summary = summary
  }

  toString() {
    return `- ${this.summary}`
  }
}

/**
 * Represents a release with a version and a set of packages.
 */
class ReleaseData {
  constructor(version) {
    this.version = version
    /** @type {Map<string, PackageChanges>} */
    this.packages = new Map()
  }

  addPackage(pkg) {
    this.packages.set(pkg.name, pkg)
  }
}

/**
 * Build a map of package name => PackageChanges from the changeset plan.
 * @param {object} plan - result from getReleasePlan
 * @returns {Map<string, PackageChanges>}
 */
function buildPackagesMap(plan) {
  const packages = new Map()

  for (const changeset of plan.changesets) {
    const { summary } = changeset

    for (const csRelease of changeset.releases) {
      const { name: pkgName, type } = csRelease

      if (!packages.has(pkgName)) packages.set(pkgName, new PackageChanges(pkgName))

      packages.get(pkgName).addChange(type, summary)
    }
  }

  return packages
}

/**
 * Render the final release notes as an array of lines.
 * @param {ReleaseData} releaseData
 */
function renderReleaseNotes(releaseData) {
  const lines = []

  lines.push('# Releases', '')
  lines.push(`## v${releaseData.version}`, '')

  for (const pkg of releaseData.packages.values()) {
    lines.push(`### ${pkg.name}`, '')

    const types = Array.from(pkg.changes.keys()).sort(
      (a, b) => CHANGE_TYPE_ORDER.indexOf(a) - CHANGE_TYPE_ORDER.indexOf(b),
    )

    for (const type of types) {
      lines.push(`#### ${TITLE_MAP.get(type)}`, '')

      for (const change of pkg.changes.get(type)) {
        lines.push(change.toString())
      }

      lines.push('')
    }
  }

  return lines
}

/**
 * Replace an existing `## v<version>` section in the changelog body, or prepend it.
 * The body passed in should not include the `# Releases` heading.
 *
 * @param {string} body - existing changelog body (without top heading)
 * @param {string} newSection - the section text starting with `## v...` and ending with a newline
 * @param {string} version - semantic version string (without leading 'v')
 * @returns {string} updated changelog body including the new or replaced section
 */
function replaceOrPrependVersionSection(body, newSection, version) {
  // helper: escape regexp special chars for the version string
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')
  }

  const existing = body || ''
  const newTrim = newSection.trim()

  if (!existing.trim()) {
    return newTrim + '\n\n'
  }

  // Find the first occurrence of the current version header at line start
  const headerRe = new RegExp(`^## v${escapeRegExp(version)}\\b`, 'm')
  const headerMatch = headerRe.exec(existing)

  if (!headerMatch) {
    // Not present: prepend
    return `${newTrim}\n\n${existing}`
  }

  const startIndex = headerMatch.index

  // Find the next header after startIndex. Stop at the next H1 or H2 header
  // (lines starting with '#' or '##') so we don't clobber content that uses
  // a different heading convention.
  const rest = existing.slice(startIndex + headerMatch[0].length)
  const nextHeaderRe = /^#{1,2}\s.*$/m
  const nextMatch = nextHeaderRe.exec(rest)

  let endIndex
  if (nextMatch) {
    // endIndex is relative to the original string
    endIndex = startIndex + headerMatch[0].length + nextMatch.index
  } else {
    // no next header: replace until EOF
    endIndex = existing.length
  }

  const before = existing.slice(0, startIndex)
  const after = existing.slice(endIndex)

  // Insert the new section at the position of the first header and keep everything after the next header
  const result = `${before}${newTrim}\n\n${after}`
  return result
}

/**
 * Removes the release heading from the existing CHANGELOG.md file.
 */
async function readChangelogBody() {
  try {
    const content = await readFile('CHANGELOG.md', 'utf-8')
    // remove a leading '# Releases' heading if present
    return content.replace(/^# Releases\n\n/, '')
  } catch (err) {
    // if the file doesn't exist, return empty string so we create it later
    if (err && err.code === 'ENOENT') return ''
    throw err
  }
}

async function main() {
  try {
    const plan = await getReleasePlan(process.cwd())

    // If there are no changesets, do nothing — avoid touching CHANGELOG.md
    if (!plan || !Array.isArray(plan.changesets) || plan.changesets.length === 0) {
      console.log('No changesets found — skipping changelog generation')
      return
    }

    const version = plan.releases && plan.releases[0] ? plan.releases[0].newVersion : 'unreleased'

    const packages = buildPackagesMap(plan)

    const releaseData = new ReleaseData(version)
    for (const pkg of packages.values()) releaseData.addPackage(pkg)

    const outputLines = renderReleaseNotes(releaseData)

    const existingBody = await readChangelogBody()

    // We only want the `## vX.Y.Z` section (skip the top '# Releases' heading
    // that renderReleaseNotes includes). The section starts at the third line.
    const sectionLines = outputLines.slice(2)
    const newSection = sectionLines.join('\n') + '\n'

    const updatedBody = replaceOrPrependVersionSection(existingBody, newSection, version)

    // write the global Releases heading plus the updated body
    const combined = '# Releases\n\n' + updatedBody
    await writeFile('CHANGELOG.md', combined, 'utf-8')

    console.log('Release notes written to CHANGELOG.md (prepended)')
  } catch (err) {
    console.error('Failed to aggregate changesets:', err)
    process.exit(1)
  }
}

main()
