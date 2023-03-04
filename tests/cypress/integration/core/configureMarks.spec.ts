/// <reference types="cypress" />

import { Mark } from '@tiptap/core'

describe('configure marks', () => {
  it('should inherit config', () => {
    const exitable = true
    const mark = Mark.create({ exitable })

    expect(mark.configure().config.exitable).to.eq(true)
  })
})
