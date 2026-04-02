import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, describe, expect, it, vi } from 'vitest'

// happy-dom doesn't normalize colors like a real browser (hex stays hex),
// so we mock normalizeColor to simulate the browser's hex→rgb conversion.
const { fakeNormalizeColor } = vi.hoisted(() => ({
  fakeNormalizeColor: (color: string): string => {
    const hex6 = color.match(/^#([0-9a-f]{6})$/i)

    if (hex6) {
      const r = parseInt(hex6[1].slice(0, 2), 16)
      const g = parseInt(hex6[1].slice(2, 4), 16)
      const b = parseInt(hex6[1].slice(4, 6), 16)

      return `rgb(${r}, ${g}, ${b})`
    }

    return color
  },
}))

vi.mock('../src/utilities/normalize-color.js', () => ({
  normalizeColor: fakeNormalizeColor,
}))

/** Wait for the plugin's async initial normalization (setTimeout(0)) to fire. */
function flushPluginInit(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}

describe('color normalization from JSON content', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
  })

  it('normalizes hex color attrs loaded from JSON on editor creation', async () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, Color],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'textStyle', attrs: { color: '#ff0000' } }],
                text: 'red text',
              },
            ],
          },
        ],
      },
    })

    await flushPluginInit()

    const marks = editor.state.doc.firstChild!.firstChild!.marks

    expect(marks).toHaveLength(1)
    expect(marks[0].attrs.color).toBe('rgb(255, 0, 0)')
  })

  it('leaves already-canonical rgb values unchanged', async () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, Color],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'textStyle', attrs: { color: 'rgb(255, 0, 0)' } }],
                text: 'red text',
              },
            ],
          },
        ],
      },
    })

    await flushPluginInit()

    const marks = editor.state.doc.firstChild!.firstChild!.marks

    expect(marks).toHaveLength(1)
    expect(marks[0].attrs.color).toBe('rgb(255, 0, 0)')
  })

  it('normalizes hex colors inserted via programmatic update (appendTransaction)', async () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, Color],
      content: '<p>hello</p>',
    })

    await flushPluginInit()

    // Simulate a programmatic or collaborative update that inserts un-normalized color
    const { state } = editor
    const tr = state.tr.addMark(1, 6, state.schema.marks.textStyle.create({ color: '#0000ff' }))

    editor.view.dispatch(tr)

    const marks = editor.state.doc.firstChild!.firstChild!.marks

    expect(marks).toHaveLength(1)
    expect(marks[0].attrs.color).toBe('rgb(0, 0, 255)')
  })
})
