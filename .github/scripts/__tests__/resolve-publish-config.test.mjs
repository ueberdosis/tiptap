import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { resolveConfig } from '../resolve-publish-config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ACTUAL_CONFIG_PATH = join(__dirname, '..', '..', 'publish-config.json')

let tmpDir
let configPath

before(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'publish-config-test-'))
  configPath = join(tmpDir, 'publish-config.json')
})

after(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

function writeConfig(data) {
  writeFileSync(configPath, JSON.stringify(data, null, 2))
}

describe('real publish-config.json', () => {
  let actualConfig

  before(() => {
    const raw = readFileSync(ACTUAL_CONFIG_PATH, 'utf8')
    actualConfig = JSON.parse(raw)
  })

  it('is valid JSON and contains a branches object', () => {
    assert.ok(actualConfig.branches, 'missing branches object')
    assert.ok(typeof actualConfig.branches === 'object', 'branches must be an object')
  })

  it('has at least one configured branch', () => {
    const names = Object.keys(actualConfig.branches)
    assert.ok(names.length > 0, 'publish-config.json has no branches configured')
  })

  it('every branch entry has all required string fields', () => {
    const required = ['distTag', 'label', 'title', 'commit']
    for (const [name, entry] of Object.entries(actualConfig.branches)) {
      for (const field of required) {
        assert.ok(
          entry[field] && typeof entry[field] === 'string',
          `Branch "${name}" is missing required string field "${field}"`,
        )
      }
    }
  })

  it('resolves each configured branch through the resolver', () => {
    for (const name of Object.keys(actualConfig.branches)) {
      const result = resolveConfig(name, ACTUAL_CONFIG_PATH)
      assert.equal(result.configured, true, `Branch "${name}" should resolve as configured`)
      assert.equal(result.distTag, actualConfig.branches[name].distTag)
      assert.equal(result.label, actualConfig.branches[name].label)
      assert.equal(result.title, actualConfig.branches[name].title)
      assert.equal(result.commit, actualConfig.branches[name].commit)
    }
  })
})

describe('unknown branches', () => {
  it('returns configured=false for a branch with no entry', () => {
    writeConfig({
      branches: { known: { distTag: 'x', label: 'stable', title: 'T', commit: 'c' } },
    })
    const result = resolveConfig('unknown', configPath)
    assert.equal(result.configured, false)
  })

  it('does not match partial branch names', () => {
    writeConfig({
      branches: { main: { distTag: 'x', label: 'stable', title: 'T', commit: 'c' } },
    })
    const result = resolveConfig('main-foo', configPath)
    assert.equal(result.configured, false)
  })

  it('returns only configured=false for an unknown branch', () => {
    writeConfig({ branches: {} })
    const result = resolveConfig('anything', configPath)
    assert.deepEqual(result, { configured: false })
  })
})

describe('validation errors', () => {
  it('fails when a required field is missing', () => {
    writeConfig({ branches: { main: { distTag: 'latest', label: 'stable' } } })
    assert.throws(() => resolveConfig('main', configPath), /missing required/i)
  })

  it('fails when a required field is not a string', () => {
    writeConfig({
      branches: { main: { distTag: 'latest', label: 123, title: null, commit: 'ok' } },
    })
    assert.throws(() => resolveConfig('main', configPath), /missing required/i)
  })

  it('fails when config has no branches object', () => {
    writeConfig({})
    assert.throws(() => resolveConfig('main', configPath), /branches/)
  })

  it('fails when branches is an array instead of an object', () => {
    writeConfig({ branches: [] })
    assert.throws(() => resolveConfig('any', configPath), /branches/)
  })

  it('fails when config file is malformed JSON', () => {
    writeFileSync(configPath, 'not-json')
    assert.throws(() => resolveConfig('main', configPath), /Failed to read or parse/)
  })

  it('fails when config file does not exist', () => {
    assert.throws(
      () => resolveConfig('main', join(tmpDir, 'nonexistent.json')),
      /Failed to read or parse/,
    )
  })
})
