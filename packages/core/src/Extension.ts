// import cloneDeep from 'clone-deep'
// import { Plugin } from 'prosemirror-state'
// import { Editor, CommandsSpec } from './Editor'

// type AnyObject = {
//   [key: string]: any
// }

// type NoInfer<T> = [T][T extends any ? 0 : never]

// type MergeStrategy = 'extend' | 'overwrite'

// type Configs = {
//   [key: string]: {
//     stategy: MergeStrategy
//     value: any
//   }[]
// }

// export interface ExtensionProps<Options> {
//   name: string
//   editor: Editor
//   options: Options
// }

// export interface ExtensionMethods<Props, Options> {
//   name: string
//   options: Options
//   commands: (params: Props) => CommandsSpec
//   inputRules: (params: Props) => any[]
//   pasteRules: (params: Props) => any[]
//   keys: (params: Props) => {
//     [key: string]: Function
//   }
//   plugins: (params: Props) => Plugin[]
// }

// export default class Extension<
//   Options = {},
//   Props = ExtensionProps<Options>,
//   Methods extends ExtensionMethods<Props, Options> = ExtensionMethods<Props, Options>,
// > {
//   type = 'extension'

//   config: AnyObject = {}

//   configs: Configs = {}

//   options: Partial<Options> = {}

//   protected storeConfig(key: string, value: any, stategy: MergeStrategy) {
//     const item = {
//       stategy,
//       value,
//     }

//     if (this.configs[key]) {
//       this.configs[key].push(item)
//     } else {
//       this.configs[key] = [item]
//     }
//   }

//   public configure(options: Partial<Options>) {
//     this.options = { ...this.options, ...options }
//     return this
//   }

//   public name(value: Methods['name']) {
//     this.storeConfig('name', value, 'overwrite')
//     return this
//   }

//   public defaults(value: Options) {
//     this.storeConfig('defaults', value, 'overwrite')
//     return this
//   }

//   public commands(value: Methods['commands']) {
//     this.storeConfig('commands', value, 'overwrite')
//     return this
//   }

//   public keys(value: Methods['keys']) {
//     this.storeConfig('keys', value, 'overwrite')
//     return this
//   }

//   public inputRules(value: Methods['inputRules']) {
//     this.storeConfig('inputRules', value, 'overwrite')
//     return this
//   }

//   public pasteRules(value: Methods['pasteRules']) {
//     this.storeConfig('pasteRules', value, 'overwrite')
//     return this
//   }

//   public plugins(value: Methods['plugins']) {
//     this.storeConfig('plugins', value, 'overwrite')
//     return this
//   }

//   public extend<T extends Extract<keyof Methods, string>>(key: T, value: Methods[T]) {
//     this.storeConfig(key, value, 'extend')
//     return this
//   }

//   public create() {
//     return <NewOptions = Options>(options?: Partial<NoInfer<NewOptions>>) => {
//       return cloneDeep(this, true).configure(options as NewOptions)
//     }
//   }
// }

import { Editor } from './Editor'
import { GlobalAttributes } from './types'

export interface ExtensionSpec<Options = {}, Commands = {}> {
  name: string,
  defaultOptions?: Options,
  addGlobalAttributes?: (
    this: {
      options: Options,
    },
  ) => GlobalAttributes,
  addCommands?: (this: {
    options: Options,
    editor: Editor,
  }) => Commands,
  addKeyboardShortcuts?: (this: {
    options: Options,
    editor: Editor,
  }) => {
    [key: string]: any
  },
}

export type Extension = Required<Omit<ExtensionSpec, 'defaultOptions'> & {
  type: string,
  options: {
    [key: string]: any
  },
}>

export const defaultExtension: Extension = {
  type: 'extension',
  name: 'extension',
  options: {},
  addGlobalAttributes: () => [],
  addCommands: () => ({}),
  addKeyboardShortcuts: () => ({}),
}

export function createExtension<Options extends {}, Commands extends {}>(config: ExtensionSpec<Options, Commands>) {
  const extend = <ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<ExtensionSpec<ExtendedOptions, ExtendedCommands>>) => {
    return createExtension({
      ...config,
      ...extendedConfig,
    } as ExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }

  const setOptions = (options?: Partial<Options>) => {
    const { defaultOptions, ...rest } = config

    return {
      ...defaultExtension,
      ...rest,
      options: {
        ...defaultOptions,
        ...options,
      } as Options,
    }
  }

  return Object.assign(setOptions, { config, extend })
}
