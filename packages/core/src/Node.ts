import {
  DOMOutputSpec,
  NodeSpec,
  Node as ProseMirrorNode,
  NodeType,
} from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { InputRule } from 'prosemirror-inputrules'
import mergeDeep from './utilities/mergeDeep'
import {
  Extensions,
  Attributes,
  NodeViewRenderer,
  GlobalAttributes,
  RawCommands,
  ParentConfig,
  KeyboardShortcutCommand,
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
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['addKeyboardShortcuts'],
    }) => {
      [key: string]: KeyboardShortcutCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['addPasteRules'],
    }) => Plugin[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extensions
     */
    addExtensions?: (this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['addExtensions'],
    }) => Extensions,

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<NodeConfig<Options>>['extendNodeSchema'],
      },
      extension: Node,
    ) => Record<string, any>) | null,

    /**
     * Extend Mark Schema
     */
    extendMarkSchema?: ((
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<NodeConfig<Options>>['extendMarkSchema'],
      },
      extension: Node,
    ) => Record<string, any>) | null,

    /**
     * The editor is not ready yet.
     */
    onBeforeCreate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['onSelectionUpdate'],
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        name: string,
        options: Options,
        editor: Editor,
        type: NodeType,
        parent: ParentConfig<NodeConfig<Options>>['onTransaction'],
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
        name: string,
        options: Options,
        editor: Editor,
        type: NodeType,
        parent: ParentConfig<NodeConfig<Options>>['onFocus'],
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
        name: string,
        options: Options,
        editor: Editor,
        type: NodeType,
        parent: ParentConfig<NodeConfig<Options>>['onBlur'],
      },
      props: {
        event: FocusEvent,
      },
    ) => void) | null,

    /**
     * The editor is destroyed.
     */
    onDestroy?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['onDestroy'],
    }) => void) | null,

    /**
     * Node View
     */
    addNodeView?: ((this: {
      name: string,
      options: Options,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options>>['addNodeView'],
    }) => NodeViewRenderer) | null,

    /**
     * TopNode
     */
    topNode?: boolean,

    /**
     * Content
     */
    content?: NodeSpec['content'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['content'],
    }) => NodeSpec['content']),

    /**
     * Marks
     */
    marks?: NodeSpec['marks'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['marks'],
    }) => NodeSpec['marks']),

    /**
     * Group
     */
    group?: NodeSpec['group'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['group'],
    }) => NodeSpec['group']),

    /**
     * Inline
     */
    inline?: NodeSpec['inline'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['inline'],
    }) => NodeSpec['inline']),

    /**
     * Atom
     */
    atom?: NodeSpec['atom'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['atom'],
    }) => NodeSpec['atom']),

    /**
     * Selectable
     */
    selectable?: NodeSpec['selectable'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['selectable'],
    }) => NodeSpec['selectable']),

    /**
     * Draggable
     */
    draggable?: NodeSpec['draggable'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['draggable'],
    }) => NodeSpec['draggable']),

    /**
     * Code
     */
    code?: NodeSpec['code'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['code'],
    }) => NodeSpec['code']),

    /**
     * Defining
     */
    defining?: NodeSpec['defining'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['defining'],
    }) => NodeSpec['defining']),

    /**
     * Isolating
     */
    isolating?: NodeSpec['isolating'] | ((this: {
      name: string,
      options: Options,
      parent: ParentConfig<NodeConfig<Options>>['isolating'],
    }) => NodeSpec['isolating']),

    /**
     * Parse HTML
     */
    parseHTML?: (
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<NodeConfig<Options>>['parseHTML'],
      },
    ) => NodeSpec['parseDOM'],

    /**
     * Render HTML
     */
    renderHTML?: ((
      this: {
        name: string,
        options: Options,
        parent: ParentConfig<NodeConfig<Options>>['renderHTML'],
      },
      props: {
        node: ProseMirrorNode,
        HTMLAttributes: Record<string, any>,
      }
    ) => DOMOutputSpec) | null,

    /**
     * Render Text
     */
    renderText?: ((
      this: {
        name: string,
        options: Options,
        editor: Editor,
        type: NodeType,
        parent: ParentConfig<NodeConfig<Options>>['renderText'],
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
        name: string,
        options: Options,
        parent: ParentConfig<NodeConfig<Options>>['addAttributes'],
      },
    ) => Attributes | {},
  }
}

export class Node<Options = any> {
  type = 'node'

  name = 'node'

  parent: Node | null = null

  child: Node | null = null

  options: Options

  config: NodeConfig = {
    name: this.name,
    priority: 100,
    defaultOptions: {},
  }

  constructor(config: Partial<NodeConfig<Options>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name
    this.options = this.config.defaultOptions
  }

  static create<O>(config: Partial<NodeConfig<O>> = {}) {
    return new Node<O>(config)
  }

  configure(options: Partial<Options> = {}) {
    this.options = mergeDeep(this.options, options) as Options

    return this
  }

  extend<ExtendedOptions = Options>(extendedConfig: Partial<NodeConfig<ExtendedOptions>> = {}) {
    const extension = new Node<ExtendedOptions>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name
      ? extendedConfig.name
      : extension.parent.name

    extension.options = extendedConfig.defaultOptions
      ? extendedConfig.defaultOptions
      : extension.parent.options

    return extension
  }
}
