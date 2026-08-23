import { describe, expect, it } from 'vite-plus/test'

/**
 * A lookbehind inside a regex *literal* is rejected at parse time by WebKit older
 * than Safari 16.4, which takes down the entire chunk the module is bundled into
 * rather than only the code path that uses the regex. This package has regressed
 * on that twice already, so pin it rather than relying on review to catch it.
 *
 * The scan is deliberately coarse: it looks at raw source text and cannot tell a
 * regex literal from a comment, so the sequence must not appear in prose either.
 */
const sources = Object.entries(
  import.meta.glob('../**/*.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
).filter(([path]) => !/\.(test|spec)\.ts$/.test(path))

describe('WebKit compatibility', () => {
  it('uses no regex lookbehind anywhere in the package source', () => {
    const offenders = sources
      .filter(([, source]) => /\(\?<[=!]/.test(source))
      .map(([path]) => path)

    expect(offenders).toEqual([])
  })
})
