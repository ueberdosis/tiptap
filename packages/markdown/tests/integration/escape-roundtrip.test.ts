import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import { afterEach, describe, expect, it } from 'vite-plus/test'

describe('escapeMarkdownSyntax Editor roundtrip (#8519)', () => {
  let editor: Editor | null = null
  let editor2: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
    editor2?.destroy()
    editor2 = null
  })

  it('reproduces reporter: setContent markdown string without contentType then getMarkdown twice', () => {
    // Input must contain already-escaped specials so two-pass growth
    // (`\*…` → `\\*…`) is observed without the fix.
    editor = new Editor({
      extensions: [StarterKit, Markdown],
      content: 'literal \\*star\\* and \\_under\\_',
    })

    const md1 = editor.getMarkdown()

    editor2 = new Editor({
      extensions: [StarterKit, Markdown],
      content: md1,
    })
    const md2 = editor2.getMarkdown()

    expect(md2).toBe(md1)
  })

  it('roundtrips with contentType markdown', () => {
    editor = new Editor({
      extensions: [StarterKit, Markdown],
      content: 'literal \\*star\\* and \\_under\\_',
      contentType: 'markdown',
    })
    const md1 = editor.getMarkdown()
    editor.commands.setContent(md1, { contentType: 'markdown' })
    const md2 = editor.getMarkdown()
    expect(md2).toBe(md1)
  })
})
