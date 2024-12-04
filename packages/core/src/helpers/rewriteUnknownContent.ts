import type { Schema } from '@tiptap/pm/model'

import type { JSONContent } from '../types.js'

type RewriteUnknownContentOptions = {
  /**
   * If true, unknown nodes will be treated as paragraphs
   * @default true
   */
  fallbackToParagraph?: boolean;
};

/**
 * The actual implementation of the rewriteUnknownContent function
 */
function rewriteUnknownContentInner({
  json,
  validMarks,
  validNodes,
  options,
}: {
  json: JSONContent;
  validMarks: Set<string>;
  validNodes: Set<string>;
  options?: RewriteUnknownContentOptions;
}) {
  if (json.marks && Array.isArray(json.marks)) {
    json.marks = json.marks.filter(mark => {
      const name = typeof mark === 'string' ? mark : mark.type

      if (validMarks.has(name)) {
        return true
      }
      // Just ignore any unknown marks
      return false
    })
  }

  if (json.content && Array.isArray(json.content)) {
    json.content = json.content.map(value => rewriteUnknownContentInner({
      json: value,
      validMarks,
      validNodes,
      options,
    }))
  }

  if (json.type && !validNodes.has(json.type)) {
    // Just treat it like a paragraph and hope for the best
    json.type = 'paragraph'
  }

  return json
}

/**
 * Rewrite unknown nodes and marks within JSON content
 * Allowing for user within the editor
 */
export function rewriteUnknownContent(
  /**
   * The JSON content to clean of unknown nodes and marks
   */
  json: JSONContent,
  /**
   * The schema to use for validation
   */
  schema: Schema,
  /**
   * Options for the cleaning process
   */
  options?: RewriteUnknownContentOptions,
) {
  return rewriteUnknownContentInner({
    json,
    validNodes: new Set(Object.keys(schema.nodes)),
    validMarks: new Set(Object.keys(schema.marks)),
    options,
  })
}
