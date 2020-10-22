import { Extensions } from '../types'
import { Extension } from '../Extension'
import { NodeExtension } from '../NodeExtension'
import { MarkExtension } from '../MarkExtension'

export default function splitExtensions(extensions: Extensions) {
  const baseExtensions = extensions.filter(extension => extension.type === 'extension') as Extension[]
  const nodeExtensions = extensions.filter(extension => extension.type === 'node') as NodeExtension[]
  const markExtensions = extensions.filter(extension => extension.type === 'mark') as MarkExtension[]

  return {
    baseExtensions,
    nodeExtensions,
    markExtensions,
  }
}
