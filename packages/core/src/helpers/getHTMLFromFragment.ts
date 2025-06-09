import type { Fragment, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

import { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function getHTMLFromFragment(
  fragment: Fragment,
  schema: Schema,
  browserEnv: BrowserEnvironmentManager = new BrowserEnvironmentManager(),
): string {
  const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment, {
    document: browserEnv.document,
  })

  const temporaryDocument = browserEnv.document?.implementation?.createHTMLDocument?.() ?? document
  const container = temporaryDocument.createElement('div')

  container.appendChild(documentFragment)

  return container.innerHTML
}
