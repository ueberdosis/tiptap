/// <reference types="cypress" />

import {
  starInputRegex,
  starPasteRegex,
  underscoreInputRegex,
  underscorePasteRegex,
} from '@tiptap/extension-bold'

describe('bold regex test', () => {
  it('star input regex matches', () => {
    expect('**Test**').to.match(starInputRegex)
  })

  it('star paste regex matches', () => {
    expect('**Test**').to.match(starPasteRegex)
  })

  it('underscore input regex matches', () => {
    expect('__Test__').to.match(underscoreInputRegex)
  })

  it('underscore paste regex matches', () => {
    expect('__Test__').to.match(underscorePasteRegex)
  })
})
