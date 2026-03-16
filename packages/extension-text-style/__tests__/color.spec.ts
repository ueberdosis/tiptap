import { Color } from '@tiptap/extension-text-style'
import { describe, expect, it } from 'vitest'

const ext: any = (Color as any).configure()
const globalAttrs = ext.config.addGlobalAttributes && ext.config.addGlobalAttributes.call(ext)[0]
const { parseHTML } = globalAttrs.attributes.color

describe('color parseHTML', () => {
  it('parses rgb(...) inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: rgb(149, 141, 241)')

    const parsed = parseHTML(el)

    expect(parsed).toBe('rgb(149, 141, 241)')
  })

  it('parses hex inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: #958DF1')

    const parsed = parseHTML(el)

    expect(parsed).toBe('#958DF1')
  })

  it('parses hsla inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'color: hsla(252, 100%, 80%, 0.5)')

    const parsed = parseHTML(el)

    expect(parsed).toBe('hsla(252, 100%, 80%, 0.5)')
  })
})
