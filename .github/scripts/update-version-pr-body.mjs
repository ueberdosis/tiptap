#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { getChangelogSection } from './get-changelog-section.mjs'
import { runIfCalledDirectly } from './run-if-called-directly.mjs'

const RELEASES_HEADING = '# Releases'

/**
 * Replaces the package list of a version PR with the aggregated changelog section.
 *
 * @param {string} body - Current PR body written by the changesets action.
 * @param {string} section - Newest section of the root changelog.
 * @returns {string} The action's intro followed by the section.
 */
export function getVersionPrBody(body, section) {
  const [intro] = body.split(`\n${RELEASES_HEADING}`)

  return `${intro.trimEnd()}\n\n${RELEASES_HEADING}\n\n${section}\n`
}

function main() {
  const { PR_NUMBER } = process.env
  const body = execFileSync('gh', ['pr', 'view', PR_NUMBER, '--json', 'body', '--jq', '.body'], {
    encoding: 'utf8',
  })
  const section = getChangelogSection(readFileSync('CHANGELOG.md', 'utf8'))

  execFileSync('gh', ['pr', 'edit', PR_NUMBER, '--body', getVersionPrBody(body, section)], {
    stdio: 'inherit',
  })
}

runIfCalledDirectly(import.meta.url, main)
