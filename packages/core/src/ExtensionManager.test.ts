import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { Editor } from './Editor.js'
import { Extension } from './Extension.js'

describe('dispatchTransaction', () => {
  it('should call dispatchTransaction from an extension', () => {
    const dispatchTransaction = vi.fn(({ transaction, next }) => next(transaction))
    const CustomExtension = Extension.create({
      name: 'custom',
      dispatchTransaction,
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomExtension],
    })

    editor.commands.insertContent('foo')

    expect(dispatchTransaction).toHaveBeenCalled()

    editor.destroy()
  })

  it('should call multiple dispatchTransaction hooks in priority order', () => {
    const order: string[] = []
    const Extension1 = Extension.create({
      name: 'extension1',
      priority: 10,
      dispatchTransaction({ transaction, next }) {
        order.push('extension1')
        next(transaction)
      },
    })
    const Extension2 = Extension.create({
      name: 'extension2',
      priority: 20,
      dispatchTransaction({ transaction, next }) {
        order.push('extension2')
        next(transaction)
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Extension1, Extension2],
    })

    editor.commands.insertContent('foo')

    expect(order).toEqual(['extension2', 'extension1'])

    editor.destroy()
  })

  it('should block transaction if next is not called', () => {
    const Extension1 = Extension.create({
      name: 'extension1',
      dispatchTransaction() {
        // do nothing
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Extension1],
    })

    editor.commands.insertContent('foo')

    expect(editor.getText()).toBe('')

    editor.destroy()
  })

  it('should allow user-provided dispatchTransaction as base', () => {
    const userDispatch = vi.fn(_tr => {
      // In a real scenario, the user would update the view state here.
      // For this test, we just want to see if it's called.
    })

    const Extension1 = Extension.create({
      name: 'extension1',
      dispatchTransaction({ transaction, next }) {
        next(transaction)
      },
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Extension1],
      editorProps: {
        dispatchTransaction: userDispatch,
      } as any,
    })

    editor.commands.insertContent('foo')

    expect(userDispatch).toHaveBeenCalled()

    editor.destroy()
  })

  it('should bypass extensions if enableExtensionDispatchTransaction is false', () => {
    const dispatchTransaction = vi.fn(({ transaction, next }) => next(transaction))
    const CustomExtension = Extension.create({
      name: 'custom',
      dispatchTransaction,
    })

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, CustomExtension],
      enableExtensionDispatchTransaction: false,
    })

    editor.commands.insertContent('foo')

    expect(dispatchTransaction).not.toHaveBeenCalled()

    editor.destroy()
  })
})

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

describe('transformPastedHTML', () => {
  describe('priority ordering', () => {
    it('should execute transforms in priority order (higher priority first)', () => {
      const executionOrder: number[] = []

      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'low-priority',
            priority: 50,
            transformPastedHTML(html) {
              executionOrder.push(3)
              return html
            },
          }),
          Extension.create({
            name: 'high-priority',
            priority: 200,
            transformPastedHTML(html) {
              executionOrder.push(1)
              return html
            },
          }),
          Extension.create({
            name: 'medium-priority',
            priority: 100,
            transformPastedHTML(html) {
              executionOrder.push(2)
              return html
            },
          }),
        ],
      })

      editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(executionOrder).toEqual([1, 2, 3])

      editor.destroy()
    })

    it('should execute transforms in default priority order when priorities are equal', () => {
      const executionOrder: string[] = []

      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'first',
            transformPastedHTML(html) {
              executionOrder.push('first')
              return html
            },
          }),
          Extension.create({
            name: 'second',
            transformPastedHTML(html) {
              executionOrder.push('second')
              return html
            },
          }),
        ],
      })

      editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(executionOrder).toEqual(['first', 'second'])

      editor.destroy()
    })
  })

  describe('transform chaining', () => {
    it('should chain transforms correctly', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'first-transform',
            priority: 100,
            transformPastedHTML(html) {
              return html.replace(/foo/g, 'bar')
            },
          }),
          Extension.create({
            name: 'second-transform',
            priority: 90,
            transformPastedHTML(html) {
              return html.replace(/bar/g, 'baz')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>foo</p>')

      expect(result).toBe('<p>baz</p>')

      editor.destroy()
    })

    it('should pass transformed HTML through entire chain', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'add-prefix',
            priority: 100,
            transformPastedHTML(html) {
              return `PREFIX-${html}`
            },
          }),
          Extension.create({
            name: 'add-suffix',
            priority: 90,
            transformPastedHTML(html) {
              return `${html}-SUFFIX`
            },
          }),
          Extension.create({
            name: 'add-wrapper',
            priority: 80,
            transformPastedHTML(html) {
              return `[${html}]`
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('TEST')

      expect(result).toBe('[PREFIX-TEST-SUFFIX]')

      editor.destroy()
    })
  })

  describe('baseTransform integration', () => {
    it('should run baseTransform before extension transforms', () => {
      const editor = new Editor({
        editorProps: {
          transformPastedHTML(html) {
            return html.replace(/original/g, 'base')
          },
        },
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'extension-transform',
            transformPastedHTML(html) {
              return html.replace(/base/g, 'final')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>original</p>')

      expect(result).toBe('<p>final</p>')

      editor.destroy()
    })

    it('should work when baseTransform is undefined', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'extension-transform',
            transformPastedHTML(html) {
              return html.replace(/test/g, 'success')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(result).toBe('<p>success</p>')

      editor.destroy()
    })
  })

  describe('extensions without transforms', () => {
    it('should skip extensions without transformPastedHTML', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'no-transform',
            // No transformPastedHTML defined
          }),
          Extension.create({
            name: 'with-transform',
            transformPastedHTML(html) {
              return html.replace(/test/g, 'success')
            },
          }),
          Extension.create({
            name: 'another-no-transform',
            // No transformPastedHTML defined
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(result).toBe('<p>success</p>')

      editor.destroy()
    })

    it('should return original HTML when no transforms are defined', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'extension-1',
          }),
          Extension.create({
            name: 'extension-2',
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>unchanged</p>')

      expect(result).toBe('<p>unchanged</p>')

      editor.destroy()
    })
  })

  describe('extension context', () => {
    it('should provide correct context to transformPastedHTML', () => {
      let capturedContext: any = null

      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'test-extension',
            addOptions() {
              return {
                customOption: 'value',
              }
            },
            addStorage() {
              return {
                customStorage: 'stored',
              }
            },
            transformPastedHTML(html) {
              capturedContext = {
                name: this.name,
                options: this.options,
                storage: this.storage,
                editor: this.editor,
              }
              return html
            },
          }),
        ],
      })

      editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(capturedContext).toBeDefined()
      expect(capturedContext.name).toBe('test-extension')
      expect(capturedContext.options).toMatchObject({ customOption: 'value' })
      expect(capturedContext.storage).toMatchObject({ customStorage: 'stored' })
      expect(capturedContext.editor).toBe(editor)

      editor.destroy()
    })

    it('should allow accessing editor state in transformPastedHTML', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'state-aware',
            transformPastedHTML(html) {
              const isEmpty = this.editor.isEmpty
              return isEmpty ? `${html}<!-- empty -->` : html
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(result).toContain('<!-- empty -->')

      editor.destroy()
    })
  })

  describe('edge cases', () => {
    it('should handle empty HTML string', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'transform',
            transformPastedHTML(html) {
              return html || '<p>default</p>'
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('')

      expect(result).toBe('<p>default</p>')

      editor.destroy()
    })

    it('should handle HTML with special characters', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'preserve-special',
            transformPastedHTML(html) {
              return html.replace(/&amp;/g, '&')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>&amp;test&amp;</p>')

      expect(result).toBe('<p>&test&</p>')

      editor.destroy()
    })

    it('should handle very long HTML strings', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'transform',
            transformPastedHTML(html) {
              return html.replace(/test/g, 'success')
            },
          }),
        ],
      })

      const longHtml = `<p>${'test '.repeat(10000)}</p>`
      const result = editor.view.props.transformPastedHTML?.(longHtml)

      expect(result).toContain('success')
      expect(result).not.toContain('test')

      editor.destroy()
    })

    it('should handle malformed HTML gracefully', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'transform',
            transformPastedHTML(html) {
              return html.replace(/test/g, 'success')
            },
          }),
        ],
      })

      const malformedHtml = '<p>test</span>'
      const result = editor.view.props.transformPastedHTML?.(malformedHtml)

      expect(result).toBe('<p>success</span>')

      editor.destroy()
    })
  })

  describe('view parameter', () => {
    it('should pass view parameter to baseTransform', () => {
      let viewReceived: any = null

      const editor = new Editor({
        editorProps: {
          transformPastedHTML(html, view) {
            viewReceived = view
            return html
          },
        },
        extensions: [Document, Paragraph, Text],
      })

      editor.view.props.transformPastedHTML?.('<p>test</p>', editor.view)

      expect(viewReceived).toBe(editor.view)

      editor.destroy()
    })

    it('should work when view parameter is undefined', () => {
      const editor = new Editor({
        editorProps: {
          transformPastedHTML(html, view) {
            return view ? html : `${html}<!-- no view -->`
          },
        },
        extensions: [Document, Paragraph, Text],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(result).toContain('<!-- no view -->')

      editor.destroy()
    })
  })

  describe('real-world scenarios', () => {
    it('should remove inline styles and dangerous attributes', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'security',
            priority: 100,
            transformPastedHTML(html) {
              return html.replace(/\s+style="[^"]*"/gi, '').replace(/\s+on\w+="[^"]*"/gi, '')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.(
        '<p style="color: red;" onclick="alert(\'xss\')">test</p>',
      )

      expect(result).toBe('<p>test</p>')

      editor.destroy()
    })

    it('should normalize whitespace from word processors', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'normalize-whitespace',
            transformPastedHTML(html) {
              return html
                .replace(/\t/g, '  ')
                .replace(/\u00a0/g, ' ')
                .replace(/\s+/g, ' ')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.(
        '<p>test\t\u00a0  multiple   spaces</p>',
      )

      expect(result).toBe('<p>test multiple spaces</p>')

      editor.destroy()
    })

    it('should chain multiple practical transforms', () => {
      const editor = new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'remove-styles',
            priority: 100,
            transformPastedHTML(html) {
              return html.replace(/\s+style="[^"]*"/gi, '')
            },
          }),
          Extension.create({
            name: 'normalize-tags',
            priority: 90,
            transformPastedHTML(html) {
              return html.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>')
            },
          }),
          Extension.create({
            name: 'add-classes',
            priority: 80,
            transformPastedHTML(html) {
              return html.replace(/<p>/g, '<p class="editor-paragraph">')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.(
        '<p style="color: red;"><b>test</b></p>',
      )

      expect(result).toBe('<p class="editor-paragraph"><strong>test</strong></p>')

      editor.destroy()
    })
  })

  describe('performance', () => {
    it('should handle many extensions efficiently', () => {
      const extensions = [Document, Paragraph, Text]

      // Add 50 extensions with transforms
      for (let i = 0; i < 50; i += 1) {
        extensions.push(
          Extension.create({
            name: `extension-${i}`,
            priority: 1000 - i,
            transformPastedHTML(html) {
              return html // Pass through
            },
          }),
        )
      }

      const editor = new Editor({ extensions })

      const start = Date.now()
      const result = editor.view.props.transformPastedHTML?.('<p>test</p>')
      const duration = Date.now() - start

      expect(result).toBe('<p>test</p>')
      expect(duration).toBeLessThan(100) // Should complete quickly

      editor.destroy()
    })
  })
})

describe('parent/child cleanup on destroy', () => {
  it('should break parent/child chain when editor is destroyed (extend path)', () => {
    const singleton = Extension.create({
      name: 'testExtension',
      addOptions() {
        return { foo: 'bar' }
      },
    })

    const childExtension = singleton.extend({
      addOptions() {
        return { ...this.parent?.(), foo: 'baz' }
      },
    })

    expect(singleton.child).toBe(childExtension)
    expect(childExtension.parent).toBe(singleton)

    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text, childExtension],
    })

    editor.destroy()

    expect(singleton.child).toBeNull()
  })

  it('should clear forward parent.child links on all extensions after editor.destroy()', () => {
    const singletonA = Extension.create({
      name: 'extA',
      addOptions() {
        return { value: 'a' }
      },
    })
    const singletonB = Extension.create({
      name: 'extB',
      addOptions() {
        return { value: 'b' }
      },
    })

    const configuredA = singletonA.configure({ value: 'a-configured' })
    const childB = singletonB.extend({ name: 'extB-child' })

    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text, configuredA, childB],
    })

    const { extensions } = editor.extensionManager

    editor.destroy()

    extensions.forEach(ext => {
      if (ext.parent?.child === ext) {
        // This should never be true after destroy — the forward link is always broken
        expect(ext.parent.child).toBeNull()
      }
    })
  })

  it('should break all ancestor child links in a multi-level extend chain after editor.destroy()', () => {
    const root = Extension.create({
      name: 'root',
      addOptions() {
        return { level: 0 }
      },
    })

    const child = root.extend({
      addOptions() {
        return { ...this.parent?.(), level: 1 }
      },
    })

    const grandchild = child.extend({
      addOptions() {
        return { ...this.parent?.(), level: 2 }
      },
    })

    expect(root.child).toBe(child)
    expect(child.child).toBe(grandchild)
    expect(grandchild.parent).toBe(child)
    expect(child.parent).toBe(root)

    const editor = new Editor({
      element: null,
      extensions: [Document, Paragraph, Text, grandchild],
    })

    editor.destroy()

    expect(root.child).toBeNull()
    expect(child.child).toBeNull()
  })
})
