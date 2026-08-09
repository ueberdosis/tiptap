/**
 * @vitest-environment node
 */

import {
  extractHtmlTagNames,
  htmlContainsUnrecognizedTag,
  isHtmlUnknownTagName,
} from '../src/utils/htmlTagDetection.js'
import { describe, expect, it } from 'vitest'

describe('htmlTagDetection', () => {
  describe('extractHtmlTagNames', () => {
    it('extracts tag names from opening and closing tags', () => {
      expect(extractHtmlTagNames('<em>hi</em>')).toEqual(['em', 'em'])
    })

    it('extracts the first token as tag name for unknown angle-bracket text', () => {
      expect(extractHtmlTagNames('<enter foo bar>')).toEqual(['enter'])
    })

    it('returns an empty array when no tags are present', () => {
      expect(extractHtmlTagNames('plain text')).toEqual([])
    })
  })

  describe('isHtmlUnknownTagName', () => {
    it('treats non-standard non-hyphenated tags as unknown', () => {
      expect(isHtmlUnknownTagName('enter')).toBe(true)
    })

    it('treats standard HTML tags as known', () => {
      expect(isHtmlUnknownTagName('em')).toBe(false)
      expect(isHtmlUnknownTagName('br')).toBe(false)
      expect(isHtmlUnknownTagName('span')).toBe(false)
    })

    it('treats hyphenated tag names as known custom elements', () => {
      expect(isHtmlUnknownTagName('my-mention')).toBe(false)
      expect(isHtmlUnknownTagName('my-el')).toBe(false)
    })

    it('treats common SVG child elements as known', () => {
      expect(isHtmlUnknownTagName('circle')).toBe(false)
      expect(isHtmlUnknownTagName('path')).toBe(false)
      expect(isHtmlUnknownTagName('g')).toBe(false)
      expect(isHtmlUnknownTagName('rect')).toBe(false)
      expect(isHtmlUnknownTagName('linearGradient')).toBe(false)
      expect(isHtmlUnknownTagName('clipPath')).toBe(false)
    })
  })

  describe('htmlContainsUnrecognizedTag', () => {
    const emptySchema = new Set<string>()

    it('returns true for unknown angle-bracket placeholders', () => {
      expect(htmlContainsUnrecognizedTag('<enter foo bar>', emptySchema)).toBe(true)
      expect(htmlContainsUnrecognizedTag('<this is a placeholder>', emptySchema)).toBe(true)
    })

    it('returns false for standard HTML elements', () => {
      expect(htmlContainsUnrecognizedTag('<em></em>', emptySchema)).toBe(false)
      expect(htmlContainsUnrecognizedTag('<em>hi</em>', emptySchema)).toBe(false)
      expect(htmlContainsUnrecognizedTag('<br>', emptySchema)).toBe(false)
    })

    it('returns false for hyphenated custom elements', () => {
      expect(htmlContainsUnrecognizedTag('<my-el></my-el>', emptySchema)).toBe(false)
    })

    it('returns false when schema declares a non-standard tag', () => {
      const schemaTags = new Set(['something'])
      expect(htmlContainsUnrecognizedTag('<something>happy</something>', schemaTags)).toBe(false)
    })

    it('returns false when no tags are present', () => {
      expect(htmlContainsUnrecognizedTag('no tags here', emptySchema)).toBe(false)
    })

    it('returns false for SVG elements', () => {
      expect(
        htmlContainsUnrecognizedTag('<svg><circle cx="10" cy="10" r="5"/></svg>', emptySchema),
      ).toBe(false)
      expect(htmlContainsUnrecognizedTag('<svg><path d="M0 0"/></svg>', emptySchema)).toBe(false)
    })
  })
})
