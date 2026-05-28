import {
  createMigration,
  removeMark,
  renameAttr,
  renameMark,
  renameNode,
  setAttr,
  unwrapNode,
  type JSONContent,
} from '@tiptap/core'

export const sourceDocument: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'legacyHeading',
      attrs: { depth: 1 },
      content: [{ type: 'text', text: 'Document migrations' }],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', text: 'This document was saved at ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'documentVersion: 1' },
        { type: 'text', text: '. On load, Tiptap runs every migration up to the latest version.' },
      ],
    },
    {
      type: 'legacyBlockquote',
      content: [
        {
          type: 'legacyParagraph',
          content: [{ type: 'text', text: 'Blockquote with nested content' }],
        },
        {
          type: 'legacyBulletList',
          content: [
            {
              type: 'legacyListItem',
              content: [
                {
                  type: 'legacyParagraph',
                  content: [{ type: 'text', text: 'List inside a blockquote' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'legacyHeading',
      attrs: { depth: 2 },
      content: [{ type: 'text', text: 'Deeply nested content' }],
    },
    {
      type: 'legacyBulletList',
      content: [
        {
          type: 'legacyListItem',
          content: [
            {
              type: 'legacyParagraph',
              content: [{ type: 'text', text: 'Level 1' }],
            },
            {
              type: 'legacyBulletList',
              content: [
                {
                  type: 'legacyListItem',
                  content: [
                    {
                      type: 'legacyParagraph',
                      content: [{ type: 'text', text: 'Level 2 (bottom-up walk)' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'legacyHeading',
      attrs: { depth: 2 },
      content: [{ type: 'text', text: 'Changelog in this demo' }],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'v2' },
        { type: 'text', text: ' — rename legacy node types; heading depth → level' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'v3' },
        { type: 'text', text: ' — bullet list rename; unwrap blockquote' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'v4' },
        { type: 'text', text: ' — all headings level 1; bold → strike; remove code mark' },
      ],
    },
    {
      type: 'legacyParagraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'v5' },
        { type: 'text', text: ' — external links (target=_blank) become code marks with url attr' },
      ],
    },
  ],
}

export const migrations = [
  createMigration(2, [
    renameNode('legacyParagraph', 'paragraph'),
    renameNode('legacyHeading', 'heading'),
    renameNode('legacyListItem', 'listItem'),
    renameNode('legacyBlockquote', 'blockquote'),
    renameAttr('heading', 'depth', 'level'),
  ]),
  createMigration(3, [renameNode('legacyBulletList', 'bulletList'), unwrapNode('blockquote')]),
  createMigration(4, [
    setAttr('heading', 'level', 1),
    renameMark('bold', 'strike'),
    removeMark('code'),
  ]),
  createMigration(5, [
    renameMark('link', 'code', {
      if: { attrs: { target: '_blank' } },
      renameAttr: { href: 'url' },
    }),
  ]),
]

export const migrationSummaries: Record<number, string> = {
  1: 'Source JSON (legacy schema)',
  2: 'Rename nodes; heading depth → level',
  3: 'Rename bullet list; unwrap blockquote',
  4: 'Heading level → 1; bold → strike; remove code',
  5: 'External links → code mark',
}
