import type { Fragment, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

import { BrowserEnvironmentManager } from '../BrowserEnvironment.js'

export function getHTMLFromFragment(
  fragment: Fragment,
  schema: Schema,
  browserEnvironment: BrowserEnvironmentManager = new BrowserEnvironmentManager(),
): string {
  const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment, {
    document: browserEnvironment.document,
  })

  const temporaryDocument = browserEnvironment.document?.implementation?.createHTMLDocument?.() ?? document
  const container = temporaryDocument.createElement('div')

  container.appendChild(documentFragment)

  return container.innerHTML
}
