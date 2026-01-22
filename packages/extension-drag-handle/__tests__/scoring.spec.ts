import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
import { describe, expect, it, vi } from 'vitest'

import { BASE_SCORE, calculateScore } from '../src/helpers/scoring.js'
import type { EdgeDetectionConfig } from '../src/types/options.js'
import type { DragHandleRule, RuleContext } from '../src/types/rules.js'

/**
 * Creates a mock RuleContext for testing.
 */
function createMockContext(overrides: Partial<RuleContext> = {}): RuleContext {
  const mockNode = {
    type: { name: 'paragraph' },
    isInline: false,
    isText: false,
  } as unknown as Node

  const mockView = {
    nodeDOM: vi.fn(() => null),
  } as unknown as EditorView

  return {
    node: mockNode,
    pos: 0,
    depth: 1,
    parent: null,
    index: 0,
    isFirst: true,
    isLast: true,
    $pos: {} as ResolvedPos,
    view: mockView,
    ...overrides,
  }
}

describe('BASE_SCORE', () => {
  it('should be 1000', () => {
    expect(BASE_SCORE).toBe(1000)
  })
})

describe('calculateScore', () => {
  const defaultEdgeConfig: EdgeDetectionConfig = {
    edges: [],
    threshold: 0,
    strength: 0,
  }

  const defaultCoords = { x: 100, y: 100 }

  describe('without rules', () => {
    it('should return base score when no rules are applied', () => {
      const context = createMockContext()
      const result = calculateScore(context, [], defaultEdgeConfig, defaultCoords)

      expect(result).toBe(BASE_SCORE)
    })
  })

  describe('with rules', () => {
    it('should apply single rule deduction', () => {
      const context = createMockContext()
      const rules: DragHandleRule[] = [{ id: 'test', evaluate: () => 100 }]

      const result = calculateScore(context, rules, defaultEdgeConfig, defaultCoords)

      expect(result).toBe(900) // 1000 - 100
    })

    it('should apply multiple rule deductions', () => {
      const context = createMockContext()
      const rules: DragHandleRule[] = [
        { id: 'rule1', evaluate: () => 100 },
        { id: 'rule2', evaluate: () => 200 },
      ]

      const result = calculateScore(context, rules, defaultEdgeConfig, defaultCoords)

      expect(result).toBe(700) // 1000 - 100 - 200
    })

    it('should return -1 when score drops to 0 or below', () => {
      const context = createMockContext()
      const rules: DragHandleRule[] = [{ id: 'exclude', evaluate: () => 1000 }]

      const result = calculateScore(context, rules, defaultEdgeConfig, defaultCoords)

      expect(result).toBe(-1)
    })

    it('should return -1 when score goes negative', () => {
      const context = createMockContext()
      const rules: DragHandleRule[] = [{ id: 'exclude', evaluate: () => 1500 }]

      const result = calculateScore(context, rules, defaultEdgeConfig, defaultCoords)

      expect(result).toBe(-1)
    })

    it('should stop evaluating rules after exclusion', () => {
      const context = createMockContext()
      const secondRuleEvaluate = vi.fn(() => 100)
      const rules: DragHandleRule[] = [
        { id: 'exclude', evaluate: () => 1000 },
        { id: 'second', evaluate: secondRuleEvaluate },
      ]

      calculateScore(context, rules, defaultEdgeConfig, defaultCoords)

      expect(secondRuleEvaluate).not.toHaveBeenCalled()
    })

    it('should support negative deductions (score boosts)', () => {
      const context = createMockContext()
      const rules: DragHandleRule[] = [{ id: 'boost', evaluate: () => -200 }]

      const result = calculateScore(context, rules, defaultEdgeConfig, defaultCoords)

      expect(result).toBe(1200) // 1000 - (-200) = 1200
    })

    it('should pass context to rule evaluate function', () => {
      const mockNode = {
        type: { name: 'heading' },
        isInline: false,
        isText: false,
      } as unknown as Node

      const context = createMockContext({
        node: mockNode,
        depth: 2,
        isFirst: false,
      })

      const evaluateFn = vi.fn(() => 0)
      const rules: DragHandleRule[] = [{ id: 'test', evaluate: evaluateFn }]

      calculateScore(context, rules, defaultEdgeConfig, defaultCoords)

      expect(evaluateFn).toHaveBeenCalledWith(context)
    })
  })

  describe('with edge detection', () => {
    it('should apply edge deduction when near edge', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 50,
          right: 250,
          top: 50,
          bottom: 150,
          width: 200,
          height: 100,
          x: 50,
          y: 50,
          toJSON: () => ({}),
        }),
      }

      const mockView = {
        nodeDOM: vi.fn(() => mockElement),
      } as unknown as EditorView

      const context = createMockContext({
        view: mockView,
        depth: 2,
      })

      const edgeConfig: EdgeDetectionConfig = {
        edges: ['left'],
        threshold: 100, // Large threshold to ensure we're "near" the edge
        strength: 500,
      }

      // Cursor at x=100, element left at 50, so distance is 50 which is < 100 threshold
      const result = calculateScore(context, [], edgeConfig, { x: 100, y: 100 })

      // Should deduct strength * depth = 500 * 2 = 1000, resulting in score 0
      // Score <= 0 returns -1 for consistency with rule-based exclusion
      expect(result).toBe(-1)
    })

    it('should not apply edge deduction when not near edge', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 50,
          right: 250,
          top: 50,
          bottom: 150,
          width: 200,
          height: 100,
          x: 50,
          y: 50,
          toJSON: () => ({}),
        }),
      }

      const mockView = {
        nodeDOM: vi.fn(() => mockElement),
      } as unknown as EditorView

      const context = createMockContext({
        view: mockView,
        depth: 2,
      })

      const edgeConfig: EdgeDetectionConfig = {
        edges: ['left'],
        threshold: 10, // Small threshold
        strength: 500,
      }

      // Cursor at x=150, element left at 50, distance is 100 which is > 10 threshold
      const result = calculateScore(context, [], edgeConfig, { x: 150, y: 100 })

      expect(result).toBe(BASE_SCORE) // No deduction
    })

    it('should combine rule deductions with edge deductions', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 50,
          right: 250,
          top: 50,
          bottom: 150,
          width: 200,
          height: 100,
          x: 50,
          y: 50,
          toJSON: () => ({}),
        }),
      }

      const mockView = {
        nodeDOM: vi.fn(() => mockElement),
      } as unknown as EditorView

      const context = createMockContext({
        view: mockView,
        depth: 1,
      })

      const rules: DragHandleRule[] = [{ id: 'test', evaluate: () => 100 }]

      const edgeConfig: EdgeDetectionConfig = {
        edges: ['left'],
        threshold: 100,
        strength: 200,
      }

      const result = calculateScore(context, rules, edgeConfig, { x: 100, y: 100 })

      // 1000 - 100 (rule) - 200 (edge: 200 * 1) = 700
      expect(result).toBe(700)
    })
  })
})
