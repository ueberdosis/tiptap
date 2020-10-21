// import { MarkSpec, MarkType } from 'prosemirror-model'
// import Extension, { ExtensionMethods } from './Extension'
// import { Editor } from './Editor'

// export interface MarkProps<Options> {
//   name: string
//   editor: Editor
//   options: Options
//   type: MarkType
// }

// export interface MarkMethods<Props, Options> extends ExtensionMethods<Props, Options> {
//   topMark: boolean
//   schema: (params: Omit<Props, 'type' | 'editor'>) => MarkSpec
// }

// export default class Mark<
//   Options = {},
//   Props = MarkProps<Options>,
//   Methods extends MarkMethods<Props, Options> = MarkMethods<Props, Options>,
// > extends Extension<Options, Props, Methods> {
//   type = 'mark'

//   public schema(value: Methods['schema']) {
//     this.storeConfig('schema', value, 'overwrite')
//     return this
//   }
// }

// import Extension from './Extension'

// export default class Node<Options = {}> extends Extension<Options> {

//   type = 'mark'

//   createAttributes() {
//     return {}
//   }

//   parseHTML() {
//     return []
//   }

//   renderHTML() {
//     return []
//   }

// }

import { DOMOutputSpec, MarkSpec, Mark } from 'prosemirror-model'
import { ExtensionSpec } from './Extension'
import { Attributes } from './types'

export interface MarkExtensionSpec<Options = {}, Commands = {}> extends ExtensionSpec<Options, Commands> {
  inclusive?: MarkSpec['inclusive'],
  excludes?: MarkSpec['excludes'],
  group?: MarkSpec['group'],
  spanning?: MarkSpec['spanning'],
  parseHTML?: (
    this: {
      options: Options,
    },
  ) => MarkSpec['parseDOM'],
  renderHTML?: (
    this: {
      options: Options,
    },
    props: {
      node: Mark,
      attributes: {
        [key: string]: any,
      },
    }
  ) => DOMOutputSpec,
  createAttributes?: (
    this: {
      options: Options,
    },
  ) => Attributes,
}

export type MarkExtension = Required<Omit<MarkExtensionSpec, 'defaultOptions'> & {
  type: string,
  options: {
    [key: string]: any
  },
}>

const defaultMark: MarkExtension = {
  type: 'mark',
  name: 'mark',
  options: {},
  inclusive: null,
  excludes: null,
  group: null,
  spanning: null,
  createGlobalAttributes: () => [],
  createCommands: () => ({}),
  parseHTML: () => null,
  renderHTML: () => null,
}

export function createMark<Options extends {}, Commands extends {}>(config: MarkExtensionSpec<Options, Commands>) {
  const extend = <ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<MarkExtensionSpec<ExtendedOptions, ExtendedCommands>>) => {
    return createMark({
      ...config,
      ...extendedConfig,
    } as MarkExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }

  const setOptions = (options?: Partial<Options>) => {
    const { defaultOptions, ...rest } = config

    return {
      ...defaultMark,
      ...rest,
      options: {
        ...defaultOptions,
        ...options,
      } as Options,
    }
  }

  return Object.assign(setOptions, { config, extend })
}
