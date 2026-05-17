import { describe, expect, it } from 'vitest'

import { Editor } from '../editor.js'
import { StarterKit } from '../kits/starter.js'

describe('StarterKit', () => {
  it('exposes the canonical starter-kit name', () => {
    expect((StarterKit as { name: string }).name).toBe('starterKit')
  })

  it('produces a working editor when paired with the defaults-enabled Editor', () => {
    const editor = new Editor({
      extensions: [StarterKit],
      content: '<h1>Title</h1><p><strong>Bold</strong> and <em>italic</em> text</p>',
    })
    try {
      // Defaults from @tiptap/editor
      expect(editor.schema.nodes.doc).toBeDefined()
      expect(editor.schema.nodes.paragraph).toBeDefined()
      expect(editor.schema.nodes.text).toBeDefined()

      // Block nodes from StarterKit
      expect(editor.schema.nodes.heading).toBeDefined()
      expect(editor.schema.nodes.blockquote).toBeDefined()
      expect(editor.schema.nodes.codeBlock).toBeDefined()
      expect(editor.schema.nodes.bulletList).toBeDefined()
      expect(editor.schema.nodes.orderedList).toBeDefined()
      expect(editor.schema.nodes.listItem).toBeDefined()

      // Marks from StarterKit
      expect(editor.schema.marks.bold).toBeDefined()
      expect(editor.schema.marks.italic).toBeDefined()
      expect(editor.schema.marks.strike).toBeDefined()
      expect(editor.schema.marks.code).toBeDefined()
      expect(editor.schema.marks.link).toBeDefined()

      // Rendered content reflects input
      expect(editor.getText()).toContain('Title')
      expect(editor.getText()).toContain('Bold')
    } finally {
      editor.destroy()
    }
  })

  it('respects opt-out flags', () => {
    const editor = new Editor({
      extensions: [StarterKit.configure({ heading: false, link: false })],
    })
    try {
      expect(editor.schema.nodes.heading).toBeUndefined()
      expect(editor.schema.marks.link).toBeUndefined()
      // unrelated members still present
      expect(editor.schema.marks.bold).toBeDefined()
    } finally {
      editor.destroy()
    }
  })

  it('does not redundantly register Document, Paragraph, or Text', () => {
    // If StarterKit accidentally included core nodes, schema build would
    // throw "duplicate node" errors. Successful construction proves it.
    expect(() => {
      const editor = new Editor({ extensions: [StarterKit] })
      editor.destroy()
    }).not.toThrow()
  })
})
