import { describe, expect, it } from 'vitest'

import { callOrReturn } from './callOrReturn.js'

describe('callOrReturn', () => {
  it('should return the value directly if it is not a function', () => {
    const value = 'test'
    const result = callOrReturn(value)

    expect(result).toBe('test')
  })

  it('should return the value directly if it is not a function (number)', () => {
    const value = 42
    const result = callOrReturn(value)

    expect(result).toBe(42)
  })

  it('should return the value directly if it is not a function (object)', () => {
    const value = { key: 'value' }
    const result = callOrReturn(value)

    expect(result).toEqual({ key: 'value' })
  })

  it('should call the function and return its result if no context or props are provided', () => {
    const fn = () => 'called'
    const result = callOrReturn(fn)

    expect(result).toBe('called')
  })

  it('should call the function with props and return its result', () => {
    const fn = (a: number, b: string) => `${a}-${b}`
    const result = callOrReturn(fn, undefined, 1, 'test')

    expect(result).toBe('1-test')
  })

  it('should bind the context and call the function', () => {
    const context = { value: 10 }
    const fn = function (this: { value: number }, multiplier: number) {
      return this.value * multiplier
    }
    const result = callOrReturn(fn, context, 2)

    expect(result).toBe(20)
  })

  it('should bind the context and call the function with multiple props', () => {
    const context = { prefix: 'Hello' }
    const fn = function (this: { prefix: string }, name: string, suffix: string) {
      return `${this.prefix} ${name}${suffix}`
    }
    const result = callOrReturn(fn, context, 'World', '!')

    expect(result).toBe('Hello World!')
  })

  it('should call the function without binding if context is undefined', () => {
    const fn = (a: number) => a * 2
    const result = callOrReturn(fn, undefined, 5)

    expect(result).toBe(10)
  })
})
