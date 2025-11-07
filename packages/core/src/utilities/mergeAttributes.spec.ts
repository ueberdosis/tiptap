import { describe, expect, it } from 'vitest'

import { mergeAttributes } from '../utilities/mergeAttributes.js'

describe('mergeAttributes', () => {
  it('merges simple attributes', () => {
    const result = mergeAttributes({ id: 'test' }, { class: 'btn' })

    expect(result).toEqual({
      id: 'test',
      class: 'btn',
    })
  })

  it('merges multiple objects', () => {
    const result = mergeAttributes({ id: 'test' }, { class: 'btn' }, { 'data-value': '123' })

    expect(result).toEqual({
      id: 'test',
      class: 'btn',
      'data-value': '123',
    })
  })

  it('overwrites non-class and non-style attributes', () => {
    const result = mergeAttributes({ id: 'first' }, { id: 'second' })

    expect(result).toEqual({ id: 'second' })
  })

  it('merges class attributes', () => {
    const result = mergeAttributes({ class: 'btn' }, { class: 'btn-primary' })

    expect(result).toEqual({ class: 'btn btn-primary' })
  })

  it('merges class attributes with multiple classes', () => {
    const result = mergeAttributes({ class: 'btn btn-lg' }, { class: 'btn-primary' })

    expect(result).toEqual({ class: 'btn btn-lg btn-primary' })
  })

  it('avoids duplicate classes', () => {
    const result = mergeAttributes({ class: 'btn btn-primary' }, { class: 'btn-primary btn-lg' })

    expect(result).toEqual({ class: 'btn btn-primary btn-lg' })
  })

  it('handles empty class values', () => {
    const result = mergeAttributes({ class: 'btn' }, { class: '' })

    expect(result).toEqual({ class: 'btn' })
  })

  it('merges style attributes', () => {
    const result = mergeAttributes({ style: 'color: red' }, { style: 'background: blue' })

    expect(result).toEqual({ style: 'color: red; background: blue' })
  })

  it('overwrites duplicate style properties', () => {
    const result = mergeAttributes({ style: 'color: red; font-size: 12px' }, { style: 'color: blue; margin: 10px' })

    expect(result).toEqual({ style: 'color: blue; font-size: 12px; margin: 10px' })
  })

  it('handles complex style merging', () => {
    const result = mergeAttributes(
      { style: 'color: red; background: white' },
      { style: 'color: blue; border: 1px solid black' },
      { style: 'background: yellow' },
    )

    expect(result).toEqual({
      style: 'color: blue; background: yellow; border: 1px solid black',
    })
  })

  it('handles empty style values', () => {
    const result = mergeAttributes({ style: 'color: red' }, { style: '' })

    expect(result).toEqual({ style: 'color: red' })
  })

  it('filters out falsy objects', () => {
    const result = mergeAttributes({ id: 'test' }, {} as any, { class: 'btn' }, {} as any, { style: 'color: red' })

    expect(result).toEqual({
      id: 'test',
      class: 'btn',
      style: 'color: red',
    })
  })

  it('returns empty object when no valid objects provided', () => {
    const result = mergeAttributes()

    expect(result).toEqual({})
  })

  it('handles mixed attribute types', () => {
    const result = mergeAttributes(
      { id: 'test', class: 'btn', style: 'color: red' },
      { class: 'btn-primary', style: 'background: blue', 'data-value': '123' },
    )

    expect(result).toEqual({
      id: 'test',
      class: 'btn btn-primary',
      style: 'color: red; background: blue',
      'data-value': '123',
    })
  })
})
