/// <reference types="cypress" />

import { TableKit } from '@tiptap/extension-table'
import StarterKit from '@tiptap/starter-kit'
import { renderToMarkdown } from '@tiptap/static-renderer/pm/markdown'

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
    expect(md).to.eq('')
  })

  it('should render empty paragraph', () => {
    const json = {
      type: 'doc',
      content: [],
    }
    const md = renderToMarkdown({
      content: json,
      extensions: [StarterKit, TableKit],
    })
    expect(md).to.eq('\n\n')
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
    expect(md).to.eq('\nHello, world!\n')
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

    expect(md).to.eq(
      '\n| Col 1 | Col 2 | Col 3 |\n| --- | --- | --- |\n| Row 1 1 | 112 | 1334 |\n| Row 2 1 | 115 | 4 |\n\n',
    )
  })
})
