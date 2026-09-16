import { describe, expect, test } from 'vite-plus/test'

import { isValidColor } from './isValidColor.js'

const maliciousColor =
  'red; position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483647; background:black'

describe('isValidColor', () => {
  // we only expect 6-digit hex values because thats
  // what y-tiptap is exposing to the client
  test.each(['#ffffff', '#1a2b3c', '#ABCDEF'])('returns true for a six-digit hex color', color => {
    expect(isValidColor(color)).toBe(true)
  })

  test.each([
    null,
    undefined,
    '#fff',
    '#ffff',
    '#ffffffff',
    'red',
    'rgb(255, 0, 0)',
    maliciousColor,
    'red; background-image: url(https://example.com)',
    'red } body { display: none',
  ])('returns false for an unsupported color', color => {
    expect(isValidColor(color)).toBe(false)
  })
})
