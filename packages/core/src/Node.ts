import { DOMOutputSpec, NodeSpec, Node } from 'prosemirror-model'
import { ExtensionSpec, defaultExtension } from './Extension'
import { Attributes } from './types'

export interface NodeExtensionSpec<Options = {}, Commands = {}> extends ExtensionSpec<Options, Commands> {
  topNode?: boolean,
  content?: NodeSpec['content'],
  marks?: NodeSpec['marks'],
  group?: NodeSpec['group'],
  inline?: NodeSpec['inline'],
  atom?: NodeSpec['atom'],
  selectable?: NodeSpec['selectable'],
  draggable?: NodeSpec['draggable'],
  code?: NodeSpec['code'],
  defining?: NodeSpec['defining'],
  isolating?: NodeSpec['isolating'],
  parseHTML?: (
    this: {
      options: Options,
    },
  ) => NodeSpec['parseDOM'],
  renderHTML?: (
    this: {
      options: Options,
    },
    props: {
      node: Node,
      attributes: { [key: string]: any },
    }
  ) => DOMOutputSpec,
  createAttributes?: (
    this: {
      options: Options,
    },
  ) => Attributes,
}

export type NodeExtension = Required<Omit<NodeExtensionSpec, 'defaultOptions'> & {
  type: string,
  options: {
    [key: string]: any
  },
}>

const defaultNode: NodeExtension = {
  ...defaultExtension,
  type: 'node',
  name: 'node',
  topNode: false,
  content: null,
  marks: null,
  group: null,
  inline: null,
  atom: null,
  selectable: null,
  draggable: null,
  code: null,
  defining: null,
  isolating: null,
  parseHTML: () => null,
  renderHTML: () => null,
  createAttributes: () => ({}),
}

export function createNode<Options extends {}, Commands extends {}>(config: NodeExtensionSpec<Options, Commands>) {
  const extend = <ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<NodeExtensionSpec<ExtendedOptions, ExtendedCommands>>) => {
    return createNode({
      ...config,
      ...extendedConfig,
    } as NodeExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }

  const setOptions = (options?: Partial<Options>) => {
    const { defaultOptions, ...rest } = config

    return {
      ...defaultNode,
      ...rest,
      options: {
        ...defaultOptions,
        ...options,
      } as Options,
    }
  }

  return Object.assign(setOptions, { config, extend })
}
