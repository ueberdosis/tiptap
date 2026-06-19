import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { NodeViewProps } from '@tiptap/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { SolidRenderer } from '../src/SolidRenderer.js'

const Counter = (props: { count: number }) => {
  return <div data-testid="count">{props.count}</div>
}

const NodeCounter = (props: NodeViewProps) => {
  const count = () => Number(props.node.attrs.count ?? 0)

  return <div data-testid="count">{count()}</div>
}

describe('SolidRenderer', () => {
  let editor: Editor | null = null
  let editorElement: HTMLElement | null = null

  beforeEach(() => {
    editorElement = document.createElement('div')
    document.body.appendChild(editorElement)

    editor = new Editor({
      element: editorElement,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello World</p>',
    })
  })

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }

    if (editorElement?.parentNode) {
      editorElement.parentNode.removeChild(editorElement)
      editorElement = null
    }
  })

  it('should initialize with destroyed flag set to false', () => {
    const renderer = new SolidRenderer(Counter, {
      editor: editor!,
      props: { count: 0 },
    })

    expect(renderer.destroyed).toBe(false)
    renderer.destroy()
  })

  it('should set destroyed flag to true after destroy', () => {
    const renderer = new SolidRenderer(Counter, {
      editor: editor!,
      props: { count: 0 },
    })

    renderer.destroy()
    expect(renderer.destroyed).toBe(true)
  })

  it('should not update props after destroy', () => {
    const renderer = new SolidRenderer(Counter, {
      editor: editor!,
      props: { count: 0 },
    })

    renderer.destroy()

    expect(() => {
      renderer.updateProps({ count: 1 })
    }).not.toThrow()
  })

  it('should re-render when top-level props change', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    const renderer = new SolidRenderer(Counter, {
      editor: editor!,
      props: { count: 0 },
    })

    target.appendChild(renderer.element!.parentElement!)

    expect(target.textContent).toBe('0')

    renderer.updateProps({ count: 3 })

    expect(target.textContent).toBe('3')

    renderer.destroy()
    target.remove()
  })

  it('should re-render when nested node attrs change', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    const initialNode = editor!.schema.nodes.paragraph.create(
      { count: 0 },
      editor!.schema.text('hello'),
    )

    const renderer = new SolidRenderer(NodeCounter, {
      editor: editor!,
      props: {
        node: initialNode,
        updateAttributes: () => {},
      },
    })

    target.appendChild(renderer.element!.parentElement!)

    expect(target.textContent).toBe('0')

    const updatedNode = editor!.schema.nodes.paragraph.create(
      { count: 2 },
      editor!.schema.text('hello'),
    )

    renderer.updateProps({ node: updatedNode })

    expect(target.textContent).toBe('2')

    renderer.destroy()
    target.remove()
  })
})
