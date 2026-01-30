import { describe, expect, it } from 'vitest'

import { normalizeNestedOptions } from '../src/helpers/normalizeOptions.js'
import type { DragHandleRule } from '../src/types/rules.js'

describe('normalizeNestedOptions', () => {
  describe('disabled states', () => {
    it('should return disabled config for undefined', () => {
      const result = normalizeNestedOptions(undefined)

      expect(result.enabled).toBe(false)
      expect(result.rules).toEqual([])
      expect(result.defaultRules).toBe(true)
      expect(result.allowedContainers).toBeUndefined()
      expect(result.edgeDetection.edges).toEqual([])
    })

    it('should return disabled config for false', () => {
      const result = normalizeNestedOptions(false)

      expect(result.enabled).toBe(false)
      expect(result.rules).toEqual([])
      expect(result.defaultRules).toBe(true)
      expect(result.allowedContainers).toBeUndefined()
      expect(result.edgeDetection.edges).toEqual([])
    })
  })

  describe('simple enable', () => {
    it('should return enabled config with defaults for true', () => {
      const result = normalizeNestedOptions(true)

      expect(result.enabled).toBe(true)
      expect(result.rules).toEqual([])
      expect(result.defaultRules).toBe(true)
      expect(result.allowedContainers).toBeUndefined()
      expect(result.edgeDetection).toEqual({
        edges: ['left', 'top'],
        threshold: 12,
        strength: 500,
      })
    })
  })

  describe('custom config', () => {
    it('should accept custom rules', () => {
      const customRule: DragHandleRule = {
        id: 'customRule',
        evaluate: () => 0,
      }

      const result = normalizeNestedOptions({ rules: [customRule] })

      expect(result.enabled).toBe(true)
      expect(result.rules).toHaveLength(1)
      expect(result.rules[0].id).toBe('customRule')
    })

    it('should accept defaultRules: false', () => {
      const result = normalizeNestedOptions({ defaultRules: false })

      expect(result.enabled).toBe(true)
      expect(result.defaultRules).toBe(false)
    })

    it('should default defaultRules to true when not specified', () => {
      const result = normalizeNestedOptions({})

      expect(result.defaultRules).toBe(true)
    })

    it('should accept allowedContainers', () => {
      const result = normalizeNestedOptions({
        allowedContainers: ['bulletList', 'orderedList'],
      })

      expect(result.enabled).toBe(true)
      expect(result.allowedContainers).toEqual(['bulletList', 'orderedList'])
    })

    it('should accept edge detection preset', () => {
      const result = normalizeNestedOptions({ edgeDetection: 'right' })

      expect(result.enabled).toBe(true)
      expect(result.edgeDetection).toEqual({
        edges: ['right', 'top'],
        threshold: 12,
        strength: 500,
      })
    })

    it('should accept edge detection config object', () => {
      const result = normalizeNestedOptions({
        edgeDetection: { threshold: 20, strength: 250 },
      })

      expect(result.enabled).toBe(true)
      expect(result.edgeDetection).toEqual({
        edges: ['left', 'top'],
        threshold: 20,
        strength: 250,
      })
    })

    it('should accept edge detection "none"', () => {
      const result = normalizeNestedOptions({ edgeDetection: 'none' })

      expect(result.enabled).toBe(true)
      expect(result.edgeDetection).toEqual({
        edges: [],
        threshold: 0,
        strength: 0,
      })
    })

    it('should handle full custom config', () => {
      const customRule: DragHandleRule = {
        id: 'myRule',
        evaluate: () => 100,
      }

      const result = normalizeNestedOptions({
        rules: [customRule],
        defaultRules: false,
        allowedContainers: ['taskList'],
        edgeDetection: { edges: ['bottom'], threshold: 50, strength: 1000 },
      })

      expect(result.enabled).toBe(true)
      expect(result.rules).toEqual([customRule])
      expect(result.defaultRules).toBe(false)
      expect(result.allowedContainers).toEqual(['taskList'])
      expect(result.edgeDetection).toEqual({
        edges: ['bottom'],
        threshold: 50,
        strength: 1000,
      })
    })

    it('should default rules to empty array when not specified', () => {
      const result = normalizeNestedOptions({ edgeDetection: 'both' })

      expect(result.rules).toEqual([])
    })
  })
})
