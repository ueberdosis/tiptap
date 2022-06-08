import { Schema } from 'prosemirror-model'

import { ExtensionManager } from '../ExtensionManager'
import { Extensions } from '../types'
import { getSchemaByResolvedExtensions } from './getSchemaByResolvedExtensions'

export function getSchema(extensions: Extensions): Schema {
  const resolvedExtensions = ExtensionManager.resolve(extensions)

  return getSchemaByResolvedExtensions(resolvedExtensions)
}
