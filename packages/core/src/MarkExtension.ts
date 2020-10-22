import { DOMOutputSpec, MarkSpec, Mark } from 'prosemirror-model'
import { ExtensionSpec, defaultExtension } from './Extension'
import { Attributes } from './types'

export interface MarkExtensionSpec<Options = {}, Commands = {}> extends ExtensionSpec<Options, Commands> {
  inclusive?: MarkSpec['inclusive'],
  excludes?: MarkSpec['excludes'],
  group?: MarkSpec['group'],
  spanning?: MarkSpec['spanning'],
  parseHTML?: (
    this: {
      options: Options,
    },
  ) => MarkSpec['parseDOM'],
  renderHTML?: (
    this: {
      options: Options,
    },
    props: {
      mark: Mark,
      attributes: { [key: string]: any },
    }
  ) => DOMOutputSpec,
  addAttributes?: (
    this: {
      options: Options,
    },
  ) => Attributes,
}

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
  renderHTML: () => null,
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
