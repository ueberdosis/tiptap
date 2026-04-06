import { describe, expect, it } from 'vitest'

import { createBackgroundAttribute } from '../../src/utilities/create-background-attribute.js'

describe('createBackgroundAttribute', () => {
  const attr = createBackgroundAttribute()

  it('should default to null', () => {
    expect(attr.default).toBeNull()
  })

  describe('parseHTML', () => {
    it('should parse background-color from element style', () => {
      const el = document.createElement('td')

      el.style.backgroundColor = '#ECF0E9'

      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBeTruthy()
    })

    it('should return null when no background-color is set', () => {
      const el = document.createElement('td')
      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBeNull()
    })

    it('should parse rgb values', () => {
      const el = document.createElement('td')

      el.style.backgroundColor = 'rgb(255, 0, 0)'

      const result = typeof attr.parseHTML === 'function' ? attr.parseHTML(el) : null

      expect(result).toBeTruthy()
    })
  })

  describe('renderHTML', () => {
    it('should render background-color as inline style', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({ background: '#ECF0E9' }) : {}

      expect(result).toEqual({ style: 'background-color: #ECF0E9' })
    })

    it('should return empty object for null background', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({ background: null }) : {}

      expect(result).toEqual({})
    })

    it('should return empty object for undefined background', () => {
      const result = typeof attr.renderHTML === 'function' ? attr.renderHTML({}) : {}

      expect(result).toEqual({})
    })
  })
})
