import cloneDeep from 'clone-deep'
import { Plugin } from 'prosemirror-state'
import { Editor, CommandSpec } from './Editor'

type AnyObject = {
  [key: string]: any
}

type NoInfer<T> = [T][T extends any ? 0 : never]

type MergeStrategy = 'extend' | 'overwrite'

type Configs = {
  [key: string]: {
    stategy: MergeStrategy
    value: any
  }[]
}

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
  config: AnyObject = {}
  configs: Configs = {} 
  options: Partial<Options> = {}

  protected storeConfig(key: string, value: any, stategy: MergeStrategy) {
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
    this.options = { ...this.options, ...options }
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
