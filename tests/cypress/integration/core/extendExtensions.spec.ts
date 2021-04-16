/// <reference types="cypress" />

import { Extension } from '@tiptap/core/src/Extension'
import getExtensionField from '@tiptap/core/src/helpers/getExtensionField'

describe('extend extensions', () => {
  it('should define a config', () => {
    const extension = Extension.create({
      addAttributes() {
        return {
          foo: {},
        }
      },
    })

    const attributes = getExtensionField(extension, 'addAttributes')()

    expect(attributes).to.deep.eq({
      foo: {},
    })
  })

  it('should overwrite a config', () => {
    const extension = Extension
      .create({
        addAttributes() {
          return {
            foo: {},
          }
        },
      })
      .extend({
        addAttributes() {
          return {
            bar: {},
          }
        },
      })

    const attributes = getExtensionField(extension, 'addAttributes')()

    expect(attributes).to.deep.eq({
      bar: {},
    })
  })

  it('should merge configs', () => {
    const extension = Extension
      .create({
        addAttributes() {
          return {
            foo: {},
          }
        },
      })
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })

    const attributes = getExtensionField(extension, 'addAttributes')()

    expect(attributes).to.deep.eq({
      foo: {},
      bar: {},
    })
  })

  it('should merge configs multiple times', () => {
    const extension = Extension
      .create({
        addAttributes() {
          return {
            foo: {},
          }
        },
      })
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            baz: {},
          }
        },
      })

    const attributes = getExtensionField(extension, 'addAttributes')()

    expect(attributes).to.deep.eq({
      foo: {},
      bar: {},
      baz: {},
    })
  })

  it('should merge configs without direct parent configuration', () => {
    const extension = Extension
      .create({
        addAttributes() {
          return {
            foo: {},
          }
        },
      })
      .extend()
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })

    const attributes = getExtensionField(extension, 'addAttributes')()

    expect(attributes).to.deep.eq({
      foo: {},
      bar: {},
    })
  })
})
