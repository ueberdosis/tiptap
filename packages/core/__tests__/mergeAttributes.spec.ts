import { mergeAttributes } from '@dibdab/core'
import { describe, expect, it } from 'vitest'

describe('mergeAttributes', () => {
  it('should merge two objects', () => {
    const value = mergeAttributes({ id: 1 }, { class: 'foo' })

    expect(value).toEqual({
      id: 1,
      class: 'foo',
    })
  })

  it('should merge multiple objects', () => {
    const value = mergeAttributes({ id: 1 }, { class: 'foo' }, { title: 'bar' })

    expect(value).toEqual({
      id: 1,
      class: 'foo',
      title: 'bar',
    })
  })

  it('should overwrite values', () => {
    const value = mergeAttributes({ id: 1 }, { id: 2 })

    expect(value).toEqual({
      id: 2,
    })
  })

  it('should merge classes', () => {
    const value = mergeAttributes({ class: 'foo' }, { class: 'bar' })

    expect(value).toEqual({
      class: 'foo bar',
    })
  })

  it('should merge styles', () => {
    const value = mergeAttributes({ style: 'color: red' }, { style: 'background: green' })

    expect(value).toEqual({
      style: 'color: red; background: green',
    })
  })

  it('should merge classes and styles', () => {
    const value = mergeAttributes({ class: 'foo', style: 'color: red' }, { class: 'bar', style: 'background: green' })

    expect(value).toEqual({
      class: 'foo bar',
      style: 'color: red; background: green',
    })
  })

  it('should ignore falsy values', () => {
    const value = mergeAttributes(undefined as any, { class: 'foo' })

    expect(value).toEqual({
      class: 'foo',
    })
  })

  it('should overwrite styles', () => {
    const value = mergeAttributes({ style: 'color: red' }, { style: 'color: green' })

    expect(value).toEqual({
      style: 'color: green',
    })
  })

  it('should merge several styles', () => {
    const value = mergeAttributes(
      { style: 'color: red; background-color: red' },
      { style: 'color: green;  background-color: red; margin-left: 30px' },
    )

    expect(value).toEqual({
      style: 'color: green; background-color: red; margin-left: 30px',
    })
  })
})
