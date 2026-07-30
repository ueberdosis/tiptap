import { z } from 'zod'

import type { JsonItem } from '../types/json-item.js'

export const defaultJsonItems: JsonItem[] = [
  // Core nodes
  // Omit the root 'doc' node because the AI does not read it or generate it.
  {
    extensionName: 'paragraph',
    name: 'Paragraph',
  },
  {
    extensionName: 'text',
    name: 'Text',
  },
  {
    extensionName: 'heading',
    name: 'Heading',
    description: 'h1 to h6',
    attributes: {
      level: z.number().min(1).max(6),
    },
  },
  {
    extensionName: 'blockquote',
    name: 'Blockquote',
    description: 'for quoted content',
  },
  {
    extensionName: 'codeBlock',
    name: 'Code Block',
    attributes: {
      language: z.string().nullable().optional(),
    },
  },
  {
    extensionName: 'hardBreak',
    name: 'Line Break',
  },
  {
    extensionName: 'horizontalRule',
    name: 'Horizontal Rule',
    description: 'horizontal divider line',
  },
  {
    extensionName: 'image',
    name: 'Image',
    attributes: {
      src: z.string(),
      alt: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      width: z.number().nullable().optional(),
      height: z.number().nullable().optional(),
    },
  },
  // List nodes
  {
    extensionName: 'bulletList',
    name: 'Bullet List',
    description: 'Unordered list with bullet points',
  },
  {
    extensionName: 'orderedList',
    name: 'Ordered List',
    description: 'Numbered list',
    attributes: {
      start: z.number().optional(),
      type: z
        .string()
        .nullable()
        .optional()
        .describe(
          'Numbering style: "1" for numbers, "a" for lowercase letters, "A" for uppercase letters, "i" for lowercase roman numerals, "I" for uppercase roman numerals',
        ),
    },
  },
  {
    extensionName: 'listItem',
    name: 'List Item',
    description: 'Item within a bulletList or orderedList',
  },
  {
    extensionName: 'taskList',
    name: 'Task List',
    description: 'Checklist with task items',
  },
  {
    extensionName: 'taskItem',
    name: 'Task Item',
    description: 'Item within a taskList',
    attributes: {
      checked: z.boolean(),
    },
  },
  // Table nodes
  {
    extensionName: 'table',
    name: 'Table',
    description: 'Table container node',
  },
  {
    extensionName: 'tableRow',
    name: 'Table Row',
    description: 'Row within a table',
  },
  {
    extensionName: 'tableCell',
    name: 'Table Cell',
    description: 'Cell within a tableRow',
  },
  {
    extensionName: 'tableHeader',
    name: 'Table Header',
    description: 'Header cell within a tableRow',
  },
  // Special nodes
  {
    extensionName: 'mention',
    name: 'Mention',
    description: 'Mention node for @mentions and similar',
    attributes: {
      id: z.string(),
      label: z.string().nullable().optional(),
      mentionSuggestionChar: z
        .string()
        .optional()
        .describe(
          'The character that triggers this mention type (e.g., "@" for users, "#" for tags). Used to distinguish between multiple mention types',
        ),
    },
  },
  {
    extensionName: 'emoji',
    name: 'Emoji',
    attributes: {
      name: z
        .string()
        .describe(
          'The unique name/shortcode identifier for the emoji (e.g., "smile", "heart", "thumbs_up")',
        ),
    },
  },
  {
    extensionName: 'youtube',
    name: 'YouTube',
    attributes: {
      src: z.string(),
      start: z
        .number()
        .optional()
        .describe('Start time in seconds for when the video should begin playing'),
      width: z.number().optional(),
      height: z.number().optional(),
    },
  },
  {
    extensionName: 'details',
    name: 'Details',
    description: 'Collapsible details/summary',
    attributes: {
      open: z.boolean().optional(),
    },
  },
  {
    extensionName: 'detailsSummary',
    name: 'Details Summary',
    description: 'Summary text for a details node',
  },
  {
    extensionName: 'detailsContent',
    name: 'Details Content',
    description: 'Collapsible content within a details node',
  },
  {
    extensionName: 'blockMath',
    name: 'Block Math',
    attributes: {
      latex: z.string(),
    },
  },
  {
    extensionName: 'inlineMath',
    name: 'Inline Math',
    attributes: {
      latex: z.string(),
    },
  },
  // Marks
  {
    extensionName: 'bold',
    name: 'Bold',
    isMark: true,
  },
  {
    extensionName: 'italic',
    name: 'Italic',
    isMark: true,
  },
  {
    extensionName: 'code',
    name: 'Code',
    isMark: true,
  },
  {
    extensionName: 'link',
    name: 'Link',
    isMark: true,
    attributes: {
      href: z.string(),
      target: z.string().nullable().optional(),
      rel: z.string().nullable().optional(),
      class: z.string().nullable().optional(),
    },
  },
  {
    extensionName: 'strike',
    name: 'Strike',
    isMark: true,
  },
  {
    extensionName: 'underline',
    name: 'Underline',
    isMark: true,
  },
  {
    extensionName: 'highlight',
    name: 'Highlight',
    isMark: true,
    attributes: {
      color: z.string().nullable().optional(),
    },
  },
  {
    extensionName: 'subscript',
    name: 'Subscript',
    isMark: true,
  },
  {
    extensionName: 'superscript',
    name: 'Superscript',
    isMark: true,
  },
  {
    extensionName: 'textStyle',
    name: 'Text Style',
    isMark: true,
    attributes: {
      fontFamily: z.string(),
      fontSize: z.string(),
      lineHeight: z.string(),
      color: z.string(),
      backgroundColor: z.string(),
    },
  },
  // tiptap-pro nodes
  {
    extensionName: 'iframely',
    name: 'Iframely',
    description: 'Embed content from URLs using Iframely service',
    attributes: {
      url: z.string().nullable(),
      data: z.any().nullable().optional(),
    },
  },
  {
    extensionName: 'blockThread',
    name: 'Block Thread',
    description: 'Block-level comment thread',
    attributes: {
      'data-thread-id': z.string(),
    },
  },
  // tiptap-pro marks
  {
    extensionName: 'inlineThread',
    name: 'Inline Thread',
    isMark: true,
    description: 'Inline comment thread',
    attributes: {
      'data-thread-id': z.string(),
    },
  },
]
