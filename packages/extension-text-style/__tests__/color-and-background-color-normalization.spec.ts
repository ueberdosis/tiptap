import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { BackgroundColor, Color, TextStyle } from '@tiptap/extension-text-style'
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

/** Wait for both plugins' async initial normalization (setTimeout(0)) to fire. */
function flushPluginInit(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}

describe('color and backgroundColor normalization on the same text node', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
  })

  it('normalizes both attrs on initial load without throwing a mismatched-transaction error', async () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        Color.configure({ colorNormalizer: fakeNormalizeColor }),
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
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { color: '#ff0000', backgroundColor: '#00ff00' },
                  },
                ],
                text: 'red on green',
              },
            ],
          },
        ],
      },
    })

    // Both Color's and BackgroundColor's plugins schedule a setTimeout(0) fix-up
    // for the initial document; letting both run is what would previously raise
    // "RangeError: Applying a mismatched transaction" for the second one.
    await flushPluginInit()

    const marks = editor.state.doc.firstChild!.firstChild!.marks

    expect(marks).toHaveLength(1)
    expect(marks[0].attrs.color).toBe('rgb(255, 0, 0)')
    expect(marks[0].attrs.backgroundColor).toBe('rgb(0, 255, 0)')
  })

  it('clears the pending initial-normalization timer when the editor is destroyed early', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        TextStyle,
        Color.configure({ colorNormalizer: fakeNormalizeColor }),
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
                marks: [
                  {
                    type: 'textStyle',
                    attrs: { color: '#ff0000', backgroundColor: '#00ff00' },
                  },
                ],
                text: 'red on green',
              },
            ],
          },
        ],
      },
    })

    // Destroy before the setTimeout(0) fix-up fires. If the timer isn't
    // cleared, its callback would run afterwards and try to read/dispatch
    // against a destroyed view.
    expect(() => {
      editor!.destroy()
      editor = null
    }).not.toThrow()
  })
})
