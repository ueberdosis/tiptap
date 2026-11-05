import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getChangelogSection } from '../get-changelog-section.mjs'
import { getReleaseFlags, getReleaseNotes, getReleaseVersion } from '../create-github-release.mjs'
import { getVersionPrBody } from '../update-version-pr-body.mjs'

const changelog = `# Releases

## v3.1.0

### @tiptap/core

#### Minor Changes

- abc1234: New feature.
  - nested 1234567: text

## v3.0.0

### @tiptap/react

#### Patch Changes

- def5678: Old fix.
`

describe('getChangelogSection', () => {
  it('returns the newest section by default', () => {
    const section = getChangelogSection(changelog)

    assert.ok(section.startsWith('## v3.1.0'))
    assert.ok(!section.includes('v3.0.0'))
  })

  it('returns the last section up to the end of the file', () => {
    const section = getChangelogSection(changelog, 'v3.0.0')

    assert.ok(section.startsWith('## v3.0.0'))
    assert.ok(section.endsWith('- def5678: Old fix.'))
  })

  it('returns an empty string for an unknown tag', () => {
    assert.equal(getChangelogSection(changelog, 'v9.9.9'), '')
  })

  it('does not match a tag that only starts the same', () => {
    assert.equal(getChangelogSection(changelog, 'v3.1'), '')
  })
})

describe('getReleaseVersion', () => {
  it('uses the @tiptap/core version', () => {
    const version = getReleaseVersion([
      { name: '@tiptap/y-tiptap', version: '3.0.14' },
      { name: '@tiptap/core', version: '3.1.0' },
    ])

    assert.equal(version, '3.1.0')
  })

  it('returns undefined when @tiptap/core was not published', () => {
    assert.equal(getReleaseVersion([{ name: '@tiptap/y-tiptap', version: '3.0.14' }]), undefined)
  })
})

describe('getReleaseNotes', () => {
  it('removes the heading and commit hashes', () => {
    const notes = getReleaseNotes(changelog, 'v3.1.0')

    assert.ok(notes.startsWith('### @tiptap/core'))
    assert.ok(notes.includes('- New feature.'))
    assert.ok(!notes.includes('abc1234'))
  })

  it('keeps hash-like text that is not a list prefix', () => {
    assert.ok(getReleaseNotes(changelog, 'v3.1.0').includes('nested 1234567: text'))
  })

  it('throws when the section is missing', () => {
    assert.throws(() => getReleaseNotes(changelog, 'v9.9.9'), /No section for v9\.9\.9/)
  })
})

describe('getReleaseFlags', () => {
  it('marks a stable latest release with no flags', () => {
    assert.deepEqual(getReleaseFlags('3.1.0', 'latest'), [])
  })

  it('marks next versions as pre-releases and not latest', () => {
    assert.deepEqual(getReleaseFlags('4.0.0-next.1', 'next'), ['--prerelease', '--latest=false'])
  })

  it('does not mark older stable lines as latest', () => {
    assert.deepEqual(getReleaseFlags('2.27.4', 'v2-latest'), ['--latest=false'])
  })
})

describe('getVersionPrBody', () => {
  it('keeps the intro and replaces the package list', () => {
    const body = getVersionPrBody(
      'Intro text.\n\nPre mode warning.\n\n# Releases\n## @tiptap/pm@3.0.0\n\nNo changes.',
      '## v3.1.0\n\n- Change.',
    )

    assert.equal(body, 'Intro text.\n\nPre mode warning.\n\n# Releases\n\n## v3.1.0\n\n- Change.\n')
  })
})
