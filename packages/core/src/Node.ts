import {
  DOMOutputSpec,
  NodeSpec,
  Node as ProseMirrorNode,
  NodeType,
} from 'prosemirror-model'
import { Command as ProseMirrorCommand } from 'prosemirror-commands'
import { Plugin, Transaction } from 'prosemirror-state'
import { InputRule } from 'prosemirror-inputrules'
import mergeDeep from './utilities/mergeDeep'
import {
  Attributes,
  NodeViewRenderer,
  GlobalAttributes,
  RawCommands,
  ParentConfig,
} from './types'
import { NodeConfig } from '.'
import { Editor } from './Editor'

declare module '@tiptap/core' {
  interface NodeConfig<Options = any> {
    [key: string]: any;

    /**
     * Name
     */
    name: string,

    /**
     * Priority
     */
    priority?: number,

    /**
     * Default options
     */
    defaultOptions?: Options,

    /**
     * Global attributes
     */
    addGlobalAttributes?: (this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => {
      [key: string]: ProseMirrorCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => Plugin[],

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        options: Options,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
      extension: Node,
    ) => {
      [key: string]: any,
    }) | null,

    /**
     * Extend Mark Schema
     */
    extendMarkSchema?: ((
      this: {
        options: Options,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
      extension: Node,
    ) => {
      [key: string]: any,
    }) | null,

    /**
     * The editor is not ready yet.
     */
     onBeforeCreate?: ((this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        options: Options,
        editor: Editor,
        type: NodeType,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
      props: {
        transaction: Transaction,
      },
    ) => void) | null,

    /**
     * The editor is focused.
     */
    onFocus?: ((
      this: {
        options: Options,
        editor: Editor,
        type: NodeType,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
      props: {
        event: FocusEvent,
      },
    ) => void) | null,

    /**
     * The editor isn’t focused anymore.
     */
    onBlur?: ((
      this: {
        options: Options,
        editor: Editor,
        type: NodeType,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
      props: {
        event: FocusEvent,
      },
    ) => void) | null,

    /**
     * The editor is destroyed.
     */
    onDestroy?: ((this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => void) | null,

    /**
     * Node View
     */
    addNodeView?: ((this: {
      options: Options,
      editor: Editor,
      type: NodeType,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeViewRenderer) | null,

    /**
     * TopNode
     */
    topNode?: boolean,

    /**
     * Content
     */
    content?: NodeSpec['content'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['content']),

    /**
     * Marks
     */
    marks?: NodeSpec['marks'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['marks']),

    /**
     * Group
     */
    group?: NodeSpec['group'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['group']),

    /**
     * Inline
     */
    inline?: NodeSpec['inline'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['inline']),

    /**
     * Atom
     */
    atom?: NodeSpec['atom'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['atom']),

    /**
     * Selectable
     */
    selectable?: NodeSpec['selectable'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['selectable']),

    /**
     * Draggable
     */
    draggable?: NodeSpec['draggable'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['draggable']),

    /**
     * Code
     */
    code?: NodeSpec['code'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['code']),

    /**
     * Defining
     */
    defining?: NodeSpec['defining'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['defining']),

    /**
     * Isolating
     */
    isolating?: NodeSpec['isolating'] | ((this: {
      options: Options,
      parentConfig: ParentConfig<NodeConfig<Options>>,
    }) => NodeSpec['isolating']),

    /**
     * Parse HTML
     */
    parseHTML?: (
      this: {
        options: Options,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
    ) => NodeSpec['parseDOM'],

    /**
     * Render HTML
     */
    renderHTML?: ((
      this: {
        options: Options,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
      props: {
        node: ProseMirrorNode,
        HTMLAttributes: { [key: string]: any },
      }
    ) => DOMOutputSpec) | null,

    /**
     * Render Text
     */
    renderText?: ((
      this: {
        options: Options,
        editor: Editor,
        type: NodeType,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
      props: {
        node: ProseMirrorNode,
      }
    ) => string) | null,

    /**
     * Add Attributes
     */
    addAttributes?: (
      this: {
        options: Options,
        parentConfig: ParentConfig<NodeConfig<Options>>,
      },
    ) => Attributes | {},
  }
}

export class Node<Options = any> {
  type = 'node'

  config: NodeConfig = {
    name: 'node',
    priority: 100,
    defaultOptions: {},
  }

  parentConfig: Partial<NodeConfig> = {}

  options!: Options

  constructor(config: NodeConfig<Options>) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.options = this.config.defaultOptions
  }

  static create<O>(config: NodeConfig<O>) {
    return new Node<O>(config)
  }

  configure(options: Partial<Options> = {}) {
    return Node
      .create<Options>(this.config as NodeConfig<Options>)
      .#configure(options)
  }

  #configure = (options: Partial<Options>) => {
    this.options = mergeDeep(this.config.defaultOptions, options) as Options

    return this
  }

  extend<ExtendedOptions = Options>(extendedConfig: Partial<NodeConfig<ExtendedOptions>>) {
    const extension = new Node<ExtendedOptions>({
      ...this.config,
      ...extendedConfig,
    } as NodeConfig<ExtendedOptions>)

    extension.parentConfig = this.config

    return extension
  }
}
