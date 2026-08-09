import { afterEach, describe, expect, it, vi } from 'vitest'

import { cloneElement } from '../src/helpers/cloneElement.js'

describe('cloneElement', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('without properties filter', () => {
    it('copies computed styles to the clone', () => {
      const element = document.createElement('p')
      const child = document.createElement('span')

      element.appendChild(child)

      vi.spyOn(window, 'getComputedStyle').mockImplementation((node: Element) => {
        const styles = node === element ? ['margin-top', 'color'] : ['font-weight']

        return {
          length: styles.length,
          0: styles[0],
          1: styles[1],
          getPropertyValue: (property: string) => {
            if (property === 'margin-top') {
              return '24px'
            }

            if (property === 'color') {
              return 'rgb(1, 2, 3)'
            }

            if (property === 'font-weight') {
              return '700'
            }

            return ''
          },
        } as unknown as CSSStyleDeclaration
      })

      const clone = cloneElement(element)

      expect(clone.style.cssText).toContain('margin-top: 24px;')
      expect(clone.style.cssText).toContain('color: rgb(1, 2, 3);')
      expect((clone.firstElementChild as HTMLElement).style.cssText).toContain('font-weight: 700;')
    })
  })

  describe('with properties filter', () => {
    it('copies only the listed properties to the clone', () => {
      const element = document.createElement('p')
      const child = document.createElement('span')

      element.appendChild(child)

      vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
        return {
          length: 6,
          0: 'margin-top',
          1: 'color',
          2: 'font-weight',
          3: 'background-color',
          4: 'opacity',
          5: 'font-size',
          getPropertyValue: (property: string) => {
            if (property === 'margin-top') {
              return '24px'
            }

            if (property === 'color') {
              return 'rgb(1, 2, 3)'
            }

            if (property === 'font-weight') {
              return '700'
            }

            if (property === 'background-color') {
              return 'rgb(255, 0, 0)'
            }

            if (property === 'opacity') {
              return '0.5'
            }

            if (property === 'font-size') {
              return '16px'
            }

            return ''
          },
        } as unknown as CSSStyleDeclaration
      })

      const clone = cloneElement(element, ['margin-top', 'color'])

      // Listed properties should be present
      expect(clone.style.cssText).toContain('margin-top: 24px;')
      expect(clone.style.cssText).toContain('color: rgb(1, 2, 3);')

      // Non-listed properties should not be present
      expect(clone.style.cssText).not.toContain('font-weight')
      expect(clone.style.cssText).not.toContain('background-color')
      expect(clone.style.cssText).not.toContain('opacity')
      expect(clone.style.cssText).not.toContain('font-size')
    })

    it('trims surrounding whitespace before reading the property', () => {
      const element = document.createElement('p')

      vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
        return {
          length: 1,
          0: 'margin-top',
          getPropertyValue: (property: string) => (property === 'margin-top' ? '24px' : ''),
        } as unknown as CSSStyleDeclaration
      })

      const clone = cloneElement(element, [' margin-top '])

      expect(clone.style.cssText).toContain('margin-top: 24px;')
    })

    it('returns an empty cssText when the properties list is empty', () => {
      const element = document.createElement('p')

      vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
        return {
          length: 1,
          0: 'color',
          getPropertyValue: () => 'red',
        } as unknown as CSSStyleDeclaration
      })

      const clone = cloneElement(element, [])

      expect(clone.style.cssText).toBe('')
    })
  })
})
