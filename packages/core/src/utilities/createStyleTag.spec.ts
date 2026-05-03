import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createStyleTag } from '../utilities/createStyleTag.js'

describe('createStyleTag', () => {
  beforeEach(() => {
    // Clean up any existing style tags before each test
    const existingTags = document.querySelectorAll('style[data-tiptap-style]')
    existingTags.forEach(tag => tag.remove())
  })

  afterEach(() => {
    // Clean up after each test
    const existingTags = document.querySelectorAll('style[data-tiptap-style]')
    existingTags.forEach(tag => tag.remove())
  })

  it('creates a new style tag when none exists', () => {
    const style = '.test { color: red; }'
    const result = createStyleTag(style)

    expect(result).toBeInstanceOf(HTMLStyleElement)
    expect(result.getAttribute('data-tiptap-style')).toBe('')
    expect(result.innerHTML).toBe(style)
    expect(document.head.contains(result)).toBe(true)
  })

  it('returns existing style tag when one already exists', () => {
    const style1 = '.test1 { color: red; }'
    const style2 = '.test2 { color: blue; }'

    const firstResult = createStyleTag(style1)
    const secondResult = createStyleTag(style2)

    expect(firstResult).toBe(secondResult)
    expect(secondResult.innerHTML).toBe(style1) // Should keep original content
    expect(document.querySelectorAll('style[data-tiptap-style]').length).toBe(1)
  })

  it('sets nonce attribute when provided', () => {
    const style = '.test { color: red; }'
    const nonce = 'test-nonce-123'
    const result = createStyleTag(style, nonce)

    expect(result.getAttribute('nonce')).toBe(nonce)
  })

  it('does not set nonce attribute when not provided', () => {
    const style = '.test { color: red; }'
    const result = createStyleTag(style)

    expect(result.hasAttribute('nonce')).toBe(false)
  })

  it('sets correct data attribute with suffix when provided', () => {
    const style = '.test { color: red; }'
    const suffix = 'custom'
    const result = createStyleTag(style, undefined, suffix)

    expect(result.getAttribute('data-tiptap-style-custom')).toBe('')
    expect(result.hasAttribute('data-tiptap-style')).toBe(false)
  })

  it('sets correct data attribute without suffix when not provided', () => {
    const style = '.test { color: red; }'
    const result = createStyleTag(style)

    expect(result.getAttribute('data-tiptap-style')).toBe('')
    expect(result.hasAttribute('data-tiptap-style-custom')).toBe(false)
  })

  it('handles both nonce and suffix together', () => {
    const style = '.test { color: red; }'
    const nonce = 'test-nonce-456'
    const suffix = 'special'
    const result = createStyleTag(style, nonce, suffix)

    expect(result.getAttribute('nonce')).toBe(nonce)
    expect(result.getAttribute('data-tiptap-style-special')).toBe('')
    expect(result.innerHTML).toBe(style)
  })

  it('returns existing style tag with correct suffix', () => {
    const style1 = '.test1 { color: red; }'
    const style2 = '.test2 { color: blue; }'
    const suffix = 'test'

    const firstResult = createStyleTag(style1, undefined, suffix)
    const secondResult = createStyleTag(style2, undefined, suffix)

    expect(firstResult).toBe(secondResult)
    expect(secondResult.getAttribute('data-tiptap-style-test')).toBe('')
    expect(document.querySelectorAll('style[data-tiptap-style-test]').length).toBe(1)
  })

  it('creates separate style tags for different suffixes', () => {
    const style1 = '.test1 { color: red; }'
    const style2 = '.test2 { color: blue; }'

    const result1 = createStyleTag(style1, undefined, 'suffix1')
    const result2 = createStyleTag(style2, undefined, 'suffix2')

    expect(result1).not.toBe(result2)
    expect(result1.getAttribute('data-tiptap-style-suffix1')).toBe('')
    expect(result2.getAttribute('data-tiptap-style-suffix2')).toBe('')
    expect(document.querySelectorAll('style[data-tiptap-style-suffix1]').length).toBe(1)
    expect(document.querySelectorAll('style[data-tiptap-style-suffix2]').length).toBe(1)
  })
})
