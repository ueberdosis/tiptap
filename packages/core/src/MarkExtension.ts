import {
  DOMOutputSpec, MarkSpec, Mark, MarkType,
} from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { ExtensionSpec, defaultExtension } from './Extension'
import { Attributes, Overwrite } from './types'
import { Editor } from './Editor'

export interface MarkExtensionSpec<Options = {}, Commands = {}> extends Overwrite<ExtensionSpec<Options, Commands>, {
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

export type MarkExtension = Required<Omit<MarkExtensionSpec, 'defaultOptions'> & {
  type: string,
  options: {
    [key: string]: any
  },
}>

const defaultMark: MarkExtension = {
  ...defaultExtension,
  type: 'mark',
  name: 'mark',
  inclusive: null,
  excludes: null,
  group: null,
  spanning: null,
  parseHTML: () => null,
  renderHTML: null,
  addAttributes: () => ({}),
}

export function createMark<Options extends {}, Commands extends {}>(config: MarkExtensionSpec<Options, Commands>) {
  const extend = <ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<MarkExtensionSpec<ExtendedOptions, ExtendedCommands>>) => {
    return createMark({
      ...config,
      ...extendedConfig,
    } as MarkExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }

  const setOptions = (options?: Partial<Options>) => {
    const { defaultOptions, ...rest } = config

    return {
      ...defaultMark,
      ...rest,
      options: {
        ...defaultOptions,
        ...options,
      } as Options,
    }
  }

  return Object.assign(setOptions, { config, extend })
}
