import { describe, expect, it, vi } from 'vite-plus/test'

import type { ExtensionAttribute } from '../types.js'
import { injectExtensionAttributesToParseRule } from './injectExtensionAttributesToParseRule.js'

const createAttribute = (parseHTML: (element: HTMLElement) => unknown): ExtensionAttribute => ({
  type: 'customNode',
  name: 'custom',
  attribute: {
    default: null,
    parseHTML,
    rendered: true,
    renderHTML: null,
    keepOnSplit: true,
    isRequired: false,
  },
})

describe('injectExtensionAttributesToParseRule', () => {
  it('returns ignored rules unchanged', () => {
    const parseHTML = vi.fn(() => 'value')
    const getAttrs = () => ({})
    const rule = { tag: 'label', ignore: true, getAttrs }

    const result = injectExtensionAttributesToParseRule(rule, [createAttribute(parseHTML)])

    expect(result).toBe(rule)
    expect(result.getAttrs).toBe(getAttrs)

    result.getAttrs?.(document.createElement('label'))

    expect(parseHTML).not.toHaveBeenCalled()
  })

  it('still injects extension attributes into ordinary rules', () => {
    const rule = { tag: 'li', getAttrs: () => ({ checked: true }) }
    const element = document.createElement('li')

    element.setAttribute('data-custom', 'abc')

    const result = injectExtensionAttributesToParseRule(rule, [
      createAttribute(node => node.getAttribute('data-custom')),
    ])

    expect(result).not.toBe(rule)
    expect(result.getAttrs?.(element)).toEqual({ checked: true, custom: 'abc' })
  })

  it('keeps cancelling when getAttrs returns false', () => {
    const rule = { tag: 'li', getAttrs: () => false as const }

    const result = injectExtensionAttributesToParseRule(rule, [createAttribute(() => 'value')])

    expect(result.getAttrs?.(document.createElement('li'))).toBe(false)
  })
})
