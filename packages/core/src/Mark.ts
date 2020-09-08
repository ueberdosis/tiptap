import { MarkSpec, MarkType } from 'prosemirror-model'
import Extension, { ExtensionCallback, ExtensionExtends } from './Extension'

// export default abstract class Mark extends Extension {

//   constructor(options = {}) {
//     super(options)
//   }

//   public extensionType = 'mark'

//   abstract schema(): MarkSpec

//   get type() {
//     return this.editor.schema.marks[this.name]
//   }

// }

export interface MarkCallback extends ExtensionCallback {
  // TODO: fix optional
  type?: MarkType
}

export interface MarkExtends<Callback = MarkCallback> extends ExtensionExtends<Callback> {
  topMark: boolean
  schema: (params: Callback) => MarkSpec
}

export default class Mark<Options = {}> extends Extension<Options, MarkExtends> {
  type = 'node'

  public schema(value: MarkExtends['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}