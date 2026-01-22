import { BackgroundColor } from '@dibdab/extension-text-style'
import { describe, expect, it } from 'vitest'

const ext: any = (BackgroundColor as any).configure()
const globalAttrs = ext.config.addGlobalAttributes && ext.config.addGlobalAttributes.call(ext)[0]
const { parseHTML } = globalAttrs.attributes.backgroundColor

describe('background-color parseHTML', () => {
  it('parses rgb(...) inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'background-color: rgb(0, 255, 0)')

    const parsed = parseHTML(el)

    expect(parsed).toBe('rgb(0, 255, 0)')
  })

  it('parses hex inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'background-color: #00ff00')

    const parsed = parseHTML(el)

    expect(parsed).toBe('#00ff00')
  })

  it('parses hsla inline style', () => {
    const el = document.createElement('span')
    el.setAttribute('style', 'background-color: hsla(120, 100%, 50%, 0.3)')

    const parsed = parseHTML(el)

    expect(parsed).toBe('hsla(120, 100%, 50%, 0.3)')
  })
})
