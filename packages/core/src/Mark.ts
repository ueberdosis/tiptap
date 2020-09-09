import { MarkSpec, MarkType } from 'prosemirror-model'
import Extension, { ExtensionCallback, ExtensionExtends } from './Extension'
import { Editor } from './Editor'

interface MarkCallback<Options> {
  name: string
  editor: Editor
  options: Options
  type: MarkType
}

export interface MarkExtends<Callback, Options> extends ExtensionExtends<Callback, Options> {
  topMark: boolean
  schema: (params: Omit<Callback, 'type' | 'editor'>) => MarkSpec
}

export default class Mark<
  Options = {},
  Callback = MarkCallback<Options>,
  Extends extends MarkExtends<Callback, Options> = MarkExtends<Callback, Options>
> extends Extension<Options, Callback, Extends> {
  type = 'mark'

  public schema(value: Extends['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}