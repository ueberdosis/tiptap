import {
  DOMOutputSpec,
  MarkSpec,
  Mark as ProseMirrorMark,
  MarkType,
} from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { InputRule } from 'prosemirror-inputrules'
import mergeDeep from './utilities/mergeDeep'
import {
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
  export interface MarkConfig<Options = any> {
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
      parent: ParentConfig<MarkConfig<Options>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addKeyboardShortcuts'],
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
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addPasteRules'],
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extensions
     */
    addExtensions?: (this: {
      name: string,
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['addExtensions'],
    }) => Extensions,

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<MarkConfig<Options>>['extendNodeSchema'],
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
        parent: ParentConfig<MarkConfig<Options>>['extendMarkSchema'],
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
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onSelectionUpdate'],
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        name: string,
        options: Options,
        editor: Editor,
        type: MarkType,
        parent: ParentConfig<MarkConfig<Options>>['onTransaction'],
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
        type: MarkType,
        parent: ParentConfig<MarkConfig<Options>>['onFocus'],
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
        type: MarkType,
        parent: ParentConfig<MarkConfig<Options>>['onBlur'],
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
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onDestroy'],
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
      parent: ParentConfig<MarkConfig<Options>>['inclusive'],
    }) => MarkSpec['inclusive']),

    /**
     * Excludes
     */
    excludes?: MarkSpec['excludes'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['excludes'],
    }) => MarkSpec['excludes']),

    /**
     * Group
     */
    group?: MarkSpec['group'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['group'],
    }) => MarkSpec['group']),

    /**
     * Spanning
     */
    spanning?: MarkSpec['spanning'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['spanning'],
    }) => MarkSpec['spanning']),

    /**
     * Parse HTML
     */
    parseHTML?: (
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<MarkConfig<Options>>['parseHTML'],
      },
    ) => MarkSpec['parseDOM'],

    /**
     * Render HTML
     */
    renderHTML?: ((
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<MarkConfig<Options>>['renderHTML'],
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
        parent: ParentConfig<MarkConfig<Options>>['addAttributes'],
      },
    ) => Attributes | {},
  }
}

export class Mark<Options = any> {
  type = 'mark'

  name = 'mark'

  parent: Mark | null = null

  child: Mark | null = null

  options: Options

  config: MarkConfig = {
    name: this.name,
    defaultOptions: {},
  }

  constructor(config: Partial<MarkConfig<Options>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name
    this.options = this.config.defaultOptions
  }

  static create<O>(config: Partial<MarkConfig<O>> = {}) {
    return new Mark<O>(config)
  }

  configure(options: Partial<Options> = {}) {
    // return a new instance so we can use the same extension
    // with different calls of `configure`
    const extension = this.extend()

    extension.options = mergeDeep(this.options, options) as Options

    return extension
  }

  extend<ExtendedOptions = Options>(extendedConfig: Partial<MarkConfig<ExtendedOptions>> = {}) {
    const extension = new Mark<ExtendedOptions>(extendedConfig)

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
