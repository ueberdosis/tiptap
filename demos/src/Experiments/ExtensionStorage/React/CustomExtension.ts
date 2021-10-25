import { Extension } from '@tiptap/core'

type CustomStorage = {
  foo: number,
}

export const CustomExtension = Extension.create<{}, CustomStorage>({
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
