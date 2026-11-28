import { Document } from '@tiptap/extension-document'
import { Italic } from '@tiptap/extension-italic'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Underline } from '@tiptap/extension-underline'
import { MarkdownManager } from '@tiptap/markdown'
import { describe, expect, it } from 'vite-plus/test'

const start = (Underline.config as any).markdownTokenizer.start as (src: string) => number

describe('Underline markdownTokenizer start', () => {
  it('finds the first underline tag', () => {
    expect(start('abc <u>def')).toBe(4)
  })

  it('finds an uppercase underline tag', () => {
    expect(start('abc <U>def')).toBe(4)
  })

  it('returns -1 when there is no underline tag', () => {
    expect(start('abc def')).toBe(-1)
  })

  it('adjusts the cached result for a suffix of the same paragraph', () => {
    expect(start('abc <u>def ghi')).toBe(4)
    expect(start('c <u>def ghi')).toBe(2)
    expect(start('def ghi')).toBe(-1)
  })

  it('rescans when the paragraph changes', () => {
    expect(start('abc <u>def')).toBe(4)
    expect(start('xyz <u>abc')).toBe(4)
    expect(start('no underline here')).toBe(-1)
  })
})

describe('Underline start performance', () => {
  it('parses a long paragraph of short pieces in reasonable time', () => {
    const markdownManager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Italic, Underline],
    })

    // One paragraph of many short pieces, none of them an underline.
    const doc = '*a* '.repeat(40000)
    const startedAt = performance.now()
    const parsed = markdownManager.parse(doc)
    const elapsed = performance.now() - startedAt

    expect(parsed.type).toBe('doc')
    // Without the fix this takes seconds; with it, well under a second.
    expect(elapsed).toBeLessThan(1000)
  })

  it('still finds underlines in a long paragraph', () => {
    const markdownManager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Italic, Underline],
    })

    const parsed = markdownManager.parse(`${'*a* '.repeat(1000)}<u>underlined</u> end\n`)
    const paragraph = parsed.content?.[0]
    const texts = (paragraph?.content || []).filter(node => node.type === 'text')
    const underlined = texts.filter(node =>
      (node.marks || []).some(mark => mark.type === 'underline'),
    )

    expect(underlined.map(node => node.text)).toEqual(['underlined'])
  })

  it('still finds an underline nested inside emphasis', () => {
    const markdownManager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Italic, Underline],
    })

    const parsed = markdownManager.parse('*a <u>b</u> c* d\n')
    const paragraph = parsed.content?.[0]
    const texts = (paragraph?.content || []).filter(node => node.type === 'text')
    const underlined = texts.filter(node =>
      (node.marks || []).some(mark => mark.type === 'underline'),
    )

    expect(underlined.map(node => node.text)).toEqual(['b'])
  })

  it('still finds an underline in a second, shorter paragraph', () => {
    const markdownManager = new MarkdownManager({
      extensions: [Document, Paragraph, Text, Italic, Underline],
    })

    const parsed = markdownManager.parse(`${'*a* '.repeat(1000)}\n\nplain <u>under</u> text\n`)
    const paragraph = parsed.content?.[1]
    const texts = (paragraph?.content || []).filter(node => node.type === 'text')
    const underlined = texts.filter(node =>
      (node.marks || []).some(mark => mark.type === 'underline'),
    )

    expect(underlined.map(node => node.text)).toEqual(['under'])
  })
})
