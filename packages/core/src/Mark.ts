import {
  DOMOutputSpec,
  MarkSpec,
  Mark as ProseMirrorMark,
  MarkType,
} from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { InputRule } from 'prosemirror-inputrules'
import { ExtensionConfig } from './Extension'
import { Attributes, Overwrite } from './types'
import { Editor } from './Editor'

export interface MarkConfig<Options = any, Commands = {}> extends Overwrite<ExtensionConfig<Options, Commands>, {
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
  ) => Attributes,

  /**
   * Commands
   */
  addCommands?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => Commands,

  /**
   * Keyboard shortcuts
   */
  addKeyboardShortcuts?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => {
    [key: string]: any
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

  onDestroy?: ((this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => void) | null,
}> {}

export class Mark<Options = any, Commands = {}> {
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
    onDestroy: null,
  }

  options!: Options

  constructor(config: MarkConfig<Options, Commands>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O, C>(config: MarkConfig<O, C>) {
    return new Mark<O, C>(config)
  }

  configure(options: Partial<Options>) {
    return Mark
      .create<Options, Commands>(this.config as MarkConfig<Options, Commands>)
      .#configure({
        ...this.config.defaultOptions,
        ...options,
      })
  }

  #configure = (options: Partial<Options>) => {
    this.options = {
      ...this.config.defaultOptions,
      ...options,
    }

    return this
  }

  extend<ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<MarkConfig<ExtendedOptions, ExtendedCommands>>) {
    return new Mark<ExtendedOptions, ExtendedCommands>({
      ...this.config,
      ...extendedConfig,
    } as MarkConfig<ExtendedOptions, ExtendedCommands>)
  }
}
