import Mention from '@tiptap/extension-mention'
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
})
