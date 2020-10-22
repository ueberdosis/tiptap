import { Extension } from './Extension'
import { NodeExtension } from './NodeExtension'
import { MarkExtension } from './MarkExtension'

export type Extensions = (Extension | NodeExtension | MarkExtension)[]

export type Attribute = {
  default: any,
  rendered?: boolean,
  renderHTML?: (attributes: {
    [key: string]: any,
  }) => any,
  parseHTML?: () => any,
}

export type Attributes = {
  [key: string]: Attribute,
}

export type ExtensionAttribute = {
  type: string,
  name: string,
  attribute: Attribute,
}

export type GlobalAttributes = {
  types: string[],
  attributes: Attributes,
}[]

export type PickValue<T, K extends keyof T> = T[K]

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I)=>void)
  ? I
  : never
