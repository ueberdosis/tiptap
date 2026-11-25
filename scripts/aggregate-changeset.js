/* oslint-disable */

import { execFile as execFileCallback } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import fg from 'fast-glob'
import { getPackageReleaseNotes } from './get-package-release-notes.js'
import { getReleaseHeading } from './get-release-heading.js'
import { replaceOrPrependVersionSection } from './replace-or-prepend-version-section.js'

const execFile = promisify(execFileCallback)

async function getCommittedVersion(packageFile) {
  try {
    const { stdout } = await execFile('git', ['show', `HEAD:./${path.basename(packageFile)}`], {
      cwd: path.dirname(packageFile),
    })

    return JSON.parse(stdout).version
  } catch {
    // A package that is new in this release has no committed version
    return undefined
  }
}

async function loadReleasedPackages() {
  const packageFiles = await fg(['packages/*/package.json', 'demos/package.json'], {
    absolute: true,
  })
  const releases = []

  for (const packageFile of packageFiles.sort()) {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf-8'))

    // Ignore private packages like the demos package
    if (packageJson.private) continue
    if (packageJson.version === (await getCommittedVersion(packageFile))) continue

    releases.push({
      name: packageJson.name,
      newVersion: packageJson.version,
      dir: path.dirname(packageFile),
    })
  }

  return releases
}

async function renderPackageSections(releases) {
  const sections = []

  for (const release of releases) {
    const changelog = await readFile(path.join(release.dir, 'CHANGELOG.md'), 'utf-8')
    const notes = getPackageReleaseNotes(changelog, release.newVersion)

    if (notes) sections.push(`### ${release.name}\n\n${notes}`)
  }

  return sections
}

/**
 * Removes the release heading from the existing CHANGELOG.md file.
 */
async function readChangelogBody() {
  try {
    const content = await readFile('CHANGELOG.md', 'utf-8')
    return content.replace(/^# Releases\n\n/, '')
  } catch (err) {
    if (err && err.code === 'ENOENT') return ''
    throw err
  }
}

async function main() {
  try {
    const releases = await loadReleasedPackages()
    const sections = await renderPackageSections(releases)

    if (sections.length === 0) {
      console.log('No package changes found, skipping changelog generation')
      return
    }

    const heading = getReleaseHeading(releases)
    const newSection = `## ${heading}\n\n${sections.join('\n\n')}\n`
    const updatedBody = replaceOrPrependVersionSection(
      await readChangelogBody(),
      newSection,
      heading,
    )
    await writeFile('CHANGELOG.md', `# Releases\n\n${updatedBody}`, 'utf-8')

    console.log('Release notes written to CHANGELOG.md')
  } catch (err) {
    console.error('Failed to aggregate changelogs:', err)
    process.exit(1)
  }
}

main()
