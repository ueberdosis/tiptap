import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('pluginOrder', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('runs keyboard shortcuts in correct priority order', () => {
    const order: number[] = []

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          priority: 1000,
          addKeyboardShortcuts() {
            return {
              a: () => {
                order.push(1)
                return false
              },
            }
          },
        }),
        Extension.create({
          addKeyboardShortcuts() {
            return {
              a: () => {
                order.push(3)
                return false
              },
            }
          },
        }),
        Extension.create({
          addKeyboardShortcuts() {
            return {
              a: () => {
                order.push(2)
                return false
              },
            }
          },
        }),
      ],
    })

    editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))

    expect(order).toEqual([1, 2, 3])
  })
})
