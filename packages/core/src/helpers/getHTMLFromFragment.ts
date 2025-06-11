import type { Fragment, Schema } from '@tiptap/pm/model'
import { DOMSerializer } from '@tiptap/pm/model'

import { BrowserEnvironment } from '../BrowserEnvironment.js'

export function getHTMLFromFragment(
  fragment: Fragment,
  schema: Schema,
  browserEnvironment: BrowserEnvironment = new BrowserEnvironment(),
): string {
  const documentFragment = DOMSerializer.fromSchema(schema).serializeFragment(fragment, {
    document: browserEnvironment.document,
  })

  const temporaryDocument = browserEnvironment.document?.implementation?.createHTMLDocument?.() ?? document
  const container = temporaryDocument.createElement('div')

  container.appendChild(documentFragment)

  return container.innerHTML
}
