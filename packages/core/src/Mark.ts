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
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parentConfig: ParentConfig<MarkConfig<Options>>,
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
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => Plugin[],

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        options: Options,
        parentConfig: ParentConfig<MarkConfig<Options>>,
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
        parentConfig: ParentConfig<MarkConfig<Options>>,
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
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      options: Options,
      editor: Editor,
      type: MarkType,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        options: Options,
        editor: Editor,
        type: MarkType,
        parentConfig: ParentConfig<MarkConfig<Options>>,
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
        parentConfig: ParentConfig<MarkConfig<Options>>,
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
        parentConfig: ParentConfig<MarkConfig<Options>>,
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
      parentConfig: ParentConfig<MarkConfig<Options>>,
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
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => MarkSpec['inclusive']),

    /**
     * Excludes
     */
    excludes?: MarkSpec['excludes'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => MarkSpec['excludes']),

    /**
     * Group
     */
    group?: MarkSpec['group'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => MarkSpec['group']),

    /**
     * Spanning
     */
    spanning?: MarkSpec['spanning'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<MarkConfig<Options>>,
    }) => MarkSpec['spanning']),

    /**
     * Parse HTML
     */
    parseHTML?: (
      this: {
        options: Options,
        parentConfig: ParentConfig<MarkConfig<Options>>,
      },
    ) => MarkSpec['parseDOM'],

    /**
     * Render HTML
     */
    renderHTML?: ((
      this: {
        options: Options,
        parentConfig: ParentConfig<MarkConfig<Options>>,
      },
      props: {
        mark: ProseMirrorMark,
        HTMLAttributes: { [key: string]: any },
      }
    ) => DOMOutputSpec) | null,

    /**
     * Attributes
     */
    addAttributes?: (
      this: {
        options: Options,
        parentConfig: ParentConfig<MarkConfig<Options>>,
      },
    ) => Attributes | {},
  }
}

export class Mark<Options = any> {
  type = 'mark'

  config: MarkConfig = {
    name: 'mark',
    priority: 100,
    defaultOptions: {},
  }

  parentConfig: Partial<MarkConfig> = {}

  options!: Options

  constructor(config: MarkConfig<Options>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O>(config: MarkConfig<O>) {
    return new Mark<O>(config)
  }

  configure(options: Partial<Options> = {}) {
    return Mark
      .create<Options>(this.config as MarkConfig<Options>)
      .#configure(options)
  }

  #configure = (options: Partial<Options>) => {
    this.options = mergeDeep(this.config.defaultOptions, options) as Options

    return this
  }

  extend<ExtendedOptions = Options>(extendedConfig: Partial<MarkConfig<ExtendedOptions>>) {
    const extension = new Mark<ExtendedOptions>({
      ...this.config,
      ...extendedConfig,
    } as MarkConfig<ExtendedOptions>)

    extension.parentConfig = this.config

    return extension
  }
}
