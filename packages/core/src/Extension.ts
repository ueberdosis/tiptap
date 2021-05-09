import { Plugin, Transaction } from 'prosemirror-state'
import { InputRule } from 'prosemirror-inputrules'
import { Editor } from './Editor'
import { Node } from './Node'
import { Mark } from './Mark'
import mergeDeep from './utilities/mergeDeep'
import {
  Extensions,
  GlobalAttributes,
  RawCommands,
  ParentConfig,
  KeyboardShortcutCommand,
} from './types'
import { ExtensionConfig } from '.'

declare module '@tiptap/core' {
  interface ExtensionConfig<Options = any> {
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
     * Global attributes
     */
    addGlobalAttributes?: (this: {
      name: string,
      options: Options,
      parent: ParentConfig<ExtensionConfig<Options>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addKeyboardShortcuts'],
    }) => {
      [key: string]: KeyboardShortcutCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addPasteRules'],
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extensions
     */
    addExtensions?: (this: {
      name: string,
      options: Options,
      parent: ParentConfig<ExtensionConfig<Options>>['addExtensions'],
    }) => Extensions,

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<ExtensionConfig<Options>>['extendNodeSchema'],
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
        parent: ParentConfig<ExtensionConfig<Options>>['extendMarkSchema'],
      },
      extension: Mark,
    ) => Record<string, any>) | null,

    /**
     * The editor is not ready yet.
     */
    onBeforeCreate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onSelectionUpdate'],
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        name: string,
        options: Options,
        editor: Editor,
        parent: ParentConfig<ExtensionConfig<Options>>['onTransaction'],
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
        editor: Editor,
        parent: ParentConfig<ExtensionConfig<Options>>['onFocus'],
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
        editor: Editor,
        parent: ParentConfig<ExtensionConfig<Options>>['onBlur'],
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
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onDestroy'],
    }) => void) | null,
  }
}

export class Extension<Options = any> {
  type = 'extension'

  name = 'extension'

  parent: Extension | null = null

  child: Extension | null = null

  options: Options

  config: ExtensionConfig = {
    name: this.name,
    defaultOptions: {},
  }

  constructor(config: Partial<ExtensionConfig<Options>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name
    this.options = this.config.defaultOptions
  }

  static create<O>(config: Partial<ExtensionConfig<O>> = {}) {
    return new Extension<O>(config)
  }

  configure(options: Partial<Options> = {}) {
    this.options = mergeDeep(this.options, options) as Options

    return this
  }

  extend<ExtendedOptions = Options>(extendedConfig: Partial<ExtensionConfig<ExtendedOptions>> = {}) {
    const extension = new Extension<ExtendedOptions>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name
      ? extendedConfig.name
      : extension.parent.name

    extension.options = extendedConfig.defaultOptions
      ? extendedConfig.defaultOptions
      : extension.parent.options

    return extension
  }
}
