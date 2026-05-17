import { describe, expect, it } from 'vitest'

import * as ReactAdapter from '../react/index.js'

describe('@tiptap/editor/react surface', () => {
  it('re-exports the defaults-enabled Editor (shadowing core)', () => {
    expect(ReactAdapter.Editor).toBeDefined()
    // The defaults-enabled Editor is a constructor.
    expect(typeof ReactAdapter.Editor).toBe('function')
  })

  it('exposes the React hook + components needed for app code', () => {
    const expected = [
      'Editor',
      'EditorContent',
      'EditorContext',
      'EditorProvider',
      'NodeViewContent',
      'NodeViewWrapper',
      'PureEditorContent',
      'ReactMarkViewRenderer',
      'ReactNodeViewRenderer',
      'ReactRenderer',
      'useCurrentEditor',
      'useEditor',
      'useEditorState',
    ]

    expected.forEach(name => {
      expect(ReactAdapter, `${name} should be exported from @tiptap/editor/react`).toHaveProperty(name)
    })
  })

  it('does NOT re-export framework-agnostic helpers from /react', () => {
    // /react should be focused on React-specific APIs (plus the Editor class).
    // It must not become a second public barrel for the whole core surface.
    expect(ReactAdapter).not.toHaveProperty('mergeAttributes')
    expect(ReactAdapter).not.toHaveProperty('findChildren')
    expect(ReactAdapter).not.toHaveProperty('Node')
    expect(ReactAdapter).not.toHaveProperty('Mark')
  })
})
