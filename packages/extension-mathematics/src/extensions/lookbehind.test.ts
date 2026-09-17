import { describe, expect, it } from 'vite-plus/test'

// Old WebKit rejects a lookbehind in a regex literal at parse time and takes the whole
// chunk down with it. Coarse on purpose: the sequence must not appear in comments either.
const sources = import.meta.glob('../**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

describe('WebKit compatibility', () => {
  it('uses no regex lookbehind anywhere in the package source', () => {
    const offenders = Object.entries(sources)
      .filter(([path]) => !/\.(test|spec)\.ts$/.test(path))
      .filter(([, source]) => /\(\?<[=!]/.test(source))
      .map(([path]) => path)

    expect(offenders).toEqual([])
  })
})
