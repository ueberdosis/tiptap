import { mergeAttributes } from '@tiptap/core'
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

  it('should handle styles with only property names', () => {
    const value = mergeAttributes(
      { style: 'color: red; background-color; font-size: 14px' },
      { style: 'color: green; font-size;' },
    )

    expect(value).to.deep.eq({
      style: 'color: green; font-size: 14px',
    })
  })

  it('should handle styles with only values', () => {
    const value = mergeAttributes({ style: ': red; color: green; : 100px;' }, { style: 'margin: 10px' })

    expect(value).to.deep.eq({
      style: 'color: green; margin: 10px',
    })
  })

  it('should handle complex font-family style declarations', () => {
    const value = mergeAttributes(
      { style: 'font-family: Arial, "Helvetica Neue", sans-serif' },
      { style: 'color: blue' },
    )

    expect(value).to.deep.eq({
      style: 'font-family: Arial, "Helvetica Neue", sans-serif; color: blue',
    })
  })

  it('should handle styles with HTTP URLs', () => {
    const value = mergeAttributes(
      { style: 'background: url(https://example.com/image.jpg) center center no-repeat;background-size: cover' },
      { style: 'color: red' },
    )

    expect(value).to.deep.eq({
      style:
        'background: url(https://example.com/image.jpg) center center no-repeat; background-size: cover; color: red',
    })
  })

  it('should handle styles with data URLs', () => {
    const value = mergeAttributes(
      {
        style:
          'background: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3C/svg%3E") center center no-repeat;background-size: cover',
      },
      { style: 'color: red' },
    )

    expect(value).to.deep.eq({
      style:
        'background: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'%3E%3C/svg%3E") center center no-repeat; background-size: cover; color: red',
    })
  })
})
