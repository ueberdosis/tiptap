import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Markdown } from '@tiptap/markdown'
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

  const imgSrc = 'https://example.com/image.jpg'

  it('should apply HTMLAttributes via renderHTML when resize is disabled', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Paragraph,
        Text,
        Image.configure({
          HTMLAttributes: {
            class: 'my-classname',
          },
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: imgSrc, alt: 'test-alt' },
          },
        ],
      },
    })

    expect(editor.getHTML()).toContain('class="my-classname"')
  })

  it('should apply HTMLAttributes in the editor DOM when resize is disabled', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Paragraph,
        Text,
        Image.configure({
          HTMLAttributes: {
            class: 'my-classname',
          },
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: imgSrc, alt: 'test-alt' },
          },
        ],
      },
    })

    const img = editor.view.dom.querySelector('img')
    expect(img).not.toBeNull()
    // ProseMirror may add additional classes like 'ProseMirror-selectednode'
    expect(img?.getAttribute('class')).toContain('my-classname')
  })

  it('should apply HTMLAttributes via renderHTML when resize is enabled', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Paragraph,
        Text,
        Image.configure({
          HTMLAttributes: {
            class: 'my-classname',
          },
          resize: {
            enabled: true,
          },
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: imgSrc, alt: 'test-alt' },
          },
        ],
      },
    })

    // getHTML() goes through renderHTML which already correctly merges HTMLAttributes
    expect(editor.getHTML()).toContain('class="my-classname"')
  })

  it('should apply HTMLAttributes in the editor DOM when resize is enabled', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Paragraph,
        Text,
        Image.configure({
          HTMLAttributes: {
            class: 'my-classname',
            'data-test': 'value',
          },
          resize: {
            enabled: true,
          },
        }),
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: imgSrc, alt: 'test-alt' },
          },
        ],
      },
    })

    const img = editor.view.dom.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('class')).toBe('my-classname')
    expect(img?.getAttribute('data-test')).toBe('value')
    expect(img?.getAttribute('src')).toBe(imgSrc)
  })

  it('should apply HTMLAttributes in the editor DOM when resize is enabled and content is markdown', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Paragraph,
        Text,
        Markdown,
        Image.configure({
          HTMLAttributes: {
            class: 'my-classname',
          },
          resize: {
            enabled: true,
          },
        }),
      ],
      content: '![Image](https://example.com/image.jpg)',
      contentType: 'markdown',
    })

    const img = editor.view.dom.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('class')).toBe('my-classname')
    expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg')
  })

  it('should apply HTMLAttributes via renderHTML when resize is enabled and content is markdown', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Paragraph,
        Text,
        Markdown,
        Image.configure({
          HTMLAttributes: {
            class: 'my-classname',
          },
          resize: {
            enabled: true,
          },
        }),
      ],
      content: '![Image](https://example.com/image.jpg)',
      contentType: 'markdown',
    })

    // getHTML() goes through renderHTML which already correctly merges HTMLAttributes
    expect(editor.getHTML()).toContain('class="my-classname"')
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

      // Update the customId so the img element reflects the new value.
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

      // Update alt text while retaining data-custom-id.
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

    it('should clear src on the resizable image when src is set to null', () => {
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

      editor.commands.updateAttributes('image', { src: null })

      expect(img?.hasAttribute('src')).toBe(false)
      expect(img?.getAttribute('src')).toBeNull()
      expect(img?.src).toBe('')
    })

    it('should clear src on the resizable image when src is set to an empty string', () => {
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

      editor.commands.updateAttributes('image', { src: '' })

      expect(img?.hasAttribute('src')).toBe(false)
      expect(img?.getAttribute('src')).toBeNull()
      expect(img?.src).toBe('')
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
