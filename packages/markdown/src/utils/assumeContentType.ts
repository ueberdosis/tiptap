import type { Content } from '@tiptap/core'
import type { Fragment, Node } from '@tiptap/pm/model'

import type { ContentType } from '../types.js'

/**
 * Assume the content type based on the content value.
 * @param content The content to assume the type for.
 * @param contentType The content type that should be prioritized.
 */
export function assumeContentType(
  content: (Content | Fragment | Node) | string,
  contentType: ContentType,
): ContentType {
  // if not a string, we assume it will be a json content object
  if (typeof content !== 'string') {
    return 'json'
  }

  // otherwise we let the content type be what it is
  return contentType
}
