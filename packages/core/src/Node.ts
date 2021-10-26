import {
  DOMOutputSpec,
  NodeSpec,
  Node as ProseMirrorNode,
  NodeType,
} from 'prosemirror-model'
import { Plugin, Transaction } from 'prosemirror-state'
import { InputRule } from './InputRule'
import { PasteRule } from './PasteRule'
import mergeDeep from './utilities/mergeDeep'
import callOrReturn from './utilities/callOrReturn'
import getExtensionField from './helpers/getExtensionField'
import {
  AnyConfig,
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
  interface NodeConfig<Options = any, Storage = any> {
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
     * Default Options
     */
    addOptions?: (this: {
      name: string,
      parent: Exclude<ParentConfig<NodeConfig<Options, Storage>>['addOptions'], undefined>,
    }) => Options,

    /**
     * Default Storage
     */
    addStorage?: (this: {
      name: string,
      options: Options,
      parent: Exclude<ParentConfig<NodeConfig<Options, Storage>>['addStorage'], undefined>,
    }) => Storage,

    /**
     * Global attributes
     */
    addGlobalAttributes?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addGlobalAttributes'],
    }) => GlobalAttributes | {},

    /**
     * Raw
     */
    addCommands?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addCommands'],
    }) => Partial<RawCommands>,

    /**
     * Keyboard shortcuts
     */
    addKeyboardShortcuts?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addKeyboardShortcuts'],
    }) => {
      [key: string]: KeyboardShortcutCommand,
    },

    /**
     * Input rules
     */
    addInputRules?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addInputRules'],
    }) => InputRule[],

    /**
     * Paste rules
     */
    addPasteRules?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addPasteRules'],
    }) => PasteRule[],

    /**
     * ProseMirror plugins
     */
    addProseMirrorPlugins?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addProseMirrorPlugins'],
    }) => Plugin[],

    /**
     * Extensions
     */
    addExtensions?: (this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addExtensions'],
    }) => Extensions,

    /**
     * Extend Node Schema
     */
    extendNodeSchema?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<NodeConfig<Options, Storage>>['extendNodeSchema'],
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
        storage: Storage,
        parent: ParentConfig<NodeConfig<Options, Storage>>['extendMarkSchema'],
      },
      extension: Node,
    ) => Record<string, any>) | null,

    /**
     * The editor is not ready yet.
     */
    onBeforeCreate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['onBeforeCreate'],
    }) => void) | null,

    /**
     * The editor is ready.
     */
    onCreate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['onCreate'],
    }) => void) | null,

    /**
     * The content has changed.
     */
    onUpdate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['onUpdate'],
    }) => void) | null,

    /**
     * The selection has changed.
     */
    onSelectionUpdate?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['onSelectionUpdate'],
    }) => void) | null,

    /**
     * The editor state has changed.
     */
    onTransaction?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        editor: Editor,
        type: NodeType,
        parent: ParentConfig<NodeConfig<Options, Storage>>['onTransaction'],
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
        storage: Storage,
        editor: Editor,
        type: NodeType,
        parent: ParentConfig<NodeConfig<Options, Storage>>['onFocus'],
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
        storage: Storage,
        editor: Editor,
        type: NodeType,
        parent: ParentConfig<NodeConfig<Options, Storage>>['onBlur'],
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
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['onDestroy'],
    }) => void) | null,

    /**
     * Node View
     */
    addNodeView?: ((this: {
      name: string,
      options: Options,
      storage: Storage,
      editor: Editor,
      type: NodeType,
      parent: ParentConfig<NodeConfig<Options, Storage>>['addNodeView'],
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
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['content'],
    }) => NodeSpec['content']),

    /**
     * Marks
     */
    marks?: NodeSpec['marks'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['marks'],
    }) => NodeSpec['marks']),

    /**
     * Group
     */
    group?: NodeSpec['group'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['group'],
    }) => NodeSpec['group']),

    /**
     * Inline
     */
    inline?: NodeSpec['inline'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['inline'],
    }) => NodeSpec['inline']),

    /**
     * Atom
     */
    atom?: NodeSpec['atom'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['atom'],
    }) => NodeSpec['atom']),

    /**
     * Selectable
     */
    selectable?: NodeSpec['selectable'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['selectable'],
    }) => NodeSpec['selectable']),

    /**
     * Draggable
     */
    draggable?: NodeSpec['draggable'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['draggable'],
    }) => NodeSpec['draggable']),

    /**
     * Code
     */
    code?: NodeSpec['code'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['code'],
    }) => NodeSpec['code']),

    /**
     * Defining
     */
    defining?: NodeSpec['defining'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['defining'],
    }) => NodeSpec['defining']),

    /**
     * Isolating
     */
    isolating?: NodeSpec['isolating'] | ((this: {
      name: string,
      options: Options,
      storage: Storage,
      parent: ParentConfig<NodeConfig<Options, Storage>>['isolating'],
    }) => NodeSpec['isolating']),

    /**
     * Parse HTML
     */
    parseHTML?: (
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<NodeConfig<Options, Storage>>['parseHTML'],
      },
    ) => NodeSpec['parseDOM'],

    /**
     * Render HTML
     */
    renderHTML?: ((
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<NodeConfig<Options, Storage>>['renderHTML'],
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
        storage: Storage,
        parent: ParentConfig<NodeConfig<Options, Storage>>['renderText'],
      },
      props: {
        node: ProseMirrorNode,
        pos: number,
        parent: ProseMirrorNode,
        index: number,
      }
    ) => string) | null,

    /**
     * Add Attributes
     */
    addAttributes?: (
      this: {
        name: string,
        options: Options,
        storage: Storage,
        parent: ParentConfig<NodeConfig<Options, Storage>>['addAttributes'],
      },
    ) => Attributes | {},
  }
}

export class Node<Options = any, Storage = any> {
  type = 'node'

  name = 'node'

  parent: Node | null = null

  child: Node | null = null

  options: Options

  storage: Storage

  config: NodeConfig = {
    name: this.name,
    defaultOptions: {},
  }

  constructor(config: Partial<NodeConfig<Options, Storage>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name

    if (config.defaultOptions) {
      console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`)
    }

    // TODO: remove `addOptions` fallback
    this.options = this.config.defaultOptions

    if (this.config.addOptions) {
      this.options = callOrReturn(getExtensionField<AnyConfig['addOptions']>(
        this,
        'addOptions',
        {
          name: this.name,
        },
      ))
    }

    this.storage = callOrReturn(getExtensionField<AnyConfig['addStorage']>(
      this,
      'addStorage',
      {
        name: this.name,
        options: this.options,
      },
    )) || {}
  }

  static create<O = any, S = any>(config: Partial<NodeConfig<O, S>> = {}) {
    return new Node<O, S>(config)
  }

  configure(options: Partial<Options> = {}) {
    // return a new instance so we can use the same extension
    // with different calls of `configure`
    const extension = this.extend()

    extension.options = mergeDeep(this.options, options) as Options

    extension.storage = callOrReturn(getExtensionField<AnyConfig['addStorage']>(
      extension,
      'addStorage',
      {
        name: extension.name,
        options: extension.options,
      },
    ))

    return extension
  }

  extend<ExtendedOptions = Options, ExtendedStorage = Storage>(extendedConfig: Partial<NodeConfig<ExtendedOptions, ExtendedStorage>> = {}) {
    const extension = new Node<ExtendedOptions, ExtendedStorage>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name
      ? extendedConfig.name
      : extension.parent.name

    if (extendedConfig.defaultOptions) {
      console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${extension.name}".`)
    }

    // TODO: remove `addOptions` fallback
    extension.options = extendedConfig.defaultOptions
      ? extendedConfig.defaultOptions
      : extension.parent.options

    if (extendedConfig.addOptions) {
      extension.options = callOrReturn(getExtensionField<AnyConfig['addOptions']>(
        extension,
        'addOptions',
        {
          name: extension.name,
        },
      ))
    }

    extension.storage = callOrReturn(getExtensionField<AnyConfig['addStorage']>(
      extension,
      'addStorage',
      {
        name: extension.name,
        options: extension.options,
      },
    ))

    return extension
  }
}
