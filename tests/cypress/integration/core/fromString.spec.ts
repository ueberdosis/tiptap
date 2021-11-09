/// <reference types="cypress" />

import fromString from '@tiptap/core/src/utilities/fromString'

describe('fromString', () => {
  it('should return a string', () => {
    const value = fromString('test')

    expect(value).to.eq('test')
  })

  it('should return an empty string', () => {
    const value = fromString('')

    expect(value).to.eq('')
  })

  it('should convert to a number', () => {
    const value = fromString('1')

    expect(value).to.eq(1)
  })

  it('should convert to a floating number', () => {
    const value = fromString('1.2')

    expect(value).to.eq(1.2)
  })

  it('should not convert to a number with exponent', () => {
    const value = fromString('1e1')

    expect(value).to.eq('1e1')
  })

  it('should convert to true', () => {
    const value = fromString('true')

    expect(value).to.eq(true)
  })

  it('should convert to false', () => {
    const value = fromString('false')

    expect(value).to.eq(false)
  })

  it('should return non-strings', () => {
    const value = fromString(null)

    expect(value).to.eq(null)
  })
})
