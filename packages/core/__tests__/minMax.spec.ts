import { minMax } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('minMax', () => {
  describe('basic clamping', () => {
    it('should return the value when within bounds', () => {
      expect(minMax(5, 0, 10)).toBe(5)
    })

    it('should return min when value is below min', () => {
      expect(minMax(-5, 0, 10)).toBe(0)
    })

    it('should return max when value is above max', () => {
      expect(minMax(15, 0, 10)).toBe(10)
    })

    it('should return min when value equals min', () => {
      expect(minMax(0, 0, 10)).toBe(0)
    })

    it('should return max when value equals max', () => {
      expect(minMax(10, 0, 10)).toBe(10)
    })
  })

  describe('edge cases', () => {
    it('should handle min equals max', () => {
      expect(minMax(5, 5, 5)).toBe(5)
      expect(minMax(0, 5, 5)).toBe(5)
      expect(minMax(10, 5, 5)).toBe(5)
    })

    it('should handle negative ranges', () => {
      expect(minMax(-5, -10, -1)).toBe(-5)
      expect(minMax(-15, -10, -1)).toBe(-10)
      expect(minMax(0, -10, -1)).toBe(-1)
    })

    it('should handle ranges crossing zero', () => {
      expect(minMax(0, -5, 5)).toBe(0)
      expect(minMax(-10, -5, 5)).toBe(-5)
      expect(minMax(10, -5, 5)).toBe(5)
    })

    it('should handle floating point values', () => {
      expect(minMax(1.5, 0.5, 2.5)).toBe(1.5)
      expect(minMax(0.1, 0.5, 2.5)).toBe(0.5)
      expect(minMax(3.0, 0.5, 2.5)).toBe(2.5)
    })
  })

  describe('min > max handling', () => {
    it('should swap bounds when min is greater than max', () => {
      // When min=10 and max=2, they should be swapped to min=2 and max=10
      expect(minMax(5, 10, 2)).toBe(5)
    })

    it('should clamp to swapped min when value is too low', () => {
      // min=10, max=2 -> swapped to min=2, max=10
      // value=0 should be clamped to 2
      expect(minMax(0, 10, 2)).toBe(2)
    })

    it('should clamp to swapped max when value is too high', () => {
      // min=10, max=2 -> swapped to min=2, max=10
      // value=15 should be clamped to 10
      expect(minMax(15, 10, 2)).toBe(10)
    })

    it('should handle negative inverted ranges', () => {
      // min=-1, max=-10 -> swapped to min=-10, max=-1
      expect(minMax(-5, -1, -10)).toBe(-5)
      expect(minMax(0, -1, -10)).toBe(-1)
      expect(minMax(-15, -1, -10)).toBe(-10)
    })
  })
})
