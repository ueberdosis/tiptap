import { FontSize } from '@tiptap/extension-text-style'
import { describe, expect, it } from 'vitest'

const ext: any = (FontSize as any).configure()
const globalAttrs = ext.config.addGlobalAttributes && ext.config.addGlobalAttributes.call(ext)[0]
const { parseHTML } = globalAttrs.attributes.fontSize

describe('fontSize parseHTML', () => {
  it('parses simple inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-size: 16px')

    const parsed = parseHTML(el)

    expect(parsed).toBe('16px')
  })

  it('returns the last declaration when font-size is declared multiple times', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'font-size: 12px; font-size: 18px')

    const parsed = parseHTML(el)

    expect(parsed).toBe('18px')
  })

  it('ignores other style declarations and only returns font-size', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: red; font-size: 1.5em; line-height: 1.2')

    const parsed = parseHTML(el)

    expect(parsed).toBe('1.5em')
  })
})
