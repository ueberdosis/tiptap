import { LineHeight } from '@tiptap/extension-text-style'
import { describe, expect, it } from 'vitest'

const ext: any = (LineHeight as any).configure()
const globalAttrs = ext.config.addGlobalAttributes && ext.config.addGlobalAttributes.call(ext)[0]
const { parseHTML } = globalAttrs.attributes.lineHeight

describe('lineHeight parseHTML', () => {
  it('parses simple inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'line-height: 1.5')

    const parsed = parseHTML(el)

    expect(parsed).toBe('1.5')
  })

  it('returns the last declaration when line-height is declared multiple times', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'line-height: 1.2; line-height: 2')

    const parsed = parseHTML(el)

    expect(parsed).toBe('2')
  })

  it('ignores other style declarations and only returns line-height', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: red; line-height: 24px; font-size: 16px')

    const parsed = parseHTML(el)

    expect(parsed).toBe('24px')
  })
})
