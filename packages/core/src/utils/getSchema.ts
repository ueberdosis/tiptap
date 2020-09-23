import deepmerge from 'deepmerge'
import { Schema } from 'prosemirror-model'
import { Extensions } from '../types'
import getTopNodeFromExtensions from './getTopNodeFromExtensions'
import getNodesFromExtensions from './getNodesFromExtensions'
import getMarksFromExtensions from './getMarksFromExtensions'
import resolveExtensionConfig from './resolveExtensionConfig'

export default function getSchema(extensions: Extensions): Schema {
  extensions.forEach(extension => {
    resolveExtensionConfig(extension, 'name')
    resolveExtensionConfig(extension, 'defaults')
    resolveExtensionConfig(extension, 'topNode')

    const { name } = extension.config
    const options = deepmerge(extension.config.defaults, extension.options)

    resolveExtensionConfig(extension, 'schema', { name, options })
  })

  return new Schema({
    topNode: getTopNodeFromExtensions(extensions),
    nodes: getNodesFromExtensions(extensions),
    marks: getMarksFromExtensions(extensions),
  })
}
