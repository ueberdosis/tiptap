import {
  DOMOutputSpec, MarkSpec, Mark, MarkType,
} from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { ExtensionSpec } from './Extension'
import { Attributes, Overwrite } from './types'
import { Editor } from './Editor'

export interface MarkExtensionSpec<Options = any, Commands = {}> extends Overwrite<ExtensionSpec<Options, Commands>, {
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
      mark: Mark,
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
  }) => any[],

  /**
   * Paste rules
   */
  addPasteRules?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => any[],

  /**
   * ProseMirror plugins
   */
  addProseMirrorPlugins?: (this: {
    options: Options,
    editor: Editor,
    type: MarkType,
  }) => Plugin[],
}> {}

export class MarkExtension<Options = any, Commands = {}> {
  config: Required<MarkExtensionSpec> = {
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
  }

  options!: Options

  constructor(config: MarkExtensionSpec<Options, Commands>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O, C>(config: MarkExtensionSpec<O, C>) {
    return new MarkExtension<O, C>(config)
  }

  configure(options: Partial<Options>) {
    return MarkExtension
      .create<Options, Commands>(this.config as MarkExtensionSpec<Options, Commands>)
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

  extend<ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<MarkExtensionSpec<ExtendedOptions, ExtendedCommands>>) {
    return new MarkExtension<ExtendedOptions, ExtendedCommands>({
      ...this.config,
      ...extendedConfig,
    } as MarkExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }
}
