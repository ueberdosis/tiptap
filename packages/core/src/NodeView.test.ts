import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { createViewMutationTestContext } from '../tests/utils/createViewMutationTestContext.js'
import { NodeView } from './NodeView.js'
import type { NodeViewRendererProps } from './types.js'

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

function createNodeView() {
  const context = createViewMutationTestContext()
  const { wrapper, contentDOM } = context

  class TestNodeView extends NodeView<null> {
    get dom() {
      return wrapper
    }

    get contentDOM() {
      return contentDOM
    }
  }

  const nodeView = new TestNodeView(null, {
    editor: { isFocused: true },
    extension: {},
    node: { isLeaf: false, isAtom: false },
    decorations: [],
    innerDecorations: {},
    view: {},
    HTMLAttributes: {},
    getPos: () => 0,
  } as unknown as NodeViewRendererProps)

  return { nodeView, ...context }
}

describe('NodeView ignoreMutation on iOS', () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.unstubAllGlobals()
  })

  it('ignores framework chrome mounted inside dom outside contentDOM', () => {
    const { nodeView, chrome, createEditableChild, childListMutation } = createNodeView()
    const mounted = createEditableChild()

    chrome.append(mounted)

    expect(nodeView.ignoreMutation(childListMutation(chrome, [mounted]))).toBe(true)
  })

  it('ignores a childList mutation whose target is dom itself', () => {
    const { nodeView, wrapper, createEditableChild, childListMutation } = createNodeView()
    const mounted = createEditableChild()

    wrapper.append(mounted)

    expect(nodeView.ignoreMutation(childListMutation(wrapper, [mounted]))).toBe(true)
  })

  it('lets ProseMirror handle childList mutations inside contentDOM', () => {
    const { nodeView, contentDOM, createEditableChild, childListMutation } = createNodeView()
    const edited = createEditableChild()

    contentDOM.append(edited)

    expect(nodeView.ignoreMutation(childListMutation(contentDOM, [edited]))).toBe(false)
  })
})
