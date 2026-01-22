import { Extension, Mark, Node } from '@dibdab/core'
import { describe, expect, it } from 'vitest'

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
