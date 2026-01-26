import { Bold } from '@tiptap/extension-bold'
import { Document } from '@tiptap/extension-document'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { describe, expect, it } from 'vitest'

import { MarkdownManager } from '../src/MarkdownManager.js'

describe('Inline marks containing only punctuation', () => {
  const extensions = [Document, Paragraph, Text, Bold, Italic]
  const markdownManager = new MarkdownManager({ extensions })

  describe('Bold marks with punctuation - whitespace-separated (CommonMark compliant)', () => {
    it('should parse standalone bold punctuation marks', () => {
      const markdown = '**)**'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: ')',
                marks: [{ type: 'bold' }],
              },
            ],
          },
        ],
      })
    })

    it('should parse bold punctuation when preceded by whitespace', () => {
      const markdown = 'text **)**'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'text ',
              },
              {
                type: 'text',
                text: ')',
                marks: [{ type: 'bold' }],
              },
            ],
          },
        ],
      })
    })

    it('should parse bold punctuation when followed by whitespace', () => {
      const markdown = '**)** text'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: ')',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: ' text',
              },
            ],
          },
        ],
      })
    })

    it('should parse bold punctuation when surrounded by whitespace', () => {
      const markdown = 'text **)** more'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'text ',
              },
              {
                type: 'text',
                text: ')',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: ' more',
              },
            ],
          },
        ],
      })
    })

    it('should parse bold punctuation when preceded by other punctuation', () => {
      const markdown = '[**)**]'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '[',
              },
              {
                type: 'text',
                text: ')',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: ']',
              },
            ],
          },
        ],
      })
    })

    it('should parse multiple bold punctuation marks', () => {
      const markdown = '**,** **.**'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: ',',
                marks: [{ type: 'bold' }],
              },
              {
                type: 'text',
                text: ' ',
              },
              {
                type: 'text',
                text: '.',
                marks: [{ type: 'bold' }],
              },
            ],
          },
        ],
      })
    })
  })

  describe('Bold marks without required whitespace (CommonMark limitation)', () => {
    it('should NOT parse bold punctuation when directly preceded by alphanumeric characters', () => {
      const markdown = 'text**)**'
      const json = markdownManager.parse(markdown)

      // Per CommonMark flanking rules, this is not recognized as bold
      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'text**)**',
              },
            ],
          },
        ],
      })
    })

    it('should NOT parse bold punctuation when directly followed by alphanumeric characters', () => {
      const markdown = '**)**text'
      const json = markdownManager.parse(markdown)

      // Per CommonMark flanking rules, this is not recognized as bold
      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: '**)**text',
              },
            ],
          },
        ],
      })
    })

    it('should NOT parse bold punctuation when surrounded by alphanumeric characters', () => {
      const markdown = 'text**)**text'
      const json = markdownManager.parse(markdown)

      // Per CommonMark flanking rules, this is not recognized as bold
      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'text**)**text',
              },
            ],
          },
        ],
      })
    })
  })

  describe('Italic marks with punctuation', () => {
    it('should parse standalone italic punctuation', () => {
      const markdown = '*)*'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: ')',
                marks: [{ type: 'italic' }],
              },
            ],
          },
        ],
      })
    })

    it('should parse italic punctuation with whitespace', () => {
      const markdown = 'text *,* more'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'text ',
              },
              {
                type: 'text',
                text: ',',
                marks: [{ type: 'italic' }],
              },
              {
                type: 'text',
                text: ' more',
              },
            ],
          },
        ],
      })
    })

    it('should NOT parse italic punctuation without whitespace', () => {
      const markdown = 'text*,*text'
      const json = markdownManager.parse(markdown)

      expect(json).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'text*,*text',
              },
            ],
          },
        ],
      })
    })
  })

  describe('Roundtrip serialization', () => {
    it('should maintain bold punctuation through parse-serialize cycle', () => {
      const markdown = 'text **)** more'
      const json = markdownManager.parse(markdown)
      const serialized = markdownManager.serialize(json)

      expect(serialized).toBe(markdown)
    })

    it('should maintain italic punctuation through parse-serialize cycle', () => {
      const markdown = 'text *,* more'
      const json = markdownManager.parse(markdown)
      const serialized = markdownManager.serialize(json)

      expect(serialized).toBe(markdown)
    })
  })
})
