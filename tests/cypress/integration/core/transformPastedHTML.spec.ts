/// <reference types="cypress" />

import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

describe('transformPastedHTML', () => {
  it('should run transforms in correct priority order (higher priority first)', () => {
    const order: number[] = []

    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      const editor = new Editor({
        element,
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

      // Manually trigger the transform
      editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(order).to.deep.eq([1, 2, 3])

      editor.destroy()
    })
  })

  it('should chain transforms correctly', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      const editor = new Editor({
        element,
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

      const result = editor.view.props.transformPastedHTML?.('<p>foo</p>')

      // First transform: foo -> bar (priority 100)
      // Second transform: bar -> baz (priority 90)
      expect(result).to.eq('<p>baz</p>')

      editor.destroy()
    })
  })

  it('should integrate with baseTransform from editorProps', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      const editor = new Editor({
        element,
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

      const result = editor.view.props.transformPastedHTML?.('<p>base</p>')

      // Base transform runs first: base -> replaced
      // Extension transform runs second: replaced -> final
      expect(result).to.eq('<p>final</p>')

      editor.destroy()
    })
  })

  it('should handle extensions without transforms', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      const editor = new Editor({
        element,
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'noTransform',
            // No transformPastedHTML defined
          }),
          Extension.create({
            name: 'withTransform',
            transformPastedHTML(html) {
              return html.replace(/test/g, 'success')
            },
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>test</p>')

      // Should still work even with extensions that don't define transformPastedHTML
      expect(result).to.eq('<p>success</p>')

      editor.destroy()
    })
  })

  it('should return original HTML if no transforms are defined', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      const editor = new Editor({
        element,
        extensions: [
          Document,
          Paragraph,
          Text,
          Extension.create({
            name: 'noTransform1',
          }),
          Extension.create({
            name: 'noTransform2',
          }),
        ],
      })

      const result = editor.view.props.transformPastedHTML?.('<p>unchanged</p>')

      expect(result).to.eq('<p>unchanged</p>')

      editor.destroy()
    })
  })

  it('should have access to extension context', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      let capturedContext: any = null

      const editor = new Editor({
        element,
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

      editor.view.props.transformPastedHTML?.('<p>test</p>')

      expect(capturedContext).to.deep.eq({
        name: 'contextChecker',
        hasOptions: true,
        hasEditor: true,
        hasStorage: true,
      })

      editor.destroy()
    })
  })

  it('should work with multiple transforms modifying HTML structure', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      const editor = new Editor({
        element,
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

      const result = editor.view.props.transformPastedHTML?.('<p style="color: red;">test</p>')

      expect(result).to.eq('<p class="clean">test</p>')

      editor.destroy()
    })
  })

  it('should handle empty HTML', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      const editor = new Editor({
        element,
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

      expect(result).to.eq('<p>default</p>')

      editor.destroy()
    })
  })

  it('should handle view parameter being passed through', () => {
    cy.window().then(({ document }) => {
      const element = document.createElement('div')

      document.body.append(element)

      let viewPassed = false

      const editor = new Editor({
        element,
        editorProps: {
          transformPastedHTML(html, view) {
            viewPassed = !!view
            return html
          },
        },
        extensions: [Document, Paragraph, Text],
      })

      editor.view.props.transformPastedHTML?.('<p>test</p>', editor.view)

      expect(viewPassed).to.equal(true)

      editor.destroy()
    })
  })
})
