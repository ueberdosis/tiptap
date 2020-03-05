import { keymap } from 'prosemirror-keymap'
import collect from 'collect.js'
import { Editor } from './Editor'

export default class ExtensionManager {

  extensions: [any?]

  constructor(extensions: any = [], editor: Editor) {
    this.extensions = extensions
    this.extensions.forEach(extension => {
      extension.bindEditor(editor)
      extension.init()
    })
  }

  get topNode() {
    const topNode = this.extensions.find(extension => extension.topNode)

    if (topNode) {
      return topNode.name
    }
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

  get plugins(): any {
    return collect(this.extensions)
      .flatMap(extension => extension.plugins)
      .toArray()
  }

}
