/// <reference types="cypress" />

import { Extension } from '@tiptap/core'

describe('configure extensions', () => {
  it('should inherit config', () => {
    const name = 'my-extension'
    const extension = Extension.create({ name })

    expect(extension.configure().config.name).to.eq(name)
  })
})
