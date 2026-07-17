import { TableKit } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'
import { renderToMarkdown } from '@tiptap/static-renderer/pm/markdown'
import { describe, expect, it } from 'vitest'

describe('static render json to string (no prosemirror)', () => {
  it('should return empty string for empty content', () => {
    const json = {
      type: 'doc',
      content: [],
    }
    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
    })
    expect(md).toBe('')
  })

  it('should render empty paragraph', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    }
    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
    })
    expect(md).toBe('\n\n')
  })

  it('should render a simple paragraph', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello, world!',
            },
          ],
        },
      ],
    }
    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
    })
    expect(md).toBe('\nHello, world!\n')
  })

  it('should render a simple table', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Col 1',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableHeader',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Col 2',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableHeader',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Col 3',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Row 1 1',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: '112',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: '1334',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Row 2 1',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: '115',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: '4',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }
    const md = renderToMarkdown({ content: json, extensions: [StarterKit, TableKit] })

    expect(md).toBe(
      '\n| Col 1 | Col 2 | Col 3 |\n| --- | --- | --- |\n| Row 1 1 | 112 | 1334 |\n| Row 2 1 | 115 | 4 |\n\n',
    )
  })

  it('should render a table with merged cells (rowspan) without breaking the grid', () => {
    const cell = (text: string, attrs: { colspan?: number; rowspan?: number } = {}) => ({
      type: 'tableCell',
      attrs: { colspan: 1, rowspan: 1, colwidth: null, ...attrs },
      content: text
        ? [{ type: 'paragraph', content: [{ type: 'text', text }] }]
        : [{ type: 'paragraph', content: [] }],
    })

    const json = {
      type: 'doc',
      content: [
        {
          type: 'table',
          content: [
            {
              // Row 0: "3" spans down into row 1, so row 0 has 3 real cells
              type: 'tableRow',
              content: [cell('1'), cell('3', { rowspan: 2 }), cell('-')],
            },
            {
              // Row 1: only 2 real cells exist here, the 3rd column is covered by row 0's rowspan
              type: 'tableRow',
              content: [cell('2'), cell('4')],
            },
            {
              // Row 2: back to 3 real (empty) cells
              type: 'tableRow',
              content: [cell(''), cell(''), cell('')],
            },
          ],
        },
      ],
    }

    const md = renderToMarkdown({ content: json, extensions: [StarterKit, TableKit] })

    // Every row must keep the same number of columns as the header separator row,
    // with a blank placeholder standing in for the rowspan-covered slot.
    expect(md).toBe('\n| 1 | 3 | - |\n| --- | --- | --- |\n| 2 |  | 4 |\n|  |  |  |\n\n')
  })

  it('should render a blockquote with trailing newline before a paragraph', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Quote',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'World',
            },
          ],
        },
      ],
    }
    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
    })
    // The blockquote must have a trailing newline so "World" is not part of the blockquote
    expect(md).toContain('> Quote\n\n')
  })

  it('should render a standalone blockquote with trailing newline', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Quote',
                },
              ],
            },
          ],
        },
      ],
    }
    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
    })
    expect(md).toBe('\n> Quote\n')
  })

  it('should render a blockquote with multiple paragraphs', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'First',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Second',
                },
              ],
            },
          ],
        },
      ],
    }
    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
    })
    expect(md).toBe('\n> First\n> \n> Second\n')
  })

  it('accepts staticEditorOptions.textDirection without crashing', () => {
    const json = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
    }

    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
      staticEditorOptions: { textDirection: 'rtl' },
    })

    expect(md).toBe('\nhello\n')
  })
})
