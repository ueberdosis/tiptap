/// <reference types="cypress" />

// eslint-disable-next-line max-classes-per-file
import { BrowserEnvironment, Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'

// Helper function to create a browser environment
function createServerBrowserEnvironment(): BrowserEnvironment {
  return new BrowserEnvironment({
    window,
    domParser: window.DOMParser,
  })
}

describe('Server-side Editor', () => {
  let editor: Editor | null = null

  afterEach(() => {
    if (editor) {
      editor.destroy()
      editor = null
    }
  })

  describe('Editor with custom browser environment', () => {
    it('should create editor with custom browser environment', () => {
      const browserEnvironment = createServerBrowserEnvironment()

      editor = new Editor({
        element: browserEnvironment.window.document.createElement('div'),
        extensions: [Document, Paragraph, Text],
        content: '<p>Server-side content</p>',
        browserEnvironment,
      })

      expect(editor).to.be.instanceOf(Editor)
      expect(editor.browserEnvironment).to.equal(browserEnvironment)
    })

    it('should handle content manipulation with custom browser environment', () => {
      const browserEnvironment = createServerBrowserEnvironment()

      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Initial content</p>',
        browserEnvironment,
      })

      // Test that we can get content
      const json = editor.getJSON()
      expect(json).to.have.property('type', 'doc')
      expect(json).to.have.property('content')

      // Test that we can get HTML
      const html = editor.getHTML()
      expect(html).to.be.a('string')
    })

    it('should work with StarterKit extensions', () => {
      const browserEnvironment = createServerBrowserEnvironment()

      editor = new Editor({
        extensions: [StarterKit],
        content: '<p><strong>Bold text</strong> and <em>italic text</em></p>',
        browserEnvironment,
      })

      expect(editor).to.be.instanceOf(Editor)

      const json = editor.getJSON()
      expect(json.type).to.equal('doc')
      expect(json.content).to.be.an('array')
    })
  })

  describe('SSR mode (element: null)', () => {
    it('should create editor for SSR without mounting to DOM', () => {
      class MockBrowserEnvironment extends BrowserEnvironment {
        get window() {
          return undefined
        }
        get document() {
          return undefined
        }
      }

      editor = new Editor({
        element: null,
        extensions: [Document, Paragraph, Text],
        content: '<p>SSR content</p>',
        browserEnvironment: new MockBrowserEnvironment(),
      })

      expect(editor).to.be.instanceOf(Editor)
      // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
      expect(editor.options.element).to.be.null

      const json = editor.getJSON()
      expect(json).to.have.property('type', 'doc')

      const html = editor.getHTML()
      expect(html).to.include('SSR content')
    })

    it('should handle JSON content in SSR mode', () => {
      const jsonContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'JSON content for SSR',
              },
            ],
          },
        ],
      }

      editor = new Editor({
        element: null,
        extensions: [Document, Paragraph, Text],
        content: jsonContent,
      })

      const html = editor.getHTML()
      expect(html).to.include('JSON content for SSR')
    })
  })

  describe('Error handling', () => {
    it('should throw error when trying to mount without document', () => {
      class MockBrowserEnvironment extends BrowserEnvironment {
        get window() {
          return undefined
        }
        get document() {
          return undefined
        }
        get DOMParser() {
          return undefined
        }
      }

      // Should throw error creating editor
      expect(() => {
        editor = new Editor({
          extensions: [Document, Paragraph, Text],
          content: '<p>Test content</p>',
          browserEnvironment: new MockBrowserEnvironment(),
        })
      }).to.throw()
      // Should throw error when trying to mount
      expect(() => {
        editor = new Editor({
          element: null,
          extensions: [Document, Paragraph, Text],
          content: '<p>Test content</p>',
          browserEnvironment: new MockBrowserEnvironment(),
        })
        editor.commands.setContent('<p>Test content</p>')
      }).to.throw()
    })

    it('should handle missing DOMParser gracefully', () => {
      const browserEnvironment = new BrowserEnvironment({
        window: undefined,
        domParser: undefined,
      })

      // This should work for basic editor creation
      editor = new Editor({
        element: null,
        extensions: [Document, Paragraph, Text],
        content: { type: 'doc', content: [] }, // Use JSON content to avoid HTML parsing
        browserEnvironment,
      })

      expect(editor).to.be.instanceOf(Editor)
    })
  })

  describe('Memory management', () => {
    it('should properly clean up server-side editor', () => {
      const browserEnvironment = createServerBrowserEnvironment()

      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '<p>Test content</p>',
        browserEnvironment,
      })

      const isDestroyed = () => editor!.isDestroyed

      // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
      expect(isDestroyed()).to.be.false

      editor.destroy()

      // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
      expect(isDestroyed()).to.be.true

      editor = null // Prevent double cleanup in afterEach
    })
  })

  describe('Content processing', () => {
    it('should process complex HTML content on server', () => {
      const browserEnvironment = createServerBrowserEnvironment()

      const complexContent = `
        <h1>Heading 1</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <blockquote>
          <p>This is a quote</p>
        </blockquote>
      `

      editor = new Editor({
        extensions: [StarterKit],
        content: complexContent,
        browserEnvironment,
      })

      const json = editor.getJSON()
      expect(json.type).to.equal('doc')
      expect(json.content).to.be.an('array')
      expect(json.content.length).to.be.greaterThan(0)
    })

    it('should handle empty content gracefully', () => {
      const browserEnvironment = createServerBrowserEnvironment()

      editor = new Editor({
        extensions: [Document, Paragraph, Text],
        content: '',
        browserEnvironment,
      })

      const json = editor.getJSON()
      expect(json.type).to.equal('doc')

      const html = editor.getHTML()
      expect(html).to.be.a('string')
    })
  })

  describe('Browser environment integration', () => {
    it('should access browser environment through editor instance', () => {
      const mockWindow = { custom: 'test-window', setTimeout: (fn: any) => fn() } as unknown as Window
      const browserEnvironment = new BrowserEnvironment({ window: mockWindow })

      editor = new Editor({
        element: null,
        extensions: [Document, Paragraph, Text],
        content: '<p>Test</p>',
        browserEnvironment,
      })

      expect(editor.browserEnvironment).to.equal(browserEnvironment)
      expect(editor.browserEnvironment.window).to.equal(mockWindow)
    })

    it('should use default browser environment when none provided', () => {
      editor = new Editor({
        element: null,
        extensions: [Document, Paragraph, Text],
        content: '<p>Test</p>',
      })

      expect(editor.browserEnvironment).to.be.instanceOf(BrowserEnvironment)
      // In browser environment, should have access to window
      expect(editor.browserEnvironment.window).to.equal(window)
    })
  })
})
