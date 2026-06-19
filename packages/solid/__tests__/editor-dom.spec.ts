import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

describe('editor dom mount structure', () => {
  it('exposes mount element and view dom', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    const element = editor.options.element as HTMLElement
    const dom = editor.view.dom as HTMLElement

    expect(element).toBeTruthy()
    expect(dom).toBeTruthy()
    expect(element.contains(dom)).toBe(true)
    expect(dom.parentNode).toBe(element)

    const wrapper = document.createElement('div')
    document.body.appendChild(wrapper)

    wrapper.append(...element.childNodes)

    expect(wrapper.contains(dom)).toBe(true)
    expect(editor.view.dom.parentNode).toBe(wrapper)

    editor.commands.focus('end')
    const sizeBefore = editor.state.doc.content.size
    editor.commands.enter()

    expect(editor.state.doc.content.size).toBeGreaterThan(sizeBefore)

    editor.destroy()
    wrapper.remove()
  })

  it('creates child dom when mounted with element null', () => {
    const wrapper = document.createElement('div')
    document.body.appendChild(wrapper)

    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    editor.mount(wrapper)

    const dom = editor.view.dom as HTMLElement

    expect(wrapper.contains(dom)).toBe(true)
    expect(dom.classList.contains('ProseMirror')).toBe(true)

    editor.commands.focus('end')
    const sizeBefore = editor.state.doc.content.size
    editor.commands.enter()
    expect(editor.state.doc.content.size).toBeGreaterThan(sizeBefore)

    editor.destroy()
    wrapper.remove()
  })
})
