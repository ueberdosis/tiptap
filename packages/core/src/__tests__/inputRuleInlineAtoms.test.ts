import { Editor, Node } from '@tiptap/core'
import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

// minimal stand-in for a mention-like node. inline atoms expand to %leaf% (6 chars)
// in getTextContentFromNodes but only take up 1 position in the doc,
// which used to break the input rule range math
const InlineAtom = Node.create({
  name: 'inlineAtom',
  group: 'inline',
  inline: true,
  atom: true,
  parseHTML: () => [{ tag: 'span[data-atom]' }],
  renderHTML: () => ['span', { 'data-atom': '' }],
})

// same as above, but with a custom text representation instead of the %leaf% fallback
const InlineAtomWithText = Node.create({
  name: 'inlineAtomWithText',
  group: 'inline',
  inline: true,
  atom: true,
  parseHTML: () => [{ tag: 'span[data-atom-text]' }],
  renderHTML: () => ['span', { 'data-atom-text': '' }],
  renderText: () => '@mention',
})

const createEditor = (content: string) =>
  new Editor({
    extensions: [Document, Paragraph, Text, InlineAtom, InlineAtomWithText, Code],
    content,
  })

const typeAtEndOfParagraph = (editor: Editor, char: string) => {
  const pos = editor.state.doc.content.size - 1

  editor.commands.setTextSelection(pos)

  return editor.view.someProp('handleTextInput', f => f(editor.view, pos, pos, char))
}

describe('input rules with inline atom nodes', () => {
  let editor: Editor

  afterEach(() => {
    editor.destroy()
  })

  it('does not crash when the match spans an inline atom (#7933)', () => {
    editor = createEditor('<p>`a<span data-atom></span></p>')

    expect(() => typeAtEndOfParagraph(editor, '`')).not.toThrow()
  })

  it('does not apply the rule when the match spans an inline atom', () => {
    editor = createEditor('<p>`a<span data-atom></span></p>')

    const handled = typeAtEndOfParagraph(editor, '`')

    // someProp returns undefined when the handler declines the input
    expect(handled).toBeFalsy()
    expect(editor.getHTML()).not.toContain('<code>')
  })

  it('does not crash with multiple atoms inside the match', () => {
    editor = createEditor(
      '<p>`a<span data-atom></span><span data-atom></span><span data-atom></span></p>',
    )

    expect(() => typeAtEndOfParagraph(editor, '`')).not.toThrow()
  })

  it('does not corrupt preceding text when the match spans an atom (#7833)', () => {
    // with enough text before the backtick the miscalculated range stays positive,
    // so instead of crashing it used to silently mark/replace the wrong content
    editor = createEditor('<p>hello world `a<span data-atom></span></p>')

    expect(() => typeAtEndOfParagraph(editor, '`')).not.toThrow()
    expect(editor.getHTML()).toBe('<p>hello world `a<span data-atom=""></span></p>')
  })

  it('does not apply the rule when the match spans an atom with a custom text representation', () => {
    editor = createEditor('<p>hello `a<span data-atom-text></span></p>')

    const handled = typeAtEndOfParagraph(editor, '`')

    expect(handled).toBeFalsy()
    expect(editor.getHTML()).toBe('<p>hello `a<span data-atom-text=""></span></p>')
  })

  it('still applies input rules to plain text', () => {
    editor = createEditor('<p>some `code</p>')

    const handled = typeAtEndOfParagraph(editor, '`')

    expect(handled).toBe(true)
    expect(editor.getHTML()).toContain('<code>code</code>')
  })

  it('still applies input rules when an atom precedes the match', () => {
    editor = createEditor('<p><span data-atom></span>x `code</p>')

    const handled = typeAtEndOfParagraph(editor, '`')

    expect(handled).toBe(true)
    expect(editor.getHTML()).toContain('<code>code</code>')
  })
})
