import { describe, expect, it } from 'vitest'

import { deleteProps } from '../utilities/deleteProps.js'

describe('deleteProps', () => {
  it('removes a single property when passed as string', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deleteProps(obj, 'b')

    expect(result).toEqual({ a: 1, c: 3 })
    expect(obj).toEqual({ a: 1, b: 2, c: 3 }) // Original should be unchanged
  })

  it('removes multiple properties when passed as array', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 }
    const result = deleteProps(obj, ['b', 'd'])

    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('returns new object without mutating original', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deleteProps(obj, 'b')

    expect(result).not.toBe(obj)
    expect(obj).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('preserves all properties when removing non-existent property', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deleteProps(obj, 'nonexistent')

    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('handles empty array of properties to remove', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deleteProps(obj, [])

    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('removes all specified properties even if some do not exist', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deleteProps(obj, ['b', 'nonexistent', 'c'])

    expect(result).toEqual({ a: 1 })
  })

  it('handles single property array', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = deleteProps(obj, ['b'])

    expect(result).toEqual({ a: 1, c: 3 })
  })

  it('works with different value types', () => {
    const obj = {
      string: 'hello',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { nested: 'value' },
      func: () => 'test',
    }
    const result = deleteProps(obj, ['boolean', 'func'])

    expect(result).toEqual({
      string: 'hello',
      number: 42,
      array: [1, 2, 3],
      object: { nested: 'value' },
    })
  })

  it('handles empty object', () => {
    const obj = {}
    const result = deleteProps(obj, 'any')

    expect(result).toEqual({})
  })

  it('handles removing all properties', () => {
    const obj = { a: 1, b: 2 }
    const result = deleteProps(obj, ['a', 'b'])

    expect(result).toEqual({})
  })
})
