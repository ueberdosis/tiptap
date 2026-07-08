import type { Editor } from '@tiptap/core'
import type { ReactNode } from 'react'
import { act, createElement, StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EditorContent } from '../components/EditorContent.js'
import type { NodeViewComponentProps } from '../components/NodeViewComponentProps.js'
import { useEditorEffect } from '../hooks/useEditorEffect.js'
import { useEditorEventCallback } from '../hooks/useEditorEventCallback.js'
import { useEditorEventListener } from '../hooks/useEditorEventListener.js'
import { useIsNodeSelected, useNodePos, useStopEvent } from '../hooks/useNodeViewHooks.js'
import { useMergedRefs } from '../refs.js'
import { useEditor } from '../useEditor.js'
import type { NodeViewDesc } from '../viewdesc.js'
import {
  mountTrackedRoot,
  renderTiptapEditor,
  tiptapTestNodes,
  unmountTrackedRoots,
} from './helpers.js'

afterEach(unmountTrackedRoots)

/** Waits past the manager's one-tick destruction grace period. */
const settleLifecycle = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 10)) // oxlint-disable-line
  })
}

interface HarnessProps {
  onEditor: (editor: Editor) => void
  content?: string
}

/** A consumer component using the hook the way applications do. */
const EditorHarness = ({ onEditor, content = '<p>hello</p>' }: HarnessProps): ReactNode => {
  const editor = useEditor({ content, extensions: tiptapTestNodes })

  onEditor(editor)
  return createElement(EditorContent, { editor })
}

describe('useEditor lifecycle', () => {
  it('survives StrictMode double-mounting and stays editable', async () => {
    const { root, container } = mountTrackedRoot()
    let editor: Editor | undefined

    await act(async () => {
      root.render(
        createElement(
          StrictMode,
          null,
          createElement(EditorHarness, {
            onEditor: current => {
              editor = current
            },
          }),
        ),
      )
    })
    await settleLifecycle()

    // The instance survived the double mount and is functional
    expect(editor).toBeDefined()
    expect(editor?.extensionManager).toBeTruthy()
    expect(container.querySelector('p')?.textContent).toBe('hello')

    await act(async () => {
      editor?.commands.insertContentAt(6, '!')
    })
    expect(container.querySelector('p')?.textContent).toBe('hello!')
  })

  it('destroys the editor after a real unmount', async () => {
    const { root } = mountTrackedRoot()
    let editor: Editor | undefined

    await act(async () => {
      root.render(
        createElement(EditorHarness, {
          onEditor: current => {
            editor = current
          },
        }),
      )
    })
    await act(async () => {
      root.unmount()
    })
    await settleLifecycle()

    expect(editor && !editor.extensionManager).toBe(true)
  })

  it('recreates the editor when deps change', async () => {
    const editors: Editor[] = []

    const DepsHarness = ({ dep }: { dep: string }): ReactNode => {
      const editor = useEditor({ content: `<p>${dep}</p>`, extensions: tiptapTestNodes }, [dep])

      if (!editors.includes(editor)) {
        editors.push(editor)
      }
      return createElement(EditorContent, { editor })
    }

    const { root, container } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(DepsHarness, { dep: 'one' }))
    })
    expect(container.querySelector('p')?.textContent).toBe('one')

    await act(async () => {
      root.render(createElement(DepsHarness, { dep: 'two' }))
    })
    await settleLifecycle()

    expect(editors).toHaveLength(2)
    expect(editors[0]).not.toBe(editors[1])
    expect(editors[0].extensionManager).toBeFalsy()
    expect(container.querySelector('p')?.textContent).toBe('two')
  })

  it('always calls the latest event callbacks', async () => {
    const calls: string[] = []

    const CallbackHarness = ({ label }: { label: string }): ReactNode => {
      const editor = useEditor({
        content: '<p>x</p>',
        extensions: tiptapTestNodes,
        onTransaction: () => {
          calls.push(label)
        },
      })

      return createElement(EditorContent, { editor, id: 'callback-harness' })
    }

    const { root, container } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(CallbackHarness, { label: 'first' }))
    })
    await act(async () => {
      root.render(createElement(CallbackHarness, { label: 'second' }))
    })

    const editorElement = container.querySelector('#callback-harness') as HTMLElement & {
      editor?: Editor
    }

    await act(async () => {
      editorElement.editor?.commands.insertContentAt(2, 'y')
    })

    expect(calls.at(-1)).toBe('second')
  })
})

describe('EditorContent guards', () => {
  it('throws a clear error when rendering a destroyed editor', async () => {
    const { editor } = await renderTiptapEditor('<p>doomed</p>')

    await unmountTrackedRoots()
    editor.destroy()

    const { root } = mountTrackedRoot()

    await expect(
      act(async () => {
        root.render(createElement(EditorContent, { editor }))
      }),
    ).rejects.toThrow(/has been destroyed/)
  })

  it('warns when two EditorContents render the same editor', async () => {
    const { editor } = await renderTiptapEditor('<p>shared</p>')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { root } = mountTrackedRoot()

    await act(async () => {
      root.render(createElement(EditorContent, { editor }))
    })

    expect(consoleError.mock.calls.some(call => String(call[0]).includes('already rendered'))).toBe(
      true,
    )
    consoleError.mockRestore()
  })
})

describe('safe-access hooks', () => {
  it('useEditorEffect runs after every commit with committed view state', async () => {
    const observed: string[] = []

    const EffectHarness = ({ editor }: { editor: Editor }): ReactNode => {
      useEditorEffect(editor, current => {
        // The view is committed here: it carries the state React just
        // rendered, so geometry and content reads are safe
        observed.push(current.view.state.doc.textContent)
      })
      return null
    }

    const { editor, root } = await renderTiptapEditor('<p>ab</p>')

    // Re-render the root with the effect consumer as a *sibling before*
    // EditorContent — the ordering plain useLayoutEffect gets wrong
    await act(async () => {
      root.render(
        createElement(
          'div',
          null,
          createElement(EffectHarness, { editor }),
          createElement(EditorContent, { editor }),
        ),
      )
    })

    expect(observed).toContain('ab')

    await act(async () => {
      editor.commands.insertContentAt(2, 'X')
    })

    expect(observed.at(-1)).toBe('aXb')

    editor.destroy()
  })

  it('useEditorEventCallback stays stable and sees fresh values', async () => {
    const { editor } = await renderTiptapEditor('<p>cb</p>')
    const { root } = mountTrackedRoot()

    const identities: Array<(suffix: string) => string | undefined> = []

    const Harness = ({ value }: { value: string }): ReactNode => {
      const callback = useEditorEventCallback(
        editor,
        (current, suffix: string) => `${current.state.doc.textContent}:${value}:${suffix}`,
      )

      identities.push(callback)
      return null
    }

    await act(async () => {
      root.render(createElement(Harness, { value: 'v1' }))
    })
    await act(async () => {
      root.render(createElement(Harness, { value: 'v2' }))
    })

    expect(identities).toHaveLength(2)
    expect(identities[0]).toBe(identities[1])
    // Latest closure, not the one from the first render
    expect(identities[1]('s')).toBe('cb:v2:s')

    editor.destroy()
    expect(identities[1]('s')).toBeUndefined()
  })

  it('useEditorEventListener subscribes with the latest handler', async () => {
    const { editor } = await renderTiptapEditor('<p>ev</p>')
    const { root } = mountTrackedRoot()
    const seen: string[] = []

    const Harness = ({ label }: { label: string }): ReactNode => {
      useEditorEventListener(editor, 'transaction', () => {
        seen.push(label)
      })
      return null
    }

    await act(async () => {
      root.render(createElement(Harness, { label: 'a' }))
    })
    await act(async () => {
      root.render(createElement(Harness, { label: 'b' }))
    })
    await act(async () => {
      editor.commands.insertContentAt(2, 'x')
    })

    expect(seen).toContain('b')
    expect(seen).not.toContain('a')
  })
})

describe('node view hooks', () => {
  it('provides position, selection state, and stopEvent through context', async () => {
    let getPosFromHook: (() => number | undefined) | undefined
    let selectedFromHook: boolean | undefined

    const HookedView = (props: NodeViewComponentProps<HTMLParagraphElement>) => {
      getPosFromHook = useNodePos()
      selectedFromHook = useIsNodeSelected()
      useStopEvent(event => event.type === 'mousedown')

      return createElement(
        'p',
        { ref: useMergedRefs(props.ref, props.contentDOMRef), className: 'hooked' },
        props.children,
      )
    }

    const { dom } = await renderTiptapEditor('<p>first</p><p>second</p>', [], {
      paragraph: HookedView,
    })

    expect(getPosFromHook?.()).toBe(7)
    expect(selectedFromHook).toBe(false)

    // The desc consults the registered stopEvent handler
    const desc = dom.querySelectorAll('p.hooked')[1]?.pmViewDesc as NodeViewDesc

    expect(desc.stopEvent(new Event('mousedown'))).toBe(true)
    expect(desc.stopEvent(new Event('click'))).toBe(false)
  })
})
