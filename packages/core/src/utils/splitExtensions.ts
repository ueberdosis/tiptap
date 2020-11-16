import { Extensions } from '../types'
import { Extension } from '../Extension'
import { NodeExtension } from '../NodeExtension'
import { MarkExtension } from '../MarkExtension'

export default function splitExtensions(extensions: Extensions) {
  const baseExtensions = extensions.filter(extension => extension instanceof Extension) as Extension[]
  const nodeExtensions = extensions.filter(extension => extension instanceof NodeExtension) as NodeExtension[]
  const markExtensions = extensions.filter(extension => extension instanceof MarkExtension) as MarkExtension[]

  return {
    baseExtensions,
    nodeExtensions,
    markExtensions,
  }
}
