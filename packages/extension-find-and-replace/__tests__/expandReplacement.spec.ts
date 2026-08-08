import { createSearchRegex } from '@tiptap/extension-find-and-replace'
import { describe, expect, it } from 'vitest'

import { expandReplacement, hasReplacementTokens } from '../src/utils/expandReplacement.js'

function createRegex(source: string) {
  const regex = createSearchRegex(source, {
    caseSensitive: true,
    useRegex: true,
    wholeWord: false,
  })

  if (!regex) {
    throw new Error(`Could not compile test regex: ${source}`)
  }

  return regex
}

describe('expandReplacement', () => {
  it('detects only supported replacement tokens', () => {
    expect(['$$', '$&', '$1', '$01', '$99', '$<word>'].map(hasReplacementTokens)).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
    ])
    expect(['$', '$0', '$00', '$x', '$`', "$'"].map(hasReplacementTokens)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
    ])
  })

  it('expands dollar, whole-match, and numbered capture tokens', () => {
    const regex = createRegex('(cat)')

    expect(expandReplacement(regex, 'cat', '$$ [$&] $1 $9 $x')).toBe('$ [cat] cat $9 $x')
  })

  it('uses capture 1 plus a literal 2 when $12 has no capture 12', () => {
    const regex = createRegex('(a)(b)?')

    expect(expandReplacement(regex, 'a', '$1:$2:$12:$99')).toBe('a::a2:$99')
  })

  it('expands named captures and removes unmatched or unknown named captures', () => {
    const regex = createRegex('(?<word>cat)(?<suffix>s)?')

    expect(expandReplacement(regex, 'cat', '$<word>:$<suffix>:$<missing>')).toBe('cat::')
  })

  it('keeps named references literal when the pattern has no named captures', () => {
    const regex = createRegex('(cat)')

    expect(expandReplacement(regex, 'cat', '$<word>')).toBe('$<word>')
  })

  it("keeps the before-match $` and after-match $' tokens literal", () => {
    const regex = createRegex('(cat)')

    expect(expandReplacement(regex, 'cat', "$`:$'")).toBe("$`:$'")
  })

  it('supports native regular expressions with the same semantics', () => {
    const regex = /(?<word>cat)(s)?/gu

    expect(expandReplacement(regex, 'cat', '$<word>:$2:$$:$&')).toBe('cat::$:cat')
  })

  it('keeps the template unchanged when the text is no longer a full match', () => {
    const regex = createRegex('(cat)')

    expect(expandReplacement(regex, 'dog', '[$1]')).toBe('[$1]')
  })

  it('preserves surrounding context for boundary assertions', () => {
    const regex = createRegex('(\\Bfoo)')
    const nativeRegex = /(\Bfoo)/gu
    const matchFrom = 1
    const matchTo = 4

    // Only `foo` is replaced, but `\B` still needs the preceding `x` to verify the boundary.
    expect(expandReplacement(regex, 'xfoo', '[$1]', matchFrom, matchTo)).toBe('[foo]')
    expect(expandReplacement(nativeRegex, 'xfoo', '[$1]', matchFrom, matchTo)).toBe('[foo]')
  })

  it('matches String.prototype.replace for every supported token form', () => {
    const cases = [
      {
        source: '(a)(b)?',
        text: 'a',
        replacements: [
          '$1',
          '$01',
          '$2',
          '$02',
          '$00',
          '$001',
          '$09',
          '$010',
          '$10',
          '$20',
          '$29',
          '$100',
          '$12',
          '$99',
          '$$',
          '$$1',
          '$$$1',
          '$$&',
          '$$$&',
          '$$$$',
          '$&',
          '$x',
          '$0',
          '$1-$2',
        ],
      },
      {
        source: '(?<word>cat)(?<suffix>s)?',
        text: 'cat',
        replacements: ['$<word>', '$<suffix>', '$<missing>', '$<word>-$2'],
      },
      {
        source: '(cat)',
        text: 'cat',
        replacements: ['$<word>'],
      },
      {
        source: '(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)(k)(l)',
        text: 'abcdefghijkl',
        replacements: [
          '$12:$1',
          '$10:$99',
          '$11$12',
          ...Array.from({ length: 100 }, (_, index) => `$${String(index).padStart(2, '0')}`),
        ],
      },
    ]

    for (const { source, text, replacements } of cases) {
      const regex = createRegex(source)
      const nativeRegex = new RegExp(source, 'u')

      for (const replacement of replacements) {
        expect(expandReplacement(regex, text, replacement), `${source} with ${replacement}`).toBe(
          text.replace(nativeRegex, replacement),
        )
      }
    }
  })

  it('matches String.prototype.replace for adjacent supported token combinations', () => {
    const regex = createRegex('(?<word>a)(b)?')
    const nativeRegex = /(?<word>a)(b)?/u
    const parts = [
      '$',
      '$$',
      '$&',
      '$1',
      '$01',
      '$2',
      '$02',
      '$9',
      '$09',
      '$<word>',
      '$<missing>',
      '$x',
      '$0',
      'x',
    ]

    for (const first of parts) {
      for (const second of parts) {
        const replacement = `${first}${second}`

        expect(expandReplacement(regex, 'a', replacement), replacement).toBe(
          'a'.replace(nativeRegex, replacement),
        )
      }
    }
  })
})
