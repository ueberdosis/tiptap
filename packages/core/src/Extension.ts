import { Plugin } from 'prosemirror-state'
import { Editor } from './Editor'
import { GlobalAttributes } from './types'

export interface ExtensionSpec<Options = any, Commands = {}> {
  /**
   * Name
   */
  name?: string,

  /**
   * Default options
   */
  defaultOptions?: Options,

  /**
   * Global attributes
   */
  addGlobalAttributes?: (this: {
    options: Options,
  }) => GlobalAttributes,

  /**
   * Commands
   */
  addCommands?: (this: {
    options: Options,
    editor: Editor,
  }) => Commands,

  /**
   * Keyboard shortcuts
   */
  addKeyboardShortcuts?: (this: {
    options: Options,
    editor: Editor,
  }) => {
    [key: string]: any
  },

  /**
   * Input rules
   */
  addInputRules?: (this: {
    options: Options,
    editor: Editor,
  }) => any[],

  /**
   * Paste rules
   */
  addPasteRules?: (this: {
    options: Options,
    editor: Editor,
  }) => any[],

  /**
   * ProseMirror plugins
   */
  addProseMirrorPlugins?: (this: {
    options: Options,
    editor: Editor,
  }) => Plugin[],
}

export class Extension<Options = any, Commands = any> {
  config: Required<ExtensionSpec> = {
    name: 'extension',
    defaultOptions: {},
    addGlobalAttributes: () => [],
    addCommands: () => ({}),
    addKeyboardShortcuts: () => ({}),
    addInputRules: () => [],
    addPasteRules: () => [],
    addProseMirrorPlugins: () => [],
  }

  options!: Options

  constructor(config: ExtensionSpec<Options, Commands>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O, C>(config: ExtensionSpec<O, C>) {
    return new Extension<O, C>(config)
  }

  set(options: Partial<Options>) {
    return Extension
      .create<Options, Commands>(this.config as ExtensionSpec<Options, Commands>)
      .#set({
        ...this.config.defaultOptions,
        ...options,
      })
  }

  #set = (options: Partial<Options>) => {
    this.options = {
      ...this.config.defaultOptions,
      ...options,
    }

    return this
  }

  extend<ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<ExtensionSpec<ExtendedOptions, ExtendedCommands>>) {
    return new Extension<ExtendedOptions, ExtendedCommands>({
      ...this.config,
      ...extendedConfig,
    } as ExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }
}
