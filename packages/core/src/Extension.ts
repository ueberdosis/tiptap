import { Plugin, Transaction } from 'prosemirror-state'
import { Command as ProseMirrorCommand } from 'prosemirror-commands'
import { InputRule } from 'prosemirror-inputrules'
import { Editor } from './Editor'
import { Node } from './Node'
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
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => {
      [key: string]: ProseMirrorCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => Plugin[],

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        options: Options,
        parentConfig: ParentConfig<ExtensionConfig<Options>>,
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
        parentConfig: ParentConfig<ExtensionConfig<Options>>,
      },
      extension: Node,
    ) => {
      [key: string]: any,
    }) | null,

    /**
     * The editor is not ready yet.
     */
     onBeforeCreate?: ((this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      options: Options,
      editor: Editor,
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        options: Options,
        editor: Editor,
        parentConfig: ParentConfig<ExtensionConfig<Options>>,
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
        parentConfig: ParentConfig<ExtensionConfig<Options>>,
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
        parentConfig: ParentConfig<ExtensionConfig<Options>>,
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
      parentConfig: ParentConfig<ExtensionConfig<Options>>,
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

  // parentConfig: Partial<ExtensionConfig> = {}
  parent: any

  options!: Options

  constructor(config: ExtensionConfig<Options>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O>(config: ExtensionConfig<O>) {
    return new Extension<O>(config)
  }

  configure(options: Partial<Options> = {}) {
    return Extension
      .create<Options>(this.config as ExtensionConfig<Options>)
      .#configure(options)
  }

  #configure = (options: Partial<Options>) => {
    this.options = mergeDeep(this.config.defaultOptions, options) as Options

    return this
  }

  extend<ExtendedOptions = Options>(extendedConfig: Partial<ExtensionConfig<ExtendedOptions>> = {}) {
    const extension = new Extension<ExtendedOptions>({
      // ...this.config,
      ...extendedConfig,
    } as ExtensionConfig<ExtendedOptions>)

    // extension.parentConfig = this.config
    extension.parent = this
    extension.options = {
      ...(this.config.defaultOptions ?? {}),
      ...(extendedConfig.defaultOptions ?? {}),
    }

    return extension
  }
}
