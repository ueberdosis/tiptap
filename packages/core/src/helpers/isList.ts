import { Extensions } from '../types'
import { NodeConfig } from '..'
import { splitExtensions } from './splitExtensions'
import { callOrReturn } from '../utilities/callOrReturn'
import { getExtensionField } from '../helpers/getExtensionField'

export function isList(name: string, extensions: Extensions): boolean {
  const { nodeExtensions } = splitExtensions(extensions)
  const extension = nodeExtensions.find(item => item.name === name)

  if (!extension) {
    return false
  }

  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage,
  }
  const group = callOrReturn(getExtensionField<NodeConfig['group']>(extension, 'group', context))

  if (typeof group !== 'string') {
    return false
  }

  return group.split(' ').includes('list')
}
