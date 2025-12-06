import { describe, expect, it } from 'vitest'

import { removeDuplicates } from './removeDuplicates.js'

describe('removeDuplicates', () => {
  it('removes duplicate numbers', () => {
    const array = [1, 2, 2, 3, 1, 4, 2]

    const result = removeDuplicates(array)

    expect(result).toEqual([1, 2, 3, 4])
  })

  it('removes duplicate strings', () => {
    const array = ['a', 'b', 'a', 'c', 'b', 'd']

    const result = removeDuplicates(array)

    expect(result).toEqual(['a', 'b', 'c', 'd'])
  })

  it('handles arrays with no duplicates', () => {
    const array = [1, 2, 3, 4, 5]

    const result = removeDuplicates(array)

    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty arrays', () => {
    const array: number[] = []

    const result = removeDuplicates(array)

    expect(result).toEqual([])
  })

  it('preserves order of first occurrences', () => {
    const array = [3, 1, 2, 1, 3, 2, 4]

    const result = removeDuplicates(array)

    expect(result).toEqual([3, 1, 2, 4])
  })

  it('removes duplicate objects using JSON.stringify', () => {
    const array = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Alice' },
      { id: 3, name: 'Charlie' },
    ]

    const result = removeDuplicates(array)

    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ])
  })

  it('handles mixed types', () => {
    const array = [1, '1', 1, '1', 2, '2']

    const result = removeDuplicates(array)

    expect(result).toEqual([1, '1', 2, '2'])
  })

  it('handles null and undefined values', () => {
    const array = [null, undefined, null, 1, undefined, 1]

    const result = removeDuplicates(array)

    expect(result).toEqual([null, undefined, 1])
  })

  it('uses custom by function for objects', () => {
    const array = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 1, name: 'Alice', age: 26 }, // Different age, same id
      { id: 3, name: 'Charlie', age: 35 },
    ]

    const result = removeDuplicates(array, item => item.id.toString())

    expect(result).toEqual([
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob', age: 30 },
      { id: 3, name: 'Charlie', age: 35 },
    ])
  })

  it('uses custom by function for strings', () => {
    const array = ['Alice', 'Bob', 'alice', 'Charlie', 'ALICE']

    const result = removeDuplicates(array, item => item.toLowerCase())

    expect(result).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('handles arrays with complex objects', () => {
    const array = [
      { user: { id: 1, name: 'Alice' }, active: true },
      { user: { id: 1, name: 'Alice' }, active: false },
      { user: { id: 2, name: 'Bob' }, active: true },
    ]

    const result = removeDuplicates(array)

    expect(result).toEqual([
      { user: { id: 1, name: 'Alice' }, active: true },
      { user: { id: 1, name: 'Alice' }, active: false },
      { user: { id: 2, name: 'Bob' }, active: true },
    ])
  })

  it('handles arrays with arrays as elements', () => {
    const array = [
      [1, 2],
      [3, 4],
      [1, 2],
      [5, 6],
    ]

    const result = removeDuplicates(array)

    expect(result).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ])
  })

  it('handles boolean values', () => {
    const array = [true, false, true, false, true]

    const result = removeDuplicates(array)

    expect(result).toEqual([true, false])
  })

  it('returns new array without modifying original', () => {
    const array = [1, 2, 2, 3, 1]
    const originalCopy = [...array]

    const result = removeDuplicates(array)

    expect(array).toEqual(originalCopy)
    expect(result).not.toBe(array)
  })
})
