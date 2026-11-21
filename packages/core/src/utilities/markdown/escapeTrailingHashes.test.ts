import { describe, expect, it } from 'vite-plus/test'

import { escapeTrailingHashes } from './escapeTrailingHashes.js'

describe('escapeTrailingHashes', () => {
  it('escapes a trailing closing sequence', () => {
    expect(escapeTrailingHashes('Title ##')).toBe('Title \\#\\#')
    expect(escapeTrailingHashes('Title #')).toBe('Title \\#')
    expect(escapeTrailingHashes('##')).toBe('\\#\\#')
  })

  it('keeps trailing spaces', () => {
    expect(escapeTrailingHashes('Title ##  ')).toBe('Title \\#\\#  ')
  })

  it('leaves hashes attached to words alone', () => {
    expect(escapeTrailingHashes('C#')).toBe('C#')
    expect(escapeTrailingHashes('Title #hashtag')).toBe('Title #hashtag')
    expect(escapeTrailingHashes('Title')).toBe('Title')
    expect(escapeTrailingHashes('')).toBe('')
  })

  it('leaves already escaped hashes alone', () => {
    expect(escapeTrailingHashes('Title \\#')).toBe('Title \\#')
  })
})
