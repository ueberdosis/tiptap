import Extension from '../Extension'
import Node from '../Node'
import Mark from '../Mark'
import { Schema } from 'prosemirror-model'
import collect from 'collect.js'

export default function getSchema(extensions: (Extension | Node | Mark)[]): Schema {
  return new Schema({
    topNode: getTopNodeFromExtensions(extensions),
    nodes: getNodesFromExtensions(extensions),
    marks: getMarksFromExtensions(extensions),
  })
}

function getNodesFromExtensions(extensions: (Extension | Node | Mark)[]): any {
  return collect(extensions)
    .where('extensionType', 'node')
    .mapWithKeys((extension: Node) => [extension.name, extension.schema()])
    .all()
}

function getTopNodeFromExtensions(extensions: (Extension | Node | Mark)[]): any {
  const topNode = collect(extensions).firstWhere('topNode', true)

  if (topNode) {
    return topNode.name
  }
}

function getMarksFromExtensions(extensions: (Extension | Node | Mark)[]): any {
  return collect(extensions)
    .where('extensionType', 'mark')
    .mapWithKeys((extension: Mark) => [extension.name, extension.schema()])
    .all()
}
