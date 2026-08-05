import type { Extension } from '../Extension.js'
import type { Mark } from '../Mark.js'
import type { Node } from '../Node.js'
import type { Extensions } from '../types.js'

/**
 * Group extensions by kind, so callers can handle nodes, marks and plain extensions apart.
 */
export function splitExtensions(extensions: Extensions) {
  const baseExtensions = extensions.filter(
    extension => extension.type === 'extension',
  ) as Extension[]
  const nodeExtensions = extensions.filter(extension => extension.type === 'node') as Node[]
  const markExtensions = extensions.filter(extension => extension.type === 'mark') as Mark[]

  return {
    baseExtensions,
    nodeExtensions,
    markExtensions,
  }
}
