/// <reference types="cypress" />

import { pasteRegex } from '@tiptap/extension-link'

describe('link regex test', () => {

  it('paste regex matches url', () => {
    expect('https://www.example.com/with-spaces?var=true&foo=bar+3').to.match(pasteRegex)
  })

})
