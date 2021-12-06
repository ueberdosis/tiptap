import { Schema } from 'prosemirror-model'
import { getSchemaByResolvedExtensions } from './getSchemaByResolvedExtensions'
import { ExtensionManager } from '../ExtensionManager'
import { Extensions } from '../types'

export function getSchema(extensions: Extensions): Schema {
  const resolvedExtensions = ExtensionManager.resolve(extensions)

  return getSchemaByResolvedExtensions(resolvedExtensions)
}
