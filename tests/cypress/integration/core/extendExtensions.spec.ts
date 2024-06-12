/// <reference types="cypress" />

import { Extension, getExtensionField } from '@tiptap/core'

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

  it('should have a parent', () => {
    const extension = Extension
      .create({
        addAttributes() {
          return {
            foo: {},
          }
        },
      })

    const newExtension = extension
      .extend({
        addAttributes() {
          return {
            bar: {},
          }
        },
      })

    const parent = newExtension.parent

    expect(parent).to.eq(extension)
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

  it('should set parents multiple times', () => {
    const grandparentExtension = Extension
      .create({
        addAttributes() {
          return {
            foo: {},
          }
        },
      })

    const parentExtension = grandparentExtension
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })

    const childExtension = parentExtension
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            baz: {},
          }
        },
      })

    expect(parentExtension.parent).to.eq(grandparentExtension)
    expect(childExtension.parent).to.eq(parentExtension)
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

  it('should call ancestors only once', () => {
    const callCounts = {
      grandparent: 0,
      parent: 0,
      child: 0,
    }

    const extension = Extension
      .create({
        addAttributes() {
          callCounts.grandparent += 1
          return {
            foo: {},
          }
        },
      })
      .extend({
        addAttributes() {
          callCounts.parent += 1
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })
      .extend({
        addAttributes() {
          callCounts.child += 1
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })

    getExtensionField(extension, 'addAttributes')()

    expect(callCounts).to.deep.eq({
      grandparent: 1,
      parent: 1,
      child: 1,
    })
  })

  it('should call ancestors only once on configure', () => {
    const callCounts = {
      grandparent: 0,
      parent: 0,
      child: 0,
    }

    const extension = Extension
      .create({
        addAttributes() {
          callCounts.grandparent += 1
          return {
            foo: {},
          }
        },
      })
      .extend({
        addAttributes() {
          callCounts.parent += 1
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })
      .extend({
        addAttributes() {
          callCounts.child += 1
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })
      .configure({
        baz: {},
      })

    getExtensionField(extension, 'addAttributes')()

    expect(callCounts).to.deep.eq({
      grandparent: 1,
      parent: 1,
      child: 1,
    })
  })

  it('should use grandparent as parent on configure (not parent)', () => {
    const grandparentExtension = Extension
      .create({
        addAttributes() {
          return {
            foo: {},
          }
        },
      })

    const parentExtension = grandparentExtension
      .extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })

    const childExtension = parentExtension
      .configure({
        baz: {},
      })

    expect(parentExtension.parent).to.eq(grandparentExtension)
    expect(childExtension.parent).to.eq(grandparentExtension)
  })

  it('should use parent\'s config on `configure`', () => {
    const grandparentExtension = Extension
      .create({
        name: 'grandparent',
        addAttributes() {
          return {
            foo: {},
          }
        },
      })

    const parentExtension = grandparentExtension
      .extend({
        name: 'parent',
        addAttributes() {
          return {
            ...this.parent?.(),
            bar: {},
          }
        },
      })

    const childExtension = parentExtension
      .configure({
        baz: {},
      })

    expect(childExtension.config.name).to.eq('parent')
  })

  it('should inherit config on configure', () => {

    const parentExtension = Extension
      .create({
        name: 'did-inherit',
      })

    const childExtension = parentExtension
      .configure()

    expect(childExtension.config.name).to.eq('did-inherit')
  })
})
