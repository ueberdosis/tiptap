import { describe, expect, it } from 'vitest'
import {
  applyMigrationStep,
  createMigration,
  migrateDocument,
  removeAttr,
  removeNode,
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

  it('populates steps on migration when created with ops', () => {
    const migration = createMigration(2, [renameNode('p', 'paragraph')])

    expect(migration.steps).toEqual([{ type: 'renameNode', from: 'p', to: 'paragraph' }])
  })

  it('does not populate steps when created with a function', () => {
    const migration = createMigration(2, () => ({ type: 'doc' }))

    expect(migration.steps).toBeUndefined()
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

  it('renames marks using renameMark', () => {
    const docWithMarks = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello',
          marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'bold' }],
        },
        {
          type: 'text',
          text: 'world',
          marks: [{ type: 'bold' }],
        },
      ],
    }

    const result = migrateDocument(
      docWithMarks,
      [createMigration(2, [{ type: 'renameMark', from: 'bold', to: 'strong' }])],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([
      { type: 'strong' },
      { type: 'italic' },
      { type: 'strong' },
    ])
    expect(result.content?.[1].marks).toEqual([{ type: 'strong' }])
  })

  it('removes marks using removeMark', () => {
    const docWithMarks = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello',
          marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }],
        },
        {
          type: 'text',
          text: 'world',
          marks: [{ type: 'bold' }],
        },
        {
          type: 'text',
          text: 'plain',
        },
      ],
    }

    const result = migrateDocument(
      docWithMarks,
      [createMigration(2, [{ type: 'removeMark', markType: 'bold' }])],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([{ type: 'italic' }, { type: 'underline' }])
    expect(result.content?.[1].marks).toEqual([])
    expect(result.content?.[2].marks).toBeUndefined()
  })

  it('adds marks using addMark', () => {
    const docWithoutMarks = {
      type: 'doc',
      content: [
        { type: 'text', text: 'plain', marks: [{ type: 'bold' }] },
        { type: 'text', text: 'also plain' },
      ],
    }

    const result = migrateDocument(
      docWithoutMarks,
      [createMigration(2, [{ type: 'addMark', markType: 'highlight' }])],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([{ type: 'bold' }, { type: 'highlight' }])
    expect(result.content?.[1].marks).toEqual([{ type: 'highlight' }])
  })

  it('adds marks with attrs using addMark', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'text', text: 'hello' }],
    }

    const result = migrateDocument(
      doc,
      [createMigration(2, [{ type: 'addMark', markType: 'textStyle', attrs: { color: 'red' } }])],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([{ type: 'textStyle', attrs: { color: 'red' } }])
  })

  it('adds an attribute to all marks of a type using addMarkAttribute', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello',
          marks: [
            { type: 'bold' },
            { type: 'link', attrs: { href: '/' } },
            { type: 'bold', attrs: { weight: '700' } },
          ],
        },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          { type: 'addMarkAttribute', markType: 'bold', key: 'edited', value: true },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([
      { type: 'bold', attrs: { edited: true } },
      { type: 'link', attrs: { href: '/' } },
      { type: 'bold', attrs: { weight: '700', edited: true } },
    ])
  })

  it('removes an attribute from all marks of a type using removeMarkAttribute', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello',
          marks: [
            { type: 'link', attrs: { href: '/', rel: 'nofollow' } },
            { type: 'bold', attrs: { weight: '700' } },
          ],
        },
      ],
    }

    const result = migrateDocument(
      doc,
      [createMigration(2, [{ type: 'removeMarkAttribute', markType: 'link', key: 'rel' }])],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([
      { type: 'link', attrs: { href: '/' } },
      { type: 'bold', attrs: { weight: '700' } },
    ])
  })

  it('renames an attribute on all marks of a type using renameMarkAttribute', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello',
          marks: [
            { type: 'textStyle', attrs: { fontSize: '16px' } },
            { type: 'textStyle', attrs: { fontSize: '14px', color: 'red' } },
          ],
        },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          { type: 'renameMarkAttribute', markType: 'textStyle', from: 'fontSize', to: 'size' },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([
      { type: 'textStyle', attrs: { size: '16px' } },
      { type: 'textStyle', attrs: { size: '14px', color: 'red' } },
    ])
  })

  it('renames only marks that match the if condition', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'stay link',
          marks: [{ type: 'link', attrs: { href: '/old', target: '_self' } }],
        },
        {
          type: 'text',
          text: 'migrate link',
          marks: [{ type: 'link', attrs: { href: '/old', target: '_blank' } }],
        },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          {
            type: 'renameMark',
            from: 'link',
            to: 'externalLink',
            if: { attrs: { target: '_blank' } },
          },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([
      { type: 'link', attrs: { href: '/old', target: '_self' } },
    ])
    expect(result.content?.[1].marks).toEqual([
      { type: 'externalLink', attrs: { href: '/old', target: '_blank' } },
    ])
  })

  it('removes only marks that match the if condition', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'keep me',
          marks: [{ type: 'link', attrs: { href: '/keep', target: '_self' } }],
        },
        {
          type: 'text',
          text: 'remove me',
          marks: [{ type: 'link', attrs: { href: '/remove', target: '_blank' } }],
        },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          { type: 'removeMark', markType: 'link', if: { attrs: { target: '_blank' } } },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([
      { type: 'link', attrs: { href: '/keep', target: '_self' } },
    ])
    expect(result.content?.[1].marks).toEqual([])
  })

  it('renames only nodes matching the if condition', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'div', attrs: { role: 'old' } },
        { type: 'div', attrs: { role: 'keep' } },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          { type: 'renameNode', from: 'div', to: 'section', if: { attrs: { role: 'old' } } },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].type).toBe('section')
    expect(result.content?.[1].type).toBe('div')
  })

  it('sets attr only on nodes matching the if condition', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 } },
        { type: 'heading', attrs: { level: 3 } },
        { type: 'heading', attrs: { level: 2 } },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          {
            type: 'setAttr',
            nodeType: 'heading',
            key: 'level',
            value: 1,
            if: { attrs: { level: 2 } },
          },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].attrs?.level).toBe(1)
    expect(result.content?.[1].attrs?.level).toBe(3)
    expect(result.content?.[2].attrs?.level).toBe(1)
  })

  it('removes attr only on nodes matching the if condition', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'link', attrs: { href: '/a', target: '_blank' } },
        { type: 'link', attrs: { href: '/b', target: '_self' } },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          {
            type: 'removeAttr',
            nodeType: 'link',
            key: 'target',
            if: { attrs: { target: '_blank' } },
          },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].attrs).toEqual({ href: '/a' })
    expect(result.content?.[1].attrs).toEqual({ href: '/b', target: '_self' })
  })

  it('unwraps only nodes matching the if condition', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'wrapper', attrs: { version: 'old' }, content: [{ type: 'text', text: 'a' }] },
        { type: 'wrapper', attrs: { version: 'current' }, content: [{ type: 'text', text: 'b' }] },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          { type: 'unwrapNode', nodeType: 'wrapper', if: { attrs: { version: 'old' } } },
        ]),
      ],
      1,
      2,
    )

    expect(result.content).toHaveLength(2)
    expect(result.content?.[0].type).toBe('text')
    expect(result.content?.[1].type).toBe('wrapper')
  })

  it('wraps only nodes matching the if condition', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'special', attrs: { migrate: true } },
        { type: 'special', attrs: { migrate: false } },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          {
            type: 'wrapNode',
            nodeType: 'special',
            wrapper: { type: 'section' },
            if: { attrs: { migrate: true } },
          },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].type).toBe('section')
    expect(result.content?.[0].content?.[0].type).toBe('special')
    expect(result.content?.[1].type).toBe('special')
  })

  it('renames a node and maps attributes in one step', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'div', attrs: { 'data-level': 2, role: 'old' } }],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          { type: 'renameNode', from: 'div', to: 'section', renameAttr: { 'data-level': 'level' } },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].type).toBe('section')
    expect(result.content?.[0].attrs).toEqual({ level: 2, role: 'old' })
  })

  it('removes a node using the removeNode op', () => {
    const docsWithTrash = {
      type: 'doc',
      content: [
        { type: 'keep', content: [{ type: 'text', text: 'stay' }] },
        { type: 'trash', content: [{ type: 'text', text: 'go' }] },
        { type: 'keep', content: [{ type: 'text', text: 'stay too' }] },
      ],
    }

    const result = migrateDocument(docsWithTrash, [createMigration(2, [removeNode('trash')])], 1, 2)

    expect(result.content).toHaveLength(2)
    expect(result.content?.[0].type).toBe('keep')
    expect(result.content?.[1].type).toBe('keep')
  })

  it('throws when migration removes the document root', () => {
    expect(() =>
      migrateDocument(
        { type: 'doc', content: [] },
        [createMigration(2, [removeNode('doc')])],
        1,
        2,
      ),
    ).toThrow('[tiptap error]: Migration removed document root')
  })

  it('does not re-apply ops before unwrap when continuing on unwrapped children', () => {
    const galleryDoc = {
      type: 'doc',
      content: [
        {
          type: 'gallery',
          content: [{ type: 'img', attrs: { src: 'a.jpg', pass: 0 } }],
        },
      ],
    }

    const result = migrateDocument(
      galleryDoc,
      [
        createMigration(2, [
          setAttr('img', 'pass', 1),
          unwrapNode('gallery'),
          setAttr('img', 'pass', 2),
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].attrs).toEqual({ src: 'a.jpg', pass: 2 })
  })

  it('applyMigrationStep applies a single operation', () => {
    const result = applyMigrationStep(doc, renameNode('paragraph', 'paragraph_v2'))

    expect(result.content?.[0].type).toBe('paragraph_v2')
  })

  it('renames a mark and maps its attributes in one step', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'text',
          text: 'hello',
          marks: [{ type: 'link', attrs: { href: 'https://old.com', target: '_blank' } }],
        },
      ],
    }

    const result = migrateDocument(
      doc,
      [
        createMigration(2, [
          { type: 'renameMark', from: 'link', to: 'externalLink', renameAttr: { href: 'url' } },
        ]),
      ],
      1,
      2,
    )

    expect(result.content?.[0].marks).toEqual([
      { type: 'externalLink', attrs: { url: 'https://old.com', target: '_blank' } },
    ])
  })
})
