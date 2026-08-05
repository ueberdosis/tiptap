import type {
  Mark as ProseMirrorMark,
  Node as ProseMirrorNode,
  ParseOptions,
  Slice,
} from '@tiptap/pm/model'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { Mappable, Transform } from '@tiptap/pm/transform'
import type {
  Decoration,
  DecorationAttrs,
  EditorProps,
  EditorView,
  MarkView,
  MarkViewConstructor,
  NodeView,
  NodeViewConstructor,
  ViewMutationRecord,
} from '@tiptap/pm/view'

import type { Editor } from './Editor.js'
import type { Extendable } from './Extendable.js'
import type { ExtensionConfig } from './Extension.js'
import type { GetUpdatedPositionResult, MappablePosition } from './helpers/MappablePosition.js'
import type { Mark, MarkConfig } from './Mark.js'
import type { Node, NodeConfig } from './Node.js'

/**
 * The config of any extension, node or mark.
 */
export type AnyConfig = ExtensionConfig | NodeConfig | MarkConfig
/**
 * Any extension, node or mark.
 */
export type AnyExtension = Extendable
/**
 * A list of extensions to load into the editor.
 */
export type Extensions = AnyExtension[]

/**
 * The config an extension inherits, so `this.parent` can call the version it overrides.
 */
export type ParentConfig<T> = Partial<{
  [P in keyof T]: Required<T>[P] extends (...args: any) => any
    ? (...args: Parameters<Required<T>[P]>) => ReturnType<Required<T>[P]>
    : T[P]
}>

/**
 * Any value that is not an object.
 */
export type Primitive = null | undefined | string | number | boolean | symbol | bigint

/**
 * Drops the `this` parameter from a function type.
 */
export type RemoveThis<T> = T extends (...args: any) => any
  ? (...args: Parameters<T>) => ReturnType<T>
  : T

/**
 * The return type of `T` if it is a function, otherwise `T` itself.
 */
export type MaybeReturnType<T> = T extends (...args: any) => any ? ReturnType<T> : T

/**
 * The `this` type of `T` if it is a function, otherwise `any`.
 */
export type MaybeThisParameterType<T> =
  Exclude<T, Primitive> extends (...args: any) => any
    ? ThisParameterType<Exclude<T, Primitive>>
    : any

/**
 * Every event the editor emits, and the payload each one carries.
 * @see https://tiptap.dev/docs/editor/api/events
 */
export interface EditorEvents {
  mount: {
    editor: Editor
  }
  unmount: {
    editor: Editor
  }
  beforeCreate: {
    editor: Editor
  }
  create: {
    editor: Editor
  }
  contentError: {
    editor: Editor
    /**
     * The error that occurred while parsing the content
     */
    error: Error
    /**
     * If called, will re-initialize the editor with the collaboration extension removed.
     * This will prevent syncing back deletions of content not present in the current schema.
     */
    disableCollaboration: () => void
  }
  update: {
    editor: Editor
    /**
     * The transaction that caused the update
     */
    transaction: Transaction
    /**
     * Appended transactions that were added to the initial transaction by plugins
     */
    appendedTransactions: Transaction[]
  }
  selectionUpdate: {
    editor: Editor
    /**
     * The transaction that caused the selection update
     */
    transaction: Transaction
  }
  beforeTransaction: {
    editor: Editor
    /**
     * The transaction that will be applied
     */
    transaction: Transaction
    /**
     * The next state of the editor after the transaction is applied
     */
    nextState: EditorState
  }
  transaction: {
    editor: Editor
    /**
     * The initial transaction
     */
    transaction: Transaction
    /**
     * Appended transactions that were added to the initial transaction by plugins
     */
    appendedTransactions: Transaction[]
  }
  focus: {
    editor: Editor
    /**
     * The focus event
     */
    event: FocusEvent
    /**
     * The transaction that caused the focus
     */
    transaction: Transaction
  }
  blur: {
    editor: Editor
    /**
     * The focus event
     */
    event: FocusEvent
    /**
     * The transaction that caused the blur
     */
    transaction: Transaction
  }
  destroy: void
  paste: {
    editor: Editor
    /**
     * The clipboard event
     */
    event: ClipboardEvent
    /**
     * The slice that was pasted
     */
    slice: Slice
  }
  drop: {
    editor: Editor
    /**
     * The drag event
     */
    event: DragEvent
    /**
     * The slice that was dropped
     */
    slice: Slice
    /**
     * Whether the content was moved (true) or copied (false)
     */
    moved: boolean
  }
  delete: {
    editor: Editor
    /**
     * The range of the deleted content (before the deletion)
     */
    deletedRange: Range
    /**
     * The new range of positions of where the deleted content was in the new document (after the deletion)
     */
    newRange: Range
    /**
     * The transaction that caused the deletion
     */
    transaction: Transaction
    /**
     * The combined transform (including all appended transactions) that caused the deletion
     */
    combinedTransform: Transform
    /**
     * Whether the deletion was partial (only a part of this content was deleted)
     */
    partial: boolean
    /**
     * This is the start position of the mark in the document (before the deletion)
     */
    from: number
    /**
     * This is the end position of the mark in the document (before the deletion)
     */
    to: number
  } & (
    | {
        /**
         * The content that was deleted
         */
        type: 'node'
        /**
         * The node which the deletion occurred in
         * @remarks This can be a parent node of the deleted content
         */
        node: ProseMirrorNode
        /**
         * The new start position of the node in the document (after the deletion)
         */
        newFrom: number
        /**
         * The new end position of the node in the document (after the deletion)
         */
        newTo: number
      }
    | {
        /**
         * The content that was deleted
         */
        type: 'mark'
        /**
         * The mark that was deleted
         */
        mark: ProseMirrorMark
      }
  )
}

/**
 * Props passed to the `dispatchTransaction` hook in extensions.
 */
export type DispatchTransactionProps = {
  /**
   * The transaction that is about to be dispatched.
   */
  transaction: Transaction
  /**
   * A function that should be called to pass the transaction down to the next extension
   * (or eventually to the editor).
   *
   * @param transaction The transaction to dispatch
   */
  next: (transaction: Transaction) => void
}

/**
 * Which extensions may run input or paste rules. `true` for all, `false` for none.
 */
export type EnableRules = (AnyExtension | string)[] | boolean

/**
 * Everything you can pass to `new Editor()`.
 * @see https://tiptap.dev/docs/editor/api/editor
 */
export interface EditorOptions {
  /**
   * The element to bind the editor to:
   * - If an `Element` is passed, the editor will be mounted appended to that element
   * - If `null` is passed, the editor will not be mounted automatically
   * - If an object with a `mount` property is passed, the editor will be mounted to that element
   * - If a function is passed, it will be called with the editor's element, which should place the editor within the document
   */
  element: Element | { mount: HTMLElement } | ((editor: HTMLElement) => void) | null
  /**
   * The content of the editor (HTML, JSON, or a JSON array)
   */
  content: Content
  /**
   * The extensions to use
   */
  extensions: Extensions
  /**
   * Whether to inject base CSS styles
   */
  injectCSS: boolean
  /**
   * A nonce to use for CSP while injecting styles
   */
  injectNonce: string | undefined
  /**
   * The editor's initial focus position
   */
  autofocus: FocusPosition
  /**
   * Whether the editor is editable
   */
  editable: boolean
  /**
   * The default text direction for all content in the editor.
   * When set to 'ltr' or 'rtl', all nodes will have the corresponding dir attribute.
   * When set to 'auto', the dir attribute will be set based on content detection.
   * When undefined, no dir attribute will be added.
   * @default undefined
   */
  textDirection?: 'ltr' | 'rtl' | 'auto'
  /**
   * The editor's props
   */
  editorProps: EditorProps
  /**
   * The editor's content parser options
   */
  parseOptions: ParseOptions
  /**
   * The editor's core extension options
   */
  coreExtensionOptions?: {
    clipboardTextSerializer?: {
      blockSeparator?: string
    }
    /**
     * Options for the `tabindex` core extension.
     */
    tabindex?: {
      /**
       * The value for the `tabindex` attribute on the editor element.
       */
      value?: string
    }
    delete?: {
      /**
       * Whether the `delete` extension should be called asynchronously to avoid blocking the editor while processing deletions
       * @default true deletion events are called asynchronously
       */
      async?: boolean
      /**
       * Allows filtering the transactions that are processed by the `delete` extension.
       * If the function returns `true`, the transaction will be ignored.
       */
      filterTransaction?: (transaction: Transaction) => boolean
    }
  }
  /**
   * Whether to enable input rules behavior
   */
  enableInputRules: EnableRules
  /**
   * Whether to enable paste rules behavior
   */
  enablePasteRules: EnableRules
  /**
   * Determines whether core extensions are enabled.
   *
   * If set to `false`, all core extensions will be disabled.
   * To disable specific core extensions, provide an object where the keys are the extension names and the values are `false`.
   * Extensions not listed in the object will remain enabled.
   *
   * @example
   * // Disable all core extensions
   * enabledCoreExtensions: false
   *
   * @example
   * // Disable only the keymap core extension
   * enabledCoreExtensions: { keymap: false }
   *
   * @default true
   */
  enableCoreExtensions?:
    | boolean
    | Partial<
        Record<
          | 'editable'
          | 'clipboardTextSerializer'
          | 'commands'
          | 'focusEvents'
          | 'keymap'
          | 'tabindex'
          | 'drop'
          | 'paste'
          | 'delete'
          | 'textDirection',
          false
        >
      >
  /**
   * If `true`, the editor will check the content for errors on initialization.
   * Emitting the `contentError` event if the content is invalid.
   * Which can be used to show a warning or error message to the user.
   * @default false
   */
  enableContentCheck: boolean
  /**
   * If `true`, the editor will emit the `contentError` event if invalid content is
   * encountered but `enableContentCheck` is `false`. This lets you preserve the
   * invalid editor content while still showing a warning or error message to
   * the user.
   *
   * @default false
   */
  emitContentError: boolean
  /**
   * Called before the editor is constructed.
   */
  onBeforeCreate: (props: EditorEvents['beforeCreate']) => void
  /**
   * Called after the editor is constructed.
   */
  onCreate: (props: EditorEvents['create']) => void
  /**
   * Called when the editor is mounted.
   */
  onMount: (props: EditorEvents['mount']) => void
  /**
   * Called when the editor is unmounted.
   */
  onUnmount: (props: EditorEvents['unmount']) => void
  /**
   * Called when the editor encounters an error while parsing the content.
   * Only enabled if `enableContentCheck` is `true`.
   */
  onContentError: (props: EditorEvents['contentError']) => void
  /**
   * Called when the editor's content is updated.
   */
  onUpdate: (props: EditorEvents['update']) => void
  /**
   * Called when the editor's selection is updated.
   */
  onSelectionUpdate: (props: EditorEvents['selectionUpdate']) => void
  /**
   * Called after a transaction is applied to the editor.
   */
  onTransaction: (props: EditorEvents['transaction']) => void
  /**
   * Called on focus events.
   */
  onFocus: (props: EditorEvents['focus']) => void
  /**
   * Called on blur events.
   */
  onBlur: (props: EditorEvents['blur']) => void
  /**
   * Called when the editor is destroyed.
   */
  onDestroy: (props: EditorEvents['destroy']) => void
  /**
   * Called when content is pasted into the editor.
   */
  onPaste: (e: ClipboardEvent, slice: Slice) => void
  /**
   * Called when content is dropped into the editor.
   */
  onDrop: (e: DragEvent, slice: Slice, moved: boolean) => void
  /**
   * Called when content is deleted from the editor.
   */
  onDelete: (props: EditorEvents['delete']) => void
  /**
   * Whether to enable extension-level dispatching of transactions.
   * If `false`, extensions cannot define their own `dispatchTransaction` hook.
   *
   * @default true
   * @example
   * new Editor({
   *   enableExtensionDispatchTransaction: false,
   * })
   */
  enableExtensionDispatchTransaction?: boolean
}

/**
 * The editor's content as HTML
 */
export type HTMLContent = string

/**
 * A Tiptap JSON node or document. Tiptap JSON is the standard format for
 * storing and manipulating Tiptap content. It is equivalent to the JSON
 * representation of a Prosemirror node.
 *
 * Tiptap JSON documents are trees of nodes. The root node is usually of type
 * `doc`. Nodes can have other nodes as children. Nodes can also have marks and
 * attributes. Text nodes (nodes with type `text`) have a `text` property and no
 * children.
 *
 * @example
 * ```ts
 * const content: JSONContent = {
 *   type: 'doc',
 *   content: [
 *     {
 *       type: 'paragraph',
 *       content: [
 *         {
 *           type: 'text',
 *           text: 'Hello ',
 *         },
 *         {
 *           type: 'text',
 *           text: 'world',
 *           marks: [{ type: 'bold' }],
 *         },
 *       ],
 *     },
 *   ],
 * }
 * ```
 */
export type JSONContent = {
  /**
   * The type of the node
   */
  type?: string
  /**
   * The attributes of the node. Attributes can have any JSON-serializable value.
   */
  attrs?: Record<string, any> | undefined
  /**
   * The children of the node. A node can have other nodes as children.
   */
  content?: JSONContent[]
  /**
   * A list of marks of the node. Inline nodes can have marks.
   */
  marks?: {
    /**
     * The type of the mark
     */
    type: string
    /**
     * The attributes of the mark. Attributes can have any JSON-serializable value.
     */
    attrs?: Record<string, any>
    [key: string]: any
  }[]
  /**
   * The text content of the node. This property is only present on text nodes
   * (i.e. nodes with `type: 'text'`).
   *
   * Text nodes cannot have children, but they can have marks.
   */
  text?: string
  [key: string]: any
}

/**
 * A mark type is either a JSON representation of a mark or a Prosemirror mark instance
 */
export type MarkType<
  Type extends string | { name: string } = any,
  TAttributes extends undefined | Record<string, any> = any,
> = {
  type: Type
  attrs: TAttributes
}

/**
 * A node type is either a JSON representation of a node or a Prosemirror node instance
 */
export type NodeType<
  Type extends string | { name: string } = any,
  TAttributes extends undefined | Record<string, any> = any,
  NodeMarkType extends MarkType = any,
  TContent extends (NodeType | TextType)[] = any,
> = {
  type: Type
  attrs: TAttributes
  content?: TContent
  marks?: NodeMarkType[]
}

/**
 * A node type is either a JSON representation of a doc node or a Prosemirror doc node instance
 */
export type DocumentType<
  TDocAttributes extends Record<string, any> | undefined = Record<string, any>,
  TContentType extends NodeType[] = NodeType[],
> = Omit<NodeType<'doc', TDocAttributes, never, TContentType>, 'marks' | 'content'> & {
  content: TContentType
}

/**
 * A node type is either a JSON representation of a text node or a Prosemirror text node instance
 */
export type TextType<TMarkType extends MarkType = MarkType> = {
  type: 'text'
  text: string
  marks: TMarkType[]
}

/**
 * Describes the output of a `renderHTML` function in prosemirror
 * @see https://prosemirror.net/docs/ref/#model.DOMOutputSpec
 */
export type DOMOutputSpecArray =
  | [string]
  | [string, Record<string, any>]
  | [string, 0]
  | [string, Record<string, any>, 0]
  | [string, Record<string, any>, DOMOutputSpecArray | 0]
  | [string, DOMOutputSpecArray]

/**
 * Editor content as HTML, as JSON, or `null` for an empty document.
 */
export type Content = HTMLContent | JSONContent | JSONContent[] | null

/**
 * What every command receives: the editor, the transaction, and the other commands.
 */
export type CommandProps = {
  editor: Editor
  tr: Transaction
  commands: SingleCommands
  can: () => CanCommands
  chain: () => ChainedCommands
  state: EditorState
  view: EditorView
  dispatch: ((args?: any) => any) | undefined
}

/**
 * A single command. Returns `true` when it did something.
 */
export type Command = (props: CommandProps) => boolean

/**
 * A function that takes arguments and returns a `Command`.
 */
export type CommandSpec = (...args: any[]) => Command

/**
 * Runs when a keyboard shortcut fires. Return `true` to stop other handlers.
 */
export type KeyboardShortcutCommand = (props: { editor: Editor }) => boolean

/**
 * How one node or mark attribute is stored, parsed and rendered.
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#attributes
 */
export type Attribute = {
  /**
   * The value to use when the attribute is missing.
   */
  default?: any

  /**
   * Checks the value and throws when it is not allowed. Pass a type name like `'string'`
   * for the built-in check, or your own function.
   */
  validate?: string | ((value: any) => void)

  /**
   * Whether the attribute ends up in the HTML.
   * @default true
   */
  rendered?: boolean

  /**
   * Turns the attribute into HTML attributes. Return `null` to render nothing.
   */
  renderHTML?: ((attributes: Record<string, any>) => Record<string, any> | null) | null

  /**
   * Reads the attribute back from an HTML element.
   */
  parseHTML?: ((element: HTMLElement) => any | null) | null

  /**
   * Whether the new node keeps this attribute when the node is split.
   * @default false
   */
  keepOnSplit?: boolean

  /**
   * Whether the attribute must have a value.
   * @default false
   */
  isRequired?: boolean
}

/**
 * A set of attributes, keyed by name.
 */
export type Attributes = {
  [key: string]: Attribute
}

/**
 * An attribute after the editor has resolved it and knows which type it belongs to.
 */
export type ExtensionAttribute = {
  type: string
  name: string
  attribute: Required<Omit<Attribute, 'validate'>> & Pick<Attribute, 'validate'>
}

/**
 * Attributes added to several node or mark types at once.
 */
export type GlobalAttributes = {
  /**
   * The node & mark types this attribute should be applied to.
   * Can be a specific array of type names, or a shorthand string:
   * - `'*'` applies to all nodes (excluding text) and all marks
   * - `'nodes'` applies to all nodes (excluding the built-in text node)
   * - `'marks'` applies to all marks
   * - `string[]` applies to specific node/mark types by name
   * @example
   * types: '*'                                    // All nodes and marks
   * types: 'nodes'                                // All nodes
   * types: 'marks'                                // All marks
   * types: ['heading', 'paragraph']               // Specific types
   */
  types: string[] | 'nodes' | 'marks' | '*'
  /**
   * The attributes to add to the node or mark types.
   */
  attributes: Record<string, Attribute | undefined>
}[]

/**
 * The type of property `K` on `T`.
 */
export type PickValue<T, K extends keyof T> = T[K]

/**
 * Turns a union like `A | B` into an intersection like `A & B`.
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

/**
 * The keys in `T` that are not in `U`.
 */
export type Diff<T extends keyof any, U extends keyof any> = ({ [P in T]: P } & {
  [P in U]: never
} & { [x: string]: never })[T]

/**
 * Replaces the properties of `T` that also exist in `U`.
 */
export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U

/**
 * A union of all property types in `T`.
 */
export type ValuesOf<T> = T[keyof T]

/**
 * The keys of `T` whose value is assignable to `Type`.
 */
export type KeysWithTypeOf<T, Type> = { [P in keyof T]: T[P] extends Type ? P : never }[keyof T]

/**
 * A DOM node. Aliased so the type also works outside the browser.
 */
export type DOMNode = InstanceType<typeof window.Node>

/**
 * prosemirror-view does not export the `type` property of `Decoration`.
 * So, this defines the `DecorationType` interface to include the `type` property.
 */
export interface DecorationType {
  spec: any
  map(mapping: Mappable, span: Decoration, offset: number, oldOffset: number): Decoration | null
  valid(node: Node, span: Decoration): boolean
  eq(other: DecorationType): boolean
  destroy(dom: DOMNode): void
  readonly attrs: DecorationAttrs
}

/**
 * prosemirror-view does not export the `type` property of `Decoration`.
 * This adds the `type` property to the `Decoration` type.
 */
export type DecorationWithType = Decoration & {
  type: DecorationType
}

/**
 * What a node view component receives.
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views
 */
export interface NodeViewProps extends NodeViewRendererProps {
  // TODO this type is not technically correct, but it's the best we can do for now since prosemirror doesn't expose the type of decorations
  decorations: readonly DecorationWithType[]
  selected: boolean
  updateAttributes: (attributes: Record<string, any>) => void
  deleteNode: () => void
}

/**
 * Settings that control how a node view behaves.
 */
export interface NodeViewRendererOptions {
  stopEvent: ((props: { event: Event }) => boolean) | null
  ignoreMutation: ((props: { mutation: ViewMutationRecord }) => boolean) | null
  contentDOMElementTag: string
  /**
   * When `true`, the `selected` prop also becomes `true` if a `TextSelection`
   * is fully inside the node's range (e.g. the cursor is placed within the
   * node's content), not only when there is a `NodeSelection` on the node.
   * Defaults to `false` to preserve existing behavior.
   */
  selectedOnTextSelection?: boolean
  /**
   * When `true`, the component re-renders on every position shift so calls
   * to `getPos()` stay current in render output.
   * Without this option, `getPos()` is still always current for imperative
   * use (click handlers, commands) — it only becomes stale when directly
   * rendered in JSX or used in reactive template expressions.
   * @default false
   */
  trackNodeViewPosition?: boolean
}

/**
 * What the editor hands to a node view when it creates one.
 */
export interface NodeViewRendererProps {
  // pass-through from prosemirror
  /**
   * The node that is being rendered.
   */
  node: Parameters<NodeViewConstructor>[0]
  /**
   * The editor's view.
   */
  view: Parameters<NodeViewConstructor>[1]
  /**
   * A function that can be called to get the node's current position in the document.
   */
  getPos: Parameters<NodeViewConstructor>[2]
  /**
   * is an array of node or inline decorations that are active around the node.
   * They are automatically drawn in the normal way, and you will usually just want to ignore this, but they can also be used as a way to provide context information to the node view without adding it to the document itself.
   */
  decorations: Parameters<NodeViewConstructor>[3]
  /**
   * holds the decorations for the node's content. You can safely ignore this if your view has no content or a contentDOM property, since the editor will draw the decorations on the content.
   * But if you, for example, want to create a nested editor with the content, it may make sense to provide it with the inner decorations.
   */
  innerDecorations: Parameters<NodeViewConstructor>[4]
  // tiptap-specific
  editor: Editor
  /**
   * The extension that is responsible for the node.
   */
  extension: Node
  /**
   * The HTML attributes that should be added to the node's DOM element.
   */
  HTMLAttributes: Record<string, any>
}

/**
 * Creates the node view for a node.
 */
export type NodeViewRenderer = (props: NodeViewRendererProps) => NodeView

/**
 * What a mark view component receives.
 */
// oxlint-disable-next-lineno-empty-object-type
export interface MarkViewProps extends MarkViewRendererProps {}

/**
 * What the editor hands to a mark view when it creates one.
 */
export interface MarkViewRendererProps {
  // pass-through from prosemirror
  /**
   * The node that is being rendered.
   */
  mark: Parameters<MarkViewConstructor>[0]
  /**
   * The editor's view.
   */
  view: Parameters<MarkViewConstructor>[1]
  /**
   * indicates whether the mark's content is inline
   */
  inline: Parameters<MarkViewConstructor>[2]
  // tiptap-specific
  editor: Editor
  /**
   * The extension that is responsible for the mark.
   */
  extension: Mark
  /**
   * The HTML attributes that should be added to the mark's DOM element.
   */
  HTMLAttributes: Record<string, any>

  updateAttributes: (attrs: Record<string, any>) => void
}

/**
 * Creates the mark view for a mark.
 */
export type MarkViewRenderer<Props = MarkViewRendererProps> = (props: Props) => MarkView

/**
 * Settings that control how a mark view behaves.
 */
export interface MarkViewRendererOptions {
  ignoreMutation: ((props: { mutation: ViewMutationRecord }) => boolean) | null
}

/**
 * Any set of commands, before the editor has typed them.
 */
export type AnyCommands = Record<string, (...args: any[]) => Command>

/**
 * Every command from every loaded extension, merged into one type.
 */
export type UnionCommands<T = Command> = UnionToIntersection<
  ValuesOf<Pick<Commands<T>, KeysWithTypeOf<Commands<T>, object>>>
>

/**
 * The commands as extensions define them, returning a `Command`.
 */
export type RawCommands = {
  [Item in keyof UnionCommands]: UnionCommands<Command>[Item]
}

/**
 * The commands on `editor.commands`. Each runs at once and returns a boolean.
 */
export type SingleCommands = {
  [Item in keyof UnionCommands]: UnionCommands<boolean>[Item]
}

/**
 * The commands on `editor.chain()`. Each returns the chain, so calls can follow each other.
 * @example editor.chain().focus().toggleBold().run()
 */
export type ChainedCommands = {
  [Item in keyof UnionCommands]: UnionCommands<ChainedCommands>[Item]
} & {
  run: () => boolean
}

/**
 * The commands on `editor.can()`. Each reports whether it would work, without changing anything.
 */
export type CanCommands = SingleCommands & { chain: () => ChainedCommands }

/**
 * Where to place the cursor when focusing. `true` keeps the current position.
 */
export type FocusPosition = 'start' | 'end' | 'all' | number | boolean | null

/**
 * A span between two document positions.
 */
export type Range = {
  from: number
  to: number
}

/**
 * A node together with the span it covers.
 */
export type NodeRange = {
  node: ProseMirrorNode
  from: number
  to: number
}

/**
 * A mark together with the span it covers.
 */
export type MarkRange = {
  mark: ProseMirrorMark
  from: number
  to: number
}

/**
 * Tests a node and returns whether it matches.
 */
export type Predicate = (node: ProseMirrorNode) => boolean

/**
 * A node together with its position in the document.
 */
export type NodeWithPos = {
  node: ProseMirrorNode
  pos: number
}

/**
 * Turns a node into plain text, used when copying to the clipboard.
 */
export type TextSerializer = (props: {
  node: ProseMirrorNode
  pos: number
  parent: ProseMirrorNode
  index: number
  range: Range
}) => string

/**
 * A regex match that input and paste rules can attach extra data to.
 */
export type ExtendedRegExpMatchArray = RegExpMatchArray & {
  data?: Record<string, any>
}

/**
 * Applies a transaction. When it is `undefined` the command should only report whether it can run.
 */
export type Dispatch = ((args?: any) => any) | undefined

/** Markdown related types */

// Shared markdown-related types for the MarkdownManager and extensions.
/**
 * One token from the markdown parser.
 */
export type MarkdownToken = {
  type?: string
  raw?: string
  text?: string
  tokens?: MarkdownToken[]
  depth?: number
  items?: MarkdownToken[]
  [key: string]: any
}

/**
 * Helpers an extension can use while parsing markdown.
 */
export type MarkdownHelpers = {
  // When used during parsing these helpers return JSON-like node objects
  // (not ProseMirror Node instances). Use `any` to represent that shape.
  parseInline: (tokens: MarkdownToken[]) => any[]
  /**
   * Render children. The second argument may be a legacy separator string
   * or a RenderContext (preferred).
   */
  renderChildren: (node: Node[] | Node, ctxOrSeparator?: RenderContext | string) => string
  text: (token: MarkdownToken) => any
}

/**
 * Helpers specifically for parsing markdown tokens into Tiptap JSON.
 * These are provided to extension parse handlers.
 */
export type MarkdownParseHelpers = {
  /** Parse an array of inline tokens into text nodes with marks */
  parseInline: (tokens: MarkdownToken[]) => JSONContent[]
  /** Tokenize source text as inline markdown when supported by the markdown parser */
  tokenizeInline?: (src: string) => MarkdownToken[]
  /** Parse an array of block-level tokens */
  parseChildren: (tokens: MarkdownToken[]) => JSONContent[]
  /** Parse block-level tokens while preserving implicit empty paragraphs from blank lines */
  parseBlockChildren?: (tokens: MarkdownToken[]) => JSONContent[]
  /** Create a text node with optional marks */
  createTextNode: (text: string, marks?: Array<{ type: string; attrs?: any }>) => JSONContent
  /** Create any node type with attributes and content */
  createNode: (type: string, attrs?: any, content?: JSONContent[]) => JSONContent
  /** Apply a mark to content (used for inline marks like bold, italic) */
  applyMark: (
    markType: string,
    content: JSONContent[],
    attrs?: any,
  ) => { mark: string; content: JSONContent[]; attrs?: any }
}

/**
 * Full runtime helpers object provided by MarkdownManager to handlers.
 * This includes the small author-facing helpers plus internal helpers
 * that can be useful for advanced handlers.
 */
export type FullMarkdownHelpers = MarkdownHelpers & {
  // parseChildren returns JSON-like nodes when invoked during parsing.
  parseChildren: (tokens: MarkdownToken[]) => any[]
  getExtension: (name: string) => any
  // createNode returns a JSON-like node during parsing; render-time helpers
  // may instead work with real ProseMirror Node instances.
  createNode: (type: string, attrs?: any, content?: any[]) => any
  /** Current render context when calling renderers; undefined during parse. */
  currentContext?: RenderContext
  /** Indent a multi-line string according to the provided RenderContext. */
  indent: (text: string, ctx?: RenderContext) => string
  /** Return the indent string for a given level (e.g. '  ' or '\t'). */
  getIndentString: (level?: number) => string
}

export default MarkdownHelpers

/**
 * Return shape for parser-level `parse` handlers.
 * - a single JSON-like node
 * - an array of JSON-like nodes
 * - or a `{ mark: string, content: JSONLike[] }` shape to apply a mark
 */
export type MarkdownParseResult =
  | JSONContent
  | JSONContent[]
  | { mark: string; content: JSONContent[]; attrs?: any }

/**
 * Where a node sits while markdown is rendered, so a renderer can adapt its output.
 */
export type RenderContext = {
  index: number
  level: number
  meta?: Record<string, any>
  parentType?: string | null
  previousNode?: JSONContent | null
}

/** Extension contract for markdown parsing/serialization. */
export interface MarkdownExtensionSpec {
  /** Token name used for parsing (e.g., 'codespan', 'code', 'strong') */
  tokenName?: string
  /** Node/mark name used for rendering (typically the extension name) */
  nodeName?: string
  parseMarkdown?: (token: MarkdownToken, helpers: MarkdownParseHelpers) => MarkdownParseResult
  renderMarkdown?: (node: any, helpers: MarkdownRendererHelpers, ctx: RenderContext) => string
  isIndenting?: boolean
  htmlReopen?: {
    open: string
    close: string
  }
  /** Custom tokenizer for marked.js to handle non-standard markdown syntax */
  tokenizer?: MarkdownTokenizer
}

/**
 * Configuration object passed to custom marked.js tokenizers
 */
export type MarkdownLexerConfiguration = {
  /**
   * Can be used to transform source text into inline tokens - useful while tokenizing child tokens.
   * @param src
   * @returns Array of inline tokens
   */
  inlineTokens: (src: string) => MarkdownToken[]

  /**
   * Can be used to transform source text into block-level tokens - useful while tokenizing child tokens.
   * @param src
   * @returns Array of block-level tokens
   */
  blockTokens: (src: string) => MarkdownToken[]
}

/** Custom tokenizer function for marked.js extensions */
export type MarkdownTokenizer = {
  /** Token name this tokenizer creates */
  name: string
  /** Priority level for tokenizer ordering (higher = earlier) */
  level?: 'block' | 'inline'
  /** A string to look for or a function that returns the start index of the token in the source string */
  start?: string | ((src: string) => number)
  /** Function that attempts to parse custom syntax from start of text */
  tokenize: (
    src: string,
    tokens: MarkdownToken[],
    lexer: MarkdownLexerConfiguration,
  ) => MarkdownToken | undefined | void
}

/**
 * Helpers an extension can use while rendering markdown.
 */
export type MarkdownRendererHelpers = {
  /**
   * Render children nodes to a markdown string, optionally separated by a string.
   * @param nodes The node or array of nodes to render
   * @param separator An optional separator string (legacy) or RenderContext
   * @returns The rendered markdown string
   */
  renderChildren: (nodes: JSONContent | JSONContent[], separator?: string) => string

  /** Render a single child node with its sibling index preserved */
  renderChild?: (node: JSONContent, index: number) => string

  /**
   * Render a text token to a markdown string
   * @param prefix The prefix to add before the content
   * @param content The content to wrap
   * @returns The wrapped content
   */
  wrapInBlock: (prefix: string, content: string) => string

  /**
   * Indent a markdown string according to the provided RenderContext
   * @param content The content to indent
   * @returns The indented content
   */
  indent: (content: string) => string
}

/**
 * Extra utilities the editor exposes to extensions.
 */
export type Utils = {
  /**
   * Returns the new position after applying a transaction.
   *
   * @param position The position to update. A MappablePosition instance.
   * @param transaction The transaction to apply.
   * @returns The new position after applying the transaction.
   *
   * @example
   * const position = editor.utils.createMappablePosition(10)
   * const {position, mapResult} = editor.utils.getUpdatedPosition(position, transaction)
   */
  getUpdatedPosition: (
    position: MappablePosition,
    transaction: Transaction,
  ) => GetUpdatedPositionResult

  /**
   * Creates a MappablePosition from a position number. A mappable position can be used to track the
   * next position after applying a transaction.
   *
   * @param position The position (as a number) where the MappablePosition will be created.
   * @returns A new MappablePosition instance at the given position.
   *
   * @example
   * const position = editor.utils.createMappablePosition(10)
   */
  createMappablePosition: (position: number) => MappablePosition
}

/**
 * Extend this interface to add your own commands to the editor.
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#commands
 */
// oxlint-disable-next-line no-unused-vars
export interface Commands<ReturnType = any> {}

/**
 * Extend this interface to type the storage your extension keeps on the editor.
 * @see https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#storage
 */
export interface Storage {}
