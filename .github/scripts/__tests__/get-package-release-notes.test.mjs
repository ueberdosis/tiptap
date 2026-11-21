import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getPackageReleaseNotes } from '../../../scripts/get-package-release-notes.js'

const changelog = `# Change Log

## 3.1.0

### Minor Changes

- abc1234: Add a feature

### Patch Changes

- def5678: Fix a bug

## 3.0.1

No changes in this release.

## 3.0.0

### Major Changes

- 1234abc: Remove an API
`

describe('getPackageReleaseNotes', () => {
  it('copies only the requested version and moves headings one level down', () => {
    assert.equal(
      getPackageReleaseNotes(changelog, '3.1.0'),
      '#### Minor Changes\n\n- abc1234: Add a feature\n\n#### Patch Changes\n\n- def5678: Fix a bug',
    )
  })

  it('copies the last version in the file', () => {
    assert.equal(
      getPackageReleaseNotes(changelog, '3.0.0'),
      '#### Major Changes\n\n- 1234abc: Remove an API',
    )
  })

  it('skips versions without changes', () => {
    assert.equal(getPackageReleaseNotes(changelog, '3.0.1'), '')
  })

  it('returns nothing for an unknown version', () => {
    assert.equal(getPackageReleaseNotes(changelog, '9.9.9'), '')
  })

  it('does not match a version that only starts with the requested one', () => {
    assert.equal(getPackageReleaseNotes('## 3.1.0-next.0\n\n### Minor Changes\n\n- a', '3.1.0'), '')
  })
})
