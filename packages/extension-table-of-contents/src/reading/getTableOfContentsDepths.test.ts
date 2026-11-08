import { describe, expect, it } from 'vite-plus/test'

import { getTableOfContentsDepths } from './getTableOfContentsDepths.js'

describe('getTableOfContentsDepths', () => {
  it('starts at depth 1 when the first level is not 1', () => {
    expect(getTableOfContentsDepths([2, 3])).toEqual([1, 2])
  })

  it('keeps the depths of a document that starts at level 1', () => {
    expect(getTableOfContentsDepths([1, 2, 3, 2])).toEqual([1, 2, 3, 2])
  })

  it('does not indent twice for a skipped level', () => {
    expect(getTableOfContentsDepths([2, 4, 5])).toEqual([1, 2, 3])
  })

  it('keeps siblings at the same depth', () => {
    expect(getTableOfContentsDepths([2, 3, 3, 3])).toEqual([1, 2, 2, 2])
  })

  it('goes back to the depth of a shallower level', () => {
    expect(getTableOfContentsDepths([2, 3, 4, 3, 2])).toEqual([1, 2, 3, 2, 1])
  })

  it('never returns a depth below 1 when a later level is shallower than the first', () => {
    expect(getTableOfContentsDepths([3, 2, 3])).toEqual([1, 1, 2])
  })

  it('returns an empty list for no levels', () => {
    expect(getTableOfContentsDepths([])).toEqual([])
  })
})
