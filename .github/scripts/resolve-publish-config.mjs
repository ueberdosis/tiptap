#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_CONFIG_PATH = join(__dirname, '..', 'publish-config.json')
const REQUIRED_FIELDS = ['distTag', 'label', 'title', 'commit']

/** @typedef {{ distTag: string, label: string, title: string, commit: string }} BranchEntry */

/**
 * Reads and parses the publish config JSON file.
 * @param {string} configPath
 * @returns {object}
 */
function readConfig(configPath) {
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'))
  } catch (err) {
    throw new Error(`Failed to read or parse ${configPath}: ${err.message}`)
  }
}

/**
 * Validates that the config has a "branches" object.
 * @param {object} config
 */
function requireBranchesObject(config) {
  if (!config.branches || typeof config.branches !== 'object' || Array.isArray(config.branches)) {
    throw new Error('publish-config.json must contain a "branches" object')
  }
}

/**
 * Validates that a branch entry has all required string fields.
 * @param {string} branch
 * @param {BranchEntry} entry
 */
function requireValidEntry(branch, entry) {
  for (const field of REQUIRED_FIELDS) {
    if (!entry[field] || typeof entry[field] !== 'string') {
      throw new Error(
        `Branch "${branch}" is missing required string field "${field}" in publish-config.json`,
      )
    }
  }
}

/**
 * Looks up a branch in the publish config and returns its release settings.
 *
 * @param {string} branch - Branch name to look up (exact match).
 * @param {string} [configPath] - Path to publish-config.json. Defaults to the
 *   canonical location next to the scripts directory.
 * @returns {{ configured: false } | { configured: true, distTag: string, label: string, title: string, commit: string }}
 * @throws {Error} When the config cannot be read/parsed or a required field is missing.
 */
export function resolveConfig(branch, configPath = DEFAULT_CONFIG_PATH) {
  const config = readConfig(configPath)
  requireBranchesObject(config)

  const entry = config.branches[branch]
  if (!entry) {
    return { configured: false }
  }

  requireValidEntry(branch, entry)

  return {
    configured: true,
    distTag: entry.distTag,
    label: entry.label,
    title: entry.title,
    commit: entry.commit,
  }
}

// ── CLI entry point ───────────────────────────────────────────
// When run as `node resolve-publish-config.mjs <branch>`, emits
// key=value lines suitable for GitHub Actions step outputs.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const branch = process.argv[2]
  if (!branch) {
    console.error('Usage: node resolve-publish-config.mjs <branch-name> [config-path]')
    process.exit(1)
  }

  const configPath = process.argv[3] || DEFAULT_CONFIG_PATH

  try {
    const result = resolveConfig(branch, configPath)
    for (const [key, value] of Object.entries(result)) {
      // Convert camelCase to snake_case for GitHub Actions output keys
      const actionsKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      console.log(`${actionsKey}=${value}`)
    }
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}
