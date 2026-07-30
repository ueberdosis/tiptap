import type { EditorView } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

import {
  edgeBlockRect,
  findClosestTopLevelBlock,
} from '../src/helpers/findNextElementFromCursor.js'

/**
 * Builds a DOMRect-like object for tests, since jsdom does not run layout and
 * returns an all-zero rect for every element by default.
 */
function rect({
  width,
  height,
  top = 0,
  left = 0,
}: {
  width: number
  height: number
  top?: number
  left?: number
}): DOMRect {
  return {
    width,
    height,
    top,
    left,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

/** Overrides an element's getBoundingClientRect with a fixed rect. */
function withRect(el: HTMLElement, r: DOMRect): HTMLElement {
  el.getBoundingClientRect = () => r
  return el
}

describe('edgeBlockRect', () => {
  it('returns the first child that has a real layout box, skipping zero-size widgets', () => {
    // Mirrors the Pages layout: the first child is a zero-height page-chrome
    // widget, followed by real content blocks.
    const container = document.createElement('div')
    const widget = withRect(document.createElement('div'), rect({ width: 640, height: 0 }))
    const firstBlock = withRect(
      document.createElement('p'),
      rect({ width: 640, height: 24, top: 100 }),
    )
    const lastBlock = withRect(
      document.createElement('p'),
      rect({ width: 640, height: 24, top: 200 }),
    )
    container.append(widget, firstBlock, lastBlock)

    const result = edgeBlockRect(container, 'first')

    expect(result).not.toBeNull()
    expect(result?.top).toBe(100)
    expect(result?.height).toBe(24)
  })

  it('returns the last child that has a real layout box, skipping trailing zero-size widgets', () => {
    const container = document.createElement('div')
    const firstBlock = withRect(
      document.createElement('p'),
      rect({ width: 640, height: 24, top: 100 }),
    )
    const lastBlock = withRect(
      document.createElement('p'),
      rect({ width: 640, height: 24, top: 200 }),
    )
    const trailingWidget = withRect(
      document.createElement('div'),
      rect({ width: 640, height: 0, top: 300 }),
    )
    container.append(firstBlock, lastBlock, trailingWidget)

    const result = edgeBlockRect(container, 'last')

    expect(result?.top).toBe(200)
  })

  it('returns null when no child has a valid box', () => {
    const container = document.createElement('div')
    container.append(withRect(document.createElement('div'), rect({ width: 0, height: 0 })))

    expect(edgeBlockRect(container, 'first')).toBeNull()
  })
})

describe('findClosestTopLevelBlock', () => {
  /**
   * Tags a DOM element with a fake ProseMirror view description. Document nodes
   * expose a `node`; widget decorations do not.
   */
  function tagViewDesc(el: HTMLElement, node: unknown): HTMLElement {
    ;(el as unknown as { pmViewDesc: { node?: unknown } }).pmViewDesc = { node }
    return el
  }

  function makeView(dom: HTMLElement): EditorView {
    return { dom } as unknown as EditorView
  }

  it('returns the top-level content block for an element inside it', () => {
    const editorDom = document.createElement('div')
    const block = tagViewDesc(document.createElement('p'), { type: { name: 'paragraph' } })
    const text = document.createElement('span')
    block.appendChild(text)
    editorDom.appendChild(block)

    expect(findClosestTopLevelBlock(text, makeView(editorDom))).toBe(block)
  })

  it('skips widget decorations that have no associated document node', () => {
    // The Pages page-chrome overlay is a widget decoration: a direct child of
    // the editor with a view description but no document node. Resolving a hover
    // to it would align the drag handle to the page header instead of the block.
    const editorDom = document.createElement('div')
    const widget = tagViewDesc(document.createElement('div'), undefined)
    const inner = document.createElement('div')
    widget.appendChild(inner)
    editorDom.appendChild(widget)

    expect(findClosestTopLevelBlock(inner, makeView(editorDom))).toBeUndefined()
  })

  it('returns undefined when the element is not inside the editor', () => {
    const editorDom = document.createElement('div')
    const orphan = document.createElement('p')

    expect(findClosestTopLevelBlock(orphan, makeView(editorDom))).toBeUndefined()
  })
})
