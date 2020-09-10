import collect from 'collect.js'
import { Extensions } from '../types'

export default function getTopNodeFromExtensions(extensions: Extensions): any {
  const topNode = collect(extensions).firstWhere('config.topNode', true)

  if (topNode) {
    return topNode.config.name
  }
}