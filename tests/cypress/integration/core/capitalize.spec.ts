/// <reference types="cypress" />

import { capitalize } from '@tiptap/core'

describe('capitalize test', () => {
  it('capitalize a word', () => {
    const capitalized = capitalize('test')

    expect(capitalized).to.eq('Test')
  })
})
