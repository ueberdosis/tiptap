import { Extension } from './Extension'
import { NodeExtension } from './Node'
import { MarkExtension } from './Mark'

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
  [key: string]: Attribute
}

export type ExtensionAttribute = {
  type: string,
  name: string,
  attribute: Attribute
}
