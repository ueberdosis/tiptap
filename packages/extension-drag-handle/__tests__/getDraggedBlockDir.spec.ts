import type { EditorView } from '@tiptap/pm/view'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getDraggedBlockDir, getDraggedBlockElement } from '../src/helpers/getDraggedBlockDir.js'

function createMockView(overrides: Partial<EditorView> = {}): EditorView {
  const editorDom = document.createElement('div')

  return {
    dom: editorDom,
    nodeDOM: vi.fn(() => null),
    domAtPos: vi.fn(() => ({ node: editorDom, offset: 0 })),
    ...overrides,
  } as unknown as EditorView
}

function mockDirection(map: Map<Element, string>) {
  const original = window.getComputedStyle

  vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
    const dir = map.get(el)

    if (dir) {
      return { direction: dir } as CSSStyleDeclaration
    }

    return original(el)
  })
}

describe('getDraggedBlockDir', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getDraggedBlockElement', () => {
    it('should prefer the child at domAtPos when nodeDOM resolves to the editor root', () => {
      const editorRoot = document.createElement('div')
      const paragraph = document.createElement('p')

      editorRoot.appendChild(paragraph)

      const view = createMockView({
        dom: editorRoot,
        nodeDOM: vi.fn(() => editorRoot),
        domAtPos: vi.fn(() => ({ node: editorRoot, offset: 0 })),
      })

      expect(getDraggedBlockElement(view, 0)).toBe(paragraph)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('nodeDOM returns an Element', () => {
    it('should return "rtl" when the block element has direction rtl', () => {
      const block = document.createElement('p')
      const dirMap = new Map<Element, string>([[block, 'rtl']])

      mockDirection(dirMap)

      const view = createMockView({ nodeDOM: vi.fn(() => block) })

      expect(getDraggedBlockDir(view, 0)).toBe('rtl')
    })

    it('should return "ltr" when the block element has direction ltr', () => {
      const block = document.createElement('p')
      const dirMap = new Map<Element, string>([[block, 'ltr']])

      mockDirection(dirMap)

      const view = createMockView({ nodeDOM: vi.fn(() => block) })

      expect(getDraggedBlockDir(view, 5)).toBe('ltr')
    })
  })

  describe('nodeDOM returns a non-Element — domAtPos fallback', () => {
    it('should resolve the child at offset when domAtPos returns a parent container', () => {
      const parent = document.createElement('div')
      const ltrChild = document.createElement('p')
      const rtlChild = document.createElement('p')

      parent.appendChild(ltrChild)
      parent.appendChild(rtlChild)

      const dirMap = new Map<Element, string>([
        [parent, 'ltr'],
        [rtlChild, 'rtl'],
      ])

      mockDirection(dirMap)

      const view = createMockView({
        nodeDOM: vi.fn(() => null),
        domAtPos: vi.fn(() => ({ node: parent, offset: 1 })),
      })

      expect(getDraggedBlockDir(view, 0)).toBe('rtl')
    })

    it('should fall back to the parent node when child at offset is a text node', () => {
      const parent = document.createElement('p')

      parent.appendChild(document.createTextNode('hello'))

      const dirMap = new Map<Element, string>([[parent, 'rtl']])

      mockDirection(dirMap)

      const view = createMockView({
        nodeDOM: vi.fn(() => null),
        domAtPos: vi.fn(() => ({ node: parent, offset: 0 })),
      })

      expect(getDraggedBlockDir(view, 0)).toBe('rtl')
    })
  })

  describe('regression: mixed RTL/LTR', () => {
    it('should read direction from the dragged block, not the parent wrapper', () => {
      const editorRoot = document.createElement('div')
      const rtlBlock = document.createElement('p')

      const dirMap = new Map<Element, string>([
        [editorRoot, 'ltr'],
        [rtlBlock, 'rtl'],
      ])

      mockDirection(dirMap)

      const view = createMockView({
        dom: editorRoot,
        nodeDOM: vi.fn(() => rtlBlock),
      })

      expect(getDraggedBlockDir(view, 0)).toBe('rtl')
    })

    it('should read direction from child at domAtPos offset, not from parent', () => {
      const listWrapper = document.createElement('ul')
      const rtlItem = document.createElement('li')

      listWrapper.appendChild(rtlItem)

      const dirMap = new Map<Element, string>([
        [listWrapper, 'ltr'],
        [rtlItem, 'rtl'],
      ])

      mockDirection(dirMap)

      const view = createMockView({
        nodeDOM: vi.fn(() => null),
        domAtPos: vi.fn(() => ({ node: listWrapper, offset: 0 })),
      })

      expect(getDraggedBlockDir(view, 0)).toBe('rtl')
    })

    it('should normalize a Text node from domAtPos to its parentElement instead of falling back to editor root', () => {
      const editorRoot = document.createElement('div')
      const rtlParagraph = document.createElement('p')
      const textNode = document.createTextNode('مرحبا')

      rtlParagraph.appendChild(textNode)

      const dirMap = new Map<Element, string>([
        [editorRoot, 'ltr'],
        [rtlParagraph, 'rtl'],
      ])

      mockDirection(dirMap)

      const view = createMockView({
        dom: editorRoot,
        nodeDOM: vi.fn(() => null),
        domAtPos: vi.fn(() => ({ node: textNode, offset: 3 })),
      })

      expect(getDraggedBlockDir(view, 0)).toBe('rtl')
    })
  })

  describe('ultimate fallback to editor root', () => {
    it('should use editor root direction when nodeDOM and domAtPos both return non-elements', () => {
      const editorRoot = document.createElement('div')
      const textNode = document.createTextNode('text')

      const dirMap = new Map<Element, string>([[editorRoot, 'rtl']])

      mockDirection(dirMap)

      const view = createMockView({
        dom: editorRoot,
        nodeDOM: vi.fn(() => textNode),
        domAtPos: vi.fn(() => ({ node: textNode, offset: 0 })),
      })

      expect(getDraggedBlockDir(view, 0)).toBe('rtl')
    })

    it('should default to "ltr" when no direction is computed anywhere', () => {
      const editorRoot = document.createElement('div')
      const textNode = document.createTextNode('text')

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        direction: '',
      } as CSSStyleDeclaration)

      const view = createMockView({
        dom: editorRoot,
        nodeDOM: vi.fn(() => textNode),
        domAtPos: vi.fn(() => ({ node: textNode, offset: 0 })),
      })

      expect(getDraggedBlockDir(view, 0)).toBe('ltr')
    })
  })
})
