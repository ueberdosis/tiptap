import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { afterEach, describe, expect, it } from 'vite-plus/test'

describe('escapeMarkdownSyntax Editor roundtrip (#8519)', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
  })

  it('reproduces reporter: setContent markdown string without contentType then getMarkdown twice', () => {
    editor = new Editor({
      extensions: [StarterKit, Markdown],
      content: '**bold** and *italic*',
    })

    const md1 = editor.getMarkdown()
    console.log('md1', JSON.stringify(md1))
    console.log('json1', JSON.stringify(editor.getJSON()))

    const editor2 = new Editor({
      extensions: [StarterKit, Markdown],
      content: md1,
    })
    const md2 = editor2.getMarkdown()
    console.log('md2', JSON.stringify(md2))
    console.log('json2', JSON.stringify(editor2.getJSON()))
    editor2.destroy()

    expect(md1 === md2).toBe(true)
  })

  it('roundtrips with contentType markdown', () => {
    editor = new Editor({
      extensions: [StarterKit, Markdown],
      content: '**bold** and *italic*',
      contentType: 'markdown',
    })
    const md1 = editor.getMarkdown()
    editor.commands.setContent(md1, { contentType: 'markdown' })
    const md2 = editor.getMarkdown()
    console.log('typed md1', JSON.stringify(md1), 'md2', JSON.stringify(md2))
    expect(md2).toBe(md1)
  })
})
