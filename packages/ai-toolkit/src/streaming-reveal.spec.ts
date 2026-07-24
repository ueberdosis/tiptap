// @vitest-environment happy-dom

import { Editor } from '@tiptap/core'
import { Collaboration } from '@tiptap/extension-collaboration'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'

import { AiInsertReveal } from './streaming-reveal.js'

/** Creates an editor with {@link AiInsertReveal} but no collaboration (no y-sync plugin). */
function createEditor(): Promise<Editor> {
  return new Promise(resolve => {
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit, AiInsertReveal],
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      },
      onCreate: () => {
        resolve(editor)
      },
    })
  })
}

/** Creates a collaborative editor (fresh Y.Doc, {@link AiInsertReveal}) seeded with one `Hello` paragraph. */
function createCollabEditor(options?: {
  durationMs?: number
}): Promise<{ editor: Editor; ydoc: Y.Doc }> {
  const ydoc = new Y.Doc()
  return new Promise(resolve => {
    new Editor({
      element: document.createElement('div'),
      extensions: [
        StarterKit.configure({ undoRedo: false }),
        Collaboration.configure({ document: ydoc }),
        options?.durationMs === undefined
          ? AiInsertReveal
          : AiInsertReveal.configure({ durationMs: options.durationMs }),
      ],
      onCreate: ({ editor }) => {
        // Collaboration ignores the `content` prop (the empty Y.Doc wins when the
        // y-sync plugin binds), so seed the shared doc with a local edit instead.
        editor.commands.setContent('<p>Hello</p>')
        resolve({ editor, ydoc })
      },
    })
  })
}

/** Applies a remote insert via a synced second Y.Doc. */
function remoteInsert(ydoc: Y.Doc, index: number, text: string): void {
  const remote = new Y.Doc()
  Y.applyUpdate(remote, Y.encodeStateAsUpdate(ydoc))
  const paragraph = remote.getXmlFragment('default').get(0) as Y.XmlElement
  const xmlText = paragraph.get(0) as Y.XmlText
  xmlText.insert(index, text)
  Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(remote, Y.encodeStateVector(ydoc)))
}

/** Collects the extension's current reveal decorations from the editor's live state. */
function revealDecorations(editor: Editor): Array<{ from: number; to: number; style: string }> {
  for (const plugin of editor.state.plugins) {
    const set = (plugin as any).props?.decorations?.call(plugin, editor.state)
    const found = (set?.find?.() ?? []).filter(
      (d: any) => d.type?.attrs?.class === 'ai-insert-reveal',
    )
    if (found.length > 0) {
      return found.map((d: any) => ({ from: d.from, to: d.to, style: d.type.attrs.style ?? '' }))
    }
  }
  return []
}

describe('AiInsertReveal', () => {
  it('is a named Tiptap extension', () => {
    expect(AiInsertReveal.name).toBe('aiInsertReveal')
  })

  it('registers and degrades to a no-op when no collaboration y-sync plugin is present', async () => {
    const editor = await createEditor()

    expect(editor.extensionManager.extensions.some(e => e.name === 'aiInsertReveal')).toBe(true)
    // Without a y-sync plugin the decorations source resolves to nothing, so the
    // editor renders normally rather than throwing.
    expect(editor.getText()).toBe('Hello')

    editor.destroy()
  })

  it('applies configured className and durationMs', async () => {
    const editor = await new Promise<Editor>(resolve => {
      const created = new Editor({
        element: document.createElement('div'),
        extensions: [
          StarterKit,
          AiInsertReveal.configure({ className: 'custom-reveal', durationMs: 300 }),
        ],
        onCreate: () => resolve(created),
      })
    })

    const reveal = editor.extensionManager.extensions.find(e => e.name === 'aiInsertReveal')
    expect(reveal?.options).toMatchObject({ className: 'custom-reveal', durationMs: 300 })

    editor.destroy()
  })

  it('reveals a remote insert as a decoration over exactly the inserted run', async () => {
    const { editor, ydoc } = await createCollabEditor()

    remoteInsert(ydoc, 5, ' WORLD')

    expect(editor.getText()).toBe('Hello WORLD')
    const decorations = revealDecorations(editor)
    expect(decorations).toHaveLength(1)
    expect(decorations[0].to - decorations[0].from).toBe(' WORLD'.length)
    // The age-seeded animation-delay is present so the fade survives re-renders.
    expect(decorations[0].style).toMatch(/animation-delay: -\d+ms/)

    editor.destroy()
  })

  it("does not reveal the local user's own typing", async () => {
    const { editor } = await createCollabEditor()

    // A local transaction (transaction.local === true) must be ignored.
    editor.commands.insertContentAt(6, 'X')

    expect(editor.getText()).toBe('HelloX')
    expect(revealDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('drops the reveal once its duration has elapsed', async () => {
    const { editor, ydoc } = await createCollabEditor({ durationMs: 30 })

    remoteInsert(ydoc, 5, ' WORLD')
    expect(revealDecorations(editor)).toHaveLength(1)

    await new Promise(resolve => setTimeout(resolve, 60))
    expect(revealDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('ignores an insert larger than the max reveal range', async () => {
    const { editor, ydoc } = await createCollabEditor()

    remoteInsert(ydoc, 5, 'x'.repeat(401))

    expect(editor.getText()).toBe(`Hello${'x'.repeat(401)}`)
    expect(revealDecorations(editor)).toHaveLength(0)

    editor.destroy()
  })

  it('tears down cleanly after a reveal without throwing', async () => {
    const { editor, ydoc } = await createCollabEditor()
    remoteInsert(ydoc, 5, ' WORLD')
    expect(revealDecorations(editor)).toHaveLength(1)

    expect(() => editor.destroy()).not.toThrow()
  })
})
