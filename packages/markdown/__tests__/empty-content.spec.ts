import { Editor } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Markdown } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

describe('empty markdown content', () => {
  it('should create a valid document when initial content is an empty string', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Markdown],
      content: '',
      contentType: 'markdown',
    })

    const json = editor.getJSON()

    expect(json.type).toBe('doc')
    expect(json.content).toBeDefined()
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('paragraph')

    editor.destroy()
  })

  it('should allow inserting text after initialization with empty markdown content', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Markdown],
      content: '',
      contentType: 'markdown',
    })

    editor.commands.insertContent('Hello')

    const json = editor.getJSON()
    expect(json.content![0].content![0].text).toBe('Hello')

    editor.destroy()
  })

  it('should allow inserting text with a paragraph command after initialization with empty markdown content', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Markdown],
      content: '',
      contentType: 'markdown',
    })

    editor.commands.insertContentAt(0, { type: 'text', text: 'Hello' })

    const json = editor.getJSON()
    expect(json.content![0].content![0].text).toBe('Hello')

    editor.destroy()
  })
})
