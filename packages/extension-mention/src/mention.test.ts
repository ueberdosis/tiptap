import { Mention } from './mention.js'
import { describe, expect, it } from 'vite-plus/test'

describe('mention Markdown', () => {
  it('parses mapped attributes', () => {
    const tokenizer = Mention.config.markdownTokenizer
    expect(tokenizer).toBeDefined()

    const token = tokenizer?.tokenize('[@ id="feature" char="#"]', [], null as any)

    expect(token).toMatchObject({
      attributes: {
        id: 'feature',
        mentionSuggestionChar: '#',
      },
    })
  })

  it('parses malformed attributes in linear time', () => {
    const tokenizer = Mention.config.markdownTokenizer
    expect(tokenizer).toBeDefined()

    const measure = (attributes: string) => {
      const startedAt = performance.now()
      tokenizer?.tokenize(`[@ ${attributes}]`, [], null as any)
      return performance.now() - startedAt
    }

    measure('warmup="true"')
    const sizes = [12_288, 24_576]
    sizes.forEach(size => {
      const attack = '0'.repeat(size)
      const control = '-'.repeat(attack.length)
      const controlDuration = measure(control)
      const attackDuration = measure(attack)

      expect(attackDuration).toBeLessThan(controlDuration * 20 + 100)
    })
  })

  it('only parses attributes at attribute boundaries', () => {
    const tokenizer = Mention.config.markdownTokenizer

    const token = tokenizer?.tokenize('[@ id="feature" prefix:char="#"]', [], null as any)

    expect(token).toMatchObject({ attributes: { id: 'feature' } })
  })

  it('keeps labels with quotes and backslashes after a round trip', () => {
    const { renderMarkdown, markdownTokenizer } = Mention.config
    const labels = ['Bob "The Builder" Smith', 'a"b', "O'Brien", 'back\\slash', 'trailing\\']

    labels.forEach(label => {
      const markdown = renderMarkdown?.({ type: 'mention', attrs: { id: 'u1', label } }, {} as any)
      const token = markdownTokenizer?.tokenize(markdown as string, [], null as any)

      expect(token).toMatchObject({ attributes: { id: 'u1', label } })
    })
  })

  it('still parses unescaped backslashes from older Markdown', () => {
    const tokenizer = Mention.config.markdownTokenizer

    const token = tokenizer?.tokenize('[@ id="u1" label="C:\\path"]', [], null as any)

    expect(token).toMatchObject({ attributes: { id: 'u1', label: 'C:\\path' } })
  })
})
