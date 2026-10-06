import { describe, expect, it } from 'vite-plus/test'

import { Extension } from './Extension.js'
import { Mark } from './Mark.js'
import { Node } from './Node.js'
import { getExtensionField } from './helpers/getExtensionField.js'

declare module './Extension.js' {
  // Extension does not have a addAttributes defined, but we just want to test it anyway
  interface ExtensionConfig {
    // @ts-ignore - this is a dynamic key
    [key: string]: any
  }
}

describe('extend extensions', () => {
  ;[Extension, Node, Mark].forEach(Extendable => {
    describe(Extendable.create().type, () => {
      it('should define a config', () => {
        const extension = Extendable.create({
          addAttributes() {
            return {
              foo: {},
            }
          },
        })

        const attributes = getExtensionField(extension, 'addAttributes')()

        expect(attributes).toEqual({
          foo: {},
        })
      })

      it('should overwrite a config', () => {
        const extension = Extendable.create({
          addAttributes() {
            return {
              foo: {},
            }
          },
        }).extend({
          addAttributes() {
            return {
              bar: {},
            }
          },
        })

        const attributes = getExtensionField(extension, 'addAttributes')()

        expect(attributes).toEqual({
          bar: {},
        })
      })

      it('should have a parent', () => {
        const extension = Extendable.create({
          addAttributes() {
            return {
              foo: {},
            }
          },
        })

        const newExtension = extension.extend({
          addAttributes() {
            return {
              bar: {},
            }
          },
        })

        const parent = newExtension.parent

        expect(parent).toBe(extension)
      })

      it('should merge configs', () => {
        const extension = Extendable.create({
          addAttributes() {
            return {
              foo: {},
            }
          },
        }).extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              bar: {},
            }
          },
        })

        const attributes = getExtensionField(extension, 'addAttributes')()

        expect(attributes).toEqual({
          foo: {},
          bar: {},
        })
      })

      it('should merge configs multiple times', () => {
        const extension = Extendable.create({
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

        expect(attributes).toEqual({
          foo: {},
          bar: {},
          baz: {},
        })
      })

      it('should set parents multiple times', () => {
        const grandparentExtension = Extendable.create({
          addAttributes() {
            return {
              foo: {},
            }
          },
        })

        const parentExtension = grandparentExtension.extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              bar: {},
            }
          },
        })

        const childExtension = parentExtension.extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              baz: {},
            }
          },
        })

        expect(parentExtension.parent).toBe(grandparentExtension)
        expect(childExtension.parent).toBe(parentExtension)
      })

      it('should merge configs without direct parent configuration', () => {
        const extension = Extendable.create({
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

        expect(attributes).toEqual({
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

        const extension = Extendable.create({
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

        expect(callCounts).toEqual({
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

        const extension = Extendable.create({
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

        expect(callCounts).toEqual({
          grandparent: 1,
          parent: 1,
          child: 1,
        })
      })

      it('should use grandparent as parent on configure (not parent)', () => {
        const grandparentExtension = Extendable.create({
          addAttributes() {
            return {
              foo: {},
            }
          },
        })

        const parentExtension = grandparentExtension.extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              bar: {},
            }
          },
        })

        const childExtension = parentExtension.configure({
          baz: {},
        })

        expect(parentExtension.parent).toBe(grandparentExtension)
        expect(childExtension.parent).toBe(grandparentExtension)
      })

      it("should use parent's config on `configure`", () => {
        const grandparentExtension = Extendable.create({
          name: 'grandparent',
          addAttributes() {
            return {
              foo: {},
            }
          },
        })

        const parentExtension = grandparentExtension.extend({
          name: 'parent',
          addAttributes() {
            return {
              ...this.parent?.(),
              bar: {},
            }
          },
        })

        const childExtension = parentExtension.configure({
          baz: {},
        })

        expect(childExtension.config.name).toBe('parent')
      })

      it('should allow extending a configure', () => {
        const parentExtension = Extendable.create({
          addAttributes() {
            return { foo: 'bar' }
          },
        })

        const childExtension = parentExtension.configure().extend()

        const attributes = getExtensionField(childExtension, 'addAttributes')()

        expect(attributes).toEqual({
          foo: 'bar',
        })
      })

      it('should allow calling this.parent when extending a configure', () => {
        const parentExtension = Extendable.create({
          name: 'parentExtension',
          addAttributes() {
            return {
              foo: {},
            }
          },
        })

        const childExtension = parentExtension.configure({}).extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              bar: {},
            }
          },
        })

        const attributes = getExtensionField(childExtension, 'addAttributes')()

        expect(attributes).toEqual({
          foo: {},
          bar: {},
        })
      })

      it('should configure to be in addition to the parent options', () => {
        const parentExtension = Extendable.create({
          name: 'parentExtension',
          addOptions() {
            return { parent: 'exists', overwrite: 'parent' }
          },
        })

        const childExtension = parentExtension.configure({
          child: 'exists-too',
          overwrite: 'child',
        })

        expect(childExtension.options).toEqual({
          parent: 'exists',
          child: 'exists-too',
          overwrite: 'child',
        })
      })

      it('should deeply merge options when extending a configured extension', () => {
        const parentExtension = Extendable.create({
          name: 'parentExtension',
          addOptions() {
            return { defaultOptions: 'exists', overwrite: 'parent' }
          },
        })

        const childExtension = parentExtension
          .configure({ configuredOptions: 'exists-too', overwrite: 'configure' })
          .extend({
            name: 'childExtension',
            addOptions() {
              return { ...this.parent?.(), additionalOptions: 'exist-too', overwrite: 'child' }
            },
          })

        expect(childExtension.options).toEqual({
          defaultOptions: 'exists',
          configuredOptions: 'exists-too',
          additionalOptions: 'exist-too',
          overwrite: 'child',
        })
      })
    })
  })
})
describe('parent/child cleanup on destroy', () => {
  it('should not leak child reference when configure() is called on a singleton', () => {
    const singleton = Extension.create({
      name: 'testExtension',
      addOptions() {
        return { foo: 'bar' }
      },
    })

    const configuredExtension = singleton.configure({ foo: 'baz' })

    expect(singleton.child).toBeNull()
    expect(configuredExtension.parent).toBeNull()
  })
})

describe('extension options', () => {
  ;[Extension, Node, Mark].forEach(Extendable => {
    describe(Extendable.create().type, () => {
      it('should set options', () => {
        const extension = Extendable.create({
          addOptions() {
            return {
              foo: 1,
              bar: 1,
            }
          },
        })

        expect(extension.options).toEqual({
          foo: 1,
          bar: 1,
        })
      })

      it('should pass through', () => {
        const extension = Extendable.create({
          addOptions() {
            return {
              foo: 1,
              bar: 1,
            }
          },
        })
          .extend()
          .configure()

        expect(extension.options).toEqual({
          foo: 1,
          bar: 1,
        })
      })

      it('should be configurable', () => {
        const extension = Extendable.create({
          addOptions() {
            return {
              foo: 1,
              bar: 1,
            }
          },
        }).configure({
          bar: 2,
        })

        expect(extension.options).toEqual({
          foo: 1,
          bar: 2,
        })
      })

      it('should be extendable', () => {
        const extension = Extendable.create({
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

        expect(newExtension.options).toEqual({
          foo: 1,
          bar: 1,
          baz: 1,
        })
      })

      it('should be extendable multiple times', () => {
        const extension = Extendable.create({
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

        expect(newExtension.options).toEqual({
          foo: 1,
          bar: 1,
          baz: 1,
          bax: 1,
        })
      })

      it('should be overwritable', () => {
        const extension = Extendable.create({
          addOptions() {
            return {
              foo: 1,
              bar: 1,
            }
          },
        }).extend({
          addOptions() {
            return {
              baz: 1,
            }
          },
        })

        expect(extension.options).toEqual({
          baz: 1,
        })
      })

      it('should configure nested objects', () => {
        const extension = Extendable.create<{
          foo: number[]
          HTMLAttributes: Record<string, any>
        }>({
          addOptions() {
            return {
              foo: [1, 2, 3],
              HTMLAttributes: {
                class: 'foo',
              },
            }
          },
        }).configure({
          foo: [1],
          HTMLAttributes: {
            id: 'bar',
          },
        })

        expect(extension.options).toEqual({
          foo: [1],
          HTMLAttributes: {
            class: 'foo',
            id: 'bar',
          },
        })
      })

      it('should configure retaining existing config', () => {
        const extension = Extendable.create({
          name: 'parent',
          addOptions() {
            return {
              foo: 1,
              bar: 1,
            }
          },
        })

        const newExtension = extension.configure()

        expect(newExtension.config.name).toBe('parent')
      })

      it('should create its own instance on configure', () => {
        const extension = Extendable.create({
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

        expect(extension1.options).toEqual({
          foo: 2,
          bar: 4,
        })

        expect(extension2.options).toEqual({
          foo: 3,
          bar: 2,
        })
      })
    })
  })
})

describe('extension storage', () => {
  ;[Extension, Node, Mark].forEach(Extendable => {
    describe(Extendable.create().type, () => {
      it('should be an empty object if not defined', () => {
        const extension = Extendable.create({})

        expect(extension.storage).toEqual({})
      })

      it('should be be the return of `addStorage` if defined', () => {
        const extension = Extendable.create({
          addStorage() {
            return { a: 1 }
          },
        })

        expect(extension.storage).toEqual({ a: 1 })
      })

      it('should be able to be extended', () => {
        const extension = Extendable.create({
          addStorage() {
            return { a: 1 }
          },
        }).extend()

        expect(extension.storage).toEqual({ a: 1 })
      })

      it('should be able to be configured', () => {
        const extension = Extendable.create({
          addStorage() {
            return { a: 1 }
          },
        }).configure({
          anything: 'else',
        })

        expect(extension.storage).toEqual({ a: 1 })
      })

      it('should be able to be extended and configured', () => {
        const extension = Extendable.create({
          addStorage() {
            return { a: 1 }
          },
        })
          .extend()
          .configure({
            anything: 'else',
          })

        expect(extension.storage).toEqual({ a: 1 })
      })

      it('should be overwrite parents addStorage', () => {
        const extension = Extendable.create({
          addStorage() {
            expect(false, 'This should not be called').toBe(true)
            return { a: 1 }
          },
        }).extend({
          addStorage() {
            return { b: 1 }
          },
        })

        expect(extension.storage).toEqual({ b: 1 })
      })

      it('grandchild should overwrite grandparent & parents addStorage', () => {
        const extension = Extendable.create({
          addStorage() {
            expect(false, 'This should not be called').toBe(true)
            return { a: 1 }
          },
        })
          .extend({
            addStorage() {
              expect(false, 'This should not be called').toBe(true)
              return { b: 1 }
            },
          })
          .extend({
            addStorage() {
              return { c: 1 }
            },
          })

        expect(extension.storage).toEqual({ c: 1 })
      })

      it('should return a new object on each access', () => {
        const extension = Extendable.create({
          addStorage() {
            return { a: 1 }
          },
        })

        const storage1 = extension.storage
        const storage2 = extension.storage

        expect(storage1).toEqual({ a: 1 })
        expect(storage2).toEqual({ a: 1 })
        expect(storage1).not.toBe(storage2)
      })
    })
  })
})
