import { MarkView, NodeView } from '@tiptap/core'
import type { MarkViewProps, NodeViewRendererProps } from '@tiptap/core'
import type { ViewMutationRecord } from '@tiptap/pm/view'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

function mockIos() {
  vi.stubGlobal('navigator', {
    platform: 'iPhone',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  })
}

function childListMutation(target: Node, added: HTMLElement[]): ViewMutationRecord {
  return {
    type: 'childList',
    target,
    addedNodes: added,
    removedNodes: [],
  } as unknown as ViewMutationRecord
}

function createEditableChild() {
  const child = document.createElement('div')

  child.contentEditable = 'true'

  return child
}

function createViewDom() {
  const wrapper = document.createElement('div')
  const chrome = document.createElement('div')
  const contentDOM = document.createElement('div')

  wrapper.append(chrome, contentDOM)
  document.body.append(wrapper)

  return { wrapper, chrome, contentDOM }
}

class TestNodeView extends NodeView<null> {
  constructor(
    props: NodeViewRendererProps,
    private readonly viewDom: HTMLElement,
    private readonly viewContentDOM: HTMLElement,
  ) {
    super(null, props)
  }

  get dom() {
    return this.viewDom
  }

  get contentDOM() {
    return this.viewContentDOM
  }
}

class TestMarkView extends MarkView<null> {
  constructor(
    props: MarkViewProps,
    private readonly viewDom: HTMLElement,
    private readonly viewContentDOM: HTMLElement,
  ) {
    super(null, props)
  }

  get dom() {
    return this.viewDom
  }

  get contentDOM() {
    return this.viewContentDOM
  }
}

function createNodeView() {
  const { wrapper, chrome, contentDOM } = createViewDom()
  const nodeView = new TestNodeView(
    {
      editor: { isFocused: true },
      extension: {},
      node: { isLeaf: false, isAtom: false },
      decorations: [],
      innerDecorations: {},
      view: {},
      HTMLAttributes: {},
      getPos: () => 0,
    } as unknown as NodeViewRendererProps,
    wrapper,
    contentDOM,
  )

  return { nodeView, wrapper, chrome, contentDOM }
}

function createMarkView() {
  const { wrapper, chrome, contentDOM } = createViewDom()
  const markView = new TestMarkView(
    {
      editor: { isFocused: true },
      mark: {},
      HTMLAttributes: {},
    } as unknown as MarkViewProps,
    wrapper,
    contentDOM,
  )

  return { markView, wrapper, chrome, contentDOM }
}

describe('ignoreMutation iOS childList branch', () => {
  afterEach(() => {
    document.body.replaceChildren()
    vi.unstubAllGlobals()
  })

  it('ignores framework chrome mounted inside NodeView.dom outside contentDOM', () => {
    mockIos()

    const { nodeView, chrome } = createNodeView()
    const mounted = createEditableChild()

    chrome.append(mounted)

    expect(nodeView.ignoreMutation(childListMutation(chrome, [mounted]))).toBe(true)
  })

  it('ignores a childList mutation whose target is NodeView.dom itself', () => {
    mockIos()

    const { nodeView, wrapper } = createNodeView()
    const mounted = createEditableChild()

    wrapper.append(mounted)

    expect(nodeView.ignoreMutation(childListMutation(wrapper, [mounted]))).toBe(true)
  })

  it('still lets ProseMirror handle childList mutations inside NodeView.contentDOM', () => {
    mockIos()

    const { nodeView, contentDOM } = createNodeView()
    const edited = createEditableChild()

    contentDOM.append(edited)

    expect(nodeView.ignoreMutation(childListMutation(contentDOM, [edited]))).toBe(false)
  })

  it('ignores framework chrome mounted inside MarkView.dom outside contentDOM', () => {
    mockIos()

    const { markView, chrome } = createMarkView()
    const mounted = createEditableChild()

    chrome.append(mounted)

    expect(markView.ignoreMutation(childListMutation(chrome, [mounted]))).toBe(true)
  })

  it('still lets ProseMirror handle childList mutations inside MarkView.contentDOM', () => {
    mockIos()

    const { markView, contentDOM } = createMarkView()
    const edited = createEditableChild()

    contentDOM.append(edited)

    expect(markView.ignoreMutation(childListMutation(contentDOM, [edited]))).toBe(false)
  })
})
