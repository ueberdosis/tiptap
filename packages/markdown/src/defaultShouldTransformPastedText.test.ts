import { Marked, marked } from 'marked'
import { describe, expect, it } from 'vite-plus/test'

import { defaultShouldTransformPastedText } from './defaultShouldTransformPastedText.js'

describe('defaultShouldTransformPastedText', () => {
  it.each([
    ['empty text', ''],
    ['only blank lines', '\n\n'],
    ['plain words', 'hello world'],
    ['an entity', 'AT&amp;T'],
    ['a soft line break', 'line1\nline2'],
  ])('returns false for %s', (_label, text) => {
    expect(defaultShouldTransformPastedText(marked.lexer(text))).toBe(false)
  })

  it.each([
    ['a heading', '# a'],
    ['a list', '- a'],
    ['a blockquote', '> a'],
    ['a fenced code block', '```js\ncode\n```'],
    ['strong', '**b**'],
    ['emphasis', '*e*'],
    ['inline code', '`c`'],
    ['a link', '[l](https://x.example)'],
    ['strikethrough', '~~d~~'],
    ['a hard line break', 'a  \nb'],
    ['inline html', '<b>x</b>'],
    ['an escaped character', '\\*a\\*'],
  ])('returns true for %s', (_label, text) => {
    expect(defaultShouldTransformPastedText(marked.lexer(text))).toBe(true)
  })

  it('returns true when a later paragraph has inline syntax', () => {
    expect(defaultShouldTransformPastedText(marked.lexer('plain\n\n**bold**'))).toBe(true)
  })

  it('returns false for several plain paragraphs', () => {
    expect(defaultShouldTransformPastedText(marked.lexer('one\n\ntwo'))).toBe(false)
  })

  it('returns true for an inline token from a custom tokenizer', () => {
    const custom = new Marked({
      extensions: [
        {
          name: 'highlight',
          level: 'inline',
          start: (src: string) => src.indexOf('=='),
          tokenizer(src: string) {
            const match = /^==([^=]+)==/.exec(src)

            return match ? { type: 'highlight', raw: match[0], text: match[1] } : undefined
          },
        },
      ],
    })

    expect(defaultShouldTransformPastedText(custom.lexer('a ==b=='))).toBe(true)
  })
})
