import { NodeView } from '@tiptap/core'
import type { NodeViewRendererProps } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

const createProps = (getPos: () => number | undefined) => {
  return {
    editor: {},
    extension: {},
    node: {},
    decorations: [],
    innerDecorations: {},
    view: {},
    HTMLAttributes: {},
    getPos,
  } as unknown as NodeViewRendererProps
}

describe('NodeView getPos', () => {
  it('returns the position from prosemirror', () => {
    const nodeView = new NodeView(
      null,
      createProps(() => 7),
    )

    expect(nodeView.getPos()).toBe(7)
  })

  it('returns undefined instead of throwing while the view tree is mid-update', () => {
    // prosemirror-view's posBeforeChild throws a TypeError when the node
    // view desc is not attached to its parent yet.
    const nodeView = new NodeView(
      null,
      createProps(() => {
        throw new TypeError("Cannot read properties of undefined (reading 'size')")
      }),
    )

    expect(nodeView.getPos()).toBeUndefined()
  })
})
