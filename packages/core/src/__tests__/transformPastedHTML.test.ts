import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

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

      const result = editor.view.props.transformPastedHTML?.('<p style="color: red;" onclick="alert(\'xss\')">test</p>')

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

      const result = editor.view.props.transformPastedHTML?.('<p>test\t\u00a0  multiple   spaces</p>')

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

      const result = editor.view.props.transformPastedHTML?.('<p style="color: red;"><b>test</b></p>')

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
