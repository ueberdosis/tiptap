import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Details, DetailsContent, DetailsSummary } from '../src/index.js'

describe('Details commands', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Details, DetailsSummary, DetailsContent],
      content: '<p>Example Text</p>',
    })
    editor.commands.selectAll()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('parses <details> tags correctly', () => {
    editor.commands.setContent('<details><summary>Summary</summary><p>Content</p></details>')
    expect(editor.getHTML()).toBe(
      '<details><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details>',
    )
  })

  it('setDetails wraps the selection in a details node', () => {
    expect(editor.view.dom.querySelectorAll('[data-type="details"]').length).toBe(0)
    editor.commands.setDetails()
    const content = editor.view.dom.querySelector('[data-type="details"] [data-type="detailsContent"]')
    expect(content?.textContent).toContain('Example Text')
  })

  it('unsetDetails turns the details node back into a paragraph', () => {
    editor.commands.setDetails()
    expect(editor.view.dom.querySelectorAll('[data-type="details"]').length).toBe(1)

    editor.commands.unsetDetails()
    expect(editor.view.dom.querySelectorAll('[data-type="details"]').length).toBe(0)
  })
})
