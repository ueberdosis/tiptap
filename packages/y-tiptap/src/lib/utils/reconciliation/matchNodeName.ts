import * as PModel from 'prosemirror-model'
import * as Y from 'yjs'

export const matchNodeName = (
  yElement: Y.XmlElement<{ [key: string]: string }>,
  pNode: PModel.Node | PModel.Node[],
) => !(pNode instanceof Array) && yElement.nodeName === pNode.type.name
