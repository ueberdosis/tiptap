/// <reference types="cypress" />

import { Extension } from '@tiptap/core/src/Extension'

describe('extension options', () => {
  it('should set options', () => {
    const extension = Extension.create({
      defaultOptions: {
        foo: 1,
        bar: 1,
      },
    })

    expect(extension.options).to.deep.eq({
      foo: 1,
      bar: 1,
    })
  })

  it('should pass through', () => {
    const extension = Extension
      .create({
        defaultOptions: {
          foo: 1,
          bar: 1,
        },
      })
      .extend()
      .configure()

    expect(extension.options).to.deep.eq({
      foo: 1,
      bar: 1,
    })
  })

  it('should be configurable', () => {
    const extension = Extension
      .create({
        defaultOptions: {
          foo: 1,
          bar: 1,
        },
      })
      .configure({
        bar: 2,
      })

    expect(extension.options).to.deep.eq({
      foo: 1,
      bar: 2,
    })
  })

  it('should be extendable', () => {
    const extension = Extension.create({
      defaultOptions: {
        foo: 1,
        bar: 1,
      },
    })

    const newExtension = extension.extend({
      defaultOptions: {
        ...extension.options,
        baz: 1,
      },
    })

    expect(newExtension.options).to.deep.eq({
      foo: 1,
      bar: 1,
      baz: 1,
    })
  })

  it('should be overwritable', () => {
    const extension = Extension
      .create({
        defaultOptions: {
          foo: 1,
          bar: 1,
        },
      })
      .extend({
        defaultOptions: {
          baz: 1,
        },
      })

    expect(extension.options).to.deep.eq({
      baz: 1,
    })
  })
})
