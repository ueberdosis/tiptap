import {
  renderJSONContentToString,
  serializeAttrsToHTMLString,
  serializeChildrenToHTMLString,
} from './string.js'
import { describe, expect, it } from 'vite-plus/test'

describe('serializeAttrsToHTMLString', () => {
  it.each([
    'onerror',
    'ONERROR',
    'onError',
    'onclick',
    'onload',
    'onbegin',
    'onunknown',
    'http://www.w3.org/1999/xhtml onerror',
    'http://www.w3.org/1999/xhtml OnLoad',
    'srcdoc',
    'SRCDOC',
    'http://www.w3.org/1999/xhtml srcdoc',
  ])('omits executable attribute %s', key => {
    expect(serializeAttrsToHTMLString({ [key]: 'alert(1)', alt: 'safe' })).toBe(' alt="safe"')
  })

  it.each([
    '',
    'title"',
    "title'",
    'title=onerror',
    'title/onerror',
    'title\tonerror',
    'title\nonerror',
    'title\ronerror',
    'title\fonerror',
    'on\0error',
    'title><svg/onload=alert(1)>',
    'http://www.w3.org/1999/xhtml title"',
  ])('omits malformed attribute %j', key => {
    expect(serializeAttrsToHTMLString({ [key]: 'attack', alt: 'safe' })).toBe(' alt="safe"')
  })

  it('preserves safe attributes and namespace local names', () => {
    expect(
      serializeAttrsToHTMLString({
        class: 'image',
        'data-onerror': 'text',
        'aria-label': 'Image',
        'http://www.w3.org/1999/xlink xlink:href': '#image',
        viewBox: '0 0 10 10',
        contenteditable: false,
        width: 0,
        title: '',
        absent: null,
        missing: undefined,
      }),
    ).toBe(
      ' class="image" data-onerror="text" aria-label="Image" xlink:href="#image" viewBox="0 0 10 10" contenteditable="false" width="0" title=""',
    )
  })

  it('returns no whitespace when all attributes are omitted', () => {
    expect(serializeAttrsToHTMLString({ onerror: 'alert(1)', title: null })).toBe('')
    expect(serializeAttrsToHTMLString(null)).toBe('')
    expect(serializeAttrsToHTMLString(undefined)).toBe('')
  })

  it('keeps attribute values as data when parsed as HTML', () => {
    const value = "\"><svg onload=alert(1)> & &#34; 'test'"
    const container = document.createElement('div')
    container.innerHTML = `<img${serializeAttrsToHTMLString({ title: value })}/>`

    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild?.getAttribute('title')).toBe(value)
    expect(container.querySelector('svg')).toBeNull()
  })
})

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

  it('renders the first mark outermost', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'Example Text',
          marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }],
        },
      ],
    }

    const html = renderJSONContentToString({
      nodeMapping: {
        doc: ({ children }) => serializeChildrenToHTMLString(children),
        text: ({ node }) => node.text ?? '',
      },
      markMapping: {
        bold: ({ children }) => `<strong>${serializeChildrenToHTMLString(children)}</strong>`,
        italic: ({ children }) => `<em>${serializeChildrenToHTMLString(children)}</em>`,
        underline: ({ children }) => `<u>${serializeChildrenToHTMLString(children)}</u>`,
      },
    })({ content: json })

    expect(html).toBe('<strong><em><u>Example Text</u></em></strong>')
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
