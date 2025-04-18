import type { Extension } from '../Extension.js'
import type { Mark } from '../Mark.js'
import type { Node } from '../Node.js'
import type { Extensions } from '../types.js'

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
