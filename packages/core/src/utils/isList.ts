import { Extensions } from '../types'
import splitExtensions from './splitExtensions'

export default function isList(name: string, extensions: Extensions) {
  const { nodeExtensions } = splitExtensions(extensions)
  const extension = nodeExtensions.find(item => item.name === name)

  if (!extension) {
    return false
  }

  return extension.list
}
