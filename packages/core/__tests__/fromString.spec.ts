import { fromString } from '@dibdab/core'
import { describe, expect, it } from 'vitest'

describe('fromString', () => {
  it('should return a string', () => {
    const value = fromString('test')

    expect(value).toBe('test')
  })

  it('should return an empty string', () => {
    const value = fromString('')

    expect(value).toBe('')
  })

  it('should convert to a number', () => {
    const value = fromString('1')

    expect(value).toBe(1)
  })

  it('should convert to a floating number', () => {
    const value = fromString('1.2')

    expect(value).toBe(1.2)
  })

  it('should not convert to a number with exponent', () => {
    const value = fromString('1e1')

    expect(value).toBe('1e1')
  })

  it('should convert to true', () => {
    const value = fromString('true')

    expect(value).toBe(true)
  })

  it('should convert to false', () => {
    const value = fromString('false')

    expect(value).toBe(false)
  })

  it('should return non-strings', () => {
    const value = fromString(null)

    expect(value).toBe(null)
  })
})
