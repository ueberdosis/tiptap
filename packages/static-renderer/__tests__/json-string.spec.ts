import { extensions as coreExtensions } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import { generateTocIds, TableOfContents } from '@tiptap/extension-table-of-contents'
import Text from '@tiptap/extension-text'
import { generateUniqueIds, UniqueID } from '@tiptap/extension-unique-id'
import Youtube from '@tiptap/extension-youtube'
import { Mark, Node } from '@tiptap/pm/model'
import {
  renderJSONContentToString,
  serializeAttrsToHTMLString,
  serializeChildrenToHTMLString,
} from '@tiptap/static-renderer/json/html-string'
import {
  domOutputSpecToHTMLString,
  renderToHTMLString,
} from '@tiptap/static-renderer/pm/html-string'
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

  it('escapes text node content', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '<img src=x onerror=alert(document.cookie)> Tom & Jerry',
            },
          ],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text],
    })

    expect(html).toBe('<p>&lt;img src=x onerror=alert(document.cookie)&gt; Tom &amp; Jerry</p>')
  })

  it('escapes attribute values in the ProseMirror HTML string renderer', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Click here',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://tiptap.dev/?q="><img src=x onerror=alert(document.cookie)>',
                    target: '_blank',
                  },
                },
              ],
            },
          ],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Link],
    })

    expect(html).toContain(
      'href="https://tiptap.dev/?q=&quot;&gt;&lt;img src=x onerror=alert(document.cookie)&gt;"',
    )
  })

  it('escapes string DOM output specs as text content', () => {
    const html = domOutputSpecToHTMLString('<img src=x onerror=alert(document.cookie)>')()

    expect(html).toBe('&lt;img src=x onerror=alert(document.cookie)&gt;')
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

  const headingDoc = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'test' }],
      },
    ],
  }

  it.each(['ltr', 'rtl', 'auto'] as const)(
    'honors textDirection=%s via staticEditorOptions',
    direction => {
      const html = renderToHTMLString({
        content: headingDoc,
        extensions: [Document, Paragraph, Text, Heading],
        staticEditorOptions: { textDirection: direction },
      })

      expect(html).toContain(`dir="${direction}"`)
    },
  )

  it('does not add a dir attribute when staticEditorOptions is unset', () => {
    const html = renderToHTMLString({
      content: headingDoc,
      extensions: [Document, Paragraph, Text, Heading],
    })

    expect(html).not.toContain('dir=')
  })

  it('a user-supplied TextDirection wins over staticEditorOptions.textDirection (matches Editor precedence)', () => {
    // Editor.ts prepends its `textDirection`-driven TextDirection to
    // `this.options.extensions`, so a user-supplied TextDirection — coming
    // later in the array — wins via tiptap's last-defined precedence for
    // duplicate `addGlobalAttributes`. The static renderer mirrors that.
    const html = renderToHTMLString({
      content: headingDoc,
      extensions: [
        Document,
        Paragraph,
        Text,
        Heading,
        coreExtensions.TextDirection.configure({ direction: 'ltr' }),
      ],
      staticEditorOptions: { textDirection: 'rtl' },
    })

    expect(html).toContain('dir="ltr"')
    expect(html).not.toContain('dir="rtl"')
  })

  it('omits null and undefined attribute values instead of serializing them as strings', () => {
    expect(serializeAttrsToHTMLString({ class: null, id: undefined, dir: 'auto' })).toBe(
      ' dir="auto"',
    )
  })

  it('preserves false attribute values (matches ProseMirror DOMSerializer)', () => {
    expect(serializeAttrsToHTMLString({ contenteditable: false })).toBe(' contenteditable="false"')
  })

  it('does not emit class="null" for a CodeBlock without language', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          content: [{ type: 'text', text: 'hello' }],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, CodeBlock],
    })

    expect(html).toBe('<pre><code>hello</code></pre>')
  })

  it('does not emit id="null" / data-toc-id="null" for TableOfContents nodes without IDs', () => {
    const html = renderToHTMLString({
      content: headingDoc,
      extensions: [Document, Paragraph, Text, Heading, TableOfContents],
    })

    expect(html).not.toContain('id="null"')
    expect(html).not.toContain('data-toc-id="null"')
  })

  it('renders UniqueID data-id attributes when JSON is pre-processed with generateUniqueIds', () => {
    const extensionsWithUid = [
      Document,
      Paragraph,
      Text,
      Heading,
      UniqueID.configure({ types: ['heading'] }),
    ]
    const docWithIds = generateUniqueIds(headingDoc, extensionsWithUid)

    const html = renderToHTMLString({ content: docWithIds, extensions: extensionsWithUid })

    expect(html).toMatch(/data-id="[^"]+"/)
  })

  it('renders TableOfContents anchor IDs when JSON is pre-processed with generateTocIds', () => {
    const extensionsWithToc = [
      Document,
      Paragraph,
      Text,
      Heading,
      TableOfContents.configure({ anchorTypes: ['heading'] }),
    ]
    const docWithIds = generateTocIds(headingDoc, extensionsWithToc)

    const html = renderToHTMLString({ content: docWithIds, extensions: extensionsWithToc })

    expect(html).toMatch(/\bid="[^"]+"/)
    expect(html).toMatch(/data-toc-id="[^"]+"/)
  })
})
