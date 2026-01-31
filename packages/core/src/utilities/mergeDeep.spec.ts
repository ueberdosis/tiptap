import { describe, expect, it } from 'vitest'

import { mergeDeep } from './mergeDeep.js'

describe('mergeDeep', () => {
  it('merges flat objects', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }

    const result = mergeDeep(target, source)

    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('performs deep merge of nested objects', () => {
    const target = {
      user: {
        name: 'John',
        age: 25,
        address: {
          city: 'New York',
          zip: '10001',
        },
      },
    }

    const source = {
      user: {
        age: 30,
        address: {
          zip: '10002',
          country: 'USA',
        },
        email: 'john@example.com',
      },
    }

    const result = mergeDeep(target, source)

    expect(result).toEqual({
      user: {
        name: 'John',
        age: 30,
        address: {
          city: 'New York',
          zip: '10002',
          country: 'USA',
        },
        email: 'john@example.com',
      },
    })
  })

  it('overwrites non-object values', () => {
    const target = { a: [1, 2, 3], b: 'hello' }
    const source = { a: [4, 5], b: 'world' }

    const result = mergeDeep(target, source)

    expect(result).toEqual({ a: [4, 5], b: 'world' })
  })

  it('handles empty target object', () => {
    const target = {}
    const source = { a: 1, b: { c: 2 } }

    const result = mergeDeep(target, source)

    expect(result).toEqual({ a: 1, b: { c: 2 } })
  })

  it('handles empty source object', () => {
    const target = { a: 1, b: { c: 2 } }
    const source = {}

    const result = mergeDeep(target, source)

    expect(result).toEqual({ a: 1, b: { c: 2 } })
  })

  it('does not modify the original objects', () => {
    const target = { a: { b: 1 } }
    const source = { a: { c: 2 } }
    const targetCopy = { ...target }
    const sourceCopy = { ...source }

    mergeDeep(target, source)

    expect(target).toEqual(targetCopy)
    expect(source).toEqual(sourceCopy)
  })

  it('handles null and undefined values', () => {
    const target = { a: 1, b: null }
    const source = { b: undefined, c: null }

    const result = mergeDeep(target, source)

    expect(result).toEqual({ a: 1, b: undefined, c: null })
  })

  it('handles multiple levels of nesting', () => {
    const target = {
      level1: {
        level2: {
          level3: {
            value: 'original',
          },
        },
      },
    }

    const source = {
      level1: {
        level2: {
          level3: {
            value: 'updated',
            newProp: 'added',
          },
          newLevel3: 'new',
        },
      },
    }

    const result = mergeDeep(target, source)

    expect(result).toEqual({
      level1: {
        level2: {
          level3: {
            value: 'updated',
            newProp: 'added',
          },
          newLevel3: 'new',
        },
      },
    })
  })

  it('handles arrays as non-mergeable values', () => {
    const target = {
      items: [1, 2, 3],
      config: { enabled: true },
    }

    const source = {
      items: [4, 5],
      config: { enabled: false, debug: true },
    }

    const result = mergeDeep(target, source)

    expect(result).toEqual({
      items: [4, 5],
      config: { enabled: false, debug: true },
    })
  })

  it('handles primitive values in target', () => {
    const target = { a: 'string', b: 42, c: true }
    const source = { a: 'updated', d: 'new' }

    const result = mergeDeep(target, source)

    expect(result).toEqual({ a: 'updated', b: 42, c: true, d: 'new' })
  })
})
