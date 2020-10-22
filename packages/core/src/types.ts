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
