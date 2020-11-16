import {
  DOMOutputSpec, NodeSpec, Node, NodeType,
} from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { ExtensionSpec } from './Extension'
import { Attributes, NodeViewRenderer, Overwrite } from './types'
import { Editor } from './Editor'

export interface NodeExtensionSpec<Options = any, Commands = {}> extends Overwrite<ExtensionSpec<Options, Commands>, {
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
      node: Node,
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

  /**
   * Node View
   */
  addNodeView?: ((this: {
    options: Options,
    editor: Editor,
    type: NodeType,
  }) => NodeViewRenderer) | null,
}> {}

export class NodeExtension<Options = any, Commands = {}> {
  config: Required<NodeExtensionSpec> = {
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
  }

  options!: Options

  constructor(config: NodeExtensionSpec<Options, Commands>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O, C>(config: NodeExtensionSpec<O, C>) {
    return new NodeExtension<O, C>(config)
  }

  set(options: Options) {
    this.options = {
      ...this.config.defaultOptions,
      ...options,
    }

    return this
  }

  extend<ExtendedOptions = Options, ExtendedCommands = Commands>(extendedConfig: Partial<NodeExtensionSpec<ExtendedOptions, ExtendedCommands>>) {
    return new NodeExtension<ExtendedOptions, ExtendedCommands>({
      ...this.config,
      ...extendedConfig,
    } as NodeExtensionSpec<ExtendedOptions, ExtendedCommands>)
  }
}
