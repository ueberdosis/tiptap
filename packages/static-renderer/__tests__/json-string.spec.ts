import type { TextType } from '@dibdab/core'
import Bold from '@dibdab/extension-bold'
import Document from '@dibdab/extension-document'
import Paragraph from '@dibdab/extension-paragraph'
import Text from '@dibdab/extension-text'
import Youtube from '@dibdab/extension-youtube'
import { Mark, Node } from '@dibdab/pm/model'
import { renderJSONContentToString, serializeChildrenToHTMLString } from '@dibdab/static-renderer/json/html-string'
import { renderToHTMLString } from '@dibdab/static-renderer/pm/html-string'
import { describe, expect, it } from 'vitest'

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

    expect(html).toBe('<doc><p>Example Text</p></doc>')
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

    expect(html).toBe('<doc><p><strong>Example Text</strong></p></doc>')
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
          expect(node).toEqual(json)
          return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
        },
        heading: ({ node, children }) => {
          expect(node).toEqual({
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
          expect(node).toEqual({
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
          expect(mark).toEqual({
            type: 'bold',
            attrs: {},
          })
          return `<strong>${serializeChildrenToHTMLString(children)}</strong>`
        },
      },
    })({ content: json })

    expect(html).toBe('<doc><h2><strong>Example Text</strong></h2></doc>')
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

    expect(html).toBe('<p><strong>Example Text</strong></p>')
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

    expect(html).toBe('<doc><p><b>Example Text</b></p></doc>')
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
            expect(node.type.name).toBe('doc')
            expect(node).toBeInstanceOf(Node)
            return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
          },
        },
        markMapping: {
          bold: ({ children, mark }) => {
            expect(mark.type.name).toBe('bold')
            expect(mark).toBeInstanceOf(Mark)
            return `<b>${serializeChildrenToHTMLString(children)}</b>`
          },
        },
      },
    })

    expect(html).toBe('<doc><p><b>Example Text</b></p></doc>')
  })

  it('renders youtube extension followed by other nodes correctly', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'youtube',
          attrs: {
            src: 'https://www.youtube.com/watch?v=3lTUAWOgoHs',
          },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text after youtube',
            },
          ],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Youtube],
    })

    expect(html).to.include('data-youtube-video')
    expect(html).to.include('<p>text after youtube</p>')
  })
})
