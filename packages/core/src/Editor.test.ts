import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from './Editor.js'
import { Extension } from './Extension.js'

const createTestEditor = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit],
  })

describe('Editor', () => {
  it('keeps command fallbacks available while commands initialize', async () => {
    let chain: ReturnType<Editor['chain']> | undefined
    let can: ReturnType<Editor['can']> | undefined

    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [
        StarterKit,
        Extension.create({
          name: 'initialization-test',
          addCommands() {
            chain = this.editor.chain()
            can = this.editor.can()

            return {}
          },
        }),
      ],
    })

    expect(chain?.focus().run()).toBe(false)
    expect(can?.focus()).toBe(false)
    expect(await Promise.resolve(chain)).toBe(chain)
    expect(await Promise.resolve(can)).toBe(can)

    editor.destroy()
  })

  describe('destroy', () => {
    it('should keep the command chain accessible after the editor is destroyed', () => {
      const editor = createTestEditor()

      expect(editor.isDestroyed).toBe(false)
      expect(editor.chain).not.toBe(null)

      editor.destroy()

      expect(editor.isDestroyed).toBe(true)
      expect(editor.chain).not.toBe(null)
      expect(editor.chain().setContent('').run()).toBe(false)
    })

    it('should keep the command can accessible after the editor is destroyed', () => {
      const editor = createTestEditor()

      expect(editor.isDestroyed).toBe(false)
      expect(editor.can).not.toBe(null)

      editor.destroy()

      expect(editor.isDestroyed).toBe(true)
      expect(editor.can).not.toBe(null)

      // can on command
      expect(editor.can().setContent('')).toBe(false)

      // can on chain
      expect(editor.can().chain().setContent('').blur().run()).toBe(false)
    })
  })
})

describe('editorProps', () => {
  const editors: Editor[] = []

  afterEach(() => {
    editors.forEach(editor => editor.destroy())
    editors.length = 0
  })

  it('editorProps can be set while constructing Editor', () => {
    function transformPastedHTML(html: string) {
      return html
    }

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      editorProps: { transformPastedHTML },
    })
    editors.push(editor)

    expect(transformPastedHTML).toBe(editor.view.props.transformPastedHTML)
  })

  it('editorProps can be set through setOptions', () => {
    function transformPastedHTML(html: string) {
      return html
    }

    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
    })
    editors.push(editor)

    editor.setOptions({ editorProps: { transformPastedHTML } })

    expect(transformPastedHTML).toBe(editor.view.props.transformPastedHTML)
  })
})

describe('editorProps.attributes', () => {
  let editor: Editor

  afterEach(() => {
    editor.destroy()
  })

  it('adds role="textbox" when attributes are set while constructing Editor', () => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit],
      editorProps: { attributes: { class: 'my-editor' } },
    })

    expect(editor.view.dom.getAttribute('role')).toBe('textbox')
    expect(editor.view.dom.classList.contains('my-editor')).toBe(true)
  })

  it('keeps role="textbox" when attributes are set through setOptions', () => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit],
      editorProps: { attributes: { class: 'my-editor' } },
    })

    editor.setOptions({ editorProps: { attributes: { class: 'my-editor is-updated' } } })

    expect(editor.view.dom.getAttribute('role')).toBe('textbox')
    expect(editor.view.dom.classList.contains('is-updated')).toBe(true)
  })

  it('keeps role="textbox" when setOptions is called with unrelated options', () => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit],
      editorProps: { attributes: { class: 'my-editor' } },
    })

    editor.setOptions({ editable: false })

    expect(editor.view.dom.getAttribute('role')).toBe('textbox')
    expect(editor.view.dom.classList.contains('my-editor')).toBe(true)
  })

  it('lets the user override the role', () => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit],
      editorProps: { attributes: { role: 'document' } },
    })

    expect(editor.view.dom.getAttribute('role')).toBe('document')

    editor.setOptions({ editorProps: { attributes: { role: 'document', class: 'my-editor' } } })

    expect(editor.view.dom.getAttribute('role')).toBe('document')
  })

  it('keeps role="textbox" when attributes are a function', () => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit],
      editorProps: { attributes: () => ({ class: 'my-editor' }) },
    })

    expect(editor.view.dom.getAttribute('role')).toBe('textbox')
    expect(editor.view.dom.classList.contains('my-editor')).toBe(true)

    editor.setOptions({ editorProps: { attributes: () => ({ class: 'is-updated' }) } })

    expect(editor.view.dom.getAttribute('role')).toBe('textbox')
    expect(editor.view.dom.classList.contains('is-updated')).toBe(true)
  })
})

describe('editor.getHTML / editor.getJSON', () => {
  let editor: Editor

  beforeEach(() => {
    const element = document.createElement('div')
    document.body.appendChild(element)
    editor = new Editor({
      element,
      extensions: [StarterKit],
      content: '<p>Example Text</p>',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('returns html', () => {
    expect(editor.getHTML()).toBe('<p>Example Text</p>')
  })

  it('returns json', () => {
    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Example Text' }],
        },
      ],
    })
  })
})

describe('onContentError', () => {
  it('does not emit a contentError on invalid content (by default)', () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      onContentError: () => {
        expect(false).toBe(true)
      },
    })

    expect(editor.getText()).toBe('')
  })
  it('does not emit a contentError on invalid content (when enableContentCheck = false)', () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: false,
      onContentError: () => {
        expect(false).toBe(true)
      },
    })

    expect(editor.getText()).toBe('')
  })
  it('emits a contentError on invalid content (when enableContentCheck = true)', async () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    let contentErrorCalled = false
    let errorMessage = ''

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: true,
      onContentError: ({ error }) => {
        contentErrorCalled = true
        errorMessage = error.message
      },
    })

    // Wait for async initialization to complete
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0)
    })

    expect(contentErrorCalled).toBe(true)
    expect(errorMessage).toBe('[tiptap error]: Invalid JSON content')
    expect(editor.getText()).toBe('')
  })

  it('does not emit a contentError on valid content', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: true,
      onContentError: () => {
        expect(false).toBe(true)
      },
    })

    expect(editor.getText()).toBe('Example Text')
  })

  it('removes the collaboration extension when has invalid content (when enableContentCheck = true)', () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'collaboration',
          addStorage() {
            return {
              isDisabled: false,
            }
          },
        }),
      ],
      enableContentCheck: true,
      onContentError: args => {
        args.disableCollaboration()
        expect(args.editor.storage.collaboration).toBe(undefined)
      },
    })

    expect(editor.getText()).toBe('')
    expect(editor.storage.collaboration).toBe(undefined)
  })

  it('does not remove the collaboration extension when has valid content (when enableContentCheck = true)', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const editor = new Editor({
      content: json,
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'collaboration',
          addStorage() {
            return {
              isDisabled: false,
            }
          },
        }),
      ],
      enableContentCheck: true,
      onContentError: () => {
        // Should not be called, so we fail the test
        expect(true).toBe(false)
      },
    })

    expect(editor.getText()).toBe('Example Text')
    expect(editor.storage.collaboration.isDisabled).toBe(false)
  })

  it('does not throw when calling setContent(valid) from the onContentError handler', () => {
    const json = {
      invalid: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
    }

    const validJson = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Recovered',
            },
          ],
        },
      ],
    }

    let editor: Editor | undefined

    expect(() => {
      editor = new Editor({
        content: json,
        extensions: [Document, Paragraph, Text],
        enableContentCheck: true,
        onContentError: ({ editor: contentErrorEditor }) => {
          contentErrorEditor.commands.setContent(validJson)
        },
      })
    }).not.toThrow()

    expect(editor?.getText()).toBe('Recovered')
  })

  // Invalid HTML whose fallback keeps a distinguishable "keepme" paragraph, so these
  // tests fail if the fallback doc is ever discarded rather than preserved.
  const invalidHtmlWithSalvageableText = '<p>keepme</p><foobar></foobar>'

  it('preserves the fallback content when the handler runs a non-setContent command', () => {
    const editor = new Editor({
      content: invalidHtmlWithSalvageableText,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: true,
      onContentError: ({ editor: contentErrorEditor }) => {
        contentErrorEditor.commands.setTextSelection(0)
      },
    })

    expect(editor.getText()).toBe('keepme')
  })

  it('keeps the stripped fallback doc when the handler does nothing', () => {
    const editor = new Editor({
      content: invalidHtmlWithSalvageableText,
      extensions: [Document, Paragraph, Text],
      enableContentCheck: true,
      onContentError: () => {},
    })

    expect(editor.getText()).toBe('keepme')
  })
})

describe('unmounted', () => {
  it('should not throw an error when the editor is unmounted', () => {
    expect(() => {
      const editor = new Editor({
        element: null,
        extensions: [Document, Paragraph, Text],
        content: '<p>Hello</p>',
      })

      expect(!!editor).toBe(true)
    }).not.toThrow()
  })

  it('should have a view property that is not null', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    expect(!!editor.view).toBe(true)
  })

  it('should emit a mount event when the editor is mounted', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('mount', () => {
      called = true
      expect(called).toBe(true)
    })
    editor.mount(document.createElement('div'))
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)
    editor.unmount()
  })

  it('should inject CSS when the editor is mounted', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('mount', () => {
      called = true
      expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)
    })

    expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)
    editor.mount(document.createElement('div'))
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)
    editor.unmount()
  })

  it('should emit an unmount event when the editor is unmounted', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    editor.mount(document.createElement('div'))

    let called = false
    editor.on('unmount', () => {
      called = true
      expect(called).toBe(true)
    })
    editor.unmount()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)
  })

  it('should only remove injected CSS when the editor is unmounted if no other editors exist', async () => {
    const elementA = document.createElement('div')
    document.body.appendChild(elementA)

    const elementB = document.createElement('div')
    document.body.appendChild(elementB)

    const editorA = new Editor({
      element: elementA,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    const editorB = new Editor({
      element: elementB,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    let called = false
    editorA.on('unmount', () => {
      expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)
      editorB.unmount()
    })
    editorB.on('unmount', () => {
      called = true
      expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)
    })

    editorA.unmount()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)

    elementA.remove()
    elementB.remove()
  })

  it('should inject CSS into the shadow root when the editor is mounted inside one', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const element = document.createElement('div')
    shadowRoot.appendChild(element)

    const editor = new Editor({
      element,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    expect(shadowRoot.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)
    expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)

    editor.unmount()

    expect(shadowRoot.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)

    host.remove()
  })

  it('should inject CSS once per shadow root and keep it until the last editor in it is unmounted', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const elementA = document.createElement('div')
    const elementB = document.createElement('div')
    shadowRoot.append(elementA, elementB)

    const documentElement = document.createElement('div')
    document.body.appendChild(documentElement)

    const editorA = new Editor({ element: elementA, extensions: [Document, Paragraph, Text] })
    const editorB = new Editor({ element: elementB, extensions: [Document, Paragraph, Text] })
    const documentEditor = new Editor({
      element: documentElement,
      extensions: [Document, Paragraph, Text],
    })

    expect(shadowRoot.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)
    expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)

    editorA.unmount()
    expect(shadowRoot.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)

    editorB.unmount()
    expect(shadowRoot.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)
    expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)

    documentEditor.unmount()
    expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)

    host.remove()
    documentElement.remove()
  })

  it('should move injected CSS into the shadow root when the editor DOM is moved into one', () => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [Document, Paragraph, Text],
    })

    expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)

    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const element = document.createElement('div')
    shadowRoot.appendChild(element)

    // what the React EditorContent does once it renders
    element.append(...editor.view.dom.parentNode!.childNodes)
    editor.setOptions({ element })

    expect(shadowRoot.querySelectorAll('style[data-tiptap-style]')).toHaveLength(1)
    expect(document.head.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)

    editor.unmount()

    expect(shadowRoot.querySelectorAll('style[data-tiptap-style]')).toHaveLength(0)

    host.remove()
  })

  it('should emit a destroy event when the editor is destroyed', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    let called = false
    editor.on('destroy', () => {
      called = true
      expect(called).toBe(true)
    })
    editor.destroy()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)
    expect(editor.isDestroyed).toBe(true)
  })

  it('should emit an update event when the editor is updated', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('update', () => {
      called = true
      expect(called).toBe(true)
    })
    editor.chain().setContent('<p>Test</p>').run()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)
  })

  it('should emit a transaction event when the editor is updated', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('transaction', () => {
      called = true
      expect(called).toBe(true)
    })
    editor.chain().setContent('<p>Test</p>').run()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)
  })

  it('should emit a selectionUpdate event when the editor is updated', async () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    let called = false
    editor.on('selectionUpdate', () => {
      called = true
      expect(called).toBe(true)
    })
    editor.chain().setContent('<p>Test</p>').run()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
    expect(called).toBe(true)
  })

  it('should be able to make changes to the editor', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    editor.chain().setContent('<p>Test</p>').run()

    expect(editor.state.doc.toJSON()).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
    })
  })

  it('should be able to make multiple changes to the editor', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })

    editor.chain().setContent('<p>Test</p>').run()
    editor.chain().setContent('<p>Test 2</p>').run()

    expect(editor.state.doc.toJSON()).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test 2' }] }],
    })
  })

  it('should be able to read state from the editor view', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    editor.chain().setContent('<p>Test</p>').run()
    expect(editor.view.state.doc.toJSON()).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
    })
  })

  it('should have some commonly accessed properties that are not null', () => {
    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
    })
    expect(editor.view.editable).toBe(true)
    expect(editor.view.composing).toBe(false)
    expect(editor.view.dragging).toBe(null)
    expect(editor.view.isDestroyed).toBe(false)
  })
})
