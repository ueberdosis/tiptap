import { keymap } from 'prosemirror-keymap'
import collect from 'collect.js'
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

  get nodes(): any {
    return collect(this.extensions)
      .where('type', 'node')
      .mapWithKeys((extension: any) => [extension.name, extension.schema])
      .all()
  }

  get marks(): any {
    return collect(this.extensions)
      .where('type', 'mark')
      .mapWithKeys((extension: any) => [extension.name, extension.schema])
      .all()
  }

}
