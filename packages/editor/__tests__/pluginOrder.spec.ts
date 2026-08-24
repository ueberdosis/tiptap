import { Editor, Extension } from '@tiptap/editor'
import { Document } from '@tiptap/editor/extensions/document'
import { Paragraph } from '@tiptap/editor/extensions/paragraph'
import { Text } from '@tiptap/editor/extensions/text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

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
