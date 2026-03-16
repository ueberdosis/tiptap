import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
import { describe, expect, it, vi } from 'vitest'

import { findBestDragTarget } from '../src/helpers/findBestDragTarget.js'
import type { NormalizedNestedOptions } from '../src/types/options.js'

/**
 * Creates default normalized options for testing.
 */
function createDefaultOptions(overrides: Partial<NormalizedNestedOptions> = {}): NormalizedNestedOptions {
  return {
    enabled: true,
    rules: [],
    defaultRules: false,
    allowedContainers: undefined,
    edgeDetection: { edges: [], threshold: 0, strength: 0 },
    ...overrides,
  }
}

/**
 * Creates a mock Node for testing.
 */
function createMockNode(overrides: Partial<Record<string, unknown>> = {}): Node {
  return {
    type: { name: 'paragraph' },
    isAtom: false,
    isInline: false,
    isText: false,
    nodeSize: 7,
    firstChild: null,
    childCount: 0,
    ...overrides,
  } as unknown as Node
}

describe('findBestDragTarget', () => {
  const defaultCoords = { x: 100, y: 100 }

  describe('coordinate validation', () => {
    it('should return null for non-finite x coordinate', () => {
      const view = {} as EditorView
      const options = createDefaultOptions()

      expect(findBestDragTarget(view, { x: Infinity, y: 100 }, options)).toBeNull()
    })

    it('should return null for non-finite y coordinate', () => {
      const view = {} as EditorView
      const options = createDefaultOptions()

      expect(findBestDragTarget(view, { x: 100, y: NaN }, options)).toBeNull()
    })
  })

  describe('posAtCoords failure', () => {
    it('should return null when posAtCoords returns null', () => {
      const view = {
        posAtCoords: vi.fn(() => null),
      } as unknown as EditorView
      const options = createDefaultOptions()

      expect(findBestDragTarget(view, defaultCoords, options)).toBeNull()
    })
  })

  describe('ancestor-based candidates', () => {
    it('should return a block node at depth 1', () => {
      const mockParagraph = createMockNode({ type: { name: 'paragraph' } })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 1 })
      const mockDom = document.createElement('p')

      const mock$pos = {
        depth: 1,
        nodeAfter: null,
        parent: mockDoc,
        node: vi.fn((d: number) => (d === 0 ? mockDoc : mockParagraph)),
        before: vi.fn((d: number) => (d === 1 ? 0 : 0)),
        index: vi.fn((_d?: number) => 0),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 1, inside: 0 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn(() => mockDom),
      } as unknown as EditorView

      const options = createDefaultOptions()
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).not.toBeNull()
      expect(result!.node).toBe(mockParagraph)
      expect(result!.dom).toBe(mockDom)
    })
  })

  describe('atom node candidates via nodeAfter', () => {
    it('should find a block atom node via $pos.nodeAfter', () => {
      const mockImage = createMockNode({
        type: { name: 'image' },
        isAtom: true,
        isInline: false,
        nodeSize: 1,
      })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 2 })
      const mockDom = document.createElement('img')

      const mock$pos = {
        depth: 0,
        nodeAfter: mockImage,
        parent: mockDoc,
        node: vi.fn((d: number) => {
          if (d === 0) {return mockDoc}
          throw new Error(`unexpected depth ${d}`)
        }),
        before: vi.fn(),
        index: vi.fn(() => 1),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 7 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn((pos: number) => (pos === 7 ? mockDom : null)),
      } as unknown as EditorView

      const options = createDefaultOptions()
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).not.toBeNull()
      expect(result!.node).toBe(mockImage)
      expect(result!.pos).toBe(7)
      expect(result!.dom).toBe(mockDom)
    })

    it('should find a horizontalRule atom node via $pos.nodeAfter', () => {
      const mockHr = createMockNode({
        type: { name: 'horizontalRule' },
        isAtom: true,
        isInline: false,
        nodeSize: 1,
      })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 3 })
      const mockDom = document.createElement('hr')

      const mock$pos = {
        depth: 0,
        nodeAfter: mockHr,
        parent: mockDoc,
        node: vi.fn(() => mockDoc),
        before: vi.fn(),
        index: vi.fn(() => 1),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 7 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn((pos: number) => (pos === 7 ? mockDom : null)),
      } as unknown as EditorView

      const options = createDefaultOptions()
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).not.toBeNull()
      expect(result!.node).toBe(mockHr)
      expect(result!.pos).toBe(7)
      expect(result!.dom).toBe(mockDom)
    })

    it('should not add inline atom nodes as candidates', () => {
      const mockInlineAtom = createMockNode({
        type: { name: 'mention' },
        isAtom: true,
        isInline: true,
        nodeSize: 1,
      })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 1 })

      const mock$pos = {
        depth: 0,
        nodeAfter: mockInlineAtom,
        parent: mockDoc,
        node: vi.fn(() => mockDoc),
        before: vi.fn(),
        index: vi.fn(() => 0),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 1 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn(() => null),
      } as unknown as EditorView

      const options = createDefaultOptions()
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).toBeNull()
    })

    it('should not add atom node when nodeDOM returns null', () => {
      const mockImage = createMockNode({
        type: { name: 'image' },
        isAtom: true,
        isInline: false,
        nodeSize: 1,
      })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 2 })

      const mock$pos = {
        depth: 0,
        nodeAfter: mockImage,
        parent: mockDoc,
        node: vi.fn(() => mockDoc),
        before: vi.fn(),
        index: vi.fn(() => 1),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 7 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn(() => null),
      } as unknown as EditorView

      const options = createDefaultOptions()
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).toBeNull()
    })
  })

  describe('allowedContainers with atom nodes', () => {
    it('should skip atom node when not inside an allowed container', () => {
      const mockImage = createMockNode({
        type: { name: 'image' },
        isAtom: true,
        isInline: false,
        nodeSize: 1,
      })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 2 })
      const mockDom = document.createElement('img')

      const mock$pos = {
        depth: 0,
        nodeAfter: mockImage,
        parent: mockDoc,
        node: vi.fn(() => mockDoc),
        before: vi.fn(),
        index: vi.fn(() => 1),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 7 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn(() => mockDom),
      } as unknown as EditorView

      const options = createDefaultOptions({
        allowedContainers: ['blockquote'],
      })
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).toBeNull()
    })

    it('should include atom node when inside an allowed container', () => {
      const mockImage = createMockNode({
        type: { name: 'image' },
        isAtom: true,
        isInline: false,
        nodeSize: 1,
      })
      const mockBlockquote = createMockNode({
        type: { name: 'blockquote' },
        childCount: 2,
      })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 1 })
      const mockDom = document.createElement('img')

      const mock$pos = {
        depth: 1,
        nodeAfter: mockImage,
        parent: mockBlockquote,
        node: vi.fn((d: number) => {
          if (d === 0) {return mockDoc}
          if (d === 1) {return mockBlockquote}
          throw new Error(`unexpected depth ${d}`)
        }),
        before: vi.fn((d: number) => {
          if (d === 1) {return 0}
          return 0
        }),
        index: vi.fn((d?: number) => {
          if (d === 0) {return 0}
          return 1
        }),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 10 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn((pos: number) => {
          if (pos === 10) {return mockDom}
          return document.createElement('blockquote')
        }),
      } as unknown as EditorView

      const options = createDefaultOptions({
        allowedContainers: ['blockquote'],
      })
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).not.toBeNull()
      expect(result!.node).toBe(mockImage)
      expect(result!.pos).toBe(10)
    })
  })

  describe('scoring and selection', () => {
    it('should prefer atom node with higher score over ancestor', () => {
      const mockImage = createMockNode({
        type: { name: 'image' },
        isAtom: true,
        isInline: false,
        nodeSize: 1,
      })
      const mockBlockquote = createMockNode({
        type: { name: 'blockquote' },
        childCount: 2,
        isInline: false,
        isText: false,
      })
      const mockDoc = createMockNode({ type: { name: 'doc' }, childCount: 1 })
      const mockImgDom = document.createElement('img')
      const mockBqDom = document.createElement('blockquote')

      const mock$pos = {
        depth: 1,
        nodeAfter: mockImage,
        parent: mockBlockquote,
        node: vi.fn((d: number) => {
          if (d === 0) {return mockDoc}
          if (d === 1) {return mockBlockquote}
          throw new Error(`unexpected depth ${d}`)
        }),
        before: vi.fn((d: number) => {
          if (d === 1) {return 0}
          return 0
        }),
        index: vi.fn((d?: number) => {
          if (d === 0) {return 0}
          return 1
        }),
      } as unknown as ResolvedPos

      const view = {
        posAtCoords: vi.fn(() => ({ pos: 10 })),
        state: { doc: { resolve: vi.fn(() => mock$pos) } },
        nodeDOM: vi.fn((pos: number) => {
          if (pos === 10) {return mockImgDom}
          if (pos === 0) {return mockBqDom}
          return null
        }),
      } as unknown as EditorView

      const options = createDefaultOptions()
      const result = findBestDragTarget(view, defaultCoords, options)

      expect(result).not.toBeNull()
      // Both have the same base score with no rules, so the deeper node (atom at depth 2) wins
      expect(result!.node).toBe(mockImage)
    })
  })
})
