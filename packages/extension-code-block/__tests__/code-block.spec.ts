import { Editor } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { CodeBlock } from '../src/code-block.js'

const pressArrowUp = (editor: Editor) => {
  editor.view.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' }))
}

describe('CodeBlock ArrowUp exit', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('inserts a paragraph above when the code block is the only node', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, CodeBlock],
      content: '<pre><code>hello</code></pre>',
    })
    editor.commands.setTextSelection(1)

    pressArrowUp(editor)

    expect(editor.getHTML()).toBe('<p></p><pre><code>hello</code></pre>')
    expect(editor.state.selection.$from.parent.type.name).toBe('paragraph')
    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.to).toBe(1)
  })

  it('inserts a paragraph above when the code block is the first node in the doc', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, CodeBlock],
      content: '<pre><code>hello</code></pre><p>after</p>',
    })
    editor.commands.setTextSelection(1)

    pressArrowUp(editor)

    expect(editor.getHTML()).toBe('<p></p><pre><code>hello</code></pre><p>after</p>')
    expect(editor.state.selection.$from.parent.type.name).toBe('paragraph')
    expect(editor.state.selection.from).toBe(1)
    expect(editor.state.selection.to).toBe(1)
  })

  it('does nothing when exitOnArrowUp is disabled', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, CodeBlock.configure({ exitOnArrowUp: false })],
      content: '<pre><code>hello</code></pre>',
    })
    editor.commands.setTextSelection(1)
    const before = editor.getHTML()

    pressArrowUp(editor)

    expect(editor.getHTML()).toBe(before)
  })

  it('does nothing when a node precedes the code block', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, CodeBlock],
      content: '<p>before</p><pre><code>hello</code></pre>',
    })

    let codeBlockContentStart = 0
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'codeBlock') {
        codeBlockContentStart = pos + 1
        return false
      }
      return true
    })
    editor.commands.setTextSelection(codeBlockContentStart)
    const before = editor.getHTML()

    pressArrowUp(editor)

    expect(editor.getHTML()).toBe(before)
  })

  it('does nothing when the caret is not at the start of the code block', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, CodeBlock],
      content: '<pre><code>hello</code></pre>',
    })
    editor.commands.setTextSelection(3)
    const before = editor.getHTML()

    pressArrowUp(editor)

    expect(editor.getHTML()).toBe(before)
  })
})
