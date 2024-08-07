/// <reference types="cypress" />

import { Extension } from '@tiptap/core'

describe('extension options', () => {
  it('should set options', () => {
    const extension = Extension.create({
      addOptions() {
        return {
          foo: 1,
          bar: 1,
        }
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
        addOptions() {
          return {
            foo: 1,
            bar: 1,
          }
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
        addOptions() {
          return {
            foo: 1,
            bar: 1,
          }
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
      addOptions() {
        return {
          foo: 1,
          bar: 1,
        }
      },
    })

    const newExtension = extension.extend({
      addOptions() {
        return {
          ...this.parent?.(),
          baz: 1,
        }
      },
    })

    expect(newExtension.options).to.deep.eq({
      foo: 1,
      bar: 1,
      baz: 1,
    })
  })

  it('should be extendable multiple times', () => {
    const extension = Extension.create({
      addOptions() {
        return {
          foo: 1,
          bar: 1,
        }
      },
    }).extend({
      addOptions() {
        return {
          ...this.parent?.(),
          baz: 1,
        }
      },
    })

    const newExtension = extension.extend({
      addOptions() {
        return {
          ...this.parent?.(),
          bax: 1,
        }
      },
    })

    expect(newExtension.options).to.deep.eq({
      foo: 1,
      bar: 1,
      baz: 1,
      bax: 1,
    })
  })

  it('should be overwritable', () => {
    const extension = Extension
      .create({
        addOptions() {
          return {
            foo: 1,
            bar: 1,
          }
        },
      })
      .extend({
        addOptions() {
          return {
            baz: 1,
          }
        },
      })

    expect(extension.options).to.deep.eq({
      baz: 1,
    })
  })

  it('should configure nested objects', () => {
    const extension = Extension
      .create<{
        foo: number[],
        HTMLAttributes: Record<string, any>,
      }>({
        addOptions() {
          return {
            foo: [1, 2, 3],
            HTMLAttributes: {
              class: 'foo',
            },
          }
        },
      })
      .configure({
        foo: [1],
        HTMLAttributes: {
          id: 'bar',
        },
      })

    expect(extension.options).to.deep.eq({
      foo: [1],
      HTMLAttributes: {
        class: 'foo',
        id: 'bar',
      },
    })
  })

  it('should configure retaining existing config', () => {
    const extension = Extension.create({
      name: 'parent',
      addOptions() {
        return {
          foo: 1,
          bar: 1,
        }
      },
    })

    const newExtension = extension
      .configure()

    expect(newExtension.config.name).to.eq('parent')
  })

  it('should create its own instance on configure', () => {
    const extension = Extension
      .create({
        addOptions() {
          return {
            foo: 1,
            bar: 2,
          }
        },
      })

    const extension1 = extension.configure({
      foo: 2,
      bar: 4,
    })

    const extension2 = extension.configure({
      foo: 3,
    })

    expect(extension1.options).to.deep.eq({
      foo: 2,
      bar: 4,
    })

    expect(extension2.options).to.deep.eq({
      foo: 3,
      bar: 2,
    })
  })
})
