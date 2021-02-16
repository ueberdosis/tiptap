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
import { Commands } from '.'

export { Commands }

export type Extensions = (Extension | Node | Mark)[]

export interface EditorOptions {
  element: Element,
  content: EditorContent,
  extensions: Extensions,
  injectCSS: boolean,
  autofocus: FocusPosition,
  editable: boolean,
  editorProps: EditorProps,
  parseOptions: ParseOptions,
  enableInputRules: boolean,
  enablePasteRules: boolean,
  onCreate: () => void,
  onUpdate: () => void,
  onSelection: () => void,
  onTransaction: (props: { transaction: Transaction }) => void,
  onFocus: (props: { event: FocusEvent }) => void,
  onBlur: (props: { event: FocusEvent }) => void,
  onDestroy: () => void,
}

export type EditorContent = string | JSON | null

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

export type Attribute = {
  default: any,
  rendered?: boolean,
  renderHTML?: ((attributes: { [key: string]: any }) => { [key: string]: any } | null) | null,
  parseHTML?: ((element: HTMLElement) => { [key: string]: any } | null) | null,
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

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I)=>void)
  ? I
  : never

export type Diff<T extends keyof any, U extends keyof any> =
  ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T]

export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;

export type AnyObject = {
  [key: string]: any
}

export type ValuesOf<T> = T[keyof T];

export type KeysWithTypeOf<T, Type> = ({[P in keyof T]: T[P] extends Type ? P : never })[keyof T]

export type NodeViewRendererProps = {
  editor: Editor,
  node: ProseMirrorNode,
  getPos: (() => number) | boolean,
  HTMLAttributes: { [key: string]: any },
  decorations: Decoration[],
  extension: Node,
}

export type NodeViewRenderer = (props: NodeViewRendererProps) => (NodeView | {})

export type UnionCommands = UnionToIntersection<ValuesOf<Pick<Commands, KeysWithTypeOf<Commands, {}>>>>

export type RawCommands = {
  [Item in keyof UnionCommands]: UnionCommands[Item] extends (...args: any[]) => any
  ? (...args: Parameters<UnionCommands[Item]>) => Command
  : never
}

export type SingleCommands = {
  [Item in keyof RawCommands]: RawCommands[Item] extends (...args: any[]) => any
  ? (...args: Parameters<RawCommands[Item]>) => boolean
  : never
}

export type ChainedCommands = {
  [Item in keyof RawCommands]: RawCommands[Item] extends (...args: any[]) => any
  ? (...args: Parameters<RawCommands[Item]>) => ChainedCommands
  : never
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
