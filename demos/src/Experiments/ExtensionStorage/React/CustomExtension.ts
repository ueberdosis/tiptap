import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface EditorStorage {
    custom: {
      foo: number,
    }
  }
}

export const CustomExtension = Extension.create({
  name: 'custom',

  onUpdate() {
    this.editor.storage.custom.foo += 1
  },

  addStorage() {
    return {
      custom: {
        foo: 123,
      },
    }
  },
})
