import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
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
      ...(withHeading ? [Heading] : []),
      Markdown.configure(transformPastedText === undefined ? {} : { transformPastedText }),
    ],
    content: '<p></p>',
  })

const parseClipboardText = (editor: Editor, text: string, plainText = false) => {
  const plugin = editor.state.plugins.find(candidate => candidate.props.clipboardTextParser) as
    | Plugin
    | undefined
  const $context = editor.state.doc.resolve(1)

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
})
