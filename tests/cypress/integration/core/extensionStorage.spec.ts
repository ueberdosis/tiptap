/// <reference types="cypress" />

import { Extension, Mark, Node } from '@tiptap/core'

describe('extension storage', () => {
  ;[Extension, Node, Mark].forEach(Extendable => {
    describe(Extendable.create().type, () => {
      it('should be an empty object if not defined', () => {
        const extension = Extension.create({})

        expect(extension.storage).to.deep.eq({})
      })

      it('should be be the return of `addStorage` if defined', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        })

        expect(extension.storage).to.deep.eq({ a: 1 })
      })

      it('should be able to be extended', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        }).extend()

        expect(extension.storage).to.deep.eq({ a: 1 })
      })

      it('should be able to be configured', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        }).configure({
          anything: 'else',
        })

        expect(extension.storage).to.deep.eq({ a: 1 })
      })

      it('should be able to be extended and configured', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        })
          .extend()
          .configure({
            anything: 'else',
          })

        expect(extension.storage).to.deep.eq({ a: 1 })
      })

      it('should be overwritten with multiple addStorage calls', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        }).extend({
          addStorage() {
            return { a: 1 }
          },
        })

        expect(extension.storage).to.deep.eq({ a: 1 })
      })

      it('should be merged with a parents addStorage', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        }).extend({
          addStorage() {
            return { b: 2 }
          },
        })

        expect(extension.storage).to.deep.eq({ a: 1, b: 2 })
      })

      it('should be merged with a grandparents addStorage', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        })
          .extend({
            addStorage() {
              return { b: 2 }
            },
          })
          .extend({
            addStorage() {
              return { c: 3 }
            },
          })

        expect(extension.storage).to.deep.eq({ a: 1, b: 2, c: 3 })
      })

      it('should return a new object on each access', () => {
        const extension = Extension.create({
          addStorage() {
            return { a: 1 }
          },
        })

        const storage1 = extension.storage
        const storage2 = extension.storage

        expect(storage1).to.deep.eq({ a: 1 })
        expect(storage2).to.deep.eq({ a: 1 })
        expect(storage1).not.to.eq(storage2)
      })
    })
  })
})
