import { Editor } from '@tiptap/editor'
import { StarterKit } from '@tiptap/editor/kits/starter'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

describe('editor.getHTML / editor.getJSON', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit],
      content: '<p>Example Text</p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('returns html', () => {
    expect(editor.getHTML()).toBe('<p>Example Text</p>')
  })

  it('returns json', () => {
    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Example Text' }],
        },
      ],
    })
  })
})
