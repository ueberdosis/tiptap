import { Extension } from '../Extension.js'
import { Mark } from '../Mark.js'
import { Node } from '../Node.js'
import { Extensions } from '../types.js'

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
