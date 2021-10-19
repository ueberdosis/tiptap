import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Storage {
    custom: {
      foo: number,
    }
  }
}

export const CustomExtension = Extension.create({
  name: 'custom',

  onUpdate() {
    this.editor.storage.custom.foo++
  },

  addStorage() {
    return {
      custom: {
        foo: 123,
      },
    }
  },
})
