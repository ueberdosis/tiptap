import { Editor } from '@tiptap/core'
import Document from '@tiptap/editor/nodes/document'
import Paragraph from '@tiptap/editor/nodes/paragraph'
import Text from '@tiptap/editor/nodes/text'
import { describe, expect, it } from 'vitest'

describe('tabindex extension', () => {
  it('should set tabindex="0" on editable editor by default', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
    })

    expect(editor.view.dom.getAttribute('tabindex')).toBe('0')

    editor.destroy()
  })

  it('should not set tabindex on non-editable editor by default', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      editable: false,
    })

    expect(editor.view.dom.getAttribute('tabindex')).toBeNull()

    editor.destroy()
  })

  it('should set custom tabindex on editable editor when configured', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      coreExtensionOptions: {
        tabindex: {
          value: '4',
        },
      },
    })

    expect(editor.view.dom.getAttribute('tabindex')).toBe('4')

    editor.destroy()
  })

  it('should set custom tabindex on non-editable editor when configured', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      editable: false,
      coreExtensionOptions: {
        tabindex: {
          value: '-1',
        },
      },
    })

    expect(editor.view.dom.getAttribute('tabindex')).toBe('-1')

    editor.destroy()
  })

  it('should set tabindex="0" when value is explicitly undefined', () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      coreExtensionOptions: {
        tabindex: {
          value: undefined,
        },
      },
    })

    expect(editor.view.dom.getAttribute('tabindex')).toBe('0')

    editor.destroy()
  })
})
