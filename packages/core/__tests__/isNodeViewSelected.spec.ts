import { Editor, isNodeViewSelected, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { NodeSelection, TextSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'

const BlockWithContent = Node.create({
  name: 'blockWithContent',
  group: 'block',
  content: 'text*',

  parseHTML() {
    return [{ tag: 'block-with-content' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-with-content', HTMLAttributes, 0]
  },
})

const AtomBlock = Node.create({
  name: 'atomBlock',
  group: 'block',
  atom: true,

  parseHTML() {
    return [{ tag: 'atom-block' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['atom-block', HTMLAttributes]
  },
})

describe('isNodeViewSelected', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('returns true when a NodeSelection wraps the node', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, AtomBlock],
      content: '<atom-block></atom-block>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
      }),
    ).toBe(true)
  })

  it('returns true when a TextSelection fully engulfs the node', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockWithContent],
      content: '<block-with-content>hello</block-with-content>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    // Selection from before the node to after it.
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 0, node.nodeSize)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
      }),
    ).toBe(true)
  })

  it('returns false when the cursor is inside the node and the option is disabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockWithContent],
      content: '<block-with-content>hello</block-with-content>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    // Place cursor inside the text content.
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 3)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
      }),
    ).toBe(false)
  })

  it('returns true when the cursor is inside the node and the option is enabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockWithContent],
      content: '<block-with-content>hello</block-with-content>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 3)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
        selectedOnTextSelection: true,
      }),
    ).toBe(true)
  })

  it('returns false when the selection is outside the node even with the option enabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockWithContent],
      content: '<block-with-content>hello</block-with-content><p>world</p>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    const outsidePos = node.nodeSize + 2
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, outsidePos)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
        selectedOnTextSelection: true,
      }),
    ).toBe(false)
  })

  it('returns false when the cursor sits exactly at the node boundary before it with the option enabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockWithContent],
      content: '<block-with-content>hello</block-with-content>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    // Cursor at `pos` is the gap *before* the node, not inside it.
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, pos)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
        selectedOnTextSelection: true,
      }),
    ).toBe(false)
  })

  it('returns false when the cursor sits exactly at the node boundary after it with the option enabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockWithContent],
      content: '<block-with-content>hello</block-with-content><p>world</p>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    // Cursor at `pos + nodeSize` is the gap *after* the node, not inside it.
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, pos + node.nodeSize)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
        selectedOnTextSelection: true,
      }),
    ).toBe(false)
  })

  it('returns false on a partial overlap (selection crosses the boundary) with the option enabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BlockWithContent],
      content: '<block-with-content>hello</block-with-content><p>world</p>',
    })

    const pos = 0
    const node = editor.state.doc.nodeAt(pos)!
    // Start inside the node, end outside it.
    const from = 2
    const to = node.nodeSize + 2
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from, to)))

    expect(
      isNodeViewSelected({
        selection: editor.state.selection,
        pos,
        nodeSize: node.nodeSize,
        selectedOnTextSelection: true,
      }),
    ).toBe(false)
  })
})
