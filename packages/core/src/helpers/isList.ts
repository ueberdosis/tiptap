import { Extensions } from '../types'
import splitExtensions from './splitExtensions'
import callOrReturn from '../utilities/callOrReturn'

export default function isList(name: string, extensions: Extensions): boolean {
  const { nodeExtensions } = splitExtensions(extensions)
  const extension = nodeExtensions.find(item => item.name === name)

  if (!extension) {
    return false
  }

  const groups = callOrReturn(extension.config.group, { options: extension.options })

  if (typeof groups !== 'string') {
    return false
  }

  return groups.split(' ').includes('list')
}
