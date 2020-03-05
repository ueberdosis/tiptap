import { keymap } from 'prosemirror-keymap'
import { Editor } from './Editor'

export default class ExtensionManager {

  extensions: [any?]

  constructor(extensions: any = [], editor: Editor) {
    // extensions.forEach(extension => {
    //   extension.bindEditor(editor)
    //   extension.init()
    // })
    this.extensions = extensions
  }

  get nodes() {
    return this.extensions
      .filter(extension => extension.type === 'node')
      .reduce((nodes, { name, schema }) => ({
        ...nodes,
        [name]: schema,
      }), {})
  }

  get marks() {
    return this.extensions
      .filter(extension => extension.type === 'mark')
      .reduce((marks, { name, schema }) => ({
        ...marks,
        [name]: schema,
      }), {})
  }

}
