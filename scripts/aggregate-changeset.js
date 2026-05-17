/* eslint-disable */

import { execFile as execFileCallback } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import fg from 'fast-glob'
import getReleasePlan from '@changesets/get-release-plan'

const execFile = promisify(execFileCallback)
const require = createRequire(import.meta.url)
const resolveFromWorkspace = request =>
  require.resolve(request, { paths: [process.cwd(), require.resolve('@changesets/cli/changelog')] })
const semverSatisfies = require(resolveFromWorkspace('semver/functions/satisfies'))
const validRange = require(resolveFromWorkspace('semver/ranges/valid'))

function normalizeChangelogOption(changelog) {
  if (changelog === false) return false
  if (typeof changelog === 'string') return [changelog, null]
  return changelog
}

async function readChangesetConfig() {
  const content = await readFile('.changeset/config.json', 'utf-8')
  const json = JSON.parse(content)

  return {
    ...json,
    changelog: normalizeChangelogOption(json.changelog === undefined ? '@changesets/cli/changelog' : json.changelog),
  }
}

function resolveModuleFrom(fromDir, request) {
  const fromRequire = createRequire(path.join(fromDir, '__changeset_resolver__.js'))
  return fromRequire.resolve(request)
}

async function loadChangelogGenerator(cwd) {
  const config = await readChangesetConfig()

  if (!config.changelog) {
    return {
      config,
      changelogFunctions: null,
      changelogOpts: null,
    }
  }

  const [modulePath, changelogOpts] = config.changelog
  const changesetDir = path.join(cwd, '.changeset')

  let resolvedPath

  try {
    resolvedPath = resolveModuleFrom(changesetDir, modulePath)
  } catch {
    resolvedPath = resolveModuleFrom(cwd, modulePath)
  }

  let mod = await import(pathToFileURL(resolvedPath).href)
  mod = mod.default ?? mod
  mod = mod.default ?? mod

  if (typeof mod.getReleaseLine !== 'function' || typeof mod.getDependencyReleaseLine !== 'function') {
    throw new Error(`Could not resolve changelog generation functions from ${modulePath}`)
  }

  return {
    config,
    changelogFunctions: mod,
    changelogOpts,
  }
}

async function getChangesetCommit(cwd, changesetId) {
  const candidates = [`.changeset/${changesetId}.md`, `.changeset/${changesetId}/changes.json`]

  for (const filePath of candidates) {
    try {
      const { stdout } = await execFile('git', ['log', '--diff-filter=A', '--format=%H', '-n', '1', '--', filePath], {
        cwd,
      })
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
  const packageFiles = await fg(['packages/*/package.json', 'packages-deprecated/*/package.json'], {
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

function getBumpLevel(type) {
  const level = ['none', 'patch', 'minor', 'major'].indexOf(type)

  if (level < 0) {
    throw new Error(`Unrecognised bump type ${type}`)
  }

  return level
}

function shouldUpdateDependencyBasedOnConfig(cwd, release, dependency, config) {
  let { depVersionRange } = dependency
  const usesWorkspaceRange = depVersionRange.startsWith('workspace:')

  if (usesWorkspaceRange) {
    depVersionRange = depVersionRange.replace(/^workspace:/, '')

    switch (depVersionRange) {
      case '*':
        return true
      case '^':
      case '~':
        depVersionRange = `${depVersionRange}${release.oldVersion}`
        break
      default:
        if (!validRange(depVersionRange)) {
          return path.posix.normalize(depVersionRange) === path.relative(cwd, release.dir).replaceAll('\\', '/')
        }
    }
  }

  if (!semverSatisfies(release.version, depVersionRange)) {
    return true
  }

  let shouldUpdate = getBumpLevel(release.type) >= getBumpLevel(config.minReleaseType)

  if (dependency.depType === 'peerDependencies') {
    shouldUpdate = !config.onlyUpdatePeerDependentsWhenOutOfRange
  }

  return shouldUpdate
}

async function getPackageChangelogEntry(cwd, release, releases, changesets, changelogFunctions, changelogOpts, config) {
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
        changelogFunctions.getReleaseLine(changeset, changesetRelease.type, changelogOpts),
      )
    }
  }

  const dependentReleases = releases.filter(otherRelease => {
    const dependencyVersionRange = release.packageJson.dependencies?.[otherRelease.name]
    const peerDependencyVersionRange = release.packageJson.peerDependencies?.[otherRelease.name]
    const versionRange = dependencyVersionRange || peerDependencyVersionRange
    const usesWorkspaceRange = versionRange?.startsWith('workspace:')

    return (
      versionRange &&
      (usesWorkspaceRange || validRange(versionRange) !== null) &&
      shouldUpdateDependencyBasedOnConfig(
        cwd,
        {
          type: otherRelease.type,
          version: otherRelease.newVersion,
          oldVersion: otherRelease.oldVersion,
          dir: otherRelease.dir,
        },
        {
          depVersionRange: versionRange,
          depType: dependencyVersionRange ? 'dependencies' : 'peerDependencies',
        },
        {
          minReleaseType: config.updateInternalDependencies,
          onlyUpdatePeerDependentsWhenOutOfRange: config.onlyUpdatePeerDependentsWhenOutOfRange,
        },
      )
    )
  })

  const relevantChangesetIds = new Set()

  for (const dependentRelease of dependentReleases) {
    for (const changesetId of dependentRelease.changesets) {
      relevantChangesetIds.add(changesetId)
    }
  }

  const relevantChangesets = changesets.filter(changeset => relevantChangesetIds.has(changeset.id))

  changelogLines.patch.push(
    changelogFunctions.getDependencyReleaseLine(relevantChangesets, dependentReleases, changelogOpts),
  )

  const sections = []

  for (const type of ['major', 'minor', 'patch']) {
    const lines = (await Promise.all(changelogLines[type])).map(line => line?.trim()).filter(Boolean)

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

function renderReleaseNotes(version, sections) {
  return (
    [
      '# Releases',
      '',
      `## v${version}`,
      '',
      ...sections.flatMap((section, index) => (index === sections.length - 1 ? [section] : [section, ''])),
    ].join('\n') + '\n'
  )
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
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const existing = body || ''
  const newTrim = newSection.trim()

  if (!existing.trim()) {
    return `${newTrim}\n\n`
  }

  const headerRe = new RegExp(`^## v${escapeRegExp(version)}\\b`, 'm')
  const headerMatch = headerRe.exec(existing)

  if (!headerMatch) {
    return `${newTrim}\n\n${existing}`
  }

  const startIndex = headerMatch.index
  const rest = existing.slice(startIndex + headerMatch[0].length)
  const nextHeaderRe = /^#{1,2}\s.*$/m
  const nextMatch = nextHeaderRe.exec(rest)

  const endIndex = nextMatch ? startIndex + headerMatch[0].length + nextMatch.index : existing.length
  const before = existing.slice(0, startIndex)
  const after = existing.slice(endIndex)

  return `${before}${newTrim}\n\n${after}`
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

    const version = plan.releases && plan.releases[0] ? plan.releases[0].newVersion : 'unreleased'
    const { config, changelogFunctions, changelogOpts } = await loadChangelogGenerator(cwd)

    if (!changelogFunctions) {
      console.log(
        'Changelog generation is disabled in .changeset/config.json — skipping aggregate changelog generation',
      )
      return
    }

    const packageMap = await loadWorkspacePackages(cwd)
    const releasesWithPackages = plan.releases
      .map(release => {
        const pkg = packageMap.get(release.name)

        if (!pkg) {
          throw new Error(`Could not find package metadata for ${release.name}`)
        }

        return {
          ...release,
          ...pkg,
        }
      })
      .filter(release => release.type !== 'none')

    const changesetsWithCommits = await addCommitsToChangesets(cwd, plan.changesets)
    const aggregateConfig = {
      updateInternalDependencies: config.updateInternalDependencies === 'minor' ? 'minor' : 'patch',
      onlyUpdatePeerDependentsWhenOutOfRange: Boolean(
        config.___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH?.onlyUpdatePeerDependentsWhenOutOfRange,
      ),
    }

    const sections = []

    for (const release of releasesWithPackages) {
      const entry = await getPackageChangelogEntry(
        cwd,
        release,
        releasesWithPackages,
        changesetsWithCommits,
        changelogFunctions,
        changelogOpts,
        aggregateConfig,
      )

      if (entry) {
        sections.push(renderPackageSection(release.name, entry))
      }
    }

    if (sections.length === 0) {
      console.log('No package changelog entries generated — skipping aggregate changelog generation')
      return
    }

    const output = renderReleaseNotes(version, sections)
    const existingBody = await readChangelogBody()
    const newSection = output.split('\n').slice(2).join('\n').trimEnd() + '\n'
    const updatedBody = replaceOrPrependVersionSection(existingBody, newSection, version)
    await writeFile('CHANGELOG.md', `# Releases\n\n${updatedBody}`, 'utf-8')

    console.log('Release notes written to CHANGELOG.md')
  } catch (err) {
    console.error('Failed to aggregate changesets:', err)
    process.exit(1)
  }
}

main()
