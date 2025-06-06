import type { Fragment, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function getHTMLFromFragment(
  fragment: Fragment,
  schema: Schema,
  browserEnv?: BrowserEnvironmentManager,
): string {
  const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment)

  // Use browser environment or fall back to global document
  const doc = browserEnv?.document ?? (typeof document !== 'undefined' ? document : undefined)

  if (!doc) {
    throw new Error(
      '[tiptap error]: No document available for HTML serialization. For server-side usage, provide a document implementation via the environment option.',
    )
  }

  const temporaryDocument = doc.implementation?.createHTMLDocument?.() ?? doc
  const container = temporaryDocument.createElement('div')

  container.appendChild(documentFragment)

  return container.innerHTML
}
