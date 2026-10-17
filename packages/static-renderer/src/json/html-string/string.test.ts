import {
  renderJSONContentToString,
  serializeAttrsToHTMLString,
  serializeChildrenToHTMLString,
} from './string.js'
import { describe, expect, it } from 'vite-plus/test'

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
          // `node.text` is accessible directly (typed `string | undefined`)
          // without casting to `TextType`.
          return node.text ?? ''
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
          // `node.text` is accessible directly (typed `string | undefined`)
          // without casting to `TextType`.
          return node.text ?? ''
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

  it('escapes serialized HTML attributes', () => {
    const attrs = serializeAttrsToHTMLString({
      href: 'x"><img src=x onerror=alert(document.cookie)>',
      title: 'Tom & "Jerry"',
    })

    expect(attrs).toBe(
      ' href="x&quot;&gt;&lt;img src=x onerror=alert(document.cookie)&gt;" title="Tom &amp; &quot;Jerry&quot;"',
    )
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
          // `node.text` is accessible directly (typed `string | undefined`)
          // without casting to `TextType`.
          return node.text ?? ''
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

  it('throws a clear "missing handler" error for a node without a type instead of crashing', () => {
    // Node-type resolution falls back to '' for a missing/undefined `type`, so a
    // malformed node routes through the normal "missing handler" contract rather
    // than throwing a raw TypeError on `content.type.name`.
    const render = renderJSONContentToString({ nodeMapping: {}, markMapping: {} })

    expect(() => render({ content: {} })).toThrow(/missing handler for node type/)
  })

  it('routes a node without a type to unhandledNode when one is provided', () => {
    const html = renderJSONContentToString({
      nodeMapping: {},
      markMapping: {},
      unhandledNode: () => '<unhandled />',
    })({ content: {} })

    expect(html).toBe('<unhandled />')
  })
})
