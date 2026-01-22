import { Extension, Mark, Node } from '@dibdab/core'
import { describe, expect, it } from 'vitest'

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
