import * as Y from 'yjs'
import { Schema } from 'prosemirror-model'
import type { Node } from 'prosemirror-model'
import { yXmlFragmentToProseMirrorFragment } from './yXmlFragmentToProseMirrorFragment.js'

/** Converts Yjs XML content to the schema's top-level document node. */
export const yXmlFragmentToProseMirrorRootNode = (
  yXmlFragment: Y.XmlFragment,
  schema: Schema,
): Node => schema.topNodeType.create(null, yXmlFragmentToProseMirrorFragment(yXmlFragment, schema))
