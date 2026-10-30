import { describe, expect, it } from 'vite-plus/test'

import { createContinuedDoc, paragraph } from '../../tests/utils/createContinuedDoc.js'
import { resultInTextblocks } from './resultInTextblocks.js'
import type { TextblockRange } from './types.js'

describe('resultInTextblocks', () => {
  const doc = createContinuedDoc([paragraph('one'), paragraph('two', true), paragraph('three')])
  const textblocks: TextblockRange[] = [
    { node: doc.child(0), pos: 0, from: 0, to: 5 },
    { node: doc.child(2), pos: 10, from: 10, to: 17 },
  ]

  it('finds a result inside a textblock', () => {
    expect(resultInTextblocks({ from: 11, to: 16 }, textblocks)).toBe(true)
  })

  it('finds a result that runs out of a textblock', () => {
    expect(resultInTextblocks({ from: 2, to: 8 }, textblocks)).toBe(true)
  })

  it('ignores a result in another textblock', () => {
    expect(resultInTextblocks({ from: 6, to: 9 }, textblocks)).toBe(false)
  })
})
