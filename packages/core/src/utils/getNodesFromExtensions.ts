import collect from 'collect.js'
import Node from '../Node'
import { Extensions } from '../types'

export default function getNodesFromExtensions(extensions: Extensions): any {
  return collect(extensions)
    .where('type', 'node')
    .mapWithKeys((extension: Node) => [extension.config.name, extension.config.schema])
    .all()
}
