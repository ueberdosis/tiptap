import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Schema } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { describe, expect, it } from 'vitest'

/**
 * ReactEditorView reaches into non-public prosemirror-view internals (see
 * AUDIT.md section 2). This suite fails loudly when the dependency drifts from
 * the audited version or the internals change shape, instead of letting the
 * renderer break at runtime.
 */
const PINNED_VERSION = '1.41.9'

describe('prosemirror-view compatibility', () => {
  it(`resolves the pinned prosemirror-view version (${PINNED_VERSION})`, () => {
    // Resolve from @tiptap/pm, the instance all runtime imports go through
    const requireFromPm = createRequire(
      join(dirname(fileURLToPath(import.meta.url)), '../../../pm/index.js'),
    )
    const entry = requireFromPm.resolve('prosemirror-view')
    const packageRoot = entry.slice(
      0,
      entry.lastIndexOf('prosemirror-view') + 'prosemirror-view'.length,
    )
    const { version } = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

    expect(version).toBe(PINNED_VERSION)
  })

  it('exposes the private EditorView internals ReactEditorView relies on', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'block+' },
        paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
        text: { group: 'inline' },
      },
    })
    const view = new EditorView(null, { state: EditorState.create({ schema }) })
    const internals = view as unknown as Record<string, unknown>

    // docView: the position<->DOM mapping tree, with the members the base
    // class calls during updateStateInner()/destroy()
    const docView = internals.docView as Record<string, unknown>
    expect(docView).toBeTruthy()
    expect(docView.matchesNode).toBeTypeOf('function')
    expect(docView.update).toBeTypeOf('function')
    expect(docView.markDirty).toBeTypeOf('function')
    expect(docView.destroy).toBeTypeOf('function')

    // domObserver: observer/queue/onSelectionChange/stop/start
    const domObserver = internals.domObserver as Record<string, unknown>
    expect(domObserver).toBeTruthy()
    expect('observer' in domObserver).toBe(true)
    expect(Array.isArray(domObserver.queue)).toBe(true)
    expect(domObserver.onSelectionChange).toBeTypeOf('function')
    expect(domObserver.stop).toBeTypeOf('function')
    expect(domObserver.start).toBeTypeOf('function')

    // committed props, input state, selection helpers, node-selection cache
    expect('_props' in internals).toBe(true)
    expect('input' in internals).toBe(true)
    expect('cursorWrapper' in internals).toBe(true)
    expect('lastSelectedViewDesc' in internals).toBe(true)
    expect(internals.domSelection).toBeTypeOf('function')
    expect(internals.domSelectionRange).toBeTypeOf('function')

    // isDestroyed is `docView == null` in the pinned version — the trap that
    // forces ReactEditorView to shadow it (AUDIT.md section 2)
    expect(view.isDestroyed).toBe(false)
    view.destroy()
    expect(internals.docView).toBeNull()
    expect(view.isDestroyed).toBe(true)
  })
})
