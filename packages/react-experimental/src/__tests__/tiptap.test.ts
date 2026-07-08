import type { Editor } from '@tiptap/core'
import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { EditorContent } from '../components/EditorContent.js'
import { useCurrentEditor } from '../Context.js'
import { Tiptap, useTiptap, useTiptapState } from '../Tiptap.js'
import {
  mountEditorContent,
  mountTrackedRoot,
  tiptapTestNodes,
  unmountTrackedRoots,
} from './helpers.js'

afterEach(unmountTrackedRoots)

/** Creates a live renderer editor without mounting EditorContent for it. */
const createEditor = async (content = '<p>hi</p>') => {
  const { editor, root } = await mountEditorContent({ content, extensions: tiptapTestNodes })

  // Unmount the helper's EditorContent; the editor instance stays alive
  await act(async () => root.unmount())
  return editor
}

describe('Tiptap', () => {
  it('provides the editor through useTiptap and renders Tiptap.Content', async () => {
    const editor = await createEditor()
    let seen: Editor | null = null
    const Probe = () => {
      seen = useTiptap().editor
      return null
    }
    const { root, container } = mountTrackedRoot()

    await act(async () => {
      root.render(
        createElement(Tiptap, { editor }, createElement(Probe), createElement(Tiptap.Content)),
      )
    })

    expect(seen).toBe(editor)
    expect(container.querySelector('p')?.textContent).toBe('hi')
  })

  it('supports the deprecated instance prop', async () => {
    const editor = await createEditor()
    let seen: Editor | null = null
    const Probe = () => {
      seen = useTiptap().editor
      return null
    }
    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(Tiptap, { instance: editor }, createElement(Probe)))
    })

    expect(seen).toBe(editor)
  })

  it('useTiptap throws outside a provider', async () => {
    const failures: unknown[] = []
    const Probe = () => {
      try {
        useTiptap().editor.commands.focus()
      } catch (error) {
        failures.push(error)
      }
      return null
    }
    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(Probe))
    })

    expect(String(failures[0])).toContain('within a <Tiptap> provider')
  })

  it('useCurrentEditor returns the provided editor inside and null outside', async () => {
    const editor = await createEditor()
    const seen: (Editor | null)[] = []
    const Probe = () => {
      seen.push(useCurrentEditor().editor)
      return null
    }
    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(Probe))
    })
    await act(async () => {
      root.render(createElement(Tiptap, { editor }, createElement(Probe)))
    })

    expect(seen[0]).toBeNull()
    expect(seen[seen.length - 1]).toBe(editor)
  })

  it('useTiptapState selects over the context editor and updates per transaction', async () => {
    const editor = await createEditor()
    let text = ''
    const Probe = () => {
      text = useTiptapState(snapshot => snapshot.editor.state.doc.textContent)
      return null
    }
    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(Tiptap, { editor }, createElement(Probe)))
    })
    expect(text).toBe('hi')

    await act(async () => {
      editor.view.dispatch(editor.state.tr.insertText('!', 1))
    })
    expect(text).toBe('!hi')
  })

  it('EditorContent with a null editor renders a plain element', async () => {
    const { root, container } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(EditorContent, { editor: null, className: 'placeholder' }))
    })

    const div = container.firstElementChild as HTMLDivElement

    expect(div.tagName).toBe('DIV')
    expect(div.className).toBe('placeholder')
  })
})
