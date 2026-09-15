import { describe, expect, it } from 'vite-plus/test'

import { isUrlLike } from './isUrlLike.js'

describe('isUrlLike', () => {
  it('detects protocol URLs and www hosts', () => {
    expect(isUrlLike('https://example.com')).toBe(true)
    expect(isUrlLike('http://example.com/path')).toBe(true)
    expect(isUrlLike('mailto:info@example.com')).toBe(true)
    expect(isUrlLike('www.example.com')).toBe(true)
  })

  it('rejects bare filenames and labels', () => {
    expect(isUrlLike('LICENSE.md')).toBe(false)
    expect(isUrlLike('click here')).toBe(false)
  })
})
