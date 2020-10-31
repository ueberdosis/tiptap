/// <reference types="cypress" />

import { fromString } from '@tiptap/core'

describe('fromString', () => {
  it('parse a string', () => {
    const value = fromString('test')

    expect(value).to.eq('test')
  })

  it('parse a number', () => {
    const value = fromString('1')

    expect(value).to.eq(1)
  })

  it('parse a floating number', () => {
    const value = fromString('1.2')

    expect(value).to.eq(1.2)
  })

  it('parse not a number with exponent', () => {
    const value = fromString('1e1')

    expect(value).to.eq('1e1')
  })

  it('parse a boolean (true)', () => {
    const value = fromString('true')

    expect(value).to.eq(true)
  })

  it('parse a boolean (false)', () => {
    const value = fromString('false')

    expect(value).to.eq(false)
  })
})
