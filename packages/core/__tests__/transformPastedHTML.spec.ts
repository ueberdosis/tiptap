import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

describe('transformPastedHTML', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('runs transforms in correct priority order (higher priority first)', () => {
    const order: number[] = []

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'extension1',
          priority: 100,
          transformPastedHTML(html) {
            order.push(2)
            return html
          },
        }),
        Extension.create({
          name: 'extension2',
          priority: 200,
          transformPastedHTML(html) {
            order.push(1)
            return html
          },
        }),
        Extension.create({
          name: 'extension3',
          priority: 50,
          transformPastedHTML(html) {
            order.push(3)
            return html
          },
        }),
      ],
    })

    editor.view.props.transformPastedHTML?.('<p>test</p>', editor.view)

    expect(order).toEqual([1, 2, 3])
  })

  it('chains transforms correctly', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'replaceFoo',
          priority: 100,
          transformPastedHTML(html) {
            return html.replace(/foo/g, 'bar')
          },
        }),
        Extension.create({
          name: 'replaceBar',
          priority: 90,
          transformPastedHTML(html) {
            return html.replace(/bar/g, 'baz')
          },
        }),
      ],
    })

    const result = editor.view.props.transformPastedHTML?.('<p>foo</p>', editor.view)

    expect(result).toBe('<p>baz</p>')
  })

  it('integrates with baseTransform from editorProps', () => {
    editor = new Editor({
      editorProps: {
        transformPastedHTML(html) {
          return html.replace(/base/g, 'replaced')
        },
      },
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'extensionTransform',
          transformPastedHTML(html) {
            return html.replace(/replaced/g, 'final')
          },
        }),
      ],
    })

    const result = editor.view.props.transformPastedHTML?.('<p>base</p>', editor.view)

    expect(result).toBe('<p>final</p>')
  })

  it('handles extensions without transforms', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'noTransform',
        }),
        Extension.create({
          name: 'withTransform',
          transformPastedHTML(html) {
            return html.replace(/test/g, 'success')
          },
        }),
      ],
    })

    const result = editor.view.props.transformPastedHTML?.('<p>test</p>', editor.view)

    expect(result).toBe('<p>success</p>')
  })

  it('returns original HTML if no transforms are defined', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({ name: 'noTransform1' }),
        Extension.create({ name: 'noTransform2' }),
      ],
    })

    const result = editor.view.props.transformPastedHTML?.('<p>unchanged</p>', editor.view)

    expect(result).toBe('<p>unchanged</p>')
  })

  it('has access to extension context', () => {
    let capturedContext: any = null

    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'contextChecker',
          addOptions() {
            return {
              testOption: 'testValue',
            }
          },
          transformPastedHTML(html) {
            capturedContext = {
              name: this.name,
              hasOptions: !!this.options,
              hasEditor: !!this.editor,
              hasStorage: this.storage !== undefined,
            }
            return html
          },
        }),
      ],
    })

    editor.view.props.transformPastedHTML?.('<p>test</p>', editor.view)

    expect(capturedContext).toEqual({
      name: 'contextChecker',
      hasOptions: true,
      hasEditor: true,
      hasStorage: true,
    })
  })

  it('works with multiple transforms modifying HTML structure', () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Extension.create({
          name: 'removeStyles',
          priority: 100,
          transformPastedHTML(html) {
            return html.replace(/\s+style="[^"]*"/gi, '')
          },
        }),
        Extension.create({
          name: 'addClass',
          priority: 90,
          transformPastedHTML(html) {
            return html.replace(/<p>/g, '<p class="clean">')
          },
        }),
      ],
    })

    const result = editor.view.props.transformPastedHTML?.(
      '<p style="color: red;">test</p>',
      editor.view,
    )

    expect(result).toBe('<p class="clean">test</p>')
  })

  it('handles empty HTML', () => {
    editor = new Editor({
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

    const result = editor.view.props.transformPastedHTML?.('', editor.view)

    expect(result).toBe('<p>default</p>')
  })

  it('passes view parameter through', () => {
    let viewPassed = false

    editor = new Editor({
      editorProps: {
        transformPastedHTML(html, view) {
          viewPassed = !!view
          return html
        },
      },
      extensions: [Document, Paragraph, Text],
    })

    editor.view.props.transformPastedHTML?.('<p>test</p>', editor.view)

    expect(viewPassed).toBe(true)
  })
})
