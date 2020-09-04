import Node from '../Node'
import collect from 'collect.js'
import { Extensions } from '../types'

export default function getNodesFromExtensions(extensions: Extensions): any {
  return collect(extensions)
    .where('extensionType', 'node')
    .mapWithKeys((extension: Node) => [extension.name, extension.schema()])
    .all()
}