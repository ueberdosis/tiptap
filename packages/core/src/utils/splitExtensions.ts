import { Extensions } from '../types'
import { Extension } from '../Extension'
import { Node } from '../Node'
import { Mark } from '../Mark'

export default function splitExtensions(extensions: Extensions) {
  const baseExtensions = extensions.filter(extension => extension instanceof Extension) as Extension[]
  const nodeExtensions = extensions.filter(extension => extension instanceof Node) as Node[]
  const markExtensions = extensions.filter(extension => extension instanceof Mark) as Mark[]

  return {
    baseExtensions,
    nodeExtensions,
    markExtensions,
  }
}
