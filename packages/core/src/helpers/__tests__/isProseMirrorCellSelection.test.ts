import { describe, expect, it } from 'vitest'

import { isProseMirrorCellSelection } from '../isProseMirrorCellSelection.js'

describe('isProseMirrorCellSelection', () => {
  it('returns true for a value with the cell-iteration API', () => {
    expect(isProseMirrorCellSelection({ forEachCell: () => {} })).toBe(true)
  })

  it('returns false for other selections and values', () => {
    expect(isProseMirrorCellSelection(null)).toBe(false)
    expect(isProseMirrorCellSelection(undefined)).toBe(false)
    expect(isProseMirrorCellSelection({})).toBe(false)
    expect(isProseMirrorCellSelection('selection')).toBe(false)
    expect(isProseMirrorCellSelection(42)).toBe(false)
  })
})
