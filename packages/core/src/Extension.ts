import { Plugin } from 'prosemirror-state'
import { Editor } from './Editor'
import { GlobalAttributes } from './types'

export interface ExtensionSpec<Options = any, Commands = {}> {
  /**
   * Name
   */
  name?: string,

  /**
   * Default options
   */
  defaultOptions?: Options,

  /**
   * Global attributes
   */
  addGlobalAttributes?: (this: {
    options: Options,
  }) => GlobalAttributes,

  /**
   * Commands
   */
  addCommands?: (this: {
    options: Options,
    editor: Editor,
  }) => Commands,

  /**
   * Keyboard shortcuts
   */
  addKeyboardShortcuts?: (this: {
    options: Options,
    editor: Editor,
  }) => {
    [key: string]: any
  },

  /**
   * Input rules
   */
  addInputRules?: (this: {
    options: Options,
    editor: Editor,
  }) => any[],

  /**
   * Paste rules
   */
  addPasteRules?: (this: {
    options: Options,
    editor: Editor,
  }) => any[],

  /**
   * ProseMirror plugins
   */
  addProseMirrorPlugins?: (this: {
    options: Options,
    editor: Editor,
  }) => Plugin[],
}

/**
 * Extension interface for internal usage
 */
export type Extension = Required<Omit<ExtensionSpec, 'defaultOptions'> & {
  type: string,
  options: {
    [key: string]: any
  },
}>

/**
 * Default extension
 */
export const defaultExtension: Extension = {
  name: 'extension',
  type: 'extension',
  options: {},
  addGlobalAttributes: () => [],
  addCommands: () => ({}),
  addKeyboardShortcuts: () => ({}),
  addInputRules: () => [],
  addPasteRules: () => [],
  addProseMirrorPlugins: () => [],
}

export function createExtension<Options extends {}, Commands extends {}>(config: ExtensionSpec<Options, Commands>) {
  const extend = <ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<ExtensionSpec<ExtendedOptions, ExtendedCommands>>) => {
    return createExtension({
      ...config,
      ...extendedConfig,
    } as ExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }

  const setOptions = (options?: Partial<Options>) => {
    const { defaultOptions, ...rest } = config

    return {
      ...defaultExtension,
      ...rest,
      options: {
        ...defaultOptions,
        ...options,
      } as Options,
    }
  }

  return Object.assign(setOptions, { config, extend })
}
