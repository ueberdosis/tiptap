import { type AttributeSpec, Schema } from '@tiptap/pm/model'
import { expect, it } from 'vite-plus/test'

import { serializeSchema } from './serialize-schema.js'

interface SchemaWithAttributesOptions {
  linkAttributes?: Record<string, AttributeSpec>
  paragraphAttributes?: Record<string, AttributeSpec>
}

function schemaWithAttributes({
  linkAttributes = {},
  paragraphAttributes = {},
}: SchemaWithAttributesOptions): Schema {
  return new Schema({
    nodes: {
      doc: { content: 'block+' },
      paragraph: { group: 'block', content: 'inline*', attrs: paragraphAttributes },
      text: { group: 'inline' },
    },
    marks: { link: { attrs: linkAttributes } },
  })
}

// Rebuilds the schema the way a server does after receiving it as JSON.
function rebuildFromJson(schema: Schema): Schema {
  return new Schema(JSON.parse(JSON.stringify(serializeSchema(schema))))
}

function paragraphWithLink(linkAttributes: Record<string, unknown>) {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Link', marks: [{ type: 'link', attrs: linkAttributes }] }],
      },
    ],
  }
}

it('keeps mark attributes with an undefined default optional after a JSON round trip', () => {
  const schema = rebuildFromJson(
    schemaWithAttributes({
      linkAttributes: {
        href: { default: null },
        class: { default: undefined },
        title: { default: undefined },
      },
    }),
  )

  const document = schema.nodeFromJSON(paragraphWithLink({ href: 'https://tiptap.dev' }))

  expect(() => document.check()).not.toThrow()
  expect(document.firstChild?.firstChild?.marks[0]?.attrs).toEqual({
    href: 'https://tiptap.dev',
    class: null,
    title: null,
  })
})

it('keeps node attributes with an undefined default optional after a JSON round trip', () => {
  const schema = rebuildFromJson(
    schemaWithAttributes({ paragraphAttributes: { color: { default: undefined } } }),
  )

  expect(schema.nodes.paragraph?.hasRequiredAttrs()).toBe(false)
  expect(() => schema.node('doc', null, [schema.node('paragraph')]).check()).not.toThrow()
})

it('allows null where the validate string allows undefined', () => {
  const schema = rebuildFromJson(
    schemaWithAttributes({
      linkAttributes: { title: { default: undefined, validate: 'string|undefined' } },
    }),
  )

  expect(() => schema.nodeFromJSON(paragraphWithLink({})).check()).not.toThrow()
  expect(() => schema.nodeFromJSON(paragraphWithLink({ title: 1 })).check()).toThrow()
})

it('leaves other attributes unchanged', () => {
  const serialized = serializeSchema(
    schemaWithAttributes({
      linkAttributes: {
        href: {},
        target: { default: '_blank', validate: 'string' },
        rel: { default: null },
      },
    }),
  )

  expect(JSON.parse(JSON.stringify(serialized.marks.link?.attrs))).toEqual({
    href: {},
    target: { default: '_blank', validate: 'string' },
    rel: { default: null },
  })
})
