import {
  DOMOutputSpec,
  MarkSpec,
  Mark as ProseMirrorMark,
  MarkType,
} from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { Command as ProseMirrorCommand } from 'prosemirror-commands'
import { InputRule } from 'prosemirror-inputrules'
import mergeDeep from './utilities/mergeDeep'
import {
  Attributes,
  RawCommands,
  GlobalAttributes,
  ParentConfig,
} from './types'
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
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addKeyboardShortcuts'],
    }) => {
      [key: string]: ProseMirrorCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addPasteRules'],
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        options: Options,
        parent: ParentConfig<MarkConfig<Options>>['extendNodeSchema'],
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
        parent: ParentConfig<MarkConfig<Options>>['extendMarkSchema'],
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
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parent: ParentConfig<MarkConfig<Options>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
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
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['inclusive'],
    }) => MarkSpec['inclusive']),

    /**
     * Excludes
     */
    excludes?: MarkSpec['excludes'] | ((this: {
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['excludes'],
    }) => MarkSpec['excludes']),

    /**
     * Group
     */
    group?: MarkSpec['group'] | ((this: {
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['group'],
    }) => MarkSpec['group']),

    /**
     * Spanning
     */
    spanning?: MarkSpec['spanning'] | ((this: {
      options: Options,
      parent: ParentConfig<MarkConfig<Options>>['spanning'],
    }) => MarkSpec['spanning']),

    /**
     * Parse HTML
     */
    parseHTML?: (
      this: {
        options: Options,
        parent: ParentConfig<MarkConfig<Options>>['parseHTML'],
      },
    ) => MarkSpec['parseDOM'],

    /**
     * Render HTML
     */
    renderHTML?: ((
      this: {
        options: Options,
        parent: ParentConfig<MarkConfig<Options>>['renderHTML'],
      },
      props: {
        mark: ProseMirrorMark,
        HTMLAttributes: { [key: string]: any },
      },
    ) => DOMOutputSpec) | null,

    /**
     * Attributes
     */
    addAttributes?: (
      this: {
        options: Options,
        parent: ParentConfig<MarkConfig<Options>>['addAttributes'],
      },
    ) => Attributes | {},
  }
}

export class Mark<Options = any> {
  type = 'node'

  config: MarkConfig = {
    name: 'node',
    priority: 100,
    defaultOptions: {},
  }

  options: Options

  parent: Mark | null = null

  child: Mark | null = null

  constructor(config: Partial<MarkConfig<Options>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O>(config: Partial<MarkConfig<O>> = {}) {
    return new Mark<O>(config)
  }

  configure(options: Partial<Options> = {}) {
    this.options = mergeDeep(this.options, options) as Options

    return this
  }

  extend<ExtendedOptions = Options>(extendedConfig: Partial<MarkConfig<ExtendedOptions>> = {}) {
    const extension = new Mark<ExtendedOptions>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.options = {
      ...extension.parent.options,
      ...extension.options,
    }

    return extension
  }
}
