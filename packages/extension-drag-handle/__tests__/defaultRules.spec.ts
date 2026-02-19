import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

import {
  defaultRules,
  inlineContent,
  listItemFirstChild,
  listWrapperDeprioritize,
  tableStructure,
} from '../src/helpers/defaultRules.js'
import type { RuleContext } from '../src/types/rules.js'

/**
 * Creates a mock RuleContext for testing.
 */
function createMockContext(overrides: Partial<RuleContext> = {}): RuleContext {
  const mockNode = {
    type: { name: 'paragraph' },
    isInline: false,
    isText: false,
  } as unknown as Node

  return {
    node: mockNode,
    pos: 0,
    depth: 1,
    parent: null,
    index: 0,
    isFirst: true,
    isLast: true,
    $pos: {} as ResolvedPos,
    view: {} as EditorView,
    ...overrides,
  }
}

describe('listItemFirstChild', () => {
  it('should have correct id', () => {
    expect(listItemFirstChild.id).toBe('listItemFirstChild')
  })

  describe('inside listItem', () => {
    it('should exclude first child of listItem', () => {
      const parent = { type: { name: 'listItem' } } as unknown as Node
      const context = createMockContext({
        parent,
        isFirst: true,
        index: 0,
      })

      const result = listItemFirstChild.evaluate(context)

      expect(result).toBe(1000)
    })

    it('should not exclude non-first child of listItem', () => {
      const parent = { type: { name: 'listItem' } } as unknown as Node
      const context = createMockContext({
        parent,
        isFirst: false,
        index: 1,
      })

      const result = listItemFirstChild.evaluate(context)

      expect(result).toBe(0)
    })
  })

  describe('inside taskItem', () => {
    it('should exclude first child of taskItem', () => {
      const parent = { type: { name: 'taskItem' } } as unknown as Node
      const context = createMockContext({
        parent,
        isFirst: true,
        index: 0,
      })

      const result = listItemFirstChild.evaluate(context)

      expect(result).toBe(1000)
    })

    it('should not exclude non-first child of taskItem', () => {
      const parent = { type: { name: 'taskItem' } } as unknown as Node
      const context = createMockContext({
        parent,
        isFirst: false,
        index: 1,
      })

      const result = listItemFirstChild.evaluate(context)

      expect(result).toBe(0)
    })
  })

  describe('outside list items', () => {
    it('should not exclude first child of other containers', () => {
      const parent = { type: { name: 'blockquote' } } as unknown as Node
      const context = createMockContext({
        parent,
        isFirst: true,
        index: 0,
      })

      const result = listItemFirstChild.evaluate(context)

      expect(result).toBe(0)
    })

    it('should not exclude when parent is null', () => {
      const context = createMockContext({
        parent: null,
        isFirst: true,
        index: 0,
      })

      const result = listItemFirstChild.evaluate(context)

      expect(result).toBe(0)
    })

    it('should not affect nodes in bulletList directly', () => {
      const parent = { type: { name: 'bulletList' } } as unknown as Node
      const context = createMockContext({
        parent,
        isFirst: true,
        index: 0,
      })

      const result = listItemFirstChild.evaluate(context)

      expect(result).toBe(0)
    })
  })
})

describe('inlineContent', () => {
  it('should have correct id', () => {
    expect(inlineContent.id).toBe('inlineContent')
  })

  it('should exclude inline nodes', () => {
    const node = {
      type: { name: 'text' },
      isInline: true,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = inlineContent.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should exclude text nodes', () => {
    const node = {
      type: { name: 'text' },
      isInline: false,
      isText: true,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = inlineContent.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should not exclude block nodes', () => {
    const node = {
      type: { name: 'paragraph' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = inlineContent.evaluate(context)

    expect(result).toBe(0)
  })

  it('should not exclude heading nodes', () => {
    const node = {
      type: { name: 'heading' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = inlineContent.evaluate(context)

    expect(result).toBe(0)
  })

  it('should not exclude listItem nodes', () => {
    const node = {
      type: { name: 'listItem' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = inlineContent.evaluate(context)

    expect(result).toBe(0)
  })
})

describe('listWrapperDeprioritize', () => {
  it('should have correct id', () => {
    expect(listWrapperDeprioritize.id).toBe('listWrapperDeprioritize')
  })

  it('should exclude nodes with listItem as first child', () => {
    const firstChild = { type: { name: 'listItem' } } as unknown as Node
    const node = {
      type: { name: 'bulletList' },
      isInline: false,
      isText: false,
      firstChild,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = listWrapperDeprioritize.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should exclude nodes with taskItem as first child', () => {
    const firstChild = { type: { name: 'taskItem' } } as unknown as Node
    const node = {
      type: { name: 'taskList' },
      isInline: false,
      isText: false,
      firstChild,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = listWrapperDeprioritize.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should not affect nodes with other first children', () => {
    const firstChild = { type: { name: 'paragraph' } } as unknown as Node
    const node = {
      type: { name: 'blockquote' },
      isInline: false,
      isText: false,
      firstChild,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = listWrapperDeprioritize.evaluate(context)

    expect(result).toBe(0)
  })

  it('should not affect nodes with no children', () => {
    const node = {
      type: { name: 'horizontalRule' },
      isInline: false,
      isText: false,
      firstChild: null,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = listWrapperDeprioritize.evaluate(context)

    expect(result).toBe(0)
  })
})

describe('tableStructure', () => {
  it('should have correct id', () => {
    expect(tableStructure.id).toBe('tableStructure')
  })

  it('should exclude tableRow nodes', () => {
    const node = {
      type: { name: 'tableRow' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = tableStructure.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should exclude tableCell nodes', () => {
    const node = {
      type: { name: 'tableCell' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = tableStructure.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should exclude tableHeader nodes', () => {
    const node = {
      type: { name: 'tableHeader' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = tableStructure.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should not affect table wrapper nodes', () => {
    const node = {
      type: { name: 'table' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = tableStructure.evaluate(context)

    expect(result).toBe(0)
  })

  it('should exclude content inside tableHeader', () => {
    const parent = {
      type: { name: 'tableHeader' },
    } as unknown as Node
    const node = {
      type: { name: 'paragraph' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node, parent })

    const result = tableStructure.evaluate(context)

    expect(result).toBe(1000)
  })

  it('should not exclude content inside tableCell', () => {
    const parent = {
      type: { name: 'tableCell' },
    } as unknown as Node
    const node = {
      type: { name: 'paragraph' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node, parent })

    const result = tableStructure.evaluate(context)

    expect(result).toBe(0)
  })

  it('should not affect paragraph nodes', () => {
    const node = {
      type: { name: 'paragraph' },
      isInline: false,
      isText: false,
    } as unknown as Node

    const context = createMockContext({ node })

    const result = tableStructure.evaluate(context)

    expect(result).toBe(0)
  })
})

describe('defaultRules', () => {
  it('should contain listItemFirstChild rule', () => {
    expect(defaultRules).toContain(listItemFirstChild)
  })

  it('should contain listWrapperDeprioritize rule', () => {
    expect(defaultRules).toContain(listWrapperDeprioritize)
  })

  it('should contain tableStructure rule', () => {
    expect(defaultRules).toContain(tableStructure)
  })

  it('should contain inlineContent rule', () => {
    expect(defaultRules).toContain(inlineContent)
  })

  it('should have exactly 4 rules', () => {
    expect(defaultRules).toHaveLength(4)
  })
})
