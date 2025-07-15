import type { Mark as ProseMirrorMark, Node as ProseMirrorNode, ParseOptions, Slice } from '@tiptap/pm/model'
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
import type { Commands, ExtensionConfig, MarkConfig, NodeConfig } from './index.js'
import type { Mark } from './Mark.js'
import type { Node } from './Node.js'

export type AnyConfig = ExtensionConfig | NodeConfig | MarkConfig
export type AnyExtension = Extendable
export type Extensions = AnyExtension[]

export type ParentConfig<T> = Partial<{
  [P in keyof T]: Required<T>[P] extends (...args: any) => any
    ? (...args: Parameters<Required<T>[P]>) => ReturnType<Required<T>[P]>
    : T[P]
}>

export type Primitive = null | undefined | string | number | boolean | symbol | bigint

export type RemoveThis<T> = T extends (...args: any) => any ? (...args: Parameters<T>) => ReturnType<T> : T

export type MaybeReturnType<T> = T extends (...args: any) => any ? ReturnType<T> : T

export type MaybeThisParameterType<T> =
  Exclude<T, Primitive> extends (...args: any) => any ? ThisParameterType<Exclude<T, Primitive>> : any

export interface EditorEvents {
  beforeCreate: {
    /**
     * The editor instance
     */
    editor: Editor
  }
  create: {
    /**
     * The editor instance
     */
    editor: Editor
  }
  contentError: {
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
    editor: Editor
    /**
     * The transaction that caused the selection update
     */
    transaction: Transaction
  }
  beforeTransaction: {
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
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
    /**
     * The editor instance
     */
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
         * @note This can be a parent node of the deleted content
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

export type EnableRules = (AnyExtension | string)[] | boolean

export interface EditorOptions {
  /**
   * The element or selector to bind the editor to
   * If `null` is passed, the editor will not be mounted automatically
   * If a function is passed, it will be called with the editor's root element
   */
  element: Element | null
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
          | 'delete',
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
}

/**
 * The editor's content as HTML
 */
export type HTMLContent = string

/**
 * Loosely describes a JSON representation of a Prosemirror document or node
 */
export type JSONContent = {
  type?: string
  attrs?: Record<string, any>
  content?: JSONContent[]
  marks?: {
    type: string
    attrs?: Record<string, any>
    [key: string]: any
  }[]
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
> = Omit<NodeType<'doc', TDocAttributes, never, TContentType>, 'marks' | 'content'> & { content: TContentType }

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

export type Content = HTMLContent | JSONContent | JSONContent[] | null

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

export type Command = (props: CommandProps) => boolean

export type CommandSpec = (...args: any[]) => Command

export type KeyboardShortcutCommand = (props: { editor: Editor }) => boolean

export type Attribute = {
  default?: any
  validate?: string | ((value: any) => void)
  rendered?: boolean
  renderHTML?: ((attributes: Record<string, any>) => Record<string, any> | null) | null
  parseHTML?: ((element: HTMLElement) => any | null) | null
  keepOnSplit?: boolean
  isRequired?: boolean
}

export type Attributes = {
  [key: string]: Attribute
}

export type ExtensionAttribute = {
  type: string
  name: string
  attribute: Required<Omit<Attribute, 'validate'>> & Pick<Attribute, 'validate'>
}

export type GlobalAttributes = {
  /**
   * The node & mark types this attribute should be applied to.
   */
  types: string[]
  /**
   * The attributes to add to the node or mark types.
   */
  attributes: Record<string, Attribute | undefined>
}[]

export type PickValue<T, K extends keyof T> = T[K]

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type Diff<T extends keyof any, U extends keyof any> = ({ [P in T]: P } & {
  [P in U]: never
} & { [x: string]: never })[T]

export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U

export type ValuesOf<T> = T[keyof T]

export type KeysWithTypeOf<T, Type> = { [P in keyof T]: T[P] extends Type ? P : never }[keyof T]

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

export interface NodeViewProps extends NodeViewRendererProps {
  // TODO this type is not technically correct, but it's the best we can do for now since prosemirror doesn't expose the type of decorations
  decorations: readonly DecorationWithType[]
  selected: boolean
  updateAttributes: (attributes: Record<string, any>) => void
  deleteNode: () => void
}

export interface NodeViewRendererOptions {
  stopEvent: ((props: { event: Event }) => boolean) | null
  ignoreMutation: ((props: { mutation: ViewMutationRecord }) => boolean) | null
  contentDOMElementTag: string
}

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
  /**
   * The editor instance.
   */
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

export type NodeViewRenderer = (props: NodeViewRendererProps) => NodeView

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MarkViewProps extends MarkViewRendererProps {}

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
  /**
   * The editor instance.
   */
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

export type MarkViewRenderer<Props = MarkViewRendererProps> = (props: Props) => MarkView

export interface MarkViewRendererOptions {
  ignoreMutation: ((props: { mutation: ViewMutationRecord }) => boolean) | null
}

export type AnyCommands = Record<string, (...args: any[]) => Command>

export type UnionCommands<T = Command> = UnionToIntersection<
  ValuesOf<Pick<Commands<T>, KeysWithTypeOf<Commands<T>, object>>>
>

export type RawCommands = {
  [Item in keyof UnionCommands]: UnionCommands<Command>[Item]
}

export type SingleCommands = {
  [Item in keyof UnionCommands]: UnionCommands<boolean>[Item]
}

export type ChainedCommands = {
  [Item in keyof UnionCommands]: UnionCommands<ChainedCommands>[Item]
} & {
  run: () => boolean
}

export type CanCommands = SingleCommands & { chain: () => ChainedCommands }

export type FocusPosition = 'start' | 'end' | 'all' | number | boolean | null

export type Range = {
  from: number
  to: number
}

export type NodeRange = {
  node: ProseMirrorNode
  from: number
  to: number
}

export type MarkRange = {
  mark: ProseMirrorMark
  from: number
  to: number
}

export type Predicate = (node: ProseMirrorNode) => boolean

export type NodeWithPos = {
  node: ProseMirrorNode
  pos: number
}

export type TextSerializer = (props: {
  node: ProseMirrorNode
  pos: number
  parent: ProseMirrorNode
  index: number
  range: Range
}) => string

export type ExtendedRegExpMatchArray = RegExpMatchArray & {
  data?: Record<string, any>
}

export type Dispatch = ((args?: any) => any) | undefined
