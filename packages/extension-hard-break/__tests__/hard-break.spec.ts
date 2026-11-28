import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import { HardBreak } from '@tiptap/extension-hard-break'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { __parseFromClipboard } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

describe('HardBreak', () => {
  const transform = HardBreak.config.transformPastedHTML?.bind({} as any)

  it('preserves trailing hard breaks through the clipboard parser', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, HardBreak],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: Array.from({ length: 6 }, () => ({ type: 'hardBreak' })),
          },
        ],
      },
    })
    const originalSlice = editor.state.doc.slice(0, editor.state.doc.content.size)
    const { dom } = editor.view.serializeForClipboard(originalSlice)
    const parsedSlice = __parseFromClipboard(
      editor.view,
      '',
      dom.innerHTML,
      false,
      editor.state.selection.$from,
    )

    expect(parsedSlice.content.toJSON()).toEqual(originalSlice.content.toJSON())
  })

  it('marks trailing hard breaks from Tiptap clipboard HTML', () => {
    const html = '<div data-pm-slice="1 1 []"><p>Example<br><br></p></div>'

    expect(transform?.(html)).toBe(
      '<div data-pm-slice="1 1 []"><p>Example<br><br><!--tiptap-preserve-trailing-hard-break--></p></div>',
    )
  })

  it('leaves non-Tiptap clipboard HTML unchanged', () => {
    const html = '<p>Example<br><br></p>'

    expect(transform?.(html)).toBe(html)
  })
})
