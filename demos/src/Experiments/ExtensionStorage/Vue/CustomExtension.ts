import { Extension } from '@tiptap/editor'

type CustomStorage = {
  foo: number
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
