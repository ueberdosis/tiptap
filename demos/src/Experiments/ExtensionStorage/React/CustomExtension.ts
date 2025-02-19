import { Extension } from '@tiptap/core'

type CustomStorage = {
  foo: number,
}

declare module '@tiptap/core' {
  interface ExtensionStorage {
    custom: CustomStorage;
  }
}

export const CustomExtension = Extension.create<any, CustomStorage>({
  name: 'custom',

  addStorage() {
    return {
      foo: 123,
    }
  },

  onUpdate() {
    this.storage.foo += 1
  },
})
