// import { NodeSpec, NodeType } from 'prosemirror-model'
// import Extension, { ExtensionMethods } from './Extension'
// import { Editor } from './Editor'

// export interface NodeProps<Options> {
//   name: string
//   editor: Editor
//   options: Options
//   type: NodeType
// }

// export interface NodeMethods<Props, Options> extends ExtensionMethods<Props, Options> {
//   topNode: boolean
//   schema: (params: Omit<Props, 'type' | 'editor'>) => NodeSpec
// }

// export default class Node<
//   Options = {},
//   Props = NodeProps<Options>,
//   Methods extends NodeMethods<Props, Options> = NodeMethods<Props, Options>,
// > extends Extension<Options, Props, Methods> {
//   type = 'node'

//   public topNode(value: Methods['topNode'] = true) {
//     this.storeConfig('topNode', value, 'overwrite')
//     return this
//   }

//   public schema(value: Methods['schema']) {
//     this.storeConfig('schema', value, 'overwrite')
//     return this
//   }
// }

// import { DOMOutputSpec, DOMOutputSpecArray } from 'prosemirror-model'
// import Extension from './Extension'

// export interface INode {
//   type: string
//   topNode: boolean
//   group: string
//   content: string
//   createAttributes(): any
//   parseHTML(): any
//   renderHTML(props: number): DOMOutputSpec
// }

// export default class Node<Options = {}> extends Extension<Options> implements INode {

//   type = 'node'

//   topNode = false

//   group = ''

//   content = ''

//   createAttributes() {
//     return {}
//   }

//   parseHTML() {
//     return []
//   }

//   renderHTML() {
//     return null
//   }

// }

import { DOMOutputSpec, NodeSpec, Node } from 'prosemirror-model'
import { ExtensionSpec } from './Extension'

export interface NodeExtensionSpec<Options = {}, Commands = {}> extends ExtensionSpec<Options, Commands> {
  topNode?: boolean,
  content?: NodeSpec['content'],
  marks?: NodeSpec['marks'],
  group?: NodeSpec['group'],
  inline?: NodeSpec['inline'],
  atom?: NodeSpec['atom'],
  parseHTML?: () => NodeSpec['parseDOM'],
  renderHTML?: (props: {
    node: Node,
    attributes: {
      [key: string]: any,
    },
  }) => DOMOutputSpec,
}

export type NodeExtension = Required<Omit<NodeExtensionSpec, 'defaultOptions'> & {
  type: string,
  options: {
    [key: string]: any
  },
}>

const defaultNode: NodeExtension = {
  type: 'node',
  name: 'node',
  options: {},
  topNode: false,
  content: null,
  marks: null,
  group: null,
  inline: null,
  atom: null,
  createCommands: () => ({}),
  parseHTML: () => null,
  renderHTML: () => null,
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
