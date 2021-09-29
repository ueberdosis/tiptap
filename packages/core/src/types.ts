import {
  Node as ProseMirrorNode,
  Mark as ProseMirrorMark,
  ParseOptions,
} from 'prosemirror-model'
import {
  EditorView,
  Decoration,
  NodeView,
  EditorProps,
} from 'prosemirror-view'
import { EditorState, Transaction } from 'prosemirror-state'
import { Extension } from './Extension'
import { Node } from './Node'
import { Mark } from './Mark'
import { Editor } from './Editor'
import {
  Commands,
  ExtensionConfig,
  NodeConfig,
  MarkConfig,
} from '.'

export type AnyConfig = ExtensionConfig | NodeConfig | MarkConfig
export type AnyExtension = Extension | Node | Mark
export type Extensions = AnyExtension[]

export type ParentConfig<T> = Partial<{
  [P in keyof T]: Required<T>[P] extends (...args: any) => any
    ? (...args: Parameters<Required<T>[P]>) => ReturnType<Required<T>[P]>
    : T[P]
}>

export type RemoveThis<T> = T extends (...args: any) => any
  ? (...args: Parameters<T>) => ReturnType<T>
  : T

export type MaybeReturnType<T> = T extends (...args: any) => any
  ? ReturnType<T>
  : T

export interface EditorEvents {
  beforeCreate: { editor: Editor }
  create: { editor: Editor }
  update: { editor: Editor, transaction: Transaction }
  selectionUpdate: { editor: Editor, transaction: Transaction }
  transaction: { editor: Editor, transaction: Transaction }
  focus: { editor: Editor, event: FocusEvent, transaction: Transaction }
  blur: { editor: Editor, event: FocusEvent, transaction: Transaction }
  destroy: void
}

export interface EditorOptions {
  element: Element,
  content: Content,
  extensions: Extensions,
  injectCSS: boolean,
  autofocus: FocusPosition,
  editable: boolean,
  editorProps: EditorProps,
  parseOptions: ParseOptions,
  enableInputRules: boolean,
  enablePasteRules: boolean,
  enableCoreExtensions: boolean,
  onBeforeCreate: (props: EditorEvents['beforeCreate']) => void,
  onCreate: (props: EditorEvents['create']) => void,
  onUpdate: (props: EditorEvents['update']) => void,
  onSelectionUpdate: (props: EditorEvents['selectionUpdate']) => void,
  onTransaction: (props: EditorEvents['transaction']) => void,
  onFocus: (props: EditorEvents['focus']) => void,
  onBlur: (props: EditorEvents['blur']) => void,
  onDestroy: (props: EditorEvents['destroy']) => void,
}

export type HTMLContent = string

export type JSONContent = {
  type: string,
  attrs?: Record<string, any>,
  content?: JSONContent[],
  marks?: {
    type: string,
    attrs?: Record<string, any>,
    [key: string]: any,
  }[],
  text?: string,
  [key: string]: any,
}

export type Content = HTMLContent | JSONContent | JSONContent[] | null

export type CommandProps = {
  editor: Editor,
  tr: Transaction,
  commands: SingleCommands,
  can: () => CanCommands,
  chain: () => ChainedCommands,
  state: EditorState,
  view: EditorView,
  dispatch: ((args?: any) => any) | undefined,
}

export type Command = (props: CommandProps) => boolean

export type CommandSpec = (...args: any[]) => Command

export type KeyboardShortcutCommand = (props: { editor: Editor }) => boolean

export type Attribute = {
  default: any,
  rendered?: boolean,
  renderHTML?: ((attributes: Record<string, any>) => Record<string, any> | null) | null,
  parseHTML?: ((element: HTMLElement) => any | null) | null,
  keepOnSplit: boolean,
}

export type Attributes = {
  [key: string]: Attribute,
}

export type ExtensionAttribute = {
  type: string,
  name: string,
  attribute: Required<Attribute>,
}

export type GlobalAttributes = {
  types: string[],
  attributes: {
    [key: string]: Attribute
  },
}[]

export type PickValue<T, K extends keyof T> = T[K]

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void)
  ? I
  : never

export type Diff<T extends keyof any, U extends keyof any> =
  ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T]

export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;

export type ValuesOf<T> = T[keyof T];

export type KeysWithTypeOf<T, Type> = ({ [P in keyof T]: T[P] extends Type ? P : never })[keyof T]

export type NodeViewProps = {
  editor: Editor,
  node: ProseMirrorNode,
  decorations: Decoration[],
  selected: boolean,
  extension: Node,
  getPos: () => number,
  updateAttributes: (attributes: Record<string, any>) => void,
  deleteNode: () => void,
}

export interface NodeViewRendererOptions {
  stopEvent: ((props: {
    event: Event
  }) => boolean) | null,
  ignoreMutation: ((props: {
    mutation: MutationRecord | { type: 'selection', target: Element }
  }) => boolean) | null,
}

export type NodeViewRendererProps = {
  editor: Editor,
  node: ProseMirrorNode,
  getPos: (() => number) | boolean,
  HTMLAttributes: Record<string, any>,
  decorations: Decoration[],
  extension: Node,
}

export type NodeViewRenderer = (props: NodeViewRendererProps) => (NodeView | {})

export type AnyCommands = Record<string, (...args: any[]) => Command>

export type UnionCommands<T = Command> = UnionToIntersection<ValuesOf<Pick<Commands<T>, KeysWithTypeOf<Commands<T>, {}>>>>

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

export type FocusPosition = 'start' | 'end' | number | boolean | null

export type Range = {
  from: number,
  to: number,
}

export type NodeRange = {
  node: ProseMirrorNode,
  from: number,
  to: number,
}

export type MarkRange = {
  mark: ProseMirrorMark,
  from: number,
  to: number,
}

export type Predicate = (node: ProseMirrorNode) => boolean

export type NodeWithPos = {
  node: ProseMirrorNode,
  pos: number,
}

export type TextSerializer = (props: {
  node: ProseMirrorNode,
  pos: number,
  parent: ProseMirrorNode,
  index: number,
}) => string
