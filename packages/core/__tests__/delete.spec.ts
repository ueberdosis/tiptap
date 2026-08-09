import { Editor, Node } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { AllSelection } from '@tiptap/pm/state'
import { describe, expect, it, vi } from 'vitest'

const InlineDocument = Document.extend({
  content: 'inline*',
})

// Test extension for the bug fix: inline node with text* content and node view
const TestInlineNode = Node.create({
  name: 'testInlineNode',
  group: 'inline',
  inline: true,
  content: 'text*',
  renderHTML() {
    return ['span', { 'data-test-node': '' }, 0]
  },
  parseHTML() {
    return [
      {
        tag: 'span[data-test-node]',
      },
    ]
  },
  addNodeView() {
    return () => {
      const dom = document.createElement('span')
      dom.dataset.testNode = 'true'
      const contentDOM = document.createElement('span')
      dom.appendChild(contentDOM)
      return { dom, contentDOM }
    }
  },
})

describe('delete extension', () => {
  it('should not throw when removing a mark from inline content at position 0', () => {
    const onDelete = vi.fn()
    const editor = new Editor({
      extensions: [InlineDocument, Text, Bold],
      content: 'hello world',
      onDelete,
      coreExtensionOptions: {
        delete: {
          async: false,
        },
      },
    })

    editor.commands.selectAll()
    editor.commands.setMark('bold')
    editor.commands.selectAll()

    expect(() => editor.commands.unsetMark('bold')).not.toThrow()
    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello world',
        },
      ],
    })
    expect(onDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mark',
        partial: false,
      }),
    )

    editor.destroy()
  })

  it('should return false for empty selection', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>hello</p>',
    })

    // Set cursor at position 1 (empty selection)
    editor.commands.setTextSelection({ from: 1, to: 1 })

    const result = editor.commands.deleteSelection()
    expect(result).toBe(false)

    editor.destroy()
  })

  it('should delete selected text', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>hello world</p>',
    })

    // Select "hello "
    editor.chain().setTextSelection({ from: 1, to: 7 }).deleteSelection().run()

    expect(editor.getHTML()).toBe('<p>world</p>')
    editor.destroy()
  })

  it('should delete selection across two paragraphs', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>one</p><p>two</p>',
    })

    // Select from end of first paragraph to start of second
    editor.chain().setTextSelection({ from: 2, to: 7 }).deleteSelection().run()

    expect(editor.getHTML()).toBe('<p>owo</p>')
    editor.destroy()
  })

  it('should delete entire inline node with text* when selecting inside it', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, TestInlineNode],
      content: '<p>before <span data-test-node>test</span> after</p>',
    })

    // Select inside the inline node (position 9-13 selects "test")
    editor.chain().setTextSelection({ from: 9, to: 13 }).deleteSelection().run()

    // The entire node should be deleted
    expect(editor.getHTML()).toBe('<p>before  after</p>')
    editor.destroy()
  })

  it('should keep inline node when selecting only half of its text content', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, TestInlineNode],
      content: '<p>before <span data-test-node>test</span> after</p>',
    })

    // Select only half of the text inside the inline node (position 9-11 selects "te")
    editor.chain().setTextSelection({ from: 9, to: 11 }).deleteSelection().run()

    // The node should remain with remaining text
    expect(editor.getHTML()).toBe('<p>before <span data-test-node="">st</span> after</p>')
    editor.destroy()
  })

  it('collapses the selection to a cursor after deleting an AllSelection', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>hello world</p>',
    })

    editor.chain().selectAll().deleteSelection().run()

    expect(editor.getHTML()).toBe('<p></p>')
    expect(editor.state.selection.empty).toBe(true)
    expect(editor.state.selection instanceof AllSelection).toBe(false)

    editor.destroy()
  })

  it('should delete selection spanning around entire inline node', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, TestInlineNode],
      content: '<p>before <span data-test-node>test</span> after</p>',
    })

    // Select from before the inline node to after it (position 4-17)
    editor.chain().setTextSelection({ from: 4, to: 17 }).deleteSelection().run()

    // The entire selection including the inline node should be deleted
    expect(editor.getHTML()).toBe('<p>befter</p>')
    editor.destroy()
  })
})
