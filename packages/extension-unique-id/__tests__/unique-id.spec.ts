import { Editor } from '@tiptap/core'
import UniqueID from '@tiptap/extension-unique-id'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('UniqueID', () => {
  let editor: Editor

  beforeEach(async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit, UniqueID.configure({ types: ['heading', 'paragraph'] })],
      content: '<h1>Heading</h1><p>Paragraph one.</p><p>Paragraph two.</p>',
    })
    // UniqueID generates initial ids in onCreate via setTimeout(0)
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('assigns a unique id to headings', () => {
    const heading = editor.view.dom.querySelector('h1')
    expect(heading?.getAttribute('data-id')).toMatch(/.+/)
  })

  it('assigns a unique id to paragraphs', () => {
    const paragraphs = editor.view.dom.querySelectorAll('p')
    paragraphs.forEach(p => {
      expect(p.getAttribute('data-id')).toMatch(/.+/)
    })
  })

  it('gives different ids to different nodes', () => {
    const paragraphs = Array.from(editor.view.dom.querySelectorAll('p'))
    const ids = paragraphs.map(p => p.getAttribute('data-id'))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
