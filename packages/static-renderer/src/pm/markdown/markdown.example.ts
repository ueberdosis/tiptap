import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'

import { renderToMarkdown } from './markdown.js'

// eslint-disable-next-line no-console
console.log(
  renderToMarkdown({
    extensions: [StarterKit, Subscript, Superscript, TextAlign, TextStyle, Highlight, Table, TableRow, TableCell, TableHeader],
    content: {
      type: 'doc',
      from: 0,
      to: 747,
      content: [
        {
          type: 'paragraph',
          from: 0,
          to: 66,
          content: [
            {
              type: 'text',
              from: 1,
              to: 65,
              text: 'Markdown shortcuts make it easy to format the text while typing.',
            },
          ],
        },
        {
          type: 'paragraph',
          from: 66,
          to: 205,
          content: [
            {
              type: 'text',
              from: 67,
              to: 107,
              text: 'To test that, start a new line and type ',
            },
            {
              type: 'text',
              from: 107,
              to: 108,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '#',
            },
            {
              type: 'text',
              from: 108,
              to: 151,
              text: ' followed by a space to get a heading. Try ',
            },
            {
              type: 'text',
              from: 151,
              to: 152,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '#',
            },
            {
              type: 'text',
              from: 152,
              to: 154,
              text: ', ',
            },
            {
              type: 'text',
              from: 154,
              to: 156,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '##',
            },
            {
              type: 'text',
              from: 156,
              to: 158,
              text: ', ',
            },
            {
              type: 'text',
              from: 158,
              to: 161,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '###',
            },
            {
              type: 'text',
              from: 161,
              to: 163,
              text: ', ',
            },
            {
              type: 'text',
              from: 163,
              to: 167,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '####',
            },
            {
              type: 'text',
              from: 167,
              to: 169,
              text: ', ',
            },
            {
              type: 'text',
              from: 169,
              to: 174,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '#####',
            },
            {
              type: 'text',
              from: 174,
              to: 176,
              text: ', ',
            },
            {
              type: 'text',
              from: 176,
              to: 182,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '######',
            },
            {
              type: 'text',
              from: 182,
              to: 204,
              text: ' for different levels.',
            },
          ],
        },
        {
          type: 'paragraph',
          from: 205,
          to: 442,
          content: [
            {
              type: 'text',
              from: 206,
              to: 299,
              text: 'Those conventions are called input rules in Tiptap. Some of them are enabled by default. Try ',
            },
            {
              type: 'text',
              from: 299,
              to: 300,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '>',
            },
            {
              type: 'text',
              from: 300,
              to: 318,
              text: ' for blockquotes, ',
            },
            {
              type: 'text',
              from: 318,
              to: 319,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '*',
            },
            {
              type: 'text',
              from: 319,
              to: 321,
              text: ', ',
            },
            {
              type: 'text',
              from: 321,
              to: 322,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '-',
            },
            {
              type: 'text',
              from: 322,
              to: 326,
              text: ' or ',
            },
            {
              type: 'text',
              from: 326,
              to: 327,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '+',
            },
            {
              type: 'text',
              from: 327,
              to: 349,
              text: ' for bullet lists, or ',
            },
            {
              type: 'text',
              from: 349,
              to: 357,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '`foobar`',
            },
            {
              type: 'text',
              from: 357,
              to: 377,
              text: ' to highlight code, ',
            },
            {
              type: 'text',
              from: 377,
              to: 387,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '~~tildes~~',
            },
            {
              type: 'text',
              from: 387,
              to: 407,
              text: ' to strike text, or ',
            },
            {
              type: 'text',
              from: 407,
              to: 422,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '==equal signs==',
            },
            {
              type: 'text',
              from: 422,
              to: 441,
              text: ' to highlight text.',
            },
          ],
        },
        {
          type: 'paragraph',
          from: 442,
          to: 450,
          content: [
            {
              type: 'text',
              from: 443,
              to: 447,
              marks: [
                {
                  type: 'highlight',
                },
              ],
              text: 'TEST',
            },
            {
              type: 'text',
              from: 447,
              to: 449,
              text: ' f',
            },
          ],
        },
        {
          type: 'blockquote',
          from: 450,
          to: 459,
          content: [
            {
              type: 'paragraph',
              from: 451,
              to: 458,
              content: [
                {
                  type: 'text',
                  from: 452,
                  to: 457,
                  text: 'fodks',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          from: 459,
          to: 463,
          content: [
            {
              type: 'text',
              from: 460,
              to: 462,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: 'ok',
            },
          ],
        },
        {
          type: 'bulletList',
          from: 463,
          to: 475,
          content: [
            {
              type: 'listItem',
              from: 464,
              to: 474,
              content: [
                {
                  type: 'paragraph',
                  from: 465,
                  to: 473,
                  content: [
                    {
                      type: 'text',
                      from: 466,
                      to: 472,
                      text: 'bullet',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'orderedList',
          from: 475,
          to: 486,
          attrs: {
            start: 1,
          },
          content: [
            {
              type: 'listItem',
              from: 476,
              to: 485,
              content: [
                {
                  type: 'paragraph',
                  from: 477,
                  to: 484,
                  content: [
                    {
                      type: 'text',
                      from: 478,
                      to: 483,
                      text: 'order',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          from: 486,
          to: 492,
          content: [
            {
              type: 'text',
              from: 487,
              to: 491,
              marks: [
                {
                  type: 'strike',
                },
              ],
              text: 'test',
            },
          ],
        },
        {
          type: 'heading',
          from: 492,
          to: 496,
          attrs: {
            level: 1,
          },
          content: [
            {
              type: 'text',
              from: 493,
              to: 495,
              text: 'h1',
            },
          ],
        },
        {
          type: 'paragraph',
          from: 496,
          to: 584,
          content: [
            {
              type: 'text',
              from: 497,
              to: 583,
              text: 'You can overwrite existing input rules or add your own to nodes, marks and extensions.',
            },
          ],
        },
        {
          type: 'paragraph',
          from: 584,
          to: 745,
          content: [
            {
              type: 'text',
              from: 585,
              to: 611,
              text: 'For example, we added the ',
            },
            {
              type: 'text',
              from: 611,
              to: 621,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: 'Typography',
            },
            {
              type: 'text',
              from: 621,
              to: 649,
              text: ' extension here. Try typing ',
            },
            {
              type: 'text',
              from: 649,
              to: 652,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '(c)',
            },
            {
              type: 'text',
              from: 652,
              to: 721,
              text: ' to see how it’s converted to a proper © character. You can also try ',
            },
            {
              type: 'text',
              from: 721,
              to: 723,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '->',
            },
            {
              type: 'text',
              from: 723,
              to: 725,
              text: ', ',
            },
            {
              type: 'text',
              from: 725,
              to: 727,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '>>',
            },
            {
              type: 'text',
              from: 727,
              to: 729,
              text: ', ',
            },
            {
              type: 'text',
              from: 729,
              to: 732,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '1/2',
            },
            {
              type: 'text',
              from: 732,
              to: 734,
              text: ', ',
            },
            {
              type: 'text',
              from: 734,
              to: 736,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '!=',
            },
            {
              type: 'text',
              from: 736,
              to: 741,
              text: ', or ',
            },
            {
              type: 'text',
              from: 741,
              to: 743,
              marks: [
                {
                  type: 'code',
                },
              ],
              text: '--',
            },
            {
              type: 'text',
              from: 743,
              to: 744,
              text: '.',
            },
          ],
        },
        {
          type: 'table',
          from: 195,
          to: 380,
          content: [
            {
              type: 'tableRow',
              from: 196,
              to: 221,
              content: [
                {
                  type: 'tableHeader',
                  from: 197,
                  to: 205,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: [
                      200,
                    ],
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 198,
                      to: 204,
                      content: [
                        {
                          type: 'text',
                          from: 199,
                          to: 203,
                          text: 'Name',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableHeader',
                  from: 205,
                  to: 220,
                  attrs: {
                    colspan: 3,
                    rowspan: 1,
                    colwidth: [
                      150,
                      100,
                    ],
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 206,
                      to: 219,
                      content: [
                        {
                          type: 'text',
                          from: 207,
                          to: 218,
                          text: 'Description',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              from: 221,
              to: 274,
              content: [
                {
                  type: 'tableCell',
                  from: 222,
                  to: 238,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 223,
                      to: 237,
                      content: [
                        {
                          type: 'text',
                          from: 224,
                          to: 236,
                          text: 'Cyndi Lauper',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 238,
                  to: 248,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 239,
                      to: 247,
                      content: [
                        {
                          type: 'text',
                          from: 240,
                          to: 246,
                          text: 'Singer',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 248,
                  to: 262,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 249,
                      to: 261,
                      content: [
                        {
                          type: 'text',
                          from: 250,
                          to: 260,
                          text: 'Songwriter',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 262,
                  to: 273,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 263,
                      to: 272,
                      content: [
                        {
                          type: 'text',
                          from: 264,
                          to: 271,
                          text: 'Actress',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              from: 274,
              to: 328,
              content: [
                {
                  type: 'tableCell',
                  from: 275,
                  to: 290,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 276,
                      to: 289,
                      content: [
                        {
                          type: 'text',
                          from: 277,
                          to: 288,
                          text: 'Marie Curie',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 290,
                  to: 303,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 291,
                      to: 302,
                      content: [
                        {
                          type: 'text',
                          from: 292,
                          to: 301,
                          text: 'Scientist',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 303,
                  to: 314,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 304,
                      to: 313,
                      content: [
                        {
                          type: 'text',
                          from: 305,
                          to: 312,
                          text: 'Chemist',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 314,
                  to: 327,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 315,
                      to: 326,
                      content: [
                        {
                          type: 'text',
                          from: 316,
                          to: 325,
                          text: 'Physicist',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              from: 328,
              to: 379,
              content: [
                {
                  type: 'tableCell',
                  from: 329,
                  to: 346,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 330,
                      to: 345,
                      content: [
                        {
                          type: 'text',
                          from: 331,
                          to: 344,
                          text: 'Indira Gandhi',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 346,
                  to: 364,
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 347,
                      to: 363,
                      content: [
                        {
                          type: 'text',
                          from: 348,
                          to: 362,
                          text: 'Prime minister',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  from: 364,
                  to: 378,
                  attrs: {
                    colspan: 2,
                    rowspan: 1,
                    colwidth: null,
                    backgroundColor: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      from: 365,
                      to: 377,
                      content: [
                        {
                          type: 'text',
                          from: 366,
                          to: 376,
                          text: 'Politician',
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
    },
  }),
)
