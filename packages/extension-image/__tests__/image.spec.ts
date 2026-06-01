import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Markdown } from '@tiptap/markdown'
import { describe, expect, it } from 'vitest'

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

    editor?.destroy()
    getEditorEl()?.remove()
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

    editor?.destroy()
    getEditorEl()?.remove()
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

    editor?.destroy()
    getEditorEl()?.remove()
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
    // THIS IS THE BUG: when resize is enabled, addNodeView takes over DOM creation
    // and does NOT apply this.options.HTMLAttributes - only the node's resolved attrs
    expect(img?.getAttribute('class')).toBe('my-classname')
    expect(img?.getAttribute('data-test')).toBe('value')
    expect(img?.getAttribute('src')).toBe(imgSrc)

    editor?.destroy()
    getEditorEl()?.remove()
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
    // THIS IS THE BUG: same issue - node view doesn't apply options.HTMLAttributes
    expect(img?.getAttribute('class')).toBe('my-classname')
    expect(img?.getAttribute('src')).toBe('https://example.com/image.jpg')

    editor?.destroy()
    getEditorEl()?.remove()
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

    editor?.destroy()
    getEditorEl()?.remove()
  })
})
