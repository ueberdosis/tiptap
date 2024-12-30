import type { Schema } from '@tiptap/pm/model'

import type { JSONContent } from '../types.js'

type RewriteUnknownContentOptions = {
  /**
   * If true, unknown nodes will be treated as paragraphs
   * @default true
   */
  fallbackToParagraph?: boolean;
};

type RewrittenContent = {
  /**
   * The original JSON content that was rewritten
   */
  original: JSONContent;
  /**
   * The name of the node or mark that was unsupported
   */
  unsupported: string;
}[];

/**
 * The actual implementation of the rewriteUnknownContent function
 */
function rewriteUnknownContentInner({
  json,
  validMarks,
  validNodes,
  options,
  rewrittenContent = [],
}: {
  json: JSONContent;
  validMarks: Set<string>;
  validNodes: Set<string>;
  options?: RewriteUnknownContentOptions;
  rewrittenContent?: RewrittenContent;
}): {
  /**
   * The cleaned JSON content
   */
  json: JSONContent | null;
  /**
   * The array of nodes and marks that were rewritten
   */
  rewrittenContent: RewrittenContent;
} {
  if (json.marks && Array.isArray(json.marks)) {
    json.marks = json.marks.filter(mark => {
      const name = typeof mark === 'string' ? mark : mark.type

      if (validMarks.has(name)) {
        return true
      }

      rewrittenContent.push({
        original: JSON.parse(JSON.stringify(mark)),
        unsupported: name,
      })
      // Just ignore any unknown marks
      return false
    })
  }

  if (json.content && Array.isArray(json.content)) {
    json.content = json.content
      .map(
        value => rewriteUnknownContentInner({
          json: value,
          validMarks,
          validNodes,
          options,
          rewrittenContent,
        }).json,
      )
      .filter(a => a !== null && a !== undefined)
  }

  if (json.type && !validNodes.has(json.type)) {
    rewrittenContent.push({
      original: JSON.parse(JSON.stringify(json)),
      unsupported: json.type,
    })

    if (json.content && Array.isArray(json.content) && (options?.fallbackToParagraph !== false)) {
      // Just treat it like a paragraph and hope for the best
      json.type = 'paragraph'

      return {
        json,
        rewrittenContent,
      }
    }

    // or just omit it entirely
    return {
      json: null,
      rewrittenContent,
    }
  }

  return { json, rewrittenContent }
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
): {
  /**
   * The cleaned JSON content
   */
  json: JSONContent | null;
  /**
   * The array of nodes and marks that were rewritten
   */
  rewrittenContent: {
    /**
     * The original JSON content that was rewritten
     */
    original: JSONContent;
    /**
     * The name of the node or mark that was unsupported
     */
    unsupported: string;
  }[];
} {
  return rewriteUnknownContentInner({
    json,
    validNodes: new Set(Object.keys(schema.nodes)),
    validMarks: new Set(Object.keys(schema.marks)),
    options,
  })
}
