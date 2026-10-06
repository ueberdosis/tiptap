import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { BackgroundColor, TextStyle } from '@tiptap/extension-text-style'
import { afterEach, describe, expect, it } from 'vitest'

// happy-dom doesn't normalize colors like a real browser (hex stays hex), so
// we use a fake normalizer that simulates the browser's hex→rgb conversion,
// passed explicitly as the opt-in `colorNormalizer` option.
const fakeNormalizeColor = (color: string): string => {
  const hex6 = color.match(/^#([0-9a-f]{6})$/i)

  if (hex6) {
    const r = parseInt(hex6[1].slice(0, 2), 16)
    const g = parseInt(hex6[1].slice(2, 4), 16)
    const b = parseInt(hex6[1].slice(4, 6), 16)

    return `rgb(${r}, ${g}, ${b})`
  }

  return color
}

function flushPluginInit(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}

describe('background-color normalization from JSON content', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
  })

  it('normalizes hex backgroundColor attrs loaded from JSON', async () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        BackgroundColor.configure({ colorNormalizer: fakeNormalizeColor }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'textStyle', attrs: { backgroundColor: '#00ff00' } }],
                text: 'green bg',
              },
            ],
          },
        ],
      },
    })

    await flushPluginInit()

    const marks = editor.state.doc.firstChild!.firstChild!.marks

    expect(marks).toHaveLength(1)
    expect(marks[0].attrs.backgroundColor).toBe('rgb(0, 255, 0)')
  })

  it('normalizes colors set through the setBackgroundColor command', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        BackgroundColor.configure({ colorNormalizer: fakeNormalizeColor }),
      ],
      content: '<p>hello</p>',
    })

    editor.commands.selectAll()
    editor.commands.setBackgroundColor('#00ff00')

    const marks = editor.state.doc.firstChild!.firstChild!.marks

    expect(marks).toHaveLength(1)
    expect(marks[0].attrs.backgroundColor).toBe('rgb(0, 255, 0)')
  })

  it('leaves hex backgroundColor attrs untouched when colorNormalizer is not configured', async () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextStyle, BackgroundColor],
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'textStyle', attrs: { backgroundColor: '#00ff00' } }],
                text: 'green bg',
              },
            ],
          },
        ],
      },
    })

    await flushPluginInit()

    const marks = editor.state.doc.firstChild!.firstChild!.marks

    expect(marks).toHaveLength(1)
    expect(marks[0].attrs.backgroundColor).toBe('#00ff00')
  })
})
