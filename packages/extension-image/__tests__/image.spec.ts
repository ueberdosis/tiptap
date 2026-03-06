import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import Image from '../src/index.js'

describe('extension-image', () => {
  const editorElClass = 'tiptap'
  let editor: Editor | null = null

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)
    document.body.appendChild(editorEl)
    return editorEl
  }

  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  const destroyEditor = () => {
    editor?.destroy()
    editor = null
    getEditorEl()?.remove()
  }

  afterEach(() => {
    destroyEditor()
  })

  /**
   * Minimal extension that adds a global `customId` attribute (rendered as `data-custom-id`)
   * to specified node types. This simulates what UniqueID does but without the complex
   * plugin machinery, making it reliable in test environments.
   */
  const CustomIdAttribute = Extension.create({
    name: 'customIdAttribute',

    addGlobalAttributes() {
      return [
        {
          types: ['image'],
          attributes: {
            customId: {
              default: null,
              parseHTML: (element: HTMLElement) => element.getAttribute('data-custom-id'),
              renderHTML: (attributes: Record<string, any>) => {
                if (!attributes.customId) {
                  return {}
                }

                return { 'data-custom-id': attributes.customId }
              },
            },
          },
        },
      ]
    },
  })

  describe('resizable image attribute updates', () => {
    it('should render global attributes on the resizable image element', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Image.configure({
            resize: { enabled: true },
          }),
          CustomIdAttribute,
        ],
        content: {
          type: 'doc',
          content: [
            {
              type: 'image',
              attrs: {
                src: 'https://tiptap.dev/placeholder.png',
                customId: 'my-id-123',
              },
            },
          ],
        },
      })

      const container = editor.view.dom.querySelector('[data-resize-container]')

      expect(container).not.toBeNull()

      const img = container?.querySelector('img')

      expect(img).not.toBeNull()
      expect(img?.getAttribute('src')).toBe('https://tiptap.dev/placeholder.png')
      expect(img?.getAttribute('data-custom-id')).toBe('my-id-123')
    })

    it('should update global attributes on the img element when node attributes change', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Image.configure({
            resize: { enabled: true },
          }),
          CustomIdAttribute,
        ],
        content: {
          type: 'doc',
          content: [
            {
              type: 'image',
              attrs: {
                src: 'https://tiptap.dev/placeholder.png',
                customId: 'original-id',
              },
            },
          ],
        },
      })

      const container = editor.view.dom.querySelector('[data-resize-container]')
      const img = container?.querySelector('img')

      expect(img?.getAttribute('data-custom-id')).toBe('original-id')

      // Update the customId — the img element should reflect the new value
      editor.commands.updateAttributes('image', { customId: 'updated-id' })

      expect(img?.getAttribute('data-custom-id')).toBe('updated-id')
    })

    it('should preserve global attributes when other attributes change', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Image.configure({
            resize: { enabled: true },
          }),
          CustomIdAttribute,
        ],
        content: {
          type: 'doc',
          content: [
            {
              type: 'image',
              attrs: {
                src: 'https://tiptap.dev/placeholder.png',
                customId: 'persistent-id',
              },
            },
          ],
        },
      })

      const container = editor.view.dom.querySelector('[data-resize-container]')
      const img = container?.querySelector('img')

      expect(img?.getAttribute('data-custom-id')).toBe('persistent-id')

      // Update alt text — data-custom-id should remain
      editor.commands.updateAttributes('image', { alt: 'Updated alt text' })

      expect(img?.getAttribute('alt')).toBe('Updated alt text')
      expect(img?.getAttribute('data-custom-id')).toBe('persistent-id')
    })

    it('should update src on the resizable image when src attribute changes', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Image.configure({
            resize: { enabled: true },
          }),
        ],
        content: {
          type: 'doc',
          content: [
            {
              type: 'image',
              attrs: {
                src: 'https://tiptap.dev/placeholder.png',
              },
            },
          ],
        },
      })

      const container = editor.view.dom.querySelector('[data-resize-container]')
      const img = container?.querySelector('img')

      expect(img?.getAttribute('src')).toBe('https://tiptap.dev/placeholder.png')

      editor.commands.updateAttributes('image', { src: 'https://tiptap.dev/new-image.png' })

      expect(img?.getAttribute('src')).toBe('https://tiptap.dev/new-image.png')
    })

    it('should remove attributes from the resizable image when set to null', () => {
      editor = new Editor({
        element: createEditorEl(),
        extensions: [
          Document,
          Text,
          Paragraph,
          Image.configure({
            resize: { enabled: true },
          }),
          CustomIdAttribute,
        ],
        content: {
          type: 'doc',
          content: [
            {
              type: 'image',
              attrs: {
                src: 'https://tiptap.dev/placeholder.png',
                alt: 'Some alt text',
                title: 'Some title',
                customId: 'to-be-removed',
              },
            },
          ],
        },
      })

      const container = editor.view.dom.querySelector('[data-resize-container]')
      const img = container?.querySelector('img')

      expect(img?.getAttribute('alt')).toBe('Some alt text')
      expect(img?.getAttribute('title')).toBe('Some title')
      expect(img?.getAttribute('data-custom-id')).toBe('to-be-removed')

      editor.commands.updateAttributes('image', { alt: null, title: null, customId: null })

      expect(img?.hasAttribute('alt')).toBe(false)
      expect(img?.hasAttribute('title')).toBe(false)
      expect(img?.hasAttribute('data-custom-id')).toBe(false)
    })
  })
})
