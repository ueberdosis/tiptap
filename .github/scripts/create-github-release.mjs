#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { getChangelogSection } from './get-changelog-section.mjs'
import { runIfCalledDirectly } from './run-if-called-directly.mjs'

/**
 * Finds the shared version of a publish.
 *
 * @param {{ name: string, version: string }[]} publishedPackages
 * @returns {string | undefined} Undefined when the fixed package group was not published.
 */
export function getReleaseVersion(publishedPackages) {
  return publishedPackages.find(item => item.name === '@tiptap/core')?.version
}

/**
 * Builds the release notes for a tag from the root changelog.
 *
 * @param {string} changelog - Content of the root CHANGELOG.md.
 * @param {string} tag - Version tag like `v3.32.0`.
 * @returns {string} The notes without the version heading or commit hashes.
 * @throws {Error} When the changelog has no section for the tag.
 */
export function getReleaseNotes(changelog, tag) {
  const section = getChangelogSection(changelog, tag)

  if (!section) throw new Error(`No section for ${tag} in CHANGELOG.md`)

  return section.replace(/^.*\n*/, '').replace(/^- [0-9a-f]{7}: /gm, '- ')
}

/**
 * Picks the `gh release create` flags that match how a version was published.
 *
 * @param {string} version - Published version.
 * @param {string} distTag - npm dist tag of the publish.
 * @returns {string[]}
 */
export function getReleaseFlags(version, distTag) {
  const flags = []

  if (version.includes('-')) flags.push('--prerelease')
  if (distTag !== 'latest') flags.push('--latest=false')

  return flags
}

function releaseExists(tag) {
  try {
    execFileSync('gh', ['release', 'view', tag], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function main() {
  const { PUBLISHED_PACKAGES, DIST_TAG, GITHUB_SHA, GITHUB_OUTPUT } = process.env
  const version = getReleaseVersion(JSON.parse(PUBLISHED_PACKAGES))

  if (!version) {
    console.log('@tiptap/core was not published, skipping GitHub release')
    return
  }

  const tag = `v${version}`

  // Keeps the retry workflow safe to run twice
  if (releaseExists(tag)) {
    console.log(`Release ${tag} already exists, skipping`)
    return
  }

  const notes = getReleaseNotes(readFileSync('CHANGELOG.md', 'utf8'), tag)

  execFileSync(
    'gh',
    [
      'release',
      'create',
      tag,
      '--target',
      GITHUB_SHA,
      '--title',
      tag,
      '--notes',
      notes,
      ...getReleaseFlags(version, DIST_TAG),
    ],
    { stdio: 'inherit' },
  )

  if (GITHUB_OUTPUT) appendFileSync(GITHUB_OUTPUT, `tag=${tag}\n`)
}

runIfCalledDirectly(import.meta.url, main)
