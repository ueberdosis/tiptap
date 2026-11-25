import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getReleaseHeading } from '../../../scripts/get-release-heading.js'

describe('getReleaseHeading', () => {
  it('uses the @tiptap/core version when core is released', () => {
    const heading = getReleaseHeading([
      { name: '@tiptap/y-tiptap', newVersion: '3.0.14' },
      { name: '@tiptap/core', newVersion: '3.1.0' },
    ])

    assert.equal(heading, 'v3.1.0')
  })

  it('names each package when core is not released', () => {
    const heading = getReleaseHeading([
      { name: '@tiptap/y-tiptap', newVersion: '3.0.14' },
      { name: '@tiptap/ai-toolkit', newVersion: '1.2.0' },
    ])

    assert.equal(heading, '@tiptap/y-tiptap@3.0.14, @tiptap/ai-toolkit@1.2.0')
  })
})
