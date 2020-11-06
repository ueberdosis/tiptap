import { Node } from 'prosemirror-model'
import { Decoration, NodeView } from 'prosemirror-view'
import { Extension } from './Extension'
import { NodeExtension } from './NodeExtension'
import { MarkExtension } from './MarkExtension'
import { Editor } from './Editor'

export type Extensions = (Extension | NodeExtension | MarkExtension)[]

export type Attribute = {
  default: any,
  rendered?: boolean,
  renderHTML?: ((attributes: { [key: string]: any }) => { [key: string]: any } | null) | null,
  parseHTML?: ((element: HTMLElement) => { [key: string]: any } | null) | null,
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
  attributes: Attributes,
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

export type NodeViewRendererProps = {
  editor: Editor,
  node: Node,
  getPos: (() => number) | boolean,
  decorations: Decoration[],
  attributes: AnyObject,
}

export type NodeViewRenderer = (props: NodeViewRendererProps) => NodeView
