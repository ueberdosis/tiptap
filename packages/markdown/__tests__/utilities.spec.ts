import type { JSONContent } from '@dibdab/core'
import { createAtomBlockMarkdownSpec, createBlockMarkdownSpec, createInlineMarkdownSpec } from '@dibdab/core'
import { describe, expect, it } from 'vitest'

describe('Markdown Utilities', () => {
  describe('createInlineMarkdownSpec', () => {
    it('should create a valid spec for self-closing inline nodes', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
        allowedAttributes: ['id', 'label'],
      })

      expect(spec).toHaveProperty('parseMarkdown')
      expect(spec).toHaveProperty('markdownTokenizer')
      expect(spec).toHaveProperty('renderMarkdown')
      expect(spec.markdownTokenizer.level).toBe('inline')
    })

    it('should create a valid spec for inline nodes with content', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'highlight',
        selfClosing: false,
        allowedAttributes: ['color'],
      })

      expect(spec).toHaveProperty('parseMarkdown')
      expect(spec).toHaveProperty('markdownTokenizer')
      expect(spec).toHaveProperty('renderMarkdown')
      expect(spec.markdownTokenizer.level).toBe('inline')
    })

    it('should handle tokenizer start detection', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
      })

      const src = '[mention id="test"] some other text'
      const startIndex =
        typeof spec.markdownTokenizer.start === 'function'
          ? spec.markdownTokenizer.start?.(src)
          : src.indexOf(spec.markdownTokenizer.start!)

      expect(startIndex).toBe(0)

      const falseSrc = 'no mention here'
      const noMatch =
        typeof spec.markdownTokenizer.start === 'function'
          ? spec.markdownTokenizer.start?.(falseSrc)
          : falseSrc.indexOf(spec.markdownTokenizer.start!)

      expect(noMatch).toBe(-1)
    })

    it('should tokenize self-closing shortcodes correctly', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
      })

      const token = spec.markdownTokenizer.tokenize('[mention id="test" label="Test User"]', [], null as any)
      expect(token).toMatchObject({
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

      const token = spec.markdownTokenizer.tokenize(
        '[highlight color="yellow"]highlighted text[/highlight]',
        [],
        null as any,
      )
      expect(token).toMatchObject({
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
      expect(rendered).toBe('[mention id="test" label="Test User"]')
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
      expect(rendered).toBe('[highlight color="yellow"]highlighted text[/highlight]')
    })

    it('should skip attributes with default values when skipIfDefault is specified', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        selfClosing: true,
        allowedAttributes: ['id', 'label', { name: 'mentionSuggestionChar', skipIfDefault: '@' }],
      })

      // When mentionSuggestionChar equals the default '@', it should be omitted
      const nodeWithDefault = {
        attrs: {
          id: 'test',
          label: 'Test User',
          mentionSuggestionChar: '@',
        },
      }

      const renderedWithDefault = spec.renderMarkdown(nodeWithDefault)
      expect(renderedWithDefault).toBe('[mention id="test" label="Test User"]')

      // When mentionSuggestionChar differs from default, it should be included
      const nodeWithNonDefault = {
        attrs: {
          id: 'bug',
          label: 'Bug',
          mentionSuggestionChar: '#',
        },
      }

      const renderedWithNonDefault = spec.renderMarkdown(nodeWithNonDefault)
      expect(renderedWithNonDefault).toBe('[mention id="bug" label="Bug" mentionSuggestionChar="#"]')
    })

    it('should support custom parseAttributes and serializeAttributes for attribute name mapping', () => {
      const spec = createInlineMarkdownSpec({
        nodeName: 'mention',
        name: '@',
        selfClosing: true,
        allowedAttributes: ['id', 'label', { name: 'mentionSuggestionChar', skipIfDefault: '@' }],
        parseAttributes: (attrString: string) => {
          const attrs: Record<string, any> = {}
          const regex = /(\w+)=(?:"([^"]*)"|'([^']*)')/g
          let match = regex.exec(attrString)

          while (match !== null) {
            const [, key, doubleQuoted, singleQuoted] = match
            const value = doubleQuoted ?? singleQuoted
            attrs[key === 'char' ? 'mentionSuggestionChar' : key] = value
            match = regex.exec(attrString)
          }

          return attrs
        },
        serializeAttributes: (attrs: Record<string, any>) => {
          return Object.entries(attrs)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
              const serializedKey = key === 'mentionSuggestionChar' ? 'char' : key
              return `${serializedKey}="${value}"`
            })
            .join(' ')
        },
      })

      // Test serialization: mentionSuggestionChar should be serialized as 'char'
      const nodeWithHashChar = {
        attrs: {
          id: 'bug',
          mentionSuggestionChar: '#',
        },
      }

      const rendered = spec.renderMarkdown(nodeWithHashChar)
      expect(rendered).toBe('[@ id="bug" char="#"]')

      // Test serialization: default '@' should be omitted
      const nodeWithDefaultChar = {
        attrs: {
          id: 'Madonna',
          mentionSuggestionChar: '@',
        },
      }

      const renderedDefault = spec.renderMarkdown(nodeWithDefaultChar)
      expect(renderedDefault).toBe('[@ id="Madonna"]')

      // Test parsing: 'char' should be mapped to 'mentionSuggestionChar'
      const token = spec.markdownTokenizer.tokenize('[@ id="feature" char="#"]', [], null as any)
      expect(token).toMatchObject({
        type: 'mention',
        attributes: {
          id: 'feature',
          mentionSuggestionChar: '#',
        },
      })

      // Test parsing: without char attribute
      const tokenNoChar = spec.markdownTokenizer.tokenize('[@ id="Tom Cruise"]', [], null as any)
      expect(tokenNoChar).toMatchObject({
        type: 'mention',
        attributes: {
          id: 'Tom Cruise',
        },
      })
    })
  })

  describe('createBlockMarkdownSpec', () => {
    it('should create a valid spec for block nodes', () => {
      const spec = createBlockMarkdownSpec({
        nodeName: 'callout',
      })

      expect(spec).toHaveProperty('parseMarkdown')
      expect(spec).toHaveProperty('markdownTokenizer')
      expect(spec).toHaveProperty('renderMarkdown')
      expect(spec.markdownTokenizer.level).toBe('block')
    })

    it('should handle tokenizer start detection', () => {
      const spec = createBlockMarkdownSpec({
        nodeName: 'callout',
      })

      const src = ':::callout\ncontent\n:::'
      const startIndex =
        typeof spec.markdownTokenizer.start === 'function'
          ? spec.markdownTokenizer.start?.(src)
          : src.indexOf(spec.markdownTokenizer.start!)

      expect(startIndex).toBe(0)

      const falseSrc = 'no callout here'
      const noMatch =
        typeof spec.markdownTokenizer.start === 'function'
          ? spec.markdownTokenizer.start?.(falseSrc)
          : falseSrc.indexOf(spec.markdownTokenizer.start!)

      expect(noMatch).toBe(-1)
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
      expect(token).toMatchObject({
        type: 'callout',
        attributes: { type: 'info' },
        content: 'This is a callout',
      })

      expect(token).toHaveProperty('tokens')
      expect(Array.isArray((token as any).tokens)).toBe(true)
      expect((token as any).tokens).toHaveLength(1)
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
      expect(rendered).toBe(':::callout {type="info"}\n\nThis is a callout\n\n:::')
    })
  })

  describe('createAtomBlockMarkdownSpec', () => {
    it('should create a valid spec for atomic block nodes', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
      })

      expect(spec).toHaveProperty('parseMarkdown')
      expect(spec).toHaveProperty('markdownTokenizer')
      expect(spec).toHaveProperty('renderMarkdown')
      expect(spec.markdownTokenizer.level).toBe('block')
    })

    it('should handle tokenizer start detection', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
      })

      const src = ':::youtube {src="test"} :::'
      const startIndex =
        typeof spec.markdownTokenizer.start === 'function'
          ? spec.markdownTokenizer.start?.(src)
          : src.indexOf(spec.markdownTokenizer.start!)
      expect(startIndex).toBe(0)

      const falseSrc = 'no youtube here'
      const noMatch =
        typeof spec.markdownTokenizer.start === 'function'
          ? spec.markdownTokenizer.start?.(falseSrc)
          : falseSrc.indexOf(spec.markdownTokenizer.start!)
      expect(noMatch).toBe(-1)
    })

    it('should tokenize atom block syntax correctly', () => {
      const spec = createAtomBlockMarkdownSpec({
        nodeName: 'youtube',
      })

      const token = spec.markdownTokenizer.tokenize(
        ':::youtube {src="https://youtube.com/watch?v=test"} :::\n',
        [],
        null as any,
      )
      expect(token).toMatchObject({
        type: 'youtube',
        raw: ':::youtube {src="https://youtube.com/watch?v=test"} :::\n',
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
      const tokenWithoutSrc = spec.markdownTokenizer.tokenize(':::youtube {width="400"} :::\n', [], null as any)
      expect(tokenWithoutSrc).toBe(undefined)

      // Should succeed with required attribute
      const tokenWithSrc = spec.markdownTokenizer.tokenize(':::youtube {src="test"} :::\n', [], null as any)
      expect(tokenWithSrc).not.toBe(undefined)
      expect(tokenWithSrc).toHaveProperty('attributes')
      expect((tokenWithSrc as any).attributes).toHaveProperty('src', 'test')
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
      expect(rendered).toBe(':::youtube {src="https://youtube.com/watch?v=test" width="400"} :::')
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

      expect((result as any).attrs).toMatchObject({
        src: 'test',
        start: '0',
        width: '640',
      })
    })
  })
})
