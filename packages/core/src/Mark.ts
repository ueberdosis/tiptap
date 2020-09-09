import { MarkSpec, MarkType } from 'prosemirror-model'
import Extension, { ExtensionCallback, ExtensionExtends } from './Extension'
import { Editor } from './Editor'

interface Callback {
  name: string
  editor: Editor
  options: any
  type: MarkType
}

export interface MarkExtends extends ExtensionExtends<Callback> {
  topMark: boolean
  schema: (params: Callback) => MarkSpec
}

export default class Mark<Options = {}> extends Extension<Options, Callback, MarkExtends> {
  type = 'mark'

  public schema(value: MarkExtends['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}