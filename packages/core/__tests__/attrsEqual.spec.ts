import { attrsEqual } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

describe('attrsEqual', () => {
  it('returns true for identical objects with same key order', () => {
    expect(attrsEqual({ level: 1, color: 'red' }, { level: 1, color: 'red' })).toBe(true)
  })

  it('returns true for identical objects with different key order', () => {
    expect(attrsEqual({ level: 1, color: 'red' }, { color: 'red', level: 1 })).toBe(true)
  })

  it('returns true for empty objects', () => {
    expect(attrsEqual({}, {})).toBe(true)
  })

  it('returns true when both are null', () => {
    expect(attrsEqual(null, null)).toBe(true)
  })

  it('returns true when both are undefined', () => {
    expect(attrsEqual(undefined, undefined)).toBe(true)
  })

  it('returns true for same reference', () => {
    const obj = { level: 1 }
    expect(attrsEqual(obj, obj)).toBe(true)
  })

  it('returns false when one is null and the other is an object', () => {
    expect(attrsEqual(null, { level: 1 })).toBe(false)
  })

  it('returns false when one is undefined and the other is an object', () => {
    expect(attrsEqual(undefined, { level: 1 })).toBe(false)
  })

  it('returns false for objects with different keys', () => {
    expect(attrsEqual({ level: 1 }, { level: 1, color: 'red' })).toBe(false)
  })

  it('returns false for objects with same keys but different values', () => {
    expect(attrsEqual({ level: 1 }, { level: 2 })).toBe(false)
  })

  it('returns false when a key is present in both but one value is undefined', () => {
    expect(attrsEqual({ level: undefined }, { level: 1 })).toBe(false)
  })

  it('distinguishes { foo: undefined } from { bar: undefined }', () => {
    expect(attrsEqual({ foo: undefined }, { bar: undefined })).toBe(false)
  })
})
