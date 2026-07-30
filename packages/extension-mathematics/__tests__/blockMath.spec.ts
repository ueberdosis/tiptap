import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { BlockMath, InlineMath } from '../src/index.js'

describe('BlockMath', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  describe('input rule', () => {
    it('replaces an empty host paragraph instead of leaving it behind', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, BlockMath],
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '$$$x^2$$' }] }],
        },
      })

      editor.commands.setTextSelection(editor.state.doc.content.size)

      editor.view.someProp('handleTextInput', f =>
        f(editor.view, editor.state.selection.from, editor.state.selection.from, '$'),
      )

      expect(editor.getJSON()).toEqual({
        type: 'doc',
        content: [{ type: 'blockMath', attrs: { latex: 'x^2' } }],
      })
    })

    it('inserts a sibling block math node inside a list item without breaking the schema', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, BulletList, ListItem, BlockMath],
        content: {
          type: 'doc',
          content: [
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: '$$$x^2$$' }] }],
                },
              ],
            },
          ],
        },
      })

      editor.commands.setTextSelection(editor.state.doc.content.size - 3)

      editor.view.someProp('handleTextInput', f =>
        f(editor.view, editor.state.selection.from, editor.state.selection.from, '$'),
      )

      expect(editor.getJSON()).toEqual({
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph' }, { type: 'blockMath', attrs: { latex: 'x^2' } }],
              },
            ],
          },
        ],
      })
    })

    it('does not fire when the match would not start at the textblock start', () => {
      editor = new Editor({
        extensions: [Document, Paragraph, Text, BlockMath],
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello $$$x^2$$' }] }],
        },
      })

      editor.commands.setTextSelection(editor.state.doc.content.size)

      const handled = editor.view.someProp('handleTextInput', f =>
        f(editor.view, editor.state.selection.from, editor.state.selection.from, '$'),
      )

      expect(handled).toBeFalsy()
      expect(editor.getJSON()).toEqual({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello $$$x^2$$' }] }],
      })
    })
  })

  describe('updateBlockMath', () => {
    function createEditor(latex: string) {
      return new Editor({
        extensions: [Document, Paragraph, Text, BlockMath],
        content: {
          type: 'doc',
          content: [{ type: 'blockMath', attrs: { latex } }],
        },
      })
    }

    it('clears the latex attribute when given an empty string', () => {
      editor = createEditor('x^2')

      editor.commands.updateBlockMath({ latex: '', pos: 0 })

      expect(editor.state.doc.firstChild?.attrs.latex).toBe('')
    })

    it('matches updateInlineMath behavior when clearing latex with an empty string', () => {
      const blockEditor = createEditor('x^2')
      blockEditor.commands.updateBlockMath({ latex: '', pos: 0 })
      const blockEmpty = blockEditor.state.doc.firstChild?.attrs.latex
      blockEditor.destroy()

      const inlineEditor = new Editor({
        extensions: [Document, Paragraph, Text, InlineMath],
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'inlineMath', attrs: { latex: 'x^2' } }],
            },
          ],
        },
      })
      const inlinePos = 1
      inlineEditor.commands.updateInlineMath({ latex: '', pos: inlinePos })
      const inlineEmpty = inlineEditor.state.doc.nodeAt(inlinePos)?.attrs.latex
      inlineEditor.destroy()

      expect(blockEmpty).toBe(inlineEmpty)
    })
  })
})
