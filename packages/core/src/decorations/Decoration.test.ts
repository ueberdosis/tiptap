import { describe, expect, it } from 'vite-plus/test'

import { Decoration } from './Decoration.js'

describe('decoration', () => {
  it('creates node decorations with default attrs', () => {
    const node = Decoration.Node(1, 4)

    expect(node.kind).toBe('node')
    expect(node.from).toBe(1)
    expect(node.to).toBe(4)
    expect(node.attrs).toEqual({})
    expect(node.spec).toBeUndefined()
  })

  it('creates inline decorations with attrs and spec', () => {
    const inline = Decoration.Inline(2, 5, { class: 'highlight' }, { inclusiveStart: true })

    expect(inline.kind).toBe('inline')
    expect(inline.from).toBe(2)
    expect(inline.to).toBe(5)
    expect(inline.attrs).toEqual({ class: 'highlight' })
    expect(inline.spec).toEqual({ inclusiveStart: true })
  })

  it('creates widget decorations with key separated from spec', () => {
    const render = () => document.createElement('span')
    const widget = Decoration.Widget(3, render, {
      key: 'widget-1',
      side: -1,
      stopEvent: () => true,
    })

    expect(widget.kind).toBe('widget')
    expect(widget.pos).toBe(3)
    expect(widget.render).toBe(render)
    expect(widget.key).toBe('widget-1')
    expect(widget.spec).toEqual({ side: -1, stopEvent: expect.any(Function) })
  })
})
