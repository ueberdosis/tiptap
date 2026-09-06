import { afterEach, describe, expect, it } from 'vite-plus/test'

import { captureDOMSelection } from './captureDOMSelection.js'

const createContent = () => {
  const oldParent = document.createElement('div')
  const newParent = document.createElement('div')
  const content = document.createElement('div')
  const text = document.createTextNode('Alpha')

  content.appendChild(text)
  oldParent.appendChild(content)
  document.body.append(oldParent, newParent)

  return { content, newParent, text }
}

const selectInside = (node: Node, offset: number) => {
  const selection = document.getSelection()!

  selection.removeAllRanges()

  const range = document.createRange()

  range.setStart(node, offset)
  range.collapse(true)
  selection.addRange(range)
}

afterEach(() => {
  document.getSelection()?.removeAllRanges()
  document.body.innerHTML = ''
})

describe('captureDOMSelection', () => {
  it('restores a selection that lives inside the element', () => {
    const { content, newParent, text } = createContent()

    selectInside(text, 3)

    const restore = captureDOMSelection(content)

    newParent.appendChild(content)

    // jsdom keeps the selection on a move, browsers drop it. Fake that here.
    document.getSelection()?.removeAllRanges()

    restore?.()

    const selection = document.getSelection()!

    expect(restore).toBeTypeOf('function')
    expect(selection.anchorNode).toBe(text)
    expect(selection.anchorOffset).toBe(3)
  })

  it('returns null when there is no selection', () => {
    const { content } = createContent()

    document.getSelection()?.removeAllRanges()

    expect(captureDOMSelection(content)).toBeNull()
  })

  it('returns null when the selection is outside of the element', () => {
    const { content } = createContent()
    const outside = document.createElement('div')

    outside.appendChild(document.createTextNode('Beta'))
    document.body.appendChild(outside)

    selectInside(outside.firstChild!, 2)

    expect(captureDOMSelection(content)).toBeNull()
  })
})
