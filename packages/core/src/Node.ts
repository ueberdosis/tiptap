import {
  DOMOutputSpec, Node as ProseMirrorNode, NodeSpec, NodeType,
} from '@tiptap/pm/model'
import { Plugin, Transaction } from '@tiptap/pm/state'

import { Editor } from './Editor.js'
import { getExtensionField } from './helpers/getExtensionField.js'
import { NodeConfig } from './index.js'
import { InputRule } from './InputRule.js'
import { Mark } from './Mark.js'
import { PasteRule } from './PasteRule.js'
import {
  AnyConfig,
  Attributes,
  Extensions,
  GlobalAttributes,
  KeyboardShortcutCommand,
  NodeViewRenderer,
  ParentConfig,
  RawCommands,
} from './types.js'
import { callOrReturn } from './utilities/callOrReturn.js'
import { mergeDeep } from './utilities/mergeDeep.js'

declare module '@tiptap/core' {
  interface NodeConfig<Options = any, Storage = any> {
    // @ts-ignore - this is a dynamic key
    [key: string]: any

    /**
     * The extension name - this must be unique.
     * It will be used to identify the extension.
     *
     * @example 'myExtension'
     */
    name: string

    /**
     * The priority of your extension. The higher, the earlier it will be called
     * and will take precedence over other extensions with a lower priority.
     * @default 100
     * @example 101
     */
    priority?: number

    /**
     * The default options for this extension.
     * @example
     * defaultOptions: {
     *   myOption: 'foo',
     *   myOtherOption: 10,
     * }
     */
    defaultOptions?: Options

    /**
     * This method will add options to this extension
     * @see https://tiptap.dev/guide/custom-extensions#settings
     * @example
     * addOptions() {
     *  return {
     *    myOption: 'foo',
     *    myOtherOption: 10,
     * }
     */
    addOptions?: (this: {
      name: string
      parent: Exclude<ParentConfig<NodeConfig<Options, Storage>>['addOptions'], undefined>
    }) => Options

    /**
     * The default storage this extension can save data to.
     * @see https://tiptap.dev/guide/custom-extensions#storage
     * @example
     * defaultStorage: {
     *   prefetchedUsers: [],
     *   loading: false,
     * }
     */
    addStorage?: (this: {
      name: string
      options: Options
      parent: Exclude<ParentConfig<NodeConfig<Options, Storage>>['addStorage'], undefined>
    }) => Storage

    /**
     * This function adds globalAttributes to specific nodes.
     * @see https://tiptap.dev/guide/custom-extensions#global-attributes
     * @example
     * addGlobalAttributes() {
     *   return [
     *     {
             // Extend the following extensions
     *       types: [
     *         'heading',
     *         'paragraph',
     *       ],
     *       // … with those attributes
     *       attributes: {
     *         textAlign: {
     *           default: 'left',
     *           renderHTML: attributes => ({
     *             style: `text-align: ${attributes.textAlign}`,
     *           }),
     *           parseHTML: element => element.style.textAlign || 'left',
     *         },
     *       },
     *     },
     *   ]
     * }
     */
    addGlobalAttributes?: (this: {
      name: string
      options: Options
      storage: Storage
      extensions: (Node | Mark)[]
      parent: ParentConfig<NodeConfig<Options, Storage>>['addGlobalAttributes']
    }) => GlobalAttributes

    /**
     * This function adds commands to the editor
     * @see https://tiptap.dev/guide/custom-extensions#keyboard-shortcuts
     * @example
     * addCommands() {
     *   return {
     *     myCommand: () => ({ chain }) => chain().setMark('type', 'foo').run(),
     *   }
     * }
     */
    addCommands?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: NodeType
      parent: ParentConfig<NodeConfig<Options, Storage>>['addCommands']
    }) => Partial<RawCommands>

    /**
     * This function registers keyboard shortcuts.
     * @see https://tiptap.dev/guide/custom-extensions#keyboard-shortcuts
     * @example
     * addKeyboardShortcuts() {
     *   return {
     *     'Mod-l': () => this.editor.commands.toggleBulletList(),
     *   }
     * },
     */
    addKeyboardShortcuts?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: NodeType
      parent: ParentConfig<NodeConfig<Options, Storage>>['addKeyboardShortcuts']
    }) => {
      [key: string]: KeyboardShortcutCommand
    }

    /**
     * This function adds input rules to the editor.
     * @see https://tiptap.dev/guide/custom-extensions#input-rules
     * @example
     * addInputRules() {
     *   return [
     *     markInputRule({
     *       find: inputRegex,
     *       type: this.type,
     *     }),
     *   ]
     * },
     */
    addInputRules?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: NodeType
      parent: ParentConfig<NodeConfig<Options, Storage>>['addInputRules']
    }) => InputRule[]

    /**
     * This function adds paste rules to the editor.
     * @see https://tiptap.dev/guide/custom-extensions#paste-rules
     * @example
     * addPasteRules() {
     *   return [
     *     markPasteRule({
     *       find: pasteRegex,
     *       type: this.type,
     *     }),
     *   ]
     * },
     */
    addPasteRules?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: NodeType
      parent: ParentConfig<NodeConfig<Options, Storage>>['addPasteRules']
    }) => PasteRule[]

    /**
     * This function adds Prosemirror plugins to the editor
     * @see https://tiptap.dev/guide/custom-extensions#prosemirror-plugins
     * @example
     * addProseMirrorPlugins() {
     *   return [
     *     customPlugin(),
     *   ]
     * }
     */
    addProseMirrorPlugins?: (this: {
      name: string
      options: Options
      storage: Storage
      editor: Editor
      type: NodeType
      parent: ParentConfig<NodeConfig<Options, Storage>>['addProseMirrorPlugins']
    }) => Plugin[]

    /**
     * This function adds additional extensions to the editor. This is useful for
     * building extension kits.
     * @example
     * addExtensions() {
     *   return [
     *     BulletList,
     *     OrderedList,
     *     ListItem
     *   ]
     * }
     */
    addExtensions?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<NodeConfig<Options, Storage>>['addExtensions']
    }) => Extensions

    /**
     * This function extends the schema of the node.
     * @example
     * extendNodeSchema() {
     *   return {
     *     group: 'inline',
     *     selectable: false,
     *   }
     * }
     */
    extendNodeSchema?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            parent: ParentConfig<NodeConfig<Options, Storage>>['extendNodeSchema']
          },
          extension: Node,
        ) => Record<string, any>)
      | null

    /**
     * This function extends the schema of the mark.
     * @example
     * extendMarkSchema() {
     *   return {
     *     group: 'inline',
     *     selectable: false,
     *   }
     * }
     */
    extendMarkSchema?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            parent: ParentConfig<NodeConfig<Options, Storage>>['extendMarkSchema']
            editor?: Editor
          },
          extension: Node,
        ) => Record<string, any>)
      | null

    /**
     * The editor is not ready yet.
     */
    onBeforeCreate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: NodeType
          parent: ParentConfig<NodeConfig<Options, Storage>>['onBeforeCreate']
        }) => void)
      | null

    /**
     * The editor is ready.
     */
    onCreate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: NodeType
          parent: ParentConfig<NodeConfig<Options, Storage>>['onCreate']
        }) => void)
      | null

    /**
     * The content has changed.
     */
    onUpdate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: NodeType
          parent: ParentConfig<NodeConfig<Options, Storage>>['onUpdate']
        }) => void)
      | null

    /**
     * The selection has changed.
     */
    onSelectionUpdate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: NodeType
          parent: ParentConfig<NodeConfig<Options, Storage>>['onSelectionUpdate']
        }) => void)
      | null

    /**
     * The editor state has changed.
     */
    onTransaction?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            editor: Editor
            type: NodeType
            parent: ParentConfig<NodeConfig<Options, Storage>>['onTransaction']
          },
          props: {
            editor: Editor
            transaction: Transaction
          },
        ) => void)
      | null

    /**
     * The editor is focused.
     */
    onFocus?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            editor: Editor
            type: NodeType
            parent: ParentConfig<NodeConfig<Options, Storage>>['onFocus']
          },
          props: {
            event: FocusEvent
          },
        ) => void)
      | null

    /**
     * The editor isn’t focused anymore.
     */
    onBlur?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            editor: Editor
            type: NodeType
            parent: ParentConfig<NodeConfig<Options, Storage>>['onBlur']
          },
          props: {
            event: FocusEvent
          },
        ) => void)
      | null

    /**
     * The editor is destroyed.
     */
    onDestroy?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: NodeType
          parent: ParentConfig<NodeConfig<Options, Storage>>['onDestroy']
        }) => void)
      | null

    /**
     * Node View
     */
    addNodeView?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: NodeType
          parent: ParentConfig<NodeConfig<Options, Storage>>['addNodeView']
        }) => NodeViewRenderer)
      | null

    /**
     * Defines if this node should be a top level node (doc)
     * @default false
     * @example true
     */
    topNode?: boolean

    /**
     * The content expression for this node, as described in the [schema
     * guide](/docs/guide/#schema.content_expressions). When not given,
     * the node does not allow any content.
     *
     * You can read more about it on the Prosemirror documentation here
     * @see https://prosemirror.net/docs/guide/#schema.content_expressions
     * @default undefined
     * @example content: 'block+'
     * @example content: 'headline paragraph block*'
     */
    content?:
      | NodeSpec['content']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['content']
          editor?: Editor
        }) => NodeSpec['content'])

    /**
     * The marks that are allowed inside of this node. May be a
     * space-separated string referring to mark names or groups, `"_"`
     * to explicitly allow all marks, or `""` to disallow marks. When
     * not given, nodes with inline content default to allowing all
     * marks, other nodes default to not allowing marks.
     *
     * @example marks: 'strong em'
     */
    marks?:
      | NodeSpec['marks']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['marks']
          editor?: Editor
        }) => NodeSpec['marks'])

    /**
     * The group or space-separated groups to which this node belongs,
     * which can be referred to in the content expressions for the
     * schema.
     *
     * By default Tiptap uses the groups 'block' and 'inline' for nodes. You
     * can also use custom groups if you want to group specific nodes together
     * and handle them in your schema.
     * @example group: 'block'
     * @example group: 'inline'
     * @example group: 'customBlock' // this uses a custom group
     */
    group?:
      | NodeSpec['group']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['group']
          editor?: Editor
        }) => NodeSpec['group'])

    /**
     * Should be set to true for inline nodes. (Implied for text nodes.)
     */
    inline?:
      | NodeSpec['inline']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['inline']
          editor?: Editor
        }) => NodeSpec['inline'])

    /**
     * Can be set to true to indicate that, though this isn't a [leaf
     * node](https://prosemirror.net/docs/ref/#model.NodeType.isLeaf), it doesn't have directly editable
     * content and should be treated as a single unit in the view.
     *
     * @example atom: true
     */
    atom?:
      | NodeSpec['atom']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['atom']
          editor?: Editor
        }) => NodeSpec['atom'])

    /**
     * Controls whether nodes of this type can be selected as a [node
     * selection](https://prosemirror.net/docs/ref/#state.NodeSelection). Defaults to true for non-text
     * nodes.
     *
     * @default true
     * @example selectable: false
     */
    selectable?:
      | NodeSpec['selectable']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['selectable']
          editor?: Editor
        }) => NodeSpec['selectable'])

    /**
     * Determines whether nodes of this type can be dragged without
     * being selected. Defaults to false.
     *
     * @default: false
     * @example: draggable: true
     */
    draggable?:
      | NodeSpec['draggable']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['draggable']
          editor?: Editor
        }) => NodeSpec['draggable'])

    /**
     * Can be used to indicate that this node contains code, which
     * causes some commands to behave differently.
     */
    code?:
      | NodeSpec['code']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['code']
          editor?: Editor
        }) => NodeSpec['code'])

    /**
     * Controls way whitespace in this a node is parsed. The default is
     * `"normal"`, which causes the [DOM parser](https://prosemirror.net/docs/ref/#model.DOMParser) to
     * collapse whitespace in normal mode, and normalize it (replacing
     * newlines and such with spaces) otherwise. `"pre"` causes the
     * parser to preserve spaces inside the node. When this option isn't
     * given, but [`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) is true, `whitespace`
     * will default to `"pre"`. Note that this option doesn't influence
     * the way the node is rendered—that should be handled by `toDOM`
     * and/or styling.
     */
    whitespace?:
      | NodeSpec['whitespace']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['whitespace']
          editor?: Editor
        }) => NodeSpec['whitespace'])

    /**
     * Allows a **single** node to be set as linebreak equivalent (e.g. hardBreak).
     * When converting between block types that have whitespace set to "pre"
     * and don't support the linebreak node (e.g. codeBlock) and other block types
     * that do support the linebreak node (e.g. paragraphs) - this node will be used
     * as the linebreak instead of stripping the newline.
     *
     * See [linebreakReplacement](https://prosemirror.net/docs/ref/#model.NodeSpec.linebreakReplacement).
     */
    linebreakReplacement?:
      | NodeSpec['linebreakReplacement']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['linebreakReplacement']
          editor?: Editor
        }) => NodeSpec['linebreakReplacement'])

    /**
     * When enabled, enables both
     * [`definingAsContext`](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext) and
     * [`definingForContent`](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
     *
     * @default false
     * @example isolating: true
     */
    defining?:
      | NodeSpec['defining']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['defining']
          editor?: Editor
        }) => NodeSpec['defining'])

    /**
     * When enabled (default is false), the sides of nodes of this type
     * count as boundaries that regular editing operations, like
     * backspacing or lifting, won't cross. An example of a node that
     * should probably have this enabled is a table cell.
     */
    isolating?:
      | NodeSpec['isolating']
      | ((this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<NodeConfig<Options, Storage>>['isolating']
          editor?: Editor
        }) => NodeSpec['isolating'])

    /**
     * Associates DOM parser information with this node, which can be
     * used by [`DOMParser.fromSchema`](https://prosemirror.net/docs/ref/#model.DOMParser^fromSchema) to
     * automatically derive a parser. The `node` field in the rules is
     * implied (the name of this node will be filled in automatically).
     * If you supply your own parser, you do not need to also specify
     * parsing rules in your schema.
     *
     * @example parseHTML: [{ tag: 'div', attrs: { 'data-id': 'my-block' } }]
     */
    parseHTML?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<NodeConfig<Options, Storage>>['parseHTML']
      editor?: Editor
    }) => NodeSpec['parseDOM']

    /**
     * A description of a DOM structure. Can be either a string, which is
     * interpreted as a text node, a DOM node, which is interpreted as
     * itself, a `{dom, contentDOM}` object, or an array.
     *
     * An array describes a DOM element. The first value in the array
     * should be a string—the name of the DOM element, optionally prefixed
     * by a namespace URL and a space. If the second element is plain
     * object, it is interpreted as a set of attributes for the element.
     * Any elements after that (including the 2nd if it's not an attribute
     * object) are interpreted as children of the DOM elements, and must
     * either be valid `DOMOutputSpec` values, or the number zero.
     *
     * The number zero (pronounced “hole”) is used to indicate the place
     * where a node's child nodes should be inserted. If it occurs in an
     * output spec, it should be the only child element in its parent
     * node.
     *
     * @example toDOM: ['div[data-id="my-block"]', { class: 'my-block' }, 0]
     */
    renderHTML?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            parent: ParentConfig<NodeConfig<Options, Storage>>['renderHTML']
            editor?: Editor
          },
          props: {
            node: ProseMirrorNode
            HTMLAttributes: Record<string, any>
          },
        ) => DOMOutputSpec)
      | null

    /**
     * renders the node as text
     * @example renderText: () => 'foo
     */
    renderText?:
      | ((
          this: {
            name: string
            options: Options
            storage: Storage
            parent: ParentConfig<NodeConfig<Options, Storage>>['renderText']
            editor?: Editor
          },
          props: {
            node: ProseMirrorNode
            pos: number
            parent: ProseMirrorNode
            index: number
          },
        ) => string)
      | null

    /**
     * Add attributes to the node
     * @example addAttributes: () => ({ class: 'foo' })
     */
    addAttributes?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<NodeConfig<Options, Storage>>['addAttributes']
      editor?: Editor
    }) => Attributes | {}
  }
}

/**
 * The Node class is used to create custom node extensions.
 * @see https://tiptap.dev/api/extensions#create-a-new-extension
 */
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

    if (config.defaultOptions && Object.keys(config.defaultOptions).length > 0) {
      console.warn(
        `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`,
      )
    }

    // TODO: remove `addOptions` fallback
    this.options = this.config.defaultOptions

    if (this.config.addOptions) {
      this.options = callOrReturn(
        getExtensionField<AnyConfig['addOptions']>(this, 'addOptions', {
          name: this.name,
        }),
      )
    }

    this.storage = callOrReturn(
      getExtensionField<AnyConfig['addStorage']>(this, 'addStorage', {
        name: this.name,
        options: this.options,
      }),
    ) || {}
  }

  static create<O = any, S = any>(config: Partial<NodeConfig<O, S>> = {}) {
    return new Node<O, S>(config)
  }

  configure(options: Partial<Options> = {}) {
    // return a new instance so we can use the same extension
    // with different calls of `configure`
    const extension = this.extend<Options, Storage>({
      ...this.config,
      addOptions: () => {
        return mergeDeep(this.options as Record<string, any>, options) as Options
      },
    })

    // Always preserve the current name
    extension.name = this.name
    // Set the parent to be our parent
    extension.parent = this.parent

    return extension
  }

  extend<ExtendedOptions = Options, ExtendedStorage = Storage>(
    extendedConfig: Partial<NodeConfig<ExtendedOptions, ExtendedStorage>> = {},
  ) {
    const extension = new Node<ExtendedOptions, ExtendedStorage>(extendedConfig)

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name ? extendedConfig.name : extension.parent.name

    if (extendedConfig.defaultOptions && Object.keys(extendedConfig.defaultOptions).length > 0) {
      console.warn(
        `[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${extension.name}".`,
      )
    }

    extension.options = callOrReturn(
      getExtensionField<AnyConfig['addOptions']>(extension, 'addOptions', {
        name: extension.name,
      }),
    )

    extension.storage = callOrReturn(
      getExtensionField<AnyConfig['addStorage']>(extension, 'addStorage', {
        name: extension.name,
        options: extension.options,
      }),
    )

    return extension
  }
}
