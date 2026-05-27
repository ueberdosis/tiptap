import { describe, expect, it } from 'vitest'
import {
  createMigration,
  migrateDocument,
  removeAttr,
  renameAttr,
  renameNode,
  setAttr,
  unwrapNode,
  wrapNode,
} from './index.js'

const doc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Hello World',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        {
          type: 'text',
          text: 'Heading 2',
        },
      ],
    },
  ],
}

describe('migrateDocument', () => {
  it('applies migrations in order within the given version range', () => {
    const result = migrateDocument(
      doc,
      [
        createMigration(2, node => {
          if (node.type === 'paragraph') {
            return { ...node, type: 'paragraph_v2' }
          }

          return node
        }),
        createMigration(3, node => {
          if (node.type === 'heading') {
            const { level, ...attrs } = node.attrs || {}

            return { ...node, type: 'heading_v3', attrs: { ...attrs, newLevel: level } }
          }

          return node
        }),
      ],
      1,
      3,
    )

    expect(result).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph_v2',
          content: [
            {
              type: 'text',
              text: 'Hello World',
            },
          ],
        },
        {
          type: 'heading_v3',
          attrs: { newLevel: 2 },
          content: [
            {
              type: 'text',
              text: 'Heading 2',
            },
          ],
        },
      ],
    })
  })

  it('does not mutate the original document', () => {
    const original = structuredClone(doc)

    migrateDocument(
      doc,
      [
        createMigration(2, node => {
          if (node.type === 'paragraph') {
            return { ...node, type: 'paragraph_v2' }
          }

          return node
        }),
      ],
      1,
      2,
    )

    expect(doc).toEqual(original)
  })

  it('returns the same document when from equals to', () => {
    const result = migrateDocument(doc, [], 1, 1)

    expect(result).toEqual(doc)
    expect(result).not.toBe(doc)
  })

  it('skips migration versions that are outside the requested range', () => {
    const result = migrateDocument(
      doc,
      [
        createMigration(2, node => {
          return { ...node, type: 'changed' }
        }),
      ],
      2,
      2,
    )

    expect(result).toEqual(doc)
  })

  it('throws when duplicate migration versions exist', () => {
    expect(() =>
      migrateDocument(
        doc,
        [createMigration(2, node => node), createMigration(2, node => node)],
        1,
        2,
      ),
    ).toThrow('Duplicate migration versions')
  })

  it('migrates nodes at any nesting depth', () => {
    const deepDoc = {
      type: 'doc',
      content: [
        {
          type: 'section',
          content: [
            {
              type: 'nested',
              content: [{ type: 'text', text: 'deep' }],
            },
          ],
        },
      ],
    }

    const result = migrateDocument(
      deepDoc,
      [
        createMigration(2, node => {
          if (node.type === 'nested') {
            return { ...node, type: 'migrated_nested' }
          }
          return node
        }),
      ],
      1,
      2,
    )

    expect(result.content?.[0].content?.[0].type).toBe('migrated_nested')
  })

  it('handles nodes without content property', () => {
    const leafDoc = {
      type: 'doc',
      content: [{ type: 'leaf', value: 'hello' }],
    }

    const result = migrateDocument(
      leafDoc,
      [
        createMigration(2, node => {
          if (node.type === 'leaf') {
            return { ...node, value: 'migrated' }
          }
          return node
        }),
      ],
      1,
      2,
    )

    expect(result.content?.[0].value).toBe('migrated')
  })

  it('supports declarative renameNode operation', () => {
    const result = migrateDocument(
      doc,
      [createMigration(2, [renameNode('paragraph', 'section'), renameNode('heading', 'title')])],
      1,
      2,
    )

    expect(result).toEqual({
      type: 'doc',
      content: [
        {
          type: 'section',
          content: [{ type: 'text', text: 'Hello World' }],
        },
        {
          type: 'title',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Heading 2' }],
        },
      ],
    })
  })

  it('supports declarative renameAttr operation', () => {
    const result = migrateDocument(
      doc,
      [createMigration(2, [renameAttr('heading', 'level', 'headingLevel')])],
      1,
      2,
    )

    expect(result.content?.[1].attrs).toEqual({ headingLevel: 2 })
  })

  it('supports mixing renameNode and renameAttr operations', () => {
    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          renameAttr('heading', 'level', 'headingLevel'),
          renameNode('heading', 'title'),
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[1].type).toBe('title')
    expect(result.content?.[1].attrs).toEqual({ headingLevel: 2 })
  })

  it('supports setAttr helper', () => {
    const result = migrateDocument(
      doc,
      [createMigration(2, [setAttr('heading', 'level', 1)])],
      1,
      2,
    )

    expect(result.content?.[1].attrs?.level).toBe(1)
  })

  it('supports removeAttr helper', () => {
    const result = migrateDocument(
      doc,
      [createMigration(2, [removeAttr('heading', 'level')])],
      1,
      2,
    )

    expect(result.content?.[1].attrs).toEqual({})
  })

  it('supports the helper function syntax alongside plain objects', () => {
    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          renameNode('paragraph', 'section'),
          renameAttr('heading', 'level', 'headingLevel'),
        ]),
        createMigration(3, [
          removeAttr('heading', 'headingLevel'),
          setAttr('heading', 'default', true),
        ]),
      ],
      1,
      3,
    )

    expect(result.content?.[0].type).toBe('section')
    expect(result.content?.[1].type).toBe('heading')
    expect(result.content?.[1].attrs).toEqual({ default: true })
  })

  it('unwraps a node by returning its children as an array', () => {
    const galleryDoc = {
      type: 'doc',
      content: [
        {
          type: 'div',
          attrs: { 'data-gallery': '' },
          content: [
            { type: 'img', attrs: { src: 'a.jpg' } },
            { type: 'img', attrs: { src: 'b.jpg' } },
          ],
        },
      ],
    }

    const result = migrateDocument(
      galleryDoc,
      [
        createMigration(2, node => {
          if (node.type === 'div' && node.attrs?.['data-gallery'] !== undefined) {
            return node.content || []
          }

          return node
        }),
      ],
      1,
      2,
    )

    expect(result.content).toHaveLength(2)
    expect(result.content?.[0].type).toBe('img')
    expect(result.content?.[1].type).toBe('img')
  })

  it('removes a node by returning null', () => {
    const docsWithTrash = {
      type: 'doc',
      content: [
        { type: 'keep', content: [{ type: 'text', text: 'stay' }] },
        { type: 'trash', content: [{ type: 'text', text: 'go' }] },
        { type: 'keep', content: [{ type: 'text', text: 'stay too' }] },
      ],
    }

    const result = migrateDocument(
      docsWithTrash,
      [
        createMigration(2, node => {
          if (node.type === 'trash') {
            return null
          }

          return node
        }),
      ],
      1,
      2,
    )

    expect(result.content).toHaveLength(2)
    expect(result.content?.[0].type).toBe('keep')
    expect(result.content?.[1].type).toBe('keep')
  })

  it('wraps a node without infinite recursion', () => {
    const result = migrateDocument(
      doc,
      [
        createMigration(2, node => {
          if (node.type === 'paragraph') {
            return { type: 'div', attrs: { class: 'wrapper' }, content: [node] }
          }

          return node
        }),
      ],
      1,
      2,
    )

    expect(result.content?.[0].type).toBe('div')
    expect(result.content?.[0].attrs).toEqual({ class: 'wrapper' })
    expect(result.content?.[0].content?.[0].type).toBe('paragraph')
  })

  it('unwraps a node type using the unwrapNode op', () => {
    const galleryDoc = {
      type: 'doc',
      content: [
        {
          type: 'gallery',
          content: [
            { type: 'img', attrs: { src: 'a.jpg' } },
            { type: 'img', attrs: { src: 'b.jpg' } },
          ],
        },
      ],
    }

    const result = migrateDocument(galleryDoc, [createMigration(2, [unwrapNode('gallery')])], 1, 2)

    expect(result.content).toHaveLength(2)
    expect(result.content?.[0].type).toBe('img')
  })

  it('wraps a node type using the wrapNode op', () => {
    const result = migrateDocument(
      doc,
      [createMigration(2, [wrapNode('paragraph', { type: 'div', attrs: { class: 'wrapper' } })])],
      1,
      2,
    )

    expect(result.content?.[0].type).toBe('div')
    expect(result.content?.[0].attrs).toEqual({ class: 'wrapper' })
    expect(result.content?.[0].content?.[0].type).toBe('paragraph')
  })

  it('strips content from the wrapper in wrapNode op', () => {
    const result = migrateDocument(
      doc,
      [createMigration(2, [wrapNode('paragraph', { type: 'div', content: [{ type: 'trash' }] })])],
      1,
      2,
    )

    expect(result.content?.[0].type).toBe('div')
    expect(result.content?.[0].content).toHaveLength(1)
    expect(result.content?.[0].content?.[0].type).toBe('paragraph')
  })

  it('chains unwrapNode with subsequent ops on the unwrapped children', () => {
    const galleryDoc = {
      type: 'doc',
      content: [
        {
          type: 'gallery',
          content: [{ type: 'img', attrs: { src: 'a.jpg' } }],
        },
      ],
    }

    const result = migrateDocument(
      galleryDoc,
      [createMigration(2, [unwrapNode('gallery'), renameAttr('img', 'src', 'url')])],
      1,
      2,
    )

    expect(result.content?.[0].attrs).toEqual({ url: 'a.jpg' })
  })
})
