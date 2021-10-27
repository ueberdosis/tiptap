import {
  DOMOutputSpec,
  MarkSpec,
  Mark as ProseMirrorMark,
  MarkType,
} from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { InputRule } from './InputRule'
import { PasteRule } from './PasteRule'
import mergeDeep from './utilities/mergeDeep'
import callOrReturn from './utilities/callOrReturn'
import getExtensionField from './helpers/getExtensionField'
import {
  AnyConfig,
  Extensions,
  Attributes,
  RawCommands,
  GlobalAttributes,
  ParentConfig,
  KeyboardShortcutCommand,
} from './types'
import { Node } from './Node'
import { MarkConfig } from '.'
import { Editor } from './Editor'

declare module '@tiptap/core' {
  export interface MarkConfig<Options = any, Storage = any> {
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
     * Default Options
     */
    addOptions?: (this: {
      name: string,
      parent: Exclude<ParentConfig<MarkConfig<Options, Storage>>['addOptions'], undefined>,
    }) => Options,

    /**
     * Default Storage
     */
    addStorage?: (this: {
      name: string,
      options: Options,
      parent: Exclude<ParentConfig<MarkConfig<Options, Storage>>['addStorage'], undefined>,
    }) => Storage,

    /**
     * Global attributes
     */
    addGlobalAttributes?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<MarkConfig<Options, Storage>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['addKeyboardShortcuts'],
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
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['addPasteRules'],
    }) => PasteRule[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extensions
     */
    addExtensions?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<MarkConfig<Options, Storage>>['addExtensions'],
    }) => Extensions,

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<MarkConfig<Options, Storage>>['extendNodeSchema'],
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
        parent: ParentConfig<MarkConfig<Options, Storage>>['extendMarkSchema'],
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
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['onSelectionUpdate'],
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
        type: MarkType,
        parent: ParentConfig<MarkConfig<Options, Storage>>['onTransaction'],
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
        type: MarkType,
        parent: ParentConfig<MarkConfig<Options, Storage>>['onFocus'],
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
        type: MarkType,
        parent: ParentConfig<MarkConfig<Options, Storage>>['onBlur'],
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
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options, Storage>>['onDestroy'],
    }) => void) | null,

    /**
     * Keep mark after split node
     */
    keepOnSplit?: boolean | (() => boolean),

    /**
     * Inclusive
     */
    inclusive?: MarkSpec['inclusive'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<MarkConfig<Options, Storage>>['inclusive'],
    }) => MarkSpec['inclusive']),

    /**
     * Excludes
     */
    excludes?: MarkSpec['excludes'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<MarkConfig<Options, Storage>>['excludes'],
    }) => MarkSpec['excludes']),

    /**
     * Group
     */
    group?: MarkSpec['group'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<MarkConfig<Options, Storage>>['group'],
    }) => MarkSpec['group']),

    /**
     * Spanning
     */
    spanning?: MarkSpec['spanning'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<MarkConfig<Options, Storage>>['spanning'],
    }) => MarkSpec['spanning']),

    /**
     * Code
     */
    code?: boolean | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<MarkConfig<Options, Storage>>['code'],
    }) => boolean),

    /**
     * Parse HTML
     */
    parseHTML?: (
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<MarkConfig<Options, Storage>>['parseHTML'],
      },
    ) => MarkSpec['parseDOM'],

    /**
     * Render HTML
     */
    renderHTML?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<MarkConfig<Options, Storage>>['renderHTML'],
      },
      props: {
        mark: ProseMirrorMark,
        HTMLAttributes: Record<string, any>,
      },
    ) => DOMOutputSpec) | null,

    /**
     * Attributes
     */
    addAttributes?: (
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<MarkConfig<Options, Storage>>['addAttributes'],
      },
    ) => Attributes | {},
  }
}

export class Mark<Options = any, Storage = any> {
  type = 'mark'

  name = 'mark'

  parent: Mark | null = null

  child: Mark | null = null

  options: Options

  storage: Storage

  config: MarkConfig = {
    name: this.name,
    defaultOptions: {},
  }

  constructor(config: Partial<MarkConfig<Options, Storage>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name

    if (config.defaultOptions) {
      console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`)
    }

    // TODO: remove `addOptions` fallback
    this.options = this.config.defaultOptions

    if (this.config.addOptions) {
      this.options = callOrReturn(getExtensionField<AnyConfig['addOptions']>(
        this,
        'addOptions',
        {
          name: this.name,
        },
      ))
    }

    this.storage = callOrReturn(getExtensionField<AnyConfig['addStorage']>(
      this,
      'addStorage',
      {
        name: this.name,
        options: this.options,
      },
    )) || {}
  }

  static create<O = any, S = any>(config: Partial<MarkConfig<O, S>> = {}) {
    return new Mark<O, S>(config)
  }

  configure(options: Partial<Options> = {}) {
    // return a new instance so we can use the same extension
    // with different calls of `configure`
    const extension = this.extend()

    extension.options = mergeDeep(this.options, options) as Options

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

  extend<ExtendedOptions = Options, ExtendedStorage = Storage>(extendedConfig: Partial<MarkConfig<ExtendedOptions, ExtendedStorage>> = {}) {
    const extension = new Mark<ExtendedOptions, ExtendedStorage>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name
      ? extendedConfig.name
      : extension.parent.name

    if (extendedConfig.defaultOptions) {
      console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${extension.name}".`)
    }

    // TODO: remove `addOptions` fallback
    extension.options = extendedConfig.defaultOptions
      ? extendedConfig.defaultOptions
      : extension.parent.options

    if (extendedConfig.addOptions) {
      extension.options = callOrReturn(getExtensionField<AnyConfig['addOptions']>(
        extension,
        'addOptions',
        {
          name: extension.name,
        },
      ))
    }

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
