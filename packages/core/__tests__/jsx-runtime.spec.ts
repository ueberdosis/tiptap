import { describe, expect, it } from 'vitest'

import { Fragment, h } from '../src/jsx-runtime.js'

describe('JSX Runtime', () => {
  describe('basic functionality', () => {
    it('should render a simple element tag', () => {
      const result = h('div', {})

      expect(result).toEqual(['div', {}])
    })

    it('should render an element with attributes', () => {
      const result = h('div', { class: 'container', id: 'main' })

      expect(result).toEqual(['div', { class: 'container', id: 'main' }])
    })

    it('should render slot tag as 0 (content hole)', () => {
      const result = h('slot', {})

      expect(result).toBe(0)
    })

    it('should handle function components', () => {
      const Component = (props: any) => ['span', props]
      const result = h(Component, { class: 'test' })

      expect(result).toEqual(['span', { class: 'test' }])
    })

    it('should throw error for svg elements', () => {
      expect(() => h('svg', {})).toThrow(
        'SVG elements are not supported in the JSX syntax, use the array syntax instead',
      )
    })
  })

  describe('single child rendering', () => {
    it('should render element with single text child', () => {
      const result = h('div', { children: 'Hello World' })

      expect(result).toEqual(['div', {}, 'Hello World'])
    })

    it('should render element with single element child', () => {
      const child = h('span', { children: 'text' })
      const result = h('div', { children: child })

      expect(result).toEqual(['div', {}, ['span', {}, 'text']])
    })

    it('should render element with single child and attributes', () => {
      const child = h('span', { children: 'text' })
      const result = h('div', { class: 'container', children: child })

      expect(result).toEqual(['div', { class: 'container' }, ['span', {}, 'text']])
    })
  })

  describe('nested sibling rendering', () => {
    it('should render multiple sibling elements by spreading them', () => {
      // Simulates JSX: <div><span>A</span><span>B</span></div>
      const child1 = h('span', { children: 'A' })
      const child2 = h('span', { children: 'B' })
      const result = h('div', { children: [child1, child2] })

      // Expected: ["div", {}, ["span", {}, "A"], ["span", {}, "B"]]
      // NOT: ["div", {}, [["span", {}, "A"], ["span", {}, "B"]]]
      expect(result).toEqual(['div', {}, ['span', {}, 'A'], ['span', {}, 'B']])
    })

    it('should render three sibling elements correctly', () => {
      const child1 = h('span', { children: 'First' })
      const child2 = h('span', { children: 'Second' })
      const child3 = h('span', { children: 'Third' })
      const result = h('div', { children: [child1, child2, child3] })

      expect(result).toEqual(['div', {}, ['span', {}, 'First'], ['span', {}, 'Second'], ['span', {}, 'Third']])
    })

    it('should render elements with attributes and multiple children', () => {
      // Simulates JSX: <div class="container"><span>A</span><span>B</span></div>
      const child1 = h('span', { children: 'A' })
      const child2 = h('span', { children: 'B' })
      const result = h('div', { class: 'container', children: [child1, child2] })

      expect(result).toEqual(['div', { class: 'container' }, ['span', {}, 'A'], ['span', {}, 'B']])
    })

    it('should render nested structures with multiple siblings at each level', () => {
      // Simulates complex nested JSX
      const innerChild1 = h('span', { children: 'Title' })
      const innerChild2 = h('span', { children: 'Value' })
      const middleChild = h('div', { class: 'stat', children: [innerChild1, innerChild2] })

      const result = h('div', { class: 'stats', children: [middleChild] })

      expect(result).toEqual([
        'div',
        { class: 'stats' },
        ['div', { class: 'stat' }, ['span', {}, 'Title'], ['span', {}, 'Value']],
      ])
    })

    it('should handle the issue example: stats card with nested siblings', () => {
      // This is the exact scenario from GitHub issue #6949
      const statTitle = h('div', { class: 'stat-title', children: 'Title' })
      const statValue = h('div', { class: 'stat-value', children: '1,000' })
      const stat = h('div', { class: 'stat', children: [statTitle, statValue] })
      const result = h('div', { class: 'stats', children: [stat] })

      expect(result).toEqual([
        'div',
        { class: 'stats' },
        [
          'div',
          { class: 'stat' },
          ['div', { class: 'stat-title' }, 'Title'],
          ['div', { class: 'stat-value' }, '1,000'],
        ],
      ])
    })
  })

  describe('edge cases', () => {
    it('should handle empty children array', () => {
      const result = h('div', { children: [] })

      expect(result).toEqual(['div', {}])
    })

    it('should handle undefined children', () => {
      const result = h('div', { children: undefined })

      expect(result).toEqual(['div', {}])
    })

    it('should handle null children', () => {
      const result = h('div', { children: null })

      expect(result).toEqual(['div', {}])
    })

    it('should filter out null and undefined from children array', () => {
      const child1 = h('span', { children: 'A' })
      const child2 = h('span', { children: 'B' })
      const result = h('div', { children: [child1, null, child2, undefined] })

      expect(result).toEqual(['div', {}, ['span', {}, 'A'], ['span', {}, 'B']])
    })

    it('should handle array with all null/undefined children', () => {
      const result = h('div', { children: [null, undefined, null] })

      expect(result).toEqual(['div', {}])
    })
  })

  describe('Fragment component', () => {
    it('should return children array from Fragment', () => {
      const child1 = h('span', { children: 'A' })
      const child2 = h('span', { children: 'B' })
      const result = Fragment({ children: [child1, child2] })

      expect(result).toEqual([
        ['span', {}, 'A'],
        ['span', {}, 'B'],
      ])
    })

    it('should work with Fragment as a parent component', () => {
      const child1 = h('div', { children: 'First' })
      const child2 = h('div', { children: 'Second' })
      const fragmentResult = Fragment({ children: [child1, child2] })

      expect(fragmentResult).toEqual([
        ['div', {}, 'First'],
        ['div', {}, 'Second'],
      ])
    })
  })

  describe('content hole (slot) integration', () => {
    it('should render element with slot (0) as child', () => {
      const slot = h('slot', {})
      const result = h('div', { children: slot })

      expect(result).toEqual(['div', {}, 0])
    })

    it('should render element with attributes and slot', () => {
      const slot = h('slot', {})
      const result = h('div', { class: 'content', children: slot })

      expect(result).toEqual(['div', { class: 'content' }, 0])
    })

    it('should handle slot in nested structure', () => {
      const slot = h('slot', {})
      const inner = h('div', { class: 'inner', children: slot })
      const result = h('div', { class: 'outer', children: inner })

      expect(result).toEqual(['div', { class: 'outer' }, ['div', { class: 'inner' }, 0]])
    })
  })

  describe('mixed content', () => {
    it('should handle mixed text and element children', () => {
      const element = h('strong', { children: 'bold' })
      const result = h('p', { children: [element] })

      expect(result).toEqual(['p', {}, ['strong', {}, 'bold']])
    })

    it('should handle multiple mixed content types', () => {
      const bold = h('strong', { children: 'important' })
      const italic = h('em', { children: 'emphasis' })
      const result = h('p', { children: [bold, italic] })

      expect(result).toEqual(['p', {}, ['strong', {}, 'important'], ['em', {}, 'emphasis']])
    })
  })

  describe('real-world scenarios', () => {
    it('should handle complex node rendering structure', () => {
      // Simulates a complex custom node like a callout with icon and content
      const icon = h('span', { class: 'icon', children: '📝' })
      const title = h('div', { class: 'title', children: 'Note' })
      const content = h('div', { class: 'content', children: h('slot', {}) })
      const header = h('div', { class: 'header', children: [icon, title] })

      const result = h('div', { class: 'callout', children: [header, content] })

      expect(result).toEqual([
        'div',
        { class: 'callout' },
        ['div', { class: 'header' }, ['span', { class: 'icon' }, '📝'], ['div', { class: 'title' }, 'Note']],
        ['div', { class: 'content' }, 0],
      ])
    })

    it('should handle deeply nested sibling structures', () => {
      // Level 3
      const leaf1 = h('span', { children: 'A' })
      const leaf2 = h('span', { children: 'B' })

      // Level 2
      const branch = h('div', { class: 'branch', children: [leaf1, leaf2] })

      // Level 1
      const root = h('div', { class: 'root', children: [branch] })

      expect(root).toEqual([
        'div',
        { class: 'root' },
        ['div', { class: 'branch' }, ['span', {}, 'A'], ['span', {}, 'B']],
      ])
    })
  })

  describe('DOMOutputSpec detection edge cases', () => {
    it('should correctly identify DOMOutputSpecArray with just tag and 0', () => {
      // ['div', 0] is a valid DOMOutputSpecArray with content hole
      const child = ['div', 0] as any
      const result = h('section', { children: child })

      expect(result).toEqual(['section', {}, ['div', 0]])
    })

    it('should correctly identify DOMOutputSpecArray with tag, attrs, and 0', () => {
      // ['div', { class: 'x' }, 0] is a valid DOMOutputSpecArray
      const child = ['div', { class: 'content' }, 0] as any
      const result = h('section', { children: child })

      expect(result).toEqual(['section', {}, ['div', { class: 'content' }, 0]])
    })

    it('should spread array of DOMOutputSpecArrays, not treat as single child', () => {
      // Array of multiple DOMOutputSpecArrays should be spread
      const children = [
        ['span', {}, 'A'],
        ['span', {}, 'B'],
      ] as any
      const result = h('div', { children })

      expect(result).toEqual(['div', {}, ['span', {}, 'A'], ['span', {}, 'B']])
    })

    it('should handle DOMOutputSpecArray with nested child', () => {
      // ['div', ['span', {}, 'text']] is valid - div with single child
      const child = ['div', ['span', {}, 'text']] as any
      const result = h('section', { children: child })

      expect(result).toEqual(['section', {}, ['div', ['span', {}, 'text']]])
    })

    it('should handle array starting with 0 as multiple children', () => {
      // [0, 'text'] is NOT a DOMOutputSpec (those must start with string tag)
      // This should be treated as multiple children and spread
      const children = [0, 'text'] as any
      const result = h('div', { children })

      expect(result).toEqual(['div', {}, 0, 'text'])
    })

    it('should handle single 0 (content hole) as child', () => {
      // Single 0 is the content hole marker
      const result = h('div', { children: 0 })

      expect(result).toEqual(['div', {}, 0])
    })

    it('should handle DOMOutputSpecArray with text content as second element', () => {
      // ['div', 'text'] is a valid DOMOutputSpec according to ProseMirror
      const child = ['div', 'text content'] as any
      const result = h('section', { children: child })

      expect(result).toEqual(['section', {}, ['div', 'text content']])
    })
  })
})
