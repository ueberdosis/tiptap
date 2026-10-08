const assert = require('node:assert/strict')
const { createRequire } = require('node:module')
const { test } = require('node:test')
const { setTimeout: delay } = require('node:timers/promises')
const { Window } = require('happy-dom')

const requireToolkit = createRequire(require.resolve('../../package.json'))

test('CommonJS selections retain their endpoints after blur', async t => {
  const window = new Window()
  for (const key of [
    'window',
    'document',
    'navigator',
    'HTMLElement',
    'Node',
    'MutationObserver',
  ]) {
    Object.defineProperty(globalThis, key, { configurable: true, value: window[key] })
  }
  const { Editor } = requireToolkit('@tiptap/core')
  const { ServerAiToolkit } = requireToolkit('./dist/index.cjs')
  const { Collaboration } = require('../../../extension-collaboration/dist/index.cjs')
  const { StarterKit } = require('../../../starter-kit/dist/index.cjs')
  const Y = requireToolkit('yjs')
  const { relativePositionToAbsolutePosition, ySyncPluginKey } = requireToolkit('@tiptap/y-tiptap')
  const doc = new Y.Doc()
  let state = {}
  const provider = {
    awareness: {
      getLocalState: () => state,
      setLocalStateField: (key, value) => {
        state = { ...state, [key]: value }
      },
    },
  }
  const editor = new Editor({
    element: window.document.body.appendChild(window.document.createElement('div')),
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      Collaboration.configure({ document: doc }),
      ServerAiToolkit.configure({ selectionAwareness: { provider, userId: 'user-1' } }),
    ],
    onCreate: ({ editor: ready }) => {
      ready.commands.setContent('<p>Hello world</p>')
      ready.commands.setTextSelection({ from: 2, to: 6 })
    },
  })
  t.after(() => {
    editor.destroy()
    doc.destroy()
    window.happyDOM.abort()
  })
  for (let attempt = 0; attempt < 100 && !state.aiToolkitSelection; attempt += 1) {
    await delay(10)
  }
  editor.view.focus()
  editor.view.dom.blur()
  const entry = state.aiToolkitSelection?.fields.default
  assert.ok(entry, 'selection awareness initialized')
  const sync = ySyncPluginKey.getState(editor.state)
  const resolve = position =>
    relativePositionToAbsolutePosition(
      doc,
      sync.type,
      Y.createRelativePositionFromJSON(position),
      sync.binding.mapping,
    )
  assert.equal(resolve(entry.anchor), 2)
  assert.equal(resolve(entry.head), 6)
})
