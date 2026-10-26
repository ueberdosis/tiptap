import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from '../src/Editor.js'
import { EditorContent } from '../src/EditorContent.js'

const beforeDestroy = (EditorContent as any).beforeDestroy as (this: {
  editor: Editor | null
}) => void

describe('EditorContent (vue-2)', () => {
  let editor: Editor | null = null
  let element: HTMLElement | null = null

  function createEditor() {
    element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    return editor
  }

  afterEach(() => {
    editor?.destroy()
    editor = null
    element?.remove()
    element = null
  })

  it('does not throw when the editor is destroyed before the component', () => {
    const current = createEditor()

    current.contentComponent = {} as any
    current.destroy()

    expect(() => beforeDestroy.call({ editor: current })).not.toThrow()
    expect(current.contentComponent).toBeNull()
  })

  it('moves the editor DOM out of the component when the editor is still alive', () => {
    const current = createEditor()
    const host = document.createElement('div')

    host.append(...current.view.dom.parentNode!.childNodes)
    current.contentComponent = {} as any

    beforeDestroy.call({ editor: current })

    expect(current.contentComponent).toBeNull()
    expect(current.options.element).not.toBe(host)
    expect(current.view.dom.isConnected).toBe(false)
  })

  it('does nothing when there is no editor', () => {
    expect(() => beforeDestroy.call({ editor: null })).not.toThrow()
  })
})
