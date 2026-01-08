import { describe, expect, it } from 'vitest'

import { minMax } from './minMax.js'

describe('minMax', () => {
  it('returns value when within range', () => {
    expect(minMax(5, 0, 10)).toBe(5)
    expect(minMax(3.5, 1, 5)).toBe(3.5)
  })

  it('returns min when value is below minimum', () => {
    expect(minMax(-5, 0, 10)).toBe(0)
    expect(minMax(2, 5, 10)).toBe(5)
  })

  it('returns max when value is above maximum', () => {
    expect(minMax(15, 0, 10)).toBe(10)
    expect(minMax(12, 5, 10)).toBe(10)
  })

  it('handles negative ranges', () => {
    expect(minMax(-5, -10, -2)).toBe(-5)
    expect(minMax(-15, -10, -2)).toBe(-10)
    expect(minMax(5, -10, -2)).toBe(-2)
  })

  it('handles zero values', () => {
    expect(minMax(0, 0, 10)).toBe(0)
    expect(minMax(0, -5, 5)).toBe(0)
    expect(minMax(0, 0, 0)).toBe(0)
  })

  it('handles decimal numbers', () => {
    expect(minMax(3.7, 2.5, 8.9)).toBe(3.7)
    expect(minMax(1.2, 2.5, 8.9)).toBe(2.5)
    expect(minMax(12.3, 2.5, 8.9)).toBe(8.9)
  })

  it('handles large numbers', () => {
    expect(minMax(1000, 500, 2000)).toBe(1000)
    expect(minMax(100, 500, 2000)).toBe(500)
    expect(minMax(3000, 500, 2000)).toBe(2000)
  })

  it('handles edge case where min equals max', () => {
    expect(minMax(5, 5, 5)).toBe(5)
    expect(minMax(3, 5, 5)).toBe(5)
    expect(minMax(7, 5, 5)).toBe(5)
  })

  it('handles case where min is greater than max by swapping bounds', () => {
    // When min > max, the bounds are swapped to ensure valid clamping
    // minMax(5, 10, 2) -> bounds swapped to [2, 10] -> 5 is within range
    expect(minMax(5, 10, 2)).toBe(5)
    // minMax(0, 10, 2) -> bounds swapped to [2, 10] -> 0 clamped to 2
    expect(minMax(0, 10, 2)).toBe(2)
    // minMax(15, 10, 2) -> bounds swapped to [2, 10] -> 15 clamped to 10
    expect(minMax(15, 10, 2)).toBe(10)
  })
})
