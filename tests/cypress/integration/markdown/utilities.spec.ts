import type { JSONContent } from '@tiptap/core'
import { createAtomBlockMarkdownSpec, createBlockMarkdownSpec, createInlineMarkdownSpec } from '@tiptap/core'

describe('Markdown Utilities', () => {
  describe('createInlineMarkdownSpec', () => {
    it('should create a valid spec for self-closing inline nodes', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
        allowedAttributes: ['id', 'label'],
      })

      expect(spec).to.have.property('parse')
      expect(spec).to.have.property('tokenizer')
      expect(spec).to.have.property('render')
      expect(spec.markdownTokenizer.level).to.equal('inline')
    })

    it('should create a valid spec for inline nodes with content', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'highlight',
        selfClosing: false,
        allowedAttributes: ['color'],
      })

      expect(spec).to.have.property('parse')
      expect(spec).to.have.property('tokenizer')
      expect(spec).to.have.property('render')
      expect(spec.markdownTokenizer.level).to.equal('inline')
    })

    it('should handle tokenizer start detection', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
      })

      const startIndex = spec.markdownTokenizer.start?.('[mention id="test"] some other text')
      expect(startIndex).to.equal(0)

      const noMatch = spec.markdownTokenizer.start?.('no mention here')
      expect(noMatch).to.equal(undefined)
    })

    it('should tokenize self-closing shortcodes correctly', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
      })

      const token = spec.markdownTokenizer.tokenize('[mention id="test" label="Test User"]', [], null)
      expect(token).to.deep.include({
        type: 'mention',
        raw: '[mention id="test" label="Test User"]',
        content: '',
        attributes: {
          id: 'test',
          label: 'Test User',
        },
      })
    })

    it('should tokenize shortcodes with content correctly', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'highlight',
        selfClosing: false,
      })

      const token = spec.markdownTokenizer.tokenize('[highlight color="yellow"]highlighted text[/highlight]', [], null)
      expect(token).to.deep.include({
        type: 'highlight',
        raw: '[highlight color="yellow"]highlighted text[/highlight]',
        content: 'highlighted text',
        attributes: {
          color: 'yellow',
        },
      })
    })

    it('should render self-closing shortcodes correctly', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
        allowedAttributes: ['id', 'label'],
      })

      const node = {
        attrs: {
          id: 'test',
          label: 'Test User',
          internalId: 'should-be-filtered', // This should not appear
        },
      }

      const rendered = spec.renderMarkdown(node)
      expect(rendered).to.equal('[mention id="test" label="Test User"]')
    })

    it('should render shortcodes with content correctly', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'highlight',
        selfClosing: false,
        allowedAttributes: ['color'],
      })

      const node: JSONContent = {
        content: [{ type: 'text', text: 'highlighted text' }],
        attrs: {
          color: 'yellow',
        },
      }

      const rendered = spec.renderMarkdown(node)
      expect(rendered).to.equal('[highlight color="yellow"]highlighted text[/highlight]')
    })
  })

  describe('createBlockMarkdownSpec', () => {
    it('should create a valid spec for block nodes', () => {
      const spec = createBlockMarkdownSpec({
        nodeName: 'callout',
      })

      expect(spec).to.have.property('parse')
      expect(spec).to.have.property('tokenizer')
      expect(spec).to.have.property('render')
      expect(spec.markdownTokenizer.level).to.equal('block')
    })

    it('should handle tokenizer start detection', () => {
      const spec = createBlockMarkdownSpec({
        nodeName: 'callout',
      })

      const startIndex = spec.markdownTokenizer.start?.(':::callout\ncontent\n:::')
      expect(startIndex).to.equal(0)

      const noMatch = spec.markdownTokenizer.start?.('no callout here')
      expect(noMatch).to.equal(undefined)
    })

    it('should tokenize block syntax correctly', () => {
      const spec = createBlockMarkdownSpec({
        nodeName: 'callout',
      })

      const mockLexer = {
        blockTokens: (src: string) => [{ type: 'paragraph', text: src.trim() }],
        inlineTokens: (src: string) => [{ type: 'text', text: src.trim() }],
      }

      const token = spec.markdownTokenizer.tokenize(':::callout {type="info"}\nThis is a callout\n:::', [], mockLexer)
      expect(token).to.deep.include({
        type: 'callout',
        attributes: { type: 'info' },
        content: 'This is a callout',
      })

      expect(token).to.have.property('tokens').that.is.an('array').with.lengthOf(1)
    })

    it('should render block syntax correctly', () => {
      const spec = createBlockMarkdownSpec({
        nodeName: 'callout',
        allowedAttributes: ['type'],
      })

      const mockHelpers = {
        renderChildren: () => 'This is a callout',
        wrapInBlock: (content: string) => content,
        indent: (content: string) => content,
      }

      const node = {
        attrs: { type: 'info' },
        content: [],
      }

      const rendered = spec.renderMarkdown(node, mockHelpers)
      expect(rendered).to.equal(':::callout {type="info"}\n\nThis is a callout\n\n:::')
    })
  })

  describe('createAtomBlockMarkdownSpec', () => {
    it('should create a valid spec for atomic block nodes', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
      })

      expect(spec).to.have.property('parse')
      expect(spec).to.have.property('tokenizer')
      expect(spec).to.have.property('render')
      expect(spec.markdownTokenizer.level).to.equal('block')
    })

    it('should handle tokenizer start detection', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
      })

      const startIndex = spec.markdownTokenizer.start?.(':::youtube {src="test"}')
      expect(startIndex).to.equal(0)

      const noMatch = spec.markdownTokenizer.start?.('no youtube here')
      expect(noMatch).to.equal(undefined)
    })

    it('should tokenize atom block syntax correctly', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
      })

      const token = spec.markdownTokenizer.tokenize(':::youtube {src="https://youtube.com/watch?v=test"}\n', [], null)
      expect(token).to.deep.include({
        type: 'youtube',
        raw: ':::youtube {src="https://youtube.com/watch?v=test"}\n',
        attributes: {
          src: 'https://youtube.com/watch?v=test',
        },
      })
    })

    it('should validate required attributes', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
        requiredAttributes: ['src'],
      })

      // Should fail without required attribute
      const tokenWithoutSrc = spec.markdownTokenizer.tokenize(':::youtube {width="400"}\n', [], null)
      expect(tokenWithoutSrc).to.equal(undefined)

      // Should succeed with required attribute
      const tokenWithSrc = spec.markdownTokenizer.tokenize(':::youtube {src="test"}\n', [], null)
      expect(tokenWithSrc).to.not.equal(undefined)
      expect(tokenWithSrc).to.have.property('attributes')
      expect((tokenWithSrc as any).attributes).to.have.property('src', 'test')
    })

    it('should render atom block syntax correctly', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
        allowedAttributes: ['src', 'width'],
      })

      const node = {
        attrs: {
          src: 'https://youtube.com/watch?v=test',
          width: '400',
          internalId: 'should-be-filtered', // This should not appear
        },
      }

      const rendered = spec.renderMarkdown(node)
      expect(rendered).to.equal(':::youtube {src="https://youtube.com/watch?v=test" width="400"}')
    })

    it('should apply default attributes', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
        defaultAttributes: { start: '0', width: '640' },
      })

      const mockHelpers = {
        createNode: (name: string, attrs: any, content: any) => ({ type: name, attrs, content }),
        parseInline: () => [],
        parseChildren: () => [],
        createTextNode: (text: string) => ({ type: 'text', text }),
        applyMark: (mark: string, content: any) => ({ mark, content }),
      }

      const token = { attributes: { src: 'test' } }
      const result = spec.parseMarkdown(token as any, mockHelpers as any)

      expect((result as any).attrs).to.deep.include({
        src: 'test',
        start: '0',
        width: '640',
      })
    })
  })
})
