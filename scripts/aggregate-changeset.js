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

    const version = plan.releases && plan.releases[0] ? plan.releases[0].newVersion : 'unreleased'

    const packages = buildPackagesMap(plan)

    const releaseData = new ReleaseData(version)
    for (const pkg of packages.values()) releaseData.addPackage(pkg)

    const outputLines = renderReleaseNotes(releaseData)

    const existingBody = await readChangelogBody()

    // write the new release notes followed by the existing changelog body
    const combined = outputLines.join('\n') + '\n\n' + existingBody
    await writeFile('CHANGELOG.md', combined, 'utf-8')

    console.log('Release notes written to CHANGELOG.md (prepended)')
  } catch (err) {
    console.error('Failed to aggregate changesets:', err)
    process.exit(1)
  }
}

main()
