import { Editor, Mark } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

const Annotation = Mark.create({
  name: 'annotation',
  clearable: false,
  parseHTML() {
    return [{ tag: 'span[data-annotation]' }]
  },
  renderHTML() {
    return ['span', { 'data-annotation': 'true' }, 0]
  },
})

describe('unsetAllMarks', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('removes all clearable marks in the selection', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Italic],
      content: '<p><strong><em>hello</em></strong></p>',
    })

    editor.commands.selectAll()
    editor.commands.unsetAllMarks()

    expect(editor.getHTML()).toBe('<p>hello</p>')
  })

  it('preserves marks with clearable: false', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Annotation],
      content: '<p><span data-annotation="true"><strong>hello</strong></span></p>',
    })

    editor.commands.selectAll()
    editor.commands.unsetAllMarks()

    expect(editor.getHTML()).toBe('<p><span data-annotation="true">hello</span></p>')
  })

  it('returns true for can() when the selection only has non-clearable marks (no-op)', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Annotation],
      content: '<p><span data-annotation="true">hello</span></p>',
    })

    editor.commands.selectAll()

    expect(editor.can().unsetAllMarks()).toBe(true)
  })

  it('returns true for can() when the selection has clearable marks', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Annotation],
      content: '<p><span data-annotation="true"><strong>hello</strong></span></p>',
    })

    editor.commands.selectAll()

    expect(editor.can().unsetAllMarks()).toBe(true)
  })

  it('removes all marks including non-clearable ones with ignoreClearable option', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Annotation],
      content: '<p><span data-annotation="true"><strong>hello</strong></span></p>',
    })

    editor.commands.selectAll()
    editor.commands.unsetAllMarks({ ignoreClearable: true })

    expect(editor.getHTML()).toBe('<p>hello</p>')
  })

  it('returns true for can() with ignoreClearable even with only non-clearable marks', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Annotation],
      content: '<p><span data-annotation="true">hello</span></p>',
    })

    editor.commands.selectAll()

    expect(editor.can().unsetAllMarks({ ignoreClearable: true })).toBe(true)
  })

  it('allows explicit unsetMark on non-clearable marks', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Annotation],
      content: '<p><span data-annotation="true">hello</span></p>',
    })

    editor.commands.selectAll()
    editor.commands.unsetMark('annotation')

    expect(editor.getHTML()).toBe('<p>hello</p>')
  })
})
