import { describe, expect, it } from 'vitest'

import { findDuplicates } from '../utilities/findDuplicates.js'

describe('findDuplicates', () => {
  it('returns empty array when no duplicates exist', () => {
    const result = findDuplicates([1, 2, 3, 4, 5])

    expect(result).toEqual([])
  })

  it('returns single duplicate when one element appears twice', () => {
    const result = findDuplicates([1, 2, 3, 2, 4])

    expect(result).toEqual([2])
  })

  it('returns multiple duplicates when multiple elements are duplicated', () => {
    const result = findDuplicates([1, 2, 3, 2, 1, 4])

    expect(result).toEqual([2, 1])
  })

  it('returns each duplicate value only once', () => {
    const result = findDuplicates([1, 2, 3, 2, 1, 2, 1])

    expect(result).toEqual([2, 1])
  })

  it('handles arrays with more than two occurrences', () => {
    const result = findDuplicates([1, 1, 1, 2, 2, 3])

    expect(result).toEqual([1, 2])
  })

  it('works with string arrays', () => {
    const result = findDuplicates(['a', 'b', 'c', 'b', 'a'])

    expect(result).toEqual(['b', 'a'])
  })

  it('works with mixed types', () => {
    const result = findDuplicates([1, '1', 1, '1', 2])

    expect(result).toEqual([1, '1'])
  })

  it('works with object arrays', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const result = findDuplicates([obj1, obj2, obj1, obj2])

    expect(result).toEqual([obj1, obj2])
  })

  it('handles empty array', () => {
    const result = findDuplicates([])

    expect(result).toEqual([])
  })

  it('handles array with single element', () => {
    const result = findDuplicates([1])

    expect(result).toEqual([])
  })

  it('handles array with all identical elements', () => {
    const result = findDuplicates([1, 1, 1, 1])

    expect(result).toEqual([1])
  })

  it('preserves order of first duplicate occurrence in result', () => {
    const result = findDuplicates([3, 1, 2, 1, 3, 2])

    expect(result).toEqual([1, 3, 2])
  })

  it('works with boolean values', () => {
    const result = findDuplicates([true, false, true, false])

    expect(result).toEqual([true, false])
  })

  it('works with null and undefined', () => {
    const result = findDuplicates([null, undefined, null, undefined])

    expect(result).toEqual([null, undefined])
  })
})
