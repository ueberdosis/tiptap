import type { EditorInternalOptions, EditorOptions } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorView } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

const extensions = [Document, Paragraph, Text]

describe('__internalViewFactory', () => {
  it('creates a plain EditorView when no factory is supplied', () => {
    const editor = new Editor({ extensions, content: '<p>legacy</p>' })

    expect(editor.view).toBeInstanceOf(EditorView)
    // Exactly the base class, not a subclass — the legacy path must be untouched
    expect(Object.getPrototypeOf(editor.view)).toBe(EditorView.prototype)
    expect(editor.getHTML()).toBe('<p>legacy</p>')

    editor.destroy()
  })

  it('constructs the view through the supplied factory', () => {
    class CustomEditorView extends EditorView {}

    let createdView: CustomEditorView | null = null

    const options: Partial<EditorOptions & EditorInternalOptions> = {
      extensions,
      content: '<p>custom</p>',
      __internalViewFactory: (element, props) => {
        createdView = new CustomEditorView(element as Element, props)
        return createdView
      },
    }
    const editor = new Editor(options)

    expect(createdView).not.toBeNull()
    expect(editor.view).toBe(createdView)
    expect(editor.view).toBeInstanceOf(CustomEditorView)
    // The rest of createView() ran against the factory-made view
    expect(editor.getHTML()).toBe('<p>custom</p>')

    editor.destroy()
  })

  it('passes the mount element and full direct editor props to the factory', () => {
    const mountElement = document.createElement('div')

    let receivedElement: unknown = null
    let receivedProps: Record<string, unknown> | null = null

    const options: Partial<EditorOptions & EditorInternalOptions> = {
      element: mountElement,
      extensions,
      __internalViewFactory: (element, props) => {
        receivedElement = element
        receivedProps = props as Record<string, unknown>
        return new EditorView(element as Element, props)
      },
    }
    const editor = new Editor(options)

    expect(receivedElement).toBe(mountElement)
    expect(receivedProps).not.toBeNull()
    expect(receivedProps).toMatchObject({ attributes: { role: 'textbox' } })
    expect(receivedProps?.state).toBeDefined()
    expect(receivedProps?.dispatchTransaction).toBeTypeOf('function')

    editor.destroy()
  })
})
