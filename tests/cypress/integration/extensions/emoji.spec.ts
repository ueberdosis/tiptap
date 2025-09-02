/// <reference types="cypress" />

import { inputRegex, pasteRegex } from '@tiptap/extension-emoji'

describe('emoji extension', () => {
  it('inputRegex matches typical shortcode', () => {
    expect(':smile:').to.match(inputRegex)
  })

  it('pasteRegex matches standalone shortcode', () => {
    expect(':smile:').to.match(pasteRegex)
  })

  it('pasteRegex does NOT match shortcode inside url-like text', () => {
    // This should NOT match because the shortcode is part of a URL path
    expect('https://example.com/:x:/sub/').to.not.match(pasteRegex)
  })

  it('pasteRegex matches when preceded by space', () => {
    expect(' test :smile: ').to.match(pasteRegex)
  })
})
