import { describe, expect, it } from 'vitest'

import { createSpacingAttributes } from '../../src/utilities/create-spacing-attributes.js'

describe('createSpacingAttributes', () => {
  const attrs = createSpacingAttributes()

  it('should create 5 attribute definitions', () => {
    expect(Object.keys(attrs)).toHaveLength(5)
    expect(attrs).toHaveProperty('spacingBefore')
    expect(attrs).toHaveProperty('spacingAfter')
    expect(attrs).toHaveProperty('lineHeight')
    expect(attrs).toHaveProperty('indent')
    expect(attrs).toHaveProperty('firstLineIndent')
  })

  it('should default all attributes to null', () => {
    Object.values(attrs).forEach(attr => {
      expect(attr).toHaveProperty('default', null)
    })
  })

  describe('spacingBefore', () => {
    it('should parse margin-top from element style', () => {
      const el = document.createElement('p')

      el.style.marginTop = '28px'

      const parse = attrs.spacingBefore?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe(28)
    })

    it('should return null when no margin-top is set', () => {
      const el = document.createElement('p')
      const parse = attrs.spacingBefore?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBeNull()
    })

    it('should render as margin-top inline style', () => {
      const render = attrs.spacingBefore?.renderHTML

      expect(typeof render === 'function' ? render({ spacingBefore: 28 }) : {}).toEqual({
        style: 'margin-top: 28px',
      })
    })

    it('should return empty object for null', () => {
      const render = attrs.spacingBefore?.renderHTML

      expect(typeof render === 'function' ? render({ spacingBefore: null }) : {}).toEqual({})
    })
  })

  describe('spacingAfter', () => {
    it('should parse margin-bottom from element style', () => {
      const el = document.createElement('p')

      el.style.marginBottom = '13px'

      const parse = attrs.spacingAfter?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe(13)
    })

    it('should return null when no margin-bottom is set', () => {
      const el = document.createElement('p')
      const parse = attrs.spacingAfter?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBeNull()
    })

    it('should render as margin-bottom inline style', () => {
      const render = attrs.spacingAfter?.renderHTML

      expect(typeof render === 'function' ? render({ spacingAfter: 13 }) : {}).toEqual({
        style: 'margin-bottom: 13px',
      })
    })

    it('should return empty object for null', () => {
      const render = attrs.spacingAfter?.renderHTML

      expect(typeof render === 'function' ? render({ spacingAfter: null }) : {}).toEqual({})
    })
  })

  describe('lineHeight', () => {
    it('should parse line-height as a string from element style', () => {
      const el = document.createElement('p')

      el.style.lineHeight = '1.5'

      const parse = attrs.lineHeight?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe('1.5')
    })

    it('should preserve px units when parsing', () => {
      const el = document.createElement('p')

      el.style.lineHeight = '24px'

      const parse = attrs.lineHeight?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe('24px')
    })

    it('should render the value as-is without modifying units', () => {
      const render = attrs.lineHeight?.renderHTML

      expect(typeof render === 'function' ? render({ lineHeight: '1.5' }) : {}).toEqual({
        style: 'line-height: 1.5',
      })
    })

    it('should render px values faithfully', () => {
      const render = attrs.lineHeight?.renderHTML

      expect(typeof render === 'function' ? render({ lineHeight: '24px' }) : {}).toEqual({
        style: 'line-height: 24px',
      })
    })

    it('should return null when no line-height is set', () => {
      const el = document.createElement('p')
      const parse = attrs.lineHeight?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBeNull()
    })

    it('should return empty object for null', () => {
      const render = attrs.lineHeight?.renderHTML

      expect(typeof render === 'function' ? render({ lineHeight: null }) : {}).toEqual({})
    })
  })

  describe('indent', () => {
    it('should parse padding-left from element style', () => {
      const el = document.createElement('p')

      el.style.paddingLeft = '48px'

      const parse = attrs.indent?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe(48)
    })

    it('should render as padding-left inline style', () => {
      const render = attrs.indent?.renderHTML

      expect(typeof render === 'function' ? render({ indent: 48 }) : {}).toEqual({
        style: 'padding-left: 48px',
      })
    })

    it('should return empty object for null', () => {
      const render = attrs.indent?.renderHTML

      expect(typeof render === 'function' ? render({ indent: null }) : {}).toEqual({})
    })
  })

  describe('firstLineIndent', () => {
    it('should parse text-indent from element style', () => {
      const el = document.createElement('p')

      el.style.textIndent = '32px'

      const parse = attrs.firstLineIndent?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe(32)
    })

    it('should render as text-indent inline style', () => {
      const render = attrs.firstLineIndent?.renderHTML

      expect(typeof render === 'function' ? render({ firstLineIndent: 32 }) : {}).toEqual({
        style: 'text-indent: 32px',
      })
    })

    it('should return empty object for null', () => {
      const render = attrs.firstLineIndent?.renderHTML

      expect(typeof render === 'function' ? render({ firstLineIndent: null }) : {}).toEqual({})
    })
  })
})
