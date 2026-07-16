import { Editor } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { NodeSelection } from '@tiptap/pm/state'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('insertDefaultBlock', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text, Bold, Blockquote, Heading],
      content: '<p>hello world</p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  describe('position handling', () => {
    it('uses the current selection position when no pos is provided', () => {
      editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, 0)))

      expect(editor.commands.insertDefaultBlock()).toBe(true)
      expect(editor.getHTML()).toBe('<p></p><p>hello world</p>')
    })

    it('inserts at a numeric position', () => {
      editor.commands.insertDefaultBlock({ pos: 0 })
      const json = editor.getJSON()
      expect(json.content[0].type).toBe('paragraph')
      expect(json.content[0].content).toBeUndefined()
      expect(json.content[1].type).toBe('paragraph')
    })

    it('inserts at a resolved position', () => {
      const $pos = editor.state.doc.resolve(0)
      editor.commands.insertDefaultBlock({ pos: $pos })
      const json = editor.getJSON()
      expect(json.content[0].type).toBe('paragraph')
      expect(json.content[0].content).toBeUndefined()
    })

    it('returns false when the current caret is inside a textblock', () => {
      editor.commands.setTextSelection(2)

      expect(editor.commands.insertDefaultBlock()).toBe(false)
      expect(editor.getHTML()).toBe('<p>hello world</p>')
    })
  })

  describe('block type determination', () => {
    it('inserts a paragraph inside document node', () => {
      editor.commands.insertDefaultBlock({ pos: 0 })
      const json = editor.getJSON()
      expect(json.content[0].type).toBe('paragraph')
      expect(json.content[0].content).toBeUndefined()
    })

    it('inserts a paragraph inside a blockquote', () => {
      editor.commands.setContent('<blockquote><p>quote</p></blockquote>')
      editor.commands.insertDefaultBlock({ pos: 1 })
      const bq = editor.state.doc.firstChild
      expect(bq?.childCount).toBe(2)
      expect(bq?.firstChild?.type.name).toBe('paragraph')
      expect(bq?.firstChild?.textContent).toBe('')
    })

    it('does not escape a blockquote when the position is inside its paragraph', () => {
      editor.commands.setContent('<blockquote><p>quote</p></blockquote>')

      expect(editor.commands.insertDefaultBlock({ pos: 2 })).toBe(false)
      expect(editor.getHTML()).toBe('<blockquote><p>quote</p></blockquote>')
    })

    it('inserts at the end of the document', () => {
      editor.commands.insertDefaultBlock({ pos: editor.state.doc.content.size })
      const json = editor.getJSON()
      expect(json.content).toHaveLength(2)
      expect(json.content[0].type).toBe('paragraph')
      expect(json.content[0].content).toBeDefined()
      expect(json.content[1].type).toBe('paragraph')
      expect(json.content[1].content).toBeUndefined()
    })

    it('inserts default block inside a blockquote', () => {
      editor.commands.setContent('<blockquote><p>existing</p></blockquote>')
      editor.commands.insertDefaultBlock({ pos: 1, content: 'new content' })
      const bq = editor.state.doc.firstChild
      expect(bq?.type.name).toBe('blockquote')
      expect(bq?.childCount).toBe(2)
      expect(bq?.firstChild?.textContent).toBe('new content')
      expect(bq?.lastChild?.textContent).toBe('existing')
    })
  })

  describe('content', () => {
    it('inserts block with text content', () => {
      editor.commands.insertDefaultBlock({ pos: 0, content: 'Hello' })
      expect(editor.getHTML()).toBe('<p>Hello</p><p>hello world</p>')
    })

    it('inserts block with HTML content', () => {
      editor.commands.insertDefaultBlock({ pos: 0, content: '<strong>bold</strong>' })
      expect(editor.getHTML()).toBe('<p><strong>bold</strong></p><p>hello world</p>')
    })

    it('inserts empty block when no content provided', () => {
      editor.commands.insertDefaultBlock({ pos: 0 })
      const json = editor.getJSON()
      const firstBlock = json.content[0]
      expect(firstBlock.type).toBe('paragraph')
      expect(firstBlock.content).toBeUndefined()
    })
  })

  describe('attributes', () => {
    it('applies valid attributes to a non-paragraph default block', () => {
      editor.destroy()

      const element = document.createElement('div')
      document.body.appendChild(element)
      editor = new Editor({
        element,
        extensions: [Document.extend({ content: 'heading+' }), Heading, Text],
        content: '<h1>existing</h1>',
      })

      editor.commands.insertDefaultBlock({ pos: 0, attrs: { level: 2 }, content: 'new' })

      expect(editor.getJSON()).toEqual({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'new' }],
          },
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'existing' }],
          },
        ],
      })

      expect(editor.commands.insertDefaultBlock({ pos: 0, attrs: { level: 3, foo: 'bar' } })).toBe(
        true,
      )
      expect(editor.state.doc.firstChild?.attrs).toEqual({ level: 3 })
    })
  })

  describe('selection', () => {
    it('updates selection by default', () => {
      editor.commands.insertDefaultBlock({ pos: 0, content: 'Hello' })
      const selection = editor.state.selection
      expect(selection.$from.parent.type.name).toBe('paragraph')
      expect(selection.$from.parent.textContent).toBe('Hello')
    })

    it('does not update selection when updateSelection is false', () => {
      editor.commands.setTextSelection(0)
      editor.commands.insertDefaultBlock({ pos: 0, updateSelection: false })
      // Selection is mapped through the transaction, so position shifts
      expect(editor.state.selection.from).toBe(3)
    })
  })
})
