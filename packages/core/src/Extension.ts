import { Plugin, Transaction } from 'prosemirror-state'
import { InputRule } from './InputRule'
import { PasteRule } from './PasteRule'
import { Editor } from './Editor'
import { Node } from './Node'
import { Mark } from './Mark'
import mergeDeep from './utilities/mergeDeep'
import callOrReturn from './utilities/callOrReturn'
import getExtensionField from './helpers/getExtensionField'
import {
  AnyConfig,
  Extensions,
  GlobalAttributes,
  RawCommands,
  ParentConfig,
  KeyboardShortcutCommand,
} from './types'
import { ExtensionConfig } from '.'

declare module '@tiptap/core' {
  interface ExtensionConfig<Options = any, Storage = any> {
    [key: string]: any;

    /**
     * Name
     */
    name: string,

    /**
     * Priority
     */
    priority?: number,

    /**
     * Default options
     */
    defaultOptions?: Options,

    /**
     * Default Storage
     */
    addStorage?: (this: {
      name: string,
      options: Options,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addGlobalAttributes'],
    }) => Storage,

    /**
     * Global attributes
     */
    addGlobalAttributes?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addKeyboardShortcuts'],
    }) => {
      [key: string]: KeyboardShortcutCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addPasteRules'],
    }) => PasteRule[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extensions
     */
    addExtensions?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['addExtensions'],
    }) => Extensions,

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<ExtensionConfig<Options, Storage>>['extendNodeSchema'],
      },
      extension: Node,
    ) => Record<string, any>) | null,

    /**
     * Extend Mark Schema
     */
    extendMarkSchema?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<ExtensionConfig<Options, Storage>>['extendMarkSchema'],
      },
      extension: Mark,
    ) => Record<string, any>) | null,

    /**
     * The editor is not ready yet.
     */
    onBeforeCreate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['onSelectionUpdate'],
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        editor: Editor,
        parent: ParentConfig<ExtensionConfig<Options, Storage>>['onTransaction'],
      },
      props: {
        transaction: Transaction,
      },
    ) => void) | null,

    /**
     * The editor is focused.
     */
    onFocus?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        editor: Editor,
        parent: ParentConfig<ExtensionConfig<Options, Storage>>['onFocus'],
      },
      props: {
        event: FocusEvent,
      },
    ) => void) | null,

    /**
     * The editor isn’t focused anymore.
     */
    onBlur?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        editor: Editor,
        parent: ParentConfig<ExtensionConfig<Options, Storage>>['onBlur'],
      },
      props: {
        event: FocusEvent,
      },
    ) => void) | null,

    /**
     * The editor is destroyed.
     */
    onDestroy?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options, Storage>>['onDestroy'],
    }) => void) | null,
  }
}

export class Extension<Options = any, Storage = any> {
  type = 'extension'

  name = 'extension'

  parent: Extension | null = null

  child: Extension | null = null

  options: Options

  storage: Storage

  config: ExtensionConfig = {
    name: this.name,
    defaultOptions: {},
  }

  constructor(config: Partial<ExtensionConfig<Options, Storage>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name
    this.options = this.config.defaultOptions
    this.storage = callOrReturn(getExtensionField<AnyConfig['addStorage']>(
      this,
      'addStorage',
      {
        name: this.name,
        options: this.options,
      },
    ))
  }

  static create<O = any, S = any>(config: Partial<ExtensionConfig<O, S>> = {}) {
    return new Extension<O, S>(config)
  }

  configure(options: Partial<Options> = {}) {
    // return a new instance so we can use the same extension
    // with different calls of `configure`
    const extension = this.extend()

    extension.options = mergeDeep(this.options, options) as Options

    return extension
  }

  extend<ExtendedOptions = Options, ExtendedStorage = Storage>(extendedConfig: Partial<ExtensionConfig<ExtendedOptions, ExtendedStorage>> = {}) {
    const extension = new Extension<ExtendedOptions, ExtendedStorage>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name
      ? extendedConfig.name
      : extension.parent.name

    extension.options = extendedConfig.defaultOptions
      ? extendedConfig.defaultOptions
      : extension.parent.options

    extension.storage = callOrReturn(getExtensionField<AnyConfig['addStorage']>(
      extension,
      'addStorage',
      {
        name: extension.name,
        options: extension.options,
      },
    ))

    return extension
  }
}
