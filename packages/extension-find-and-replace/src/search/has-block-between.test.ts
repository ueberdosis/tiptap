import { describe, expect, it } from 'vite-plus/test'

import { createContinuedDoc, paragraph } from '../../tests/utils/createContinuedDoc.js'
import { hasBlockBetween } from './has-block-between.js'

describe('hasBlockBetween', () => {
  it('ignores nothing between two textblocks', () => {
    const doc = createContinuedDoc([paragraph('one'), paragraph('two')])

    expect(hasBlockBetween(doc, 5, 5)).toBe(false)
  })

  it('ignores parents that close and open between two textblocks', () => {
    const doc = createContinuedDoc([
      { type: 'blockquote', content: [paragraph('one')] },
      { type: 'blockquote', content: [paragraph('two')] },
    ])

    expect(hasBlockBetween(doc, 6, 8)).toBe(false)
  })

  it('finds a block between two textblocks', () => {
    const doc = createContinuedDoc([paragraph('one'), { type: 'horizontalRule' }, paragraph('two')])

    expect(hasBlockBetween(doc, 5, 6)).toBe(true)
  })
})
