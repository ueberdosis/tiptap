import type { EditorInternalOptions, EditorOptions } from '@tiptap/core'
import { Editor } from '@tiptap/core'
import type { RefObject } from 'react'

import { ReactRendererExtension } from './extension.js'
import type { ReactEditorViewPlace } from './ReactEditorView.js'
import { ReactEditorView } from './ReactEditorView.js'

/** The editor event callbacks routed through the options ref. */
const CALLBACK_OPTIONS = [
  'onBeforeCreate',
  'onCreate',
  'onMount',
  'onUnmount',
  'onUpdate',
  'onSelectionUpdate',
  'onTransaction',
  'onFocus',
  'onBlur',
  'onDestroy',
  'onContentError',
  'onDrop',
  'onPaste',
  'onDelete',
] as const

type CallbackName = (typeof CALLBACK_OPTIONS)[number]

/**
 * Wraps every event callback so the editor always invokes the most recent
 * one from the options ref — no stale closures when the consumer re-renders
 * with new handlers.
 */
export const latestCallbacks = (
  options: RefObject<Partial<EditorOptions>>,
): Partial<EditorOptions> =>
  Object.fromEntries(
    CALLBACK_OPTIONS.map(name => [
      name,
      (...args: unknown[]) =>
        (options.current[name] as ((...inner: unknown[]) => void) | undefined)?.(...args),
    ]),
  ) as Pick<EditorOptions, CallbackName>

/**
 * Constructs an editor wired to the React renderer: built unmounted
 * (`element: null` — `EditorContent` mounts it onto the React-rendered
 * document element later) with the internal view factory substituting a
 * `ReactEditorView`. `useEditor` builds on this; call it directly to
 * construct an editor outside a hook (e.g. to pass to `<Tiptap editor>`).
 */
export const createRendererEditor = (options: Partial<EditorOptions>): Editor => {
  const editorOptions: Partial<EditorOptions> & EditorInternalOptions = {
    ...options,
    // ReactEditorView itself rejects function placements at runtime
    element: null,
    extensions: [...(options.extensions ?? []), ReactRendererExtension],
    __internalViewFactory: (element, props) =>
      new ReactEditorView(element as ReactEditorViewPlace, props),
  }

  const editor = new Editor(editorOptions)

  // Give the pre-mount state its extension plugins: the first render then
  // has real reactKeys keys instead of index fallbacks (which would flip —
  // and remount every node — once the plugins arrive). createView() later
  // reconfigures with the same plugin instances, preserving their state.
  editor.view.updateState(editor.state.reconfigure({ plugins: editor.extensionManager.plugins }))

  return editor
}
