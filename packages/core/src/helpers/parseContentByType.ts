import type { ParseOptions, Schema } from '@tiptap/pm/model'
import { Fragment, Node as ProseMirrorNode } from '@tiptap/pm/model'

import type { MarkdownManager } from '../markdown/MarkdownManager.js'
import type { Content, ContentType } from '../types.js'
import { createNodeFromContent } from './createNodeFromContent.js'

export type ParseContentByTypeOptions = {
  slice?: boolean
  parseOptions?: ParseOptions
  errorOnInvalidContent?: boolean
}

/**
 * Determines the content type based on content and explicit contentType option.
 * Priority rules:
 * 1. If contentType is explicitly set, use that
 * 2. If content is an object or array, assume 'json'
 * 3. Otherwise assume 'html' for strings
 */
function determineContentType(content: Content, contentType?: ContentType): ContentType {
  if (contentType) {
    return contentType
  }

  if (typeof content === 'object' && content !== null) {
    return 'json'
  }

  // Default to HTML for string content unless explicitly specified as markdown
  return 'html'
}

/**
 * Parse content based on the determined content type.
 * Handles JSON, HTML, and Markdown content appropriately.
 */
export function parseContentByType(
  content: Content | ProseMirrorNode | Fragment,
  schema: Schema,
  contentType: ContentType | undefined,
  markdownManager: MarkdownManager | undefined,
  options?: ParseContentByTypeOptions,
): ProseMirrorNode | Fragment {
  // If content is already a ProseMirror node or fragment, return as-is
  if (content instanceof ProseMirrorNode || content instanceof Fragment) {
    return content
  }

  const detectedContentType = determineContentType(content, contentType)

  // Handle markdown content
  if (detectedContentType === 'markdown' && typeof content === 'string') {
    if (!markdownManager || !markdownManager.hasMarked()) {
      console.warn(
        '[tiptap warn]: Markdown content type specified but no MarkdownManager available. Falling back to HTML parsing.',
      )
      return createNodeFromContent(content, schema, options)
    }

    try {
      // Parse markdown to JSON first
      const jsonContent = markdownManager.parse(content)
      // Then create ProseMirror node from the JSON
      return createNodeFromContent(jsonContent, schema, options)
    } catch (error) {
      if (options?.errorOnInvalidContent) {
        throw new Error('[tiptap error]: Invalid Markdown content', { cause: error as Error })
      }
      console.warn('[tiptap warn]: Invalid markdown content.', 'Passed value:', content, 'Error:', error)
      // Fallback to HTML parsing if markdown parsing fails
      return createNodeFromContent(content, schema, options)
    }
  }

  // For JSON and HTML content, use the existing createNodeFromContent function
  return createNodeFromContent(content, schema, options)
}
