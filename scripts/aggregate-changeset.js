/* oslint-disable */

import { execFile as execFileCallback } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import fg from 'fast-glob'
import getReleasePlan from '@changesets/get-release-plan'
import changelog from './changeset-changelog.cjs'
import { getReleaseHeading } from './get-release-heading.js'
import { replaceOrPrependVersionSection } from './replace-or-prepend-version-section.js'

const execFile = promisify(execFileCallback)

async function getChangesetCommit(cwd, changesetId) {
  const candidates = [`.changeset/${changesetId}.md`, `.changeset/${changesetId}/changes.json`]

  for (const filePath of candidates) {
    try {
      const { stdout } = await execFile(
        'git',
        ['log', '--diff-filter=A', '--format=%H', '-n', '1', '--', filePath],
        {
          cwd,
        },
      )
      const commit = stdout.trim()

      if (commit) return commit
    } catch {}
  }

  return undefined
}

async function addCommitsToChangesets(cwd, changesets) {
  return Promise.all(
    changesets.map(async changeset => ({
      ...changeset,
      commit: await getChangesetCommit(cwd, changeset.id),
    })),
  )
}

async function loadWorkspacePackages(cwd) {
  const packageFiles = await fg(['packages/*/package.json', 'demos/package.json'], {
    cwd,
    absolute: true,
  })

  const packages = new Map()

  for (const packageFile of packageFiles) {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf-8'))

    if (!packageJson.name) continue

    packages.set(packageJson.name, {
      dir: path.dirname(packageFile),
      packageJson,
    })
  }

  return packages
}

async function getPackageChangelogEntry(release, changesets) {
  if (release.type === 'none') return null

  const changelogLines = {
    major: [],
    minor: [],
    patch: [],
  }

  for (const changeset of changesets) {
    const changesetRelease = changeset.releases.find(item => item.name === release.name)

    if (changesetRelease && changesetRelease.type !== 'none') {
      changelogLines[changesetRelease.type].push(
        changelog.getReleaseLine(changeset, changesetRelease.type),
      )
    }
  }

  const sections = []

  for (const type of ['major', 'minor', 'patch']) {
    const lines = (await Promise.all(changelogLines[type]))
      .map(line => line?.trim())
      .filter(Boolean)

    if (lines.length > 0) {
      sections.push(`### ${type[0].toUpperCase()}${type.slice(1)} Changes\n\n${lines.join('\n')}\n`)
    }
  }

  if (sections.length === 0) return null

  return [`## ${release.newVersion}`, ...sections].join('\n')
}

function renderPackageSection(name, entry) {
  const body = entry
    .replace(/^##\s+.*\n+/, '')
    .split('\n')
    .map(line => line.replace(/^(#{1,5})\s/, '$1# '))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return `### ${name}\n\n${body}`
}

function renderReleaseNotes(heading, sections) {
  return (
    [
      '# Releases',
      '',
      `## ${heading}`,
      '',
      ...sections.flatMap((section, index) =>
        index === sections.length - 1 ? [section] : [section, ''],
      ),
    ].join('\n') + '\n'
  )
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
    const cwd = process.cwd()
    const plan = await getReleasePlan(cwd)

    if (!plan || !Array.isArray(plan.changesets) || plan.changesets.length === 0) {
      console.log('No changesets found — skipping changelog generation')
      return
    }

    const packageMap = await loadWorkspacePackages(cwd)
    const releasesWithPackages = plan.releases
      .filter(release => {
        const pkg = packageMap.get(release.name)
        return !!pkg
      })
      .map(release => {
        const pkg = packageMap.get(release.name)

        return {
          ...release,
          ...pkg,
        }
      })
      // Ignore private packages like the demos package
      .filter(release => release.type !== 'none' && !release.packageJson.private)

    const changesetsWithCommits = await addCommitsToChangesets(cwd, plan.changesets)
    const sections = []

    for (const release of releasesWithPackages) {
      const entry = await getPackageChangelogEntry(release, changesetsWithCommits)

      if (entry) {
        sections.push(renderPackageSection(release.name, entry))
      }
    }

    if (sections.length === 0) {
      console.log(
        'No package changelog entries generated — skipping aggregate changelog generation',
      )
      return
    }

    const heading = getReleaseHeading(releasesWithPackages)
    const output = renderReleaseNotes(heading, sections)
    const existingBody = await readChangelogBody()
    const newSection = output.split('\n').slice(2).join('\n').trimEnd() + '\n'
    const updatedBody = replaceOrPrependVersionSection(existingBody, newSection, heading)
    await writeFile('CHANGELOG.md', `# Releases\n\n${updatedBody}`, 'utf-8')

    console.log('Release notes written to CHANGELOG.md')
  } catch (err) {
    console.error('Failed to aggregate changesets:', err)
    process.exit(1)
  }
}

main()
