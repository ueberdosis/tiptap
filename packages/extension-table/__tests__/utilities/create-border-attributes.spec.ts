import { describe, expect, it } from 'vitest'

import { createBorderAttributes } from '../../src/utilities/create-border-attributes.js'

describe('createBorderAttributes', () => {
  const attrs = createBorderAttributes()

  it('should create 12 attribute definitions', () => {
    expect(Object.keys(attrs)).toHaveLength(12)
  })

  it('should create width, style, and color for each side', () => {
    ;['Top', 'Bottom', 'Left', 'Right'].forEach(side => {
      expect(attrs).toHaveProperty(`border${side}Width`)
      expect(attrs).toHaveProperty(`border${side}Style`)
      expect(attrs).toHaveProperty(`border${side}Color`)
    })
  })

  it('should default all attributes to null', () => {
    Object.values(attrs).forEach(attr => {
      expect(attr).toHaveProperty('default', null)
    })
  })

  describe('parseHTML', () => {
    it('should parse border width from element style', () => {
      const el = document.createElement('td')

      el.style.borderTopWidth = '2px'

      const parse = attrs.borderTopWidth?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe(2)
    })

    it('should return null for empty border width', () => {
      const el = document.createElement('td')
      const parse = attrs.borderTopWidth?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBeNull()
    })

    it('should parse border style from element style', () => {
      const el = document.createElement('td')

      el.style.borderLeftStyle = 'dashed'

      const parse = attrs.borderLeftStyle?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBe('dashed')
    })

    it('should return null for empty border style', () => {
      const el = document.createElement('td')
      const parse = attrs.borderLeftStyle?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBeNull()
    })

    it('should parse border color from element style', () => {
      const el = document.createElement('td')

      el.style.borderRightColor = 'red'

      const parse = attrs.borderRightColor?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBeTruthy()
    })

    it('should return null for empty border color', () => {
      const el = document.createElement('td')
      const parse = attrs.borderRightColor?.parseHTML
      const result = typeof parse === 'function' ? parse(el) : null

      expect(result).toBeNull()
    })
  })

  describe('renderHTML', () => {
    it('should render border width as inline style', () => {
      const render = attrs.borderTopWidth?.renderHTML

      expect(typeof render === 'function' ? render({ borderTopWidth: 2 }) : {}).toEqual({
        style: 'border-top-width: 2px',
      })
    })

    it('should return empty object for null border width', () => {
      const render = attrs.borderTopWidth?.renderHTML

      expect(typeof render === 'function' ? render({ borderTopWidth: null }) : {}).toEqual({})
    })

    it('should render border style as inline style', () => {
      const render = attrs.borderBottomStyle?.renderHTML

      expect(typeof render === 'function' ? render({ borderBottomStyle: 'solid' }) : {}).toEqual({
        style: 'border-bottom-style: solid',
      })
    })

    it('should return empty object for null border style', () => {
      const render = attrs.borderBottomStyle?.renderHTML

      expect(typeof render === 'function' ? render({ borderBottomStyle: null }) : {}).toEqual({})
    })

    it('should render border color as inline style', () => {
      const render = attrs.borderLeftColor?.renderHTML

      expect(typeof render === 'function' ? render({ borderLeftColor: '#FF0000' }) : {}).toEqual({
        style: 'border-left-color: #FF0000',
      })
    })

    it('should return empty object for null border color', () => {
      const render = attrs.borderLeftColor?.renderHTML

      expect(typeof render === 'function' ? render({ borderLeftColor: null }) : {}).toEqual({})
    })
  })
})
