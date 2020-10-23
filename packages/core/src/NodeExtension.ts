import {
  DOMOutputSpec, NodeSpec, Node, NodeType,
} from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { ExtensionSpec, defaultExtension } from './Extension'
import { Attributes, Overwrite } from './types'
import { Editor } from './Editor'

export interface NodeExtensionSpec<Options = {}, Commands = {}> extends Overwrite<ExtensionSpec<Options, Commands>, {
  /**
   * TopNode
   */
  topNode?: boolean,

  /**
   * Content
   */
  content?: NodeSpec['content'],

  /**
   * Marks
   */
  marks?: NodeSpec['marks'],

  /**
   * Group
   */
  group?: NodeSpec['group'],

  /**
   * Inline
   */
  inline?: NodeSpec['inline'],

  /**
   * Atom
   */
  atom?: NodeSpec['atom'],

  /**
   * Selectable
   */
  selectable?: NodeSpec['selectable'],

  /**
   * Draggable
   */
  draggable?: NodeSpec['draggable'],

  /**
   * Code
   */
  code?: NodeSpec['code'],

  /**
   * Defining
   */
  defining?: NodeSpec['defining'],

  /**
   * Isolating
   */
  isolating?: NodeSpec['isolating'],

  /**
   * Parse HTML
   */
  parseHTML?: (
    this: {
      options: Options,
    },
  ) => NodeSpec['parseDOM'],

  /**
   * Render HTML
   */
  renderHTML?: ((
    this: {
      options: Options,
    },
    props: {
      node: Node,
      attributes: { [key: string]: any },
    }
  ) => DOMOutputSpec) | null,

  /**
   * Add Attributes
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
    type: NodeType,
  }) => Commands,

  /**
   * Keyboard shortcuts
   */
  addKeyboardShortcuts?: (this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => {
    [key: string]: any
  },

  /**
   * Input rules
   */
  addInputRules?: (this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => any[],

  /**
   * Paste rules
   */
  addPasteRules?: (this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => any[],

  /**
   * ProseMirror plugins
   */
  addProseMirrorPlugins?: (this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => Plugin[],
}> {}

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
  renderHTML: null,
  addAttributes: () => ({}),
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
