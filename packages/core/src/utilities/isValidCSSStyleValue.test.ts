import { describe, expect, test } from 'vite-plus/test'

import { isValidCSSStyleValue } from './isValidCSSStyleValue.js'

describe('isValidCSSStyleValue', () => {
  test.each([
    '#ffffff',
    'rgb(255, 0, 0)',
    'var(--text-color)',
    '"Comic Sans MS", sans-serif',
    'calc(1rem + 2px)',
  ])('accepts a single CSS value', value => {
    expect(isValidCSSStyleValue(value)).toBe(true)
  })

  test.each([null, undefined, 16, '', '   ', 'red; position: fixed', 'red } body { display: none'])(
    'rejects a value that can escape its declaration',
    value => {
      expect(isValidCSSStyleValue(value)).toBe(false)
    },
  )
})
