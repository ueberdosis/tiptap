import { inputRegex, pasteRegex } from '@dibdab/extension-emoji'
import { describe, expect, it } from 'vitest'

describe('emoji extension', () => {
  it('inputRegex matches typical shortcode', () => {
    expect(':smile:').toMatch(inputRegex)
  })

  it('pasteRegex matches standalone shortcode', () => {
    expect(':smile:').toMatch(pasteRegex)
  })

  it('pasteRegex does NOT match shortcode inside url-like text', () => {
    // This should NOT match because the shortcode is part of a URL path
    expect('https://example.com/:x:/sub/').not.toMatch(pasteRegex)
  })

  it('pasteRegex matches when preceded by space', () => {
    expect(' test :smile: ').toMatch(pasteRegex)
  })
})
