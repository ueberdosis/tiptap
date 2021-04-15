import { Plugin, Transaction } from 'prosemirror-state'
import { Command as ProseMirrorCommand } from 'prosemirror-commands'
import { InputRule } from 'prosemirror-inputrules'
import { Editor } from './Editor'
import { Node } from './Node'
import { Mark } from './Mark'
import mergeDeep from './utilities/mergeDeep'
import { GlobalAttributes, RawCommands, ParentConfig } from './types'
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
      options: Options,
      parent: ParentConfig<ExtensionConfig<Options>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addKeyboardShortcuts'],
    }) => {
      [key: string]: ProseMirrorCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addPasteRules'],
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        options: Options,
        parent: ParentConfig<ExtensionConfig<Options>>['extendNodeSchema'],
      },
      extension: Node,
    ) => {
      [key: string]: any,
    }) | null,

    /**
     * Extend Mark Schema
     */
    extendMarkSchema?: ((
      this: {
        options: Options,
        parent: ParentConfig<ExtensionConfig<Options>>['extendMarkSchema'],
      },
      extension: Mark,
    ) => {
      [key: string]: any,
    }) | null,

    /**
     * The editor is not ready yet.
     */
     onBeforeCreate?: ((this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onSelectionUpdate'],
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
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
      options: Options,
      editor: Editor,
      parent: ParentConfig<ExtensionConfig<Options>>['onDestroy'],
    }) => void) | null,
  }
}

export class Extension<Options = any> {
  type = 'extension'

  config: ExtensionConfig = {
    name: 'extension',
    priority: 100,
    defaultOptions: {},
  }

  options: Options

  parent: Extension | null = null

  child: Extension | null = null

  constructor(config: Partial<ExtensionConfig<Options>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

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

    extension.options = {
      ...extension.parent.options,
      ...extension.options,
    }

    return extension
  }
}
