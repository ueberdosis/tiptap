import { afterEach, describe, expect, it, vi } from 'vitest'

import { cloneElement } from '../src/helpers/cloneElement.js'

describe('cloneElement', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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
