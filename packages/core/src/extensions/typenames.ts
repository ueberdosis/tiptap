import { Extension } from '../Extension.js'

export const Typenames = Extension.create({
  name: 'typenames',

  addGlobalAttributes() {
    return this.extensions.filter(extension => {
      return extension.name !== 'text' && extension.name !== 'doc'
    }).map(extension => ({
      types: [extension.name],
      attributes: {
        'data-tiptap': {
          default: extension.name,
          rendered: true,
        },
      },
    }))
  },
})
