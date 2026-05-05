import { Editor } from '@tiptap/core'
import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Markdown } from '@tiptap/markdown'
import { afterEach, describe, expect, it } from 'vitest'

describe('empty markdown content', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('should create a valid document when initial content is an empty string', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Markdown],
      content: '',
      contentType: 'markdown',
    })

    const json = editor.getJSON()

    expect(json.type).toBe('doc')
    expect(json.content).toBeDefined()
    expect(json.content).toHaveLength(1)
    expect(json.content![0].type).toBe('paragraph')
  })

  it('should allow inserting text after initialization with empty markdown content', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Markdown],
      content: '',
      contentType: 'markdown',
    })

    editor.commands.insertContent('Hello')

    const json = editor.getJSON()
    expect((json.content![0].content![0] as any).text).toBe('Hello')
  })

  it('should allow inserting text with a paragraph command after initialization with empty markdown content', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Markdown],
      content: '',
      contentType: 'markdown',
    })

    editor.commands.insertContentAt(0, { type: 'text', text: 'Hello' })

    const json = editor.getJSON()
    expect((json.content![0].content![0] as any).text).toBe('Hello')
  })

  it('should allow inserting markdown-formatted content after initialization with empty markdown content', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Markdown],
      content: '',
      contentType: 'markdown',
    })

    editor.commands.insertContent('**bold**', { contentType: 'markdown' })

    const json = editor.getJSON()
    const textNode = json.content![0].content![0] as any
    expect(textNode.type).toBe('text')
    expect(textNode.text).toBe('bold')
    expect(textNode.marks?.[0]?.type).toBe('bold')
  })

  it('should allow inserting markdown-formatted content at a specific position after empty initialization', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Markdown],
      content: '',
      contentType: 'markdown',
    })

    editor.commands.insertContentAt(0, '**bold**', { contentType: 'markdown' })

    const json = editor.getJSON()
    const textNode = json.content![0].content![0] as any
    expect(textNode.type).toBe('text')
    expect(textNode.text).toBe('bold')
    expect(textNode.marks?.[0]?.type).toBe('bold')
  })
})
