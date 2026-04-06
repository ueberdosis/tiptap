import { describe, expect, it } from 'vitest'

import { createVerticalAlignAttribute } from '../../src/utilities/create-vertical-align-attribute.js'

describe('createVerticalAlignAttribute', () => {
  const attr = createVerticalAlignAttribute()

  it('should default to null', () => {
    expect(attr.default).toBeNull()
  })

  describe('parseHTML', () => {
    it('should parse "top" from element style', () => {
      const el = document.createElement('td')

      el.style.verticalAlign = 'top'

      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBe('top')
    })

    it('should parse "middle" from element style', () => {
      const el = document.createElement('td')

      el.style.verticalAlign = 'middle'

      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBe('middle')
    })

    it('should parse "bottom" from element style', () => {
      const el = document.createElement('td')

      el.style.verticalAlign = 'bottom'

      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBe('bottom')
    })

    it('should return null for unsupported values', () => {
      const el = document.createElement('td')

      el.style.verticalAlign = 'baseline'

      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBeNull()
    })

    it('should return null when no vertical-align is set', () => {
      const el = document.createElement('td')
      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBeNull()
    })
  })

  describe('renderHTML', () => {
    it('should render "top" as inline style', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({ verticalAlign: 'top' }) : {}

      expect(result).toEqual({ style: 'vertical-align: top' })
    })

    it('should render "middle" as inline style', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({ verticalAlign: 'middle' }) : {}

      expect(result).toEqual({ style: 'vertical-align: middle' })
    })

    it('should render "bottom" as inline style', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({ verticalAlign: 'bottom' }) : {}

      expect(result).toEqual({ style: 'vertical-align: bottom' })
    })

    it('should return empty object for null', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({ verticalAlign: null }) : {}

      expect(result).toEqual({})
    })

    it('should return empty object for undefined', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({}) : {}

      expect(result).toEqual({})
    })
  })
})
