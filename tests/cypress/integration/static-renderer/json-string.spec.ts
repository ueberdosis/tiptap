/// <reference types="cypress" />

import { TextType } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Mark, Node } from '@tiptap/pm/model'
import { renderJSONContentToString, serializeChildrenToHTMLString } from '@tiptap/static-renderer/json/html-string'
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string'

describe('static render json to string (no prosemirror)', () => {
  it('generate an HTML string from JSON without an editor instance', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderJSONContentToString({
      nodeMapping: {
        doc: ({ children }) => {
          return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
        },
        paragraph: ({ children }) => {
          return `<p>${serializeChildrenToHTMLString(children)}</p>`
        },
        text: ({ node }) => {
          return (node as unknown as TextType).text
        },
      },
      markMapping: {},
    })({ content: json })

    expect(html).to.eq('<doc><p>Example Text</p></doc>')
  })

  it('supports mapping nodes & marks', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderJSONContentToString({
      nodeMapping: {
        doc: ({ children }) => {
          return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
        },
        paragraph: ({ children }) => {
          return `<p>${serializeChildrenToHTMLString(children)}</p>`
        },
        text: ({ node }) => {
          return (node as unknown as TextType).text
        },
      },
      markMapping: {
        bold: ({ children }) => {
          return `<strong>${serializeChildrenToHTMLString(children)}</strong>`
        },
      },
    })({ content: json })

    expect(html).to.eq('<doc><p><strong>Example Text</strong></p></doc>')
  })

  it('gives access to the original JSON node or mark', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: {
            level: 2,
          },
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderJSONContentToString({
      nodeMapping: {
        doc: ({ node, children }) => {
          expect(node).to.deep.eq(json)
          return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
        },
        heading: ({ node, children }) => {
          expect(node).to.deep.eq({
            type: 'heading',
            attrs: {
              level: 2,
            },
            content: [
              {
                type: 'text',
                text: 'Example Text',
                marks: [
                  {
                    type: 'bold',
                    attrs: {},
                  },
                ],
              },
            ],
          })
          return `<h${node.attrs.level}>${serializeChildrenToHTMLString(children)}</h${node.attrs.level}>`
        },
        text: ({ node }) => {
          expect(node).to.deep.eq({
            type: 'text',
            text: 'Example Text',
            marks: [
              {
                type: 'bold',
                attrs: {},
              },
            ],
          })
          return (node as unknown as TextType).text
        },
      },
      markMapping: {
        bold: ({ children, mark }) => {
          expect(mark).to.deep.eq({
            type: 'bold',
            attrs: {},
          })
          return `<strong>${serializeChildrenToHTMLString(children)}</strong>`
        },
      },
    })({ content: json })

    expect(html).to.eq('<doc><h2><strong>Example Text</strong></h2></doc>')
  })
})

describe('static render json to string (with prosemirror)', () => {
  it('generates an HTML string from JSON without an editor instance', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Bold],
    })

    expect(html).to.eq('<p><strong>Example Text</strong></p>')
  })

  it('supports custom mapping for nodes & marks', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Bold],
      options: {
        nodeMapping: {
          doc: ({ children }) => {
            return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
          },
        },
        markMapping: {
          bold: ({ children }) => {
            return `<b>${serializeChildrenToHTMLString(children)}</b>`
          },
        },
      },
    })

    expect(html).to.eq('<doc><p><b>Example Text</b></p></doc>')
  })

  it('gives access to a prosemirror node or mark instance', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Bold],
      options: {
        nodeMapping: {
          doc: ({ children, node }) => {
            expect(node.type.name).to.eq('doc')
            expect(node).to.be.instanceOf(Node)
            return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
          },
        },
        markMapping: {
          bold: ({ children, mark }) => {
            expect(mark.type.name).to.eq('bold')
            expect(mark).to.be.instanceOf(Mark)
            return `<b>${serializeChildrenToHTMLString(children)}</b>`
          },
        },
      },
    })

    expect(html).to.eq('<doc><p><b>Example Text</b></p></doc>')
  })
})
