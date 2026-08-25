import type { JSONContent, MarkdownParseHelpers, MarkdownToken } from '@tiptap/core'

export type CreateParseHelpersOptions = {
  parseInline: (tokens: MarkdownToken[]) => JSONContent[]
  tokenizeInline: (src: string) => MarkdownToken[]
  parseChildren: (tokens: MarkdownToken[]) => JSONContent[]
  parseBlockChildren: (tokens: MarkdownToken[]) => JSONContent[]
}

/**
 * Build the helper object handed to extension markdown parse handlers.
 * @param options The bound manager functions used to parse inline and block tokens.
 * @returns The markdown parse helpers.
 */
export function createParseHelpers(options: CreateParseHelpersOptions): MarkdownParseHelpers {
  return {
    parseInline: options.parseInline,
    tokenizeInline: options.tokenizeInline,
    parseChildren: options.parseChildren,
    parseBlockChildren: options.parseBlockChildren,
    createTextNode: (text, marks) => {
      const node = {
        type: 'text',
        text,
        marks: marks || undefined,
      }

      return node
    },
    createNode: (type, attrs, content) => {
      const node = {
        type,
        attrs: attrs || undefined,
        content: content || undefined,
      }

      if (!attrs || Object.keys(attrs).length === 0) {
        delete node.attrs
      }

      return node
    },
    applyMark: (markType, content, attrs) => ({
      mark: markType,
      content,
      attrs: attrs && Object.keys(attrs).length > 0 ? attrs : undefined,
    }),
  }
}
