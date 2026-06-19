import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'solid-js/web'

import { Editor } from '../src/Editor.js'
import { EditorContent, Tiptap, useEditor } from '../src/index.js'

describe('EditorContent', () => {
  const mountedElements: HTMLElement[] = []

  afterEach(() => {
    mountedElements.forEach(element => {
      if (element.isConnected) {
        render(() => null, element)
      }

      element.remove()
    })

    mountedElements.length = 0
  })

  it('mounts the editor dom inside the content element', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)
    mountedElements.push(container)

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    render(() => <EditorContent editor={editor} />, container)

    await new Promise(resolve => queueMicrotask(resolve))

    const proseMirror = container.querySelector('.ProseMirror')

    expect(proseMirror).toBeTruthy()
    expect(container.contains(proseMirror)).toBe(true)
    expect(editor.contentComponent).toBeTruthy()
    expect(editor.isEditable).toBe(true)

    editor.destroy()
  })

  it('allows inserting content and pressing enter after mount', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)
    mountedElements.push(container)

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    render(() => <EditorContent editor={editor} />, container)

    await new Promise(resolve => queueMicrotask(resolve))

    editor.commands.focus('end')

    const sizeBefore = editor.state.doc.content.size

    editor.commands.enter()

    expect(editor.state.doc.content.size).toBeGreaterThan(sizeBefore)

    editor.destroy()
  })

  it('works with Tiptap provider setup', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)
    mountedElements.push(container)

    const dispose = render(() => {
      const editor = useEditor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello</p>',
      })

      return (
        <Tiptap editor={editor()}>
          <Tiptap.Content />
        </Tiptap>
      )
    }, container)

    await new Promise(resolve => queueMicrotask(resolve))

    const proseMirror = container.querySelector('.ProseMirror') as HTMLElement & {
      editor?: Editor
    }

    expect(proseMirror).toBeTruthy()
    expect(proseMirror.getAttribute('contenteditable')).toBe('true')

    const editor = proseMirror.editor

    expect(editor).toBeTruthy()
    expect(editor?.isEditable).toBe(true)

    editor?.commands.focus('end')

    const sizeBefore = editor!.state.doc.content.size

    editor?.commands.enter()

    expect(editor!.state.doc.content.size).toBeGreaterThan(sizeBefore)

    dispose()
  })

  it('handles keyboard enter after EditorContent moves the editor dom', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)
    mountedElements.push(container)

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    render(() => <EditorContent editor={editor} />, container)

    await new Promise(resolve => queueMicrotask(resolve))

    const proseMirror = container.querySelector('.ProseMirror') as HTMLElement

    expect(proseMirror).toBeTruthy()
    expect(container.contains(proseMirror)).toBe(true)
    expect(proseMirror.parentElement).toBe(container)

    proseMirror.focus()

    const sizeBefore = editor.state.doc.content.size

    proseMirror.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    )

    expect(editor.state.doc.content.size).toBeGreaterThan(sizeBefore)

    editor.destroy()
  })
})
