import { Extensions } from '../types'
import { Extension } from '../Extension'
import { Node } from '../Node'
import { Mark } from '../Mark'

export function splitExtensions(extensions: Extensions) {
  const baseExtensions = extensions.filter(extension => extension.type === 'extension') as Extension[]
  const nodeExtensions = extensions.filter(extension => extension.type === 'node') as Node[]
  const markExtensions = extensions.filter(extension => extension.type === 'mark') as Mark[]

  return {
    baseExtensions,
    nodeExtensions,
    markExtensions,
  }
}
