/// <reference types="cypress" />

import { prettyDOM, render } from '@testing-library/react'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Mark, Node } from '@tiptap/pm/model'
import { mapAttrsToHTMLAttributes,renderToReactElement } from '@tiptap/static-renderer/pm/react'
import React from 'react'

describe('static renderer: react', () => {
  it('mapAttrsToHTMLAttributes maps attributes to React attributes', () => {
    const attrs = {
      class: 'my-class',
      style: 'color: red; font-size: 16px; transform: translateX(15px) translateY(10px);',
      id: 'my-id',
    }

    const result = mapAttrsToHTMLAttributes(attrs, 'test-key')

    expect(result).to.deep.equal({
      className: 'my-class',
      style: { color: 'red', fontSize: '16px', transform: 'translateX(15px) translateY(10px)' },
      id: 'my-id',
      key: 'test-key',
    })
  })
})

describe('static render json to react elements (with prosemirror)', () => {
  it('generates a React element from JSON without an editor instance', () => {
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

    const view = render(
      renderToReactElement({
        content: json,
        extensions: [Document, Paragraph, Text, Bold],
      }),
    )
    const html = prettyDOM(view.container, undefined, { highlight: false })

    expect(html).to.eq(`<div>
  <p>
    <strong>
      Example Text
    </strong>
  </p>
</div>`)
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

    const view = render(
      renderToReactElement({
        content: json,
        extensions: [Document, Paragraph, Text, Bold],
        options: {
          nodeMapping: {
            doc: ({ children }) => {
              return React.createElement('doc', {}, children)
            },
          },
          markMapping: {
            bold: ({ children }) => {
              return React.createElement('b', {}, children)
            },
          },
        },
      }),
    )
    const html = prettyDOM(view.container, undefined, { highlight: false })

    expect(html).to.eq(`<div>
  <doc>
    <p>
      <b>
        Example Text
      </b>
    </p>
  </doc>
</div>`)
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

    const view = render(
      renderToReactElement({
        content: json,
        extensions: [Document, Paragraph, Text, Bold],
        options: {
          nodeMapping: {
            doc: ({ children, node }) => {
              expect(node.type.name).to.eq('doc')
              expect(node).to.be.instanceOf(Node)
              return React.createElement('doc', {}, children)
            },
          },
          markMapping: {
            bold: ({ children, mark }) => {
              expect(mark.type.name).to.eq('bold')
              expect(mark).to.be.instanceOf(Mark)
              return React.createElement('b', {}, children)
            },
          },
        },
      }),
    )
    const html = prettyDOM(view.container, undefined, { highlight: false })

    expect(html).to.eq(`<div>
  <doc>
    <p>
      <b>
        Example Text
      </b>
    </p>
  </doc>
</div>`)
  })
})
