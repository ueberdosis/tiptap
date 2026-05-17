import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('insertContentAt', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  describe('from position adjustment', () => {
    it('should not adjust the from position for inline content with marks at parentOffset 0', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Bold],
        content: '<p>first</p><p>second</p>',
      })

      let stepFrom: number | undefined
      const origDispatch = editor.view.dispatch.bind(editor.view)

      editor.view.dispatch = (tr: any) => {
        if (tr.steps.length > 0) {
          stepFrom = tr.steps[0].from
        }
        return origDispatch(tr)
      }

      // Position 8 is at parentOffset 0 inside the second paragraph
      editor.commands.insertContentAt(8, [{ type: 'text', text: 'hello', marks: [{ type: 'bold' }] }])

      // The from position should NOT be adjusted (should remain 8, not 7)
      expect(stepFrom).toBe(8)
    })

    it('should adjust the from position for block content at parentOffset 0', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Bold],
        content: '<p>first</p><p>second</p>',
      })

      let stepFrom: number | undefined
      const origDispatch = editor.view.dispatch.bind(editor.view)

      editor.view.dispatch = (tr: any) => {
        if (tr.steps.length > 0) {
          stepFrom = tr.steps[0].from
        }
        return origDispatch(tr)
      }

      // Inserting block content at parentOffset 0 should use from-1
      editor.commands.insertContentAt(8, [{ type: 'paragraph', content: [{ type: 'text', text: 'new' }] }])

      // The from position SHOULD be adjusted (8 -> 7)
      expect(stepFrom).toBe(7)
    })
  })

  describe('content correctness', () => {
    it('inserts marked inline content at the start of a paragraph', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Bold],
        content: '<p>existing text</p>',
      })

      editor.commands.insertContentAt(1, [{ type: 'text', text: 'hello', marks: [{ type: 'bold' }] }])

      const json = editor.getJSON()

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', marks: [{ type: 'bold' }], text: 'hello' },
              { type: 'text', text: 'existing text' },
            ],
          },
        ],
      })
    })

    it('inserts block content before a non-empty paragraph', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, Bold],
        content: '<p>existing text</p>',
      })

      editor.commands.insertContentAt(1, [{ type: 'paragraph', content: [{ type: 'text', text: 'new paragraph' }] }])

      const json = editor.getJSON()

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'new paragraph' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'existing text' }],
          },
        ],
      })
    })

    it('inserts plain text at the start of a paragraph', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>existing text</p>',
      })

      editor.commands.insertContentAt(1, 'hello')

      expect(editor.getHTML()).toContain('helloexisting text')
    })
  })
})
