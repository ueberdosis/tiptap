/// <reference types="cypress" />

import {
  Extension, getExtensionField, Mark, Node,
} from '@tiptap/core'

describe('extend extensions', () => {
  [Extension, Node, Mark].forEach(Extendable => {
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

        expect(attributes).to.deep.eq({
          foo: {},
        })
      })

      it('should overwrite a config', () => {
        const extension = Extendable
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
        const extension = Extendable
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
        const extension = Extendable
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
        const extension = Extendable
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
        const grandparentExtension = Extendable
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
        const extension = Extendable
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

        const extension = Extendable
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

        const extension = Extendable
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
        const grandparentExtension = Extendable
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
        const grandparentExtension = Extendable
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

      it('should allow extending a configure', () => {

        const parentExtension = Extendable
          .create({

            addAttributes() {
              return { foo: 'bar' }
            },
          })

        const childExtension = parentExtension
          .configure().extend()

        const attributes = getExtensionField(childExtension, 'addAttributes')()

        expect(attributes).to.deep.eq({
          foo: 'bar',
        })
      })

      it('should allow calling this.parent when extending a configure', () => {

        const parentExtension = Extendable
          .create({
            name: 'parentExtension',
            addAttributes() {
              return {
                foo: {},
              }
            },
          })

        const childExtension = parentExtension
          .configure({}).extend({
            addAttributes() {
              return {
                ...this.parent?.(),
                bar: {},
              }
            },
          })

        const attributes = getExtensionField(childExtension, 'addAttributes')()

        expect(attributes).to.deep.eq({
          foo: {},
          bar: {},
        })
      })

      it('should configure to be in addition to the parent options', () => {
        const parentExtension = Extendable
          .create({
            name: 'parentExtension',
            addOptions() {
              return { parent: 'exists', overwrite: 'parent' }
            },
          })

        const childExtension = parentExtension
          .configure({ child: 'exists-too', overwrite: 'child' })

        expect(childExtension.options).to.deep.eq({
          parent: 'exists',
          child: 'exists-too',
          overwrite: 'child',
        })
      })

      it('should deeply merge options when extending a configured extension', () => {
        const parentExtension = Extendable
          .create({
            name: 'parentExtension',
            addOptions() {
              return { defaultOptions: 'exists', overwrite: 'parent' }
            },
          })

        const childExtension = parentExtension
          .configure({ configuredOptions: 'exists-too', overwrite: 'configure' }).extend({
            name: 'childExtension',
            addOptions() {
              return { ...this.parent?.(), additionalOptions: 'exist-too', overwrite: 'child' }
            },
          })

        expect(childExtension.options).to.deep.eq({
          defaultOptions: 'exists',
          configuredOptions: 'exists-too',
          additionalOptions: 'exist-too',
          overwrite: 'child',
        })
      })
    })
  })
})
