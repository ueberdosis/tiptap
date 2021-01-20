/// <reference types="cypress" />

import mergeDeep from '@tiptap/core/src/utilities/mergeDeep'

describe('mergeDeep', () => {
  it('should merge', () => {
    const one = {
      a: 1,
    }
    const two = {
      b: 1,
    }
    const result = {
      a: 1,
      b: 1,
    }
    const merged = mergeDeep(one, two)

    expect(merged).to.deep.eq(result)
  })

  it('should not merge array', () => {
    const one = {
      a: [1],
    }
    const two = {
      a: [2],
    }
    const result = {
      a: [2],
    }
    const merged = mergeDeep(one, two)

    expect(merged).to.deep.eq(result)
  })

  it('should merge deep', () => {
    const one = {
      a: 1,
      b: {
        c: true,
      },
      d: {
        e: true,
        f: [1],
      },
    }
    const two = {
      b: 1,
      d: {
        f: [2],
        g: 1,
      },
    }
    const result = {
      a: 1,
      b: 1,
      d: {
        e: true,
        f: [2],
        g: 1,
      },
    }
    const merged = mergeDeep(one, two)

    expect(merged).to.deep.eq(result)
  })
})
