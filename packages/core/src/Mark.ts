import {
  DOMOutputSpec,
  MarkSpec,
  Mark as ProseMirrorMark,
  MarkType,
} from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { Command as ProseMirrorCommand } from 'prosemirror-commands'
import { InputRule } from 'prosemirror-inputrules'
import { ExtensionConfig } from './Extension'
import mergeDeep from './utilities/mergeDeep'
import { Attributes, Overwrite, RawCommands } from './types'
import { Editor } from './Editor'

export interface MarkConfig<Options = any> extends Overwrite<ExtensionConfig<Options>, {
  /**
   * Inclusive
   */
  inclusive?: MarkSpec['inclusive'] | ((this: { options: Options }) => MarkSpec['inclusive']),

  /**
   * Excludes
   */
  excludes?: MarkSpec['excludes'] | ((this: { options: Options }) => MarkSpec['excludes']),

  /**
   * Group
   */
  group?: MarkSpec['group'] | ((this: { options: Options }) => MarkSpec['group']),

  /**
   * Spanning
   */
  spanning?: MarkSpec['spanning'] | ((this: { options: Options }) => MarkSpec['spanning']),

  /**
   * Parse HTML
   */
  parseHTML?: (
    this: {
      options: Options,
    },
  ) => MarkSpec['parseDOM'],

  /**
   * Render HTML
   */
  renderHTML?: ((
    this: {
      options: Options,
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
    },
  ) => Attributes | {},

  /**
   * Commands
   */
  addCommands?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => Partial<RawCommands>,

  /**
   * Keyboard shortcuts
   */
  addKeyboardShortcuts?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
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
  }) => InputRule[],

  /**
   * Paste rules
   */
  addPasteRules?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => Plugin[],

  /**
   * ProseMirror plugins
   */
  addProseMirrorPlugins?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => Plugin[],

  /**
   * The editor is ready.
   */
  onCreate?: ((this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => void) | null,

  /**
   * The content has changed.
   */
  onUpdate?: ((this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => void) | null,

  /**
   * The selection has changed.
   */
  onSelection?: ((this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => void) | null,

  /**
   * The editor state has changed.
   */
  onTransaction?: ((
    this: {
      options: Options,
      editor: Editor,
      type: MarkType,
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
  }) => void) | null,
}> {}

export class Mark<Options = any> {
  type = 'mark'

  config: Required<MarkConfig> = {
    name: 'mark',
    defaultOptions: {},
    addGlobalAttributes: () => [],
    addCommands: () => ({}),
    addKeyboardShortcuts: () => ({}),
    addInputRules: () => [],
    addPasteRules: () => [],
    addProseMirrorPlugins: () => [],
    inclusive: null,
    excludes: null,
    group: null,
    spanning: null,
    parseHTML: () => null,
    renderHTML: null,
    addAttributes: () => ({}),
    onCreate: null,
    onUpdate: null,
    onSelection: null,
    onTransaction: null,
    onFocus: null,
    onBlur: null,
    onDestroy: null,
  }

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
    return new Mark<ExtendedOptions>({
      ...this.config,
      ...extendedConfig,
    } as MarkConfig<ExtendedOptions>)
  }
}
