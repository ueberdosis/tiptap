import { afterEach, describe, expect, it, vi } from 'vitest'

import { isAndroid } from '../utilities/isAndroid.js'

function mockNavigator(platform: string, userAgent: string) {
  vi.stubGlobal('navigator', { platform, userAgent })
}

describe('isAndroid', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('detects Android via userAgent', () => {
    mockNavigator('Linux armv8l', 'Mozilla/5.0 (Linux; Android 13; Pixel 7)')
    expect(isAndroid()).toBe(true)
  })

  it('detects Android via platform', () => {
    mockNavigator('Android', 'Mozilla/5.0 (X11; Linux x86_64)')
    expect(isAndroid()).toBe(true)
  })

  it('returns false for non-Android platforms', () => {
    mockNavigator('MacIntel', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
    expect(isAndroid()).toBe(false)
  })
})
