/// <reference types="cypress" />

import { mergeAttributes } from '@tiptap/core/src/utilities/mergeAttributes'

describe('mergeAttributes', () => {
  it('should merge two objects', () => {
    const value = mergeAttributes({ id: 1 }, { class: 'foo' })

    expect(value).to.deep.eq({
      id: 1,
      class: 'foo',
    })
  })

  it('should merge multiple objects', () => {
    const value = mergeAttributes({ id: 1 }, { class: 'foo' }, { title: 'bar' })

    expect(value).to.deep.eq({
      id: 1,
      class: 'foo',
      title: 'bar',
    })
  })

  it('should overwrite values', () => {
    const value = mergeAttributes({ id: 1 }, { id: 2 })

    expect(value).to.deep.eq({
      id: 2,
    })
  })

  it('should merge classes', () => {
    const value = mergeAttributes({ class: 'foo' }, { class: 'bar' })

    expect(value).to.deep.eq({
      class: 'foo bar',
    })
  })

  it('should merge styles', () => {
    const value = mergeAttributes({ style: 'color: red' }, { style: 'background: green' })

    expect(value).to.deep.eq({
      style: 'color: red; background: green',
    })
  })

  it('should merge classes and styles', () => {
    const value = mergeAttributes(
      { class: 'foo', style: 'color: red' },
      { class: 'bar', style: 'background: green' },
    )

    expect(value).to.deep.eq({
      class: 'foo bar',
      style: 'color: red; background: green',
    })
  })

  it('should ignore falsy values', () => {
    // @ts-expect-error
    const value = mergeAttributes(undefined, { class: 'foo' })

    expect(value).to.deep.eq({
      class: 'foo',
    })
  })
})
