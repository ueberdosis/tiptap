import {
  DOMOutputSpec,
  NodeSpec,
  Node as ProseMirrorNode,
  NodeType,
} from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { InputRule } from 'prosemirror-inputrules'
import { ExtensionConfig } from './Extension'
import { Attributes, NodeViewRenderer, Overwrite } from './types'
import { Editor } from './Editor'

export interface NodeConfig<Options = any, Commands = {}> extends Overwrite<ExtensionConfig<Options, Commands>, {
  /**
   * TopNode
   */
  topNode?: boolean,

  /**
   * Content
   */
  content?: NodeSpec['content'] | ((this: { options: Options }) => NodeSpec['content']),

  /**
   * Marks
   */
  marks?: NodeSpec['marks'] | ((this: { options: Options }) => NodeSpec['marks']),

  /**
   * Group
   */
  group?: NodeSpec['group'] | ((this: { options: Options }) => NodeSpec['group']),

  /**
   * Inline
   */
  inline?: NodeSpec['inline'] | ((this: { options: Options }) => NodeSpec['inline']),

  /**
   * Atom
   */
  atom?: NodeSpec['atom'] | ((this: { options: Options }) => NodeSpec['atom']),

  /**
   * Selectable
   */
  selectable?: NodeSpec['selectable'] | ((this: { options: Options }) => NodeSpec['selectable']),

  /**
   * Draggable
   */
  draggable?: NodeSpec['draggable'] | ((this: { options: Options }) => NodeSpec['draggable']),

  /**
   * Code
   */
  code?: NodeSpec['code'] | ((this: { options: Options }) => NodeSpec['code']),

  /**
   * Defining
   */
  defining?: NodeSpec['defining'] | ((this: { options: Options }) => NodeSpec['defining']),

  /**
   * Isolating
   */
  isolating?: NodeSpec['isolating'] | ((this: { options: Options }) => NodeSpec['isolating']),

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
      node: ProseMirrorNode,
      HTMLAttributes: { [key: string]: any },
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
  }) => InputRule[],

  /**
   * Paste rules
   */
  addPasteRules?: (this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => Plugin[],

  /**
   * ProseMirror plugins
   */
  addProseMirrorPlugins?: (this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => Plugin[],

  /**
   * Node View
   */
  addNodeView?: ((this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => NodeViewRenderer) | null,

  onDestroy?: ((this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => void) | null,
}> {}

export class Node<Options = any, Commands = {}> {
  type = 'node'

  config: Required<NodeConfig> = {
    name: 'node',
    defaultOptions: {},
    addGlobalAttributes: () => [],
    addCommands: () => ({}),
    addKeyboardShortcuts: () => ({}),
    addInputRules: () => [],
    addPasteRules: () => [],
    addProseMirrorPlugins: () => [],
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
    addNodeView: null,
    onDestroy: null,
  }

  options!: Options

  constructor(config: NodeConfig<Options, Commands>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O, C>(config: NodeConfig<O, C>) {
    return new Node<O, C>(config)
  }

  configure(options: Partial<Options>) {
    return Node
      .create<Options, Commands>(this.config as NodeConfig<Options, Commands>)
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

  extend<ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<NodeConfig<ExtendedOptions, ExtendedCommands>>) {
    return new Node<ExtendedOptions, ExtendedCommands>({
      ...this.config,
      ...extendedConfig,
    } as NodeConfig<ExtendedOptions, ExtendedCommands>)
  }
}
