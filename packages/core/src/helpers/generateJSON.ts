import { DOMParser } from '@tiptap/pm/model'

import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'
import type { Extensions } from '../types.js'
import { elementFromString } from '../utilities/elementFromString.js'
import { getSchema } from './getSchema.js'

/**
 * Generate JSONContent from HTML
 * @param html The HTML to generate JSONContent from
 * @param extensions The extensions to use for the schema
 * @param browserEnv Optional browser environment for server-side usage
 * @returns The generated JSONContent
 */
export function generateJSON(
  html: string,
  extensions: Extensions,
  browserEnv?: BrowserEnvironmentManager,
): Record<string, any> {
  const schema = getSchema(extensions)
  const dom = elementFromString(html, browserEnv)

  return DOMParser.fromSchema(schema).parse(dom).toJSON()
}
