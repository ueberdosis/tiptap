import cloneDeep from 'clone-deep'
import { Plugin } from 'prosemirror-state'
import { Editor, CommandSpec } from './Editor'

// export default abstract class Extension {

//   constructor(options = {}) {
//     this.options = {
//       ...this.defaultOptions(),
//       ...options,
//     }
//   }
  
//   editor!: Editor
//   options: { [key: string]: any } = {}
  
//   public abstract name: string
  
//   public extensionType = 'extension'

//   public created() {}

//   public bindEditor(editor: Editor): void {
//     this.editor = editor
//   }

//   defaultOptions(): { [key: string]: any } {
//     return {}
//   }

//   update(): any {
//     return () => {}
//   }

//   plugins(): Plugin[] {
//     return []
//   }

//   inputRules(): any {
//     return []
//   }

//   pasteRules(): any {
//     return []
//   }

//   keys(): { [key: string]: Function } {
//     return {}
//   }

//   commands(): { [key: string]: Command } {
//     return {}
//   } 

// }

type AnyObject = {
  [key: string]: any
}

type NoInfer<T> = [T][T extends any ? 0 : never]

export interface ExtensionCallback<Options> {
  name: string
  editor: Editor
  options: Options
}

export interface ExtensionExtends<Callback, Options> {
  name: string
  options: Options
  commands: (params: Callback) => CommandSpec
  inputRules: (params: Callback) => any[]
  pasteRules: (params: Callback) => any[]
  keys: (params: Callback) => {
    [key: string]: Function
  }
  plugins: (params: Callback) => Plugin[]
}

export default class Extension<
  Options = {},
  Callback = ExtensionCallback<Options>,
  Extends extends ExtensionExtends<Callback, Options> = ExtensionExtends<Callback, Options>
> {
  type = 'extension'
  config: any = {}
  configs: {
    [key: string]: {
      stategy: 'extend' | 'overwrite'
      value: any
    }[]
  } = {} 
  usedOptions: Partial<Options> = {}

  protected storeConfig(key: string, value: any, stategy: 'extend' | 'overwrite') {
    const item = {
      stategy,
      value,
    }

    if (this.configs[key]) {
      this.configs[key].push(item)
    } else {
      this.configs[key] = [item]
    }
  }

  public configure(options: Partial<Options>) {
    this.usedOptions = { ...this.usedOptions, ...options }
    return this
  }

  public name(value: Extends['name']) {
    this.storeConfig('name', value, 'overwrite')
    return this
  }

  public defaults(value: Options) {
    this.storeConfig('defaults', value, 'overwrite')
    return this
  }

  public commands(value: Extends['commands']) {
    this.storeConfig('commands', value, 'overwrite')
    return this
  }

  public keys(value: Extends['keys']) {
    this.storeConfig('keys', value, 'overwrite')
    return this
  }

  public inputRules(value: Extends['inputRules']) {
    this.storeConfig('inputRules', value, 'overwrite')
    return this
  }

  public pasteRules(value: Extends['pasteRules']) {
    this.storeConfig('pasteRules', value, 'overwrite')
    return this
  }

  public plugins(value: Extends['plugins']) {
    this.storeConfig('plugins', value, 'overwrite')
    return this
  }

  public extend<T extends Extract<keyof Extends, string>>(key: T, value: Extends[T]) {
    this.storeConfig(key, value, 'extend')
    return this
  }
  
  public create() {
    type ParentOptions = Options

    return <Options = ParentOptions>(options?: Partial<NoInfer<Options>>) => {
      return cloneDeep(this, true).configure(options as Options)
    }
  }
}
