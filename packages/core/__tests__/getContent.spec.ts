import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

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
