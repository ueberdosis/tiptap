import { describe, expect, it } from 'vitest'

import { calculateEdgeDeduction, isNearEdge, normalizeEdgeDetection } from '../src/helpers/edgeDetection.js'

describe('normalizeEdgeDetection', () => {
  describe('presets', () => {
    it('should return default config for undefined', () => {
      const result = normalizeEdgeDetection(undefined)

      expect(result).toEqual({
        edges: ['left', 'top'],
        threshold: 12,
        strength: 500,
      })
    })

    it('should return left preset config', () => {
      const result = normalizeEdgeDetection('left')

      expect(result).toEqual({
        edges: ['left', 'top'],
        threshold: 12,
        strength: 500,
      })
    })

    it('should return right preset config', () => {
      const result = normalizeEdgeDetection('right')

      expect(result).toEqual({
        edges: ['right', 'top'],
        threshold: 12,
        strength: 500,
      })
    })

    it('should return both preset config', () => {
      const result = normalizeEdgeDetection('both')

      expect(result).toEqual({
        edges: ['left', 'right', 'top'],
        threshold: 12,
        strength: 500,
      })
    })

    it('should return none preset config', () => {
      const result = normalizeEdgeDetection('none')

      expect(result).toEqual({
        edges: [],
        threshold: 0,
        strength: 0,
      })
    })
  })

  describe('custom config', () => {
    it('should merge partial config with defaults', () => {
      const result = normalizeEdgeDetection({ threshold: 20 })

      expect(result).toEqual({
        edges: ['left', 'top'],
        threshold: 20,
        strength: 500,
      })
    })

    it('should merge partial config with custom edges', () => {
      const result = normalizeEdgeDetection({ edges: ['bottom'] })

      expect(result).toEqual({
        edges: ['bottom'],
        threshold: 12,
        strength: 500,
      })
    })

    it('should merge partial config with custom strength', () => {
      const result = normalizeEdgeDetection({ strength: 250 })

      expect(result).toEqual({
        edges: ['left', 'top'],
        threshold: 12,
        strength: 250,
      })
    })

    it('should accept full custom config', () => {
      const result = normalizeEdgeDetection({
        edges: ['right', 'bottom'],
        threshold: 30,
        strength: 1000,
      })

      expect(result).toEqual({
        edges: ['right', 'bottom'],
        threshold: 30,
        strength: 1000,
      })
    })

    it('should handle negative threshold values', () => {
      const result = normalizeEdgeDetection({ threshold: -16 })

      expect(result).toEqual({
        edges: ['left', 'top'],
        threshold: -16,
        strength: 500,
      })
    })
  })
})

describe('isNearEdge', () => {
  const mockElement = {
    getBoundingClientRect: () => ({
      left: 100,
      right: 300,
      top: 50,
      bottom: 150,
      width: 200,
      height: 100,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    }),
  } as HTMLElement

  describe('left edge', () => {
    const config = { edges: ['left' as const], threshold: 12, strength: 500 }

    it('should return true when cursor is near left edge', () => {
      const result = isNearEdge({ x: 105, y: 100 }, mockElement, config)

      expect(result).toBe(true)
    })

    it('should return false when cursor is far from left edge', () => {
      const result = isNearEdge({ x: 150, y: 100 }, mockElement, config)

      expect(result).toBe(false)
    })

    it('should return true when cursor is exactly at threshold', () => {
      const result = isNearEdge({ x: 111, y: 100 }, mockElement, config)

      expect(result).toBe(true)
    })

    it('should return false when cursor is just beyond threshold', () => {
      const result = isNearEdge({ x: 113, y: 100 }, mockElement, config)

      expect(result).toBe(false)
    })
  })

  describe('right edge', () => {
    const config = { edges: ['right' as const], threshold: 12, strength: 500 }

    it('should return true when cursor is near right edge', () => {
      const result = isNearEdge({ x: 295, y: 100 }, mockElement, config)

      expect(result).toBe(true)
    })

    it('should return false when cursor is far from right edge', () => {
      const result = isNearEdge({ x: 200, y: 100 }, mockElement, config)

      expect(result).toBe(false)
    })
  })

  describe('top edge', () => {
    const config = { edges: ['top' as const], threshold: 12, strength: 500 }

    it('should return true when cursor is near top edge', () => {
      const result = isNearEdge({ x: 200, y: 55 }, mockElement, config)

      expect(result).toBe(true)
    })

    it('should return false when cursor is far from top edge', () => {
      const result = isNearEdge({ x: 200, y: 100 }, mockElement, config)

      expect(result).toBe(false)
    })
  })

  describe('bottom edge', () => {
    const config = { edges: ['bottom' as const], threshold: 12, strength: 500 }

    it('should return true when cursor is near bottom edge', () => {
      const result = isNearEdge({ x: 200, y: 145 }, mockElement, config)

      expect(result).toBe(true)
    })

    it('should return false when cursor is far from bottom edge', () => {
      const result = isNearEdge({ x: 200, y: 100 }, mockElement, config)

      expect(result).toBe(false)
    })
  })

  describe('multiple edges', () => {
    const config = { edges: ['left' as const, 'top' as const], threshold: 12, strength: 500 }

    it('should return true when near any configured edge', () => {
      expect(isNearEdge({ x: 105, y: 100 }, mockElement, config)).toBe(true)
      expect(isNearEdge({ x: 200, y: 55 }, mockElement, config)).toBe(true)
    })

    it('should return false when not near any configured edge', () => {
      const result = isNearEdge({ x: 200, y: 100 }, mockElement, config)

      expect(result).toBe(false)
    })
  })

  describe('empty edges', () => {
    const config = { edges: [] as const[], threshold: 12, strength: 500 }

    it('should return false when edges array is empty', () => {
      const result = isNearEdge({ x: 100, y: 50 }, mockElement, config)

      expect(result).toBe(false)
    })
  })

  describe('negative threshold', () => {
    const config = { edges: ['left' as const], threshold: -10, strength: 500 }

    it('should require cursor to be further inside with negative threshold', () => {
      // At left edge (100), with -10 threshold, cursor at 105 is not "near"
      // because 105 - 100 = 5, which is not < -10
      expect(isNearEdge({ x: 105, y: 100 }, mockElement, config)).toBe(false)
      expect(isNearEdge({ x: 85, y: 100 }, mockElement, config)).toBe(true)
    })
  })
})

describe('calculateEdgeDeduction', () => {
  const mockElement = {
    getBoundingClientRect: () => ({
      left: 100,
      right: 300,
      top: 50,
      bottom: 150,
      width: 200,
      height: 100,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    }),
  } as HTMLElement

  const config = { edges: ['left' as const], threshold: 12, strength: 500 }

  it('should return 0 when element is null', () => {
    const result = calculateEdgeDeduction({ x: 105, y: 100 }, null, config, 2)

    expect(result).toBe(0)
  })

  it('should return 0 when edges array is empty', () => {
    const emptyConfig = { edges: [] as const[], threshold: 12, strength: 500 }
    const result = calculateEdgeDeduction({ x: 105, y: 100 }, mockElement, emptyConfig, 2)

    expect(result).toBe(0)
  })

  it('should return 0 when cursor is not near edge', () => {
    const result = calculateEdgeDeduction({ x: 200, y: 100 }, mockElement, config, 2)

    expect(result).toBe(0)
  })

  it('should return strength * depth when cursor is near edge', () => {
    const result = calculateEdgeDeduction({ x: 105, y: 100 }, mockElement, config, 2)

    expect(result).toBe(1000) // 500 * 2
  })

  it('should scale deduction with depth', () => {
    expect(calculateEdgeDeduction({ x: 105, y: 100 }, mockElement, config, 1)).toBe(500)
    expect(calculateEdgeDeduction({ x: 105, y: 100 }, mockElement, config, 2)).toBe(1000)
    expect(calculateEdgeDeduction({ x: 105, y: 100 }, mockElement, config, 3)).toBe(1500)
  })

  it('should use custom strength value', () => {
    const customConfig = { edges: ['left' as const], threshold: 12, strength: 250 }
    const result = calculateEdgeDeduction({ x: 105, y: 100 }, mockElement, customConfig, 2)

    expect(result).toBe(500) // 250 * 2
  })
})
