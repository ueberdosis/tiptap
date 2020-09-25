import { MarkSpec, MarkType } from 'prosemirror-model'
import Extension, { ExtensionMethods } from './Extension'
import { Editor } from './Editor'

export interface MarkProps<Options> {
  name: string
  editor: Editor
  options: Options
  type: MarkType
}

export interface MarkMethods<Props, Options> extends ExtensionMethods<Props, Options> {
  topMark: boolean
  schema: (params: Omit<Props, 'type' | 'editor'>) => MarkSpec
}

export default class Mark<
  Options = {},
  Props = MarkProps<Options>,
  Methods extends MarkMethods<Props, Options> = MarkMethods<Props, Options>,
> extends Extension<Options, Props, Methods> {
  type = 'mark'

  public schema(value: Methods['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}
