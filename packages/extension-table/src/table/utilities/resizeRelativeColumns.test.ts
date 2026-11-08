import { describe, expect, it } from 'vite-plus/test'

import { resizeRelativeColumns } from './resizeRelativeColumns.js'

const base = { widths: [200, 200, 200], minWidth: 25, width: 60, containerWidth: 1000 }

describe('resizeRelativeColumns', () => {
  it('moves width from the right neighbour when an inner border is dragged', () => {
    expect(resizeRelativeColumns({ ...base, column: 0, delta: 50 })).toEqual({
      widths: [250, 150, 200],
      width: 60,
    })
  })

  it('keeps both neighbours at the minimum width', () => {
    expect(resizeRelativeColumns({ ...base, column: 1, delta: 500 }).widths).toEqual([200, 375, 25])
    expect(resizeRelativeColumns({ ...base, column: 1, delta: -500 }).widths).toEqual([
      200, 25, 375,
    ])
  })

  it('changes the table width when the last border is dragged', () => {
    expect(resizeRelativeColumns({ ...base, column: 2, delta: 100 })).toEqual({
      widths: [200, 200, 300],
      width: 70,
    })
  })

  it('does not shrink the last column below the minimum width', () => {
    expect(resizeRelativeColumns({ ...base, column: 2, delta: -500 })).toEqual({
      widths: [200, 200, 25],
      width: 42.5,
    })
  })
})
