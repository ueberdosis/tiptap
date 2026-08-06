import { act, render } from '@testing-library/react'
import { Editor, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import React, { useEffect, useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { EditorContent } from './EditorContent.js'
import { NodeViewContent } from './NodeViewContent.js'
import { NodeViewWrapper } from './NodeViewWrapper.js'
import { ReactNodeViewRenderer } from './ReactNodeViewRenderer.js'
import type { ReactNodeViewProps } from './types.js'

const renderedPositions: Array<number | undefined> = []
const renderErrors: unknown[] = []
const bumpHandles = new Map<string, () => void>()
const explodingIds = new Set<string>()

// Optional hook run inside the click handler before the replace commands.
let beforeReplace: (() => void) | undefined

const ContainerComponent = (props: ReactNodeViewProps) => {
  const [, setTick] = useState(0)
  const id = props.node.attrs.id as string

  useEffect(() => {
    bumpHandles.set(id, () => setTick(tick => tick + 1))
    setTick(tick => tick + 1)

    return () => {
      bumpHandles.delete(id)
    }
  }, [id])

  if (explodingIds.has(id)) {
    throw new Error(`render bomb in container ${id}`)
  }

  // Calling getPos in the render path is what crashes with React 19.
  try {
    renderedPositions.push(props.getPos())
  } catch (error) {
    renderErrors.push(error)
    throw error
  }

  const replaceSelf = () => {
    beforeReplace?.()

    // setState first so React has pending sync work when the
    // transactions below run.
    setTick(tick => tick + 1)

    const pos = props.getPos()

    if (typeof pos !== 'number') {
      return
    }

    // The first transaction destroys this node view while its component is
    // still mounted. The second one constructs a new node view, whose
    // ReactRenderer flushSync then re-renders pending components while
    // ProseMirror's view tree is mid-update.
    props.editor.commands.deleteRange({ from: pos, to: pos + props.node.nodeSize })
    props.editor.commands.insertContentAt(0, {
      type: 'container',
      attrs: { id: 'fresh' },
      content: [{ type: 'item', content: [{ type: 'paragraph' }] }],
    })
  }

  return React.createElement(
    NodeViewWrapper,
    null,
    React.createElement('button', {
      type: 'button',
      'data-testid': `replace-${id}`,
      onClick: replaceSelf,
    }),
    React.createElement(NodeViewContent),
  )
}

const ItemComponent = () => {
  return React.createElement(NodeViewWrapper, null, React.createElement(NodeViewContent))
}

const WidgetComponent = () => {
  return React.createElement(NodeViewWrapper, null)
}

const ReactParagraphComponent = () => {
  return React.createElement(NodeViewWrapper, null, React.createElement(NodeViewContent))
}

const ReactParagraph = Paragraph.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ReactParagraphComponent)
  },
})

const Container = Node.create({
  name: 'container',
  group: 'block',
  content: 'item+',

  addAttributes() {
    return {
      id: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="container"]' }]
  },

  renderHTML() {
    return ['div', { 'data-type': 'container' }, 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContainerComponent)
  },
})

const Item = Node.create({
  name: 'item',
  group: 'block',
  content: 'paragraph+',

  parseHTML() {
    return [{ tag: 'div[data-type="item"]' }]
  },

  renderHTML() {
    return ['div', { 'data-type': 'item' }, 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ItemComponent)
  },
})

const Widget = Node.create({
  name: 'widget',
  group: 'block',
  atom: true,

  parseHTML() {
    return [{ tag: 'div[data-type="widget"]' }]
  },

  renderHTML() {
    return ['div', { 'data-type': 'widget' }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(WidgetComponent)
  },
})

const createEditorWithContainers = () => {
  return new Editor({
    extensions: [Document, Paragraph, Text, Container, Item],
    content:
      '<div data-type="container" id="a"><div data-type="item"><p>first</p></div></div>' +
      '<div data-type="container" id="b"><div data-type="item"><p>second</p></div></div>',
  })
}

const createEditorWithReactParagraph = () => {
  return new Editor({
    extensions: [Document, ReactParagraph, Text],
    content: '<p>Hello</p>',
  })
}

const createEditorWithWidget = () => {
  return new Editor({
    extensions: [Document, Paragraph, Text, Widget],
    content: '<p>abc</p><div data-type="widget"></div>',
  })
}

const flushMicrotasks = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

const flushAnimationFrame = async () => {
  await act(async () => {
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => resolve())
    })
  })
}

const clickReplace = (id: string) => {
  document
    .querySelector(`[data-testid="replace-${id}"]`)!
    .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

describe('ReactNodeViewRenderer', () => {
  afterEach(() => {
    renderedPositions.length = 0
    renderErrors.length = 0
    bumpHandles.clear()
    explodingIds.clear()
    beforeReplace = undefined
    document.body.innerHTML = ''
  })

  it('renders nested node views and resolves getPos during render', async () => {
    const editor = createEditorWithContainers()
    const { container } = render(React.createElement(EditorContent, { editor }))

    await flushMicrotasks()

    expect(container.querySelector('[data-node-view-wrapper]')).not.toBeNull()
    expect(renderedPositions.length).toBeGreaterThan(0)
    expect(renderedPositions).toContain(0)

    editor.destroy()
  })

  it('keeps new React paragraph content connected while its portal is queued', async () => {
    const editor = createEditorWithReactParagraph()
    const { container } = render(React.createElement(EditorContent, { editor }))

    await flushMicrotasks()

    editor.commands.setTextSelection(6)
    editor.commands.splitBlock()

    const secondParagraphPosition = editor.state.doc.firstChild!.nodeSize

    expect(editor.state.selection.from).toBe(secondParagraphPosition + 1)

    const contentElements = container.querySelectorAll('[data-node-view-content-react]')

    expect(contentElements).toHaveLength(2)
    expect(contentElements[1].isConnected).toBe(true)

    editor.commands.insertContent('Second')

    expect(editor.state.doc.child(0).textContent).toBe('Hello')
    expect(editor.state.doc.child(1).textContent).toBe('Second')

    await flushMicrotasks()

    expect(contentElements[1].parentElement?.hasAttribute('data-node-view-content')).toBe(true)

    editor.destroy()
  })

  it('resolves getPos to undefined while the view desc is detached mid-update', async () => {
    const editor = createEditorWithContainers()
    const { container } = render(React.createElement(EditorContent, { editor }))

    await flushMicrotasks()

    // Recreate the state ProseMirror's view tree goes through while it
    // updates: the desc has a parent but is not in parent.children yet.
    // getPos then walks past the end of the children array and throws.
    const desc = (container.querySelector('.react-renderer') as any).pmViewDesc
    const siblings = desc.parent.children

    siblings.splice(siblings.indexOf(desc), 1)

    renderedPositions.length = 0

    await act(async () => {
      bumpHandles.get('a')?.()
    })

    // put the tree back so teardown works on a consistent view
    siblings.unshift(desc)

    expect(renderErrors).toEqual([])
    expect(renderedPositions).toEqual([undefined])

    editor.destroy()
  })

  it('does not select the node view when the selection covers its former position', async () => {
    const editor = createEditorWithWidget()
    const { container } = render(React.createElement(EditorContent, { editor }))

    await flushMicrotasks()

    // The widget starts at position 5 and moves to 8 when text is typed above it.
    editor.commands.insertContentAt(4, 'def')
    editor.commands.setTextSelection({ from: 5, to: 6 })

    await flushAnimationFrame()

    const widget = container.querySelector('.node-widget')!

    expect(widget.classList.contains('ProseMirror-selectednode')).toBe(false)

    editor.destroy()
  })

  it('selects the node view when it is selected at its new position', async () => {
    const editor = createEditorWithWidget()
    const { container } = render(React.createElement(EditorContent, { editor }))

    await flushMicrotasks()

    editor.commands.insertContentAt(4, 'def')
    editor.commands.setNodeSelection(8)

    await flushAnimationFrame()

    const widget = container.querySelector('.node-widget')!

    expect(widget.classList.contains('ProseMirror-selectednode')).toBe(true)

    editor.destroy()
  })

  it('does not crash when node views are created while React has pending updates', async () => {
    const editor = createEditorWithContainers()
    const { container } = render(React.createElement(EditorContent, { editor }))

    await flushMicrotasks()

    expect(() => clickReplace('b')).not.toThrow()

    await flushMicrotasks()

    // getPos must not blow up inside the synchronous React flush.
    expect(renderErrors).toEqual([])

    // The editor and the React tree must stay intact and usable.
    expect(editor.state.doc.firstChild?.attrs.id).toBe('fresh')
    expect(container.querySelector('.tiptap')).not.toBeNull()
    expect(
      editor.commands.insertContentAt(editor.state.doc.content.size, { type: 'paragraph' }),
    ).toBe(true)

    editor.destroy()
  })

  it('keeps the editor intact when a component throws during the synchronous flush', async () => {
    const editor = createEditorWithContainers()

    render(React.createElement(EditorContent, { editor }))

    await flushMicrotasks()

    // Make container "a" throw on its next render and give it a pending
    // update, so the new node view's flushSync renders it mid-transaction.
    beforeReplace = () => {
      explodingIds.add('a')
      bumpHandles.get('a')?.()
    }

    let clickError: unknown

    try {
      clickReplace('b')
    } catch (error) {
      clickError = error
    }

    await flushMicrotasks()

    // React 19 reports the render error via onUncaughtError instead of
    // rethrowing, so nothing may propagate into the ProseMirror transaction.
    expect(clickError).toBeUndefined()

    // The ProseMirror transaction must complete even though a component
    // render threw during the flush.
    expect(editor.state.doc.firstChild?.attrs.id).toBe('fresh')
    expect(
      editor.commands.insertContentAt(editor.state.doc.content.size, { type: 'paragraph' }),
    ).toBe(true)

    editor.destroy()
  })
})
