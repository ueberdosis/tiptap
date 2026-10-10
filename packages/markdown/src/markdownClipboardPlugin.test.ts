import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Plugin } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Markdown } from './Extension.js'

const createEditor = (transformPastedText?: boolean, withHeading = true) =>
  new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      ...(withHeading ? [Heading] : []),
      Markdown.configure(transformPastedText === undefined ? {} : { transformPastedText }),
    ],
    content: '<p></p>',
  })

const parseClipboardText = (
  editor: Editor,
  text: string,
  plainText = false,
  markNames: string[] = [],
) => {
  const plugin = editor.state.plugins.find(candidate => candidate.props.clipboardTextParser) as
    | Plugin
    | undefined
  const $context = editor.state.doc.resolve(1)
  const marks = markNames.map(name => editor.schema.marks[name].create())

  $context.marks = () => marks

  return plugin?.props.clipboardTextParser?.call(plugin, text, $context, plainText, editor.view)
}

describe('markdown clipboard text parser', () => {
  let editor: Editor

  afterEach(() => editor?.destroy())

  it('parses markdown blocks into a closed slice', () => {
    editor = createEditor(true)

    const slice = parseClipboardText(editor, '# title\n\n## sub')

    expect(slice?.content.childCount).toBe(2)
    expect(slice?.content.child(0).type.name).toBe('heading')
    expect(slice?.content.child(0).attrs.level).toBe(1)
    expect(slice?.content.child(1).attrs.level).toBe(2)
    expect([slice?.openStart, slice?.openEnd]).toEqual([0, 0])
  })

  it('opens a single paragraph so it merges into the current text', () => {
    editor = createEditor(true)

    const slice = parseClipboardText(editor, 'hello **world**')

    expect(slice?.content.childCount).toBe(1)
    expect([slice?.openStart, slice?.openEnd]).toEqual([1, 1])
  })

  it('returns null when pasting as plain text', () => {
    editor = createEditor(true)

    expect(parseClipboardText(editor, '# title', true)).toBeNull()
  })

  it('returns null by default', () => {
    editor = createEditor()

    expect(parseClipboardText(editor, '# title')).toBeNull()
  })

  it('returns null for empty text', () => {
    editor = createEditor(true)

    expect(parseClipboardText(editor, '')).toBeNull()
  })

  it('returns null instead of throwing when the schema lacks a parsed node', () => {
    editor = createEditor(true, false)

    expect(() => parseClipboardText(editor, '# title')).not.toThrow()
    expect(parseClipboardText(editor, '# title')).toBeNull()
  })

  describe('inherited marks at the insertion point', () => {
    const markNamesOf = (node: { marks: readonly { type: { name: string } }[] }) =>
      node.marks.map(mark => mark.type.name).sort()

    it('applies the context marks to a single pasted paragraph', () => {
      editor = createEditor(true)

      const slice = parseClipboardText(editor, 'hello world', false, ['bold'])

      expect(markNamesOf(slice!.content.firstChild!.firstChild!)).toEqual(['bold'])
    })

    it('keeps marks parsed from markdown next to the context marks', () => {
      editor = createEditor(true)

      const slice = parseClipboardText(editor, 'a *b* c', false, ['bold'])
      const texts: Array<[string, string[]]> = []

      slice!.content.firstChild!.forEach(child => texts.push([child.text!, markNamesOf(child)]))

      expect(texts).toEqual([
        ['a ', ['bold']],
        ['b', ['bold', 'italic']],
        [' c', ['bold']],
      ])
    })

    it('adds no marks when the context has none', () => {
      editor = createEditor(true)

      const slice = parseClipboardText(editor, 'hello world')

      expect(markNamesOf(slice!.content.firstChild!.firstChild!)).toEqual([])
    })

    it('does not apply the context marks to multiple blocks', () => {
      editor = createEditor(true)

      const slice = parseClipboardText(editor, '# title\n\ntext', false, ['bold'])

      expect(markNamesOf(slice!.content.child(0).firstChild!)).toEqual([])
      expect(markNamesOf(slice!.content.child(1).firstChild!)).toEqual([])
    })
  })
})
