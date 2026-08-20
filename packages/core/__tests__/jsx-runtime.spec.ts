import { describe, expect, it } from 'vitest'

import { jsx, jsxs } from '../src/jsx-runtime.js'

describe('JSX runtime', () => {
  it('keeps text and element siblings separate', () => {
    const element = jsx('strong', { children: 'text' })

    expect(jsxs('p', { children: ['Before ', element] })).toEqual([
      'p',
      {},
      'Before ',
      ['strong', {}, 'text'],
    ])
  })

  it('keeps text and slot siblings separate', () => {
    const slot = jsx('slot', {})

    expect(jsxs('p', { children: ['Before ', slot] })).toEqual(['p', {}, 'Before ', 0])
  })
})
