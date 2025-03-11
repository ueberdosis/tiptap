/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-shadow */
import { type EditorOptions, Editor } from '@tiptap/core'
import {
  type Accessor,
  $PROXY,
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  on,
  onCleanup,
  onMount,
} from 'solid-js'
import type { Store } from 'solid-js/store'
import { $RAW } from 'solid-js/store'
import { isServer } from 'solid-js/web'

import { createEditorState } from './createEditorState.js'
import { setTiptapSolidReactiveOwner } from './ReactiveOwner.js'

// @ts-ignore
const isDev = process.env.NODE_ENV !== 'production'

/**
 * The options for the `createEditor` hook.
 */
export type CreateEditorOptions = Partial<EditorOptions> & {
  /**
   * Whether to render the editor on the first render.
   * If client-side rendering, set this to `true`.
   * If server-side rendering, set this to `false`.
   * @default true
   */
  immediatelyRender?: boolean
  /**
   * Whether to create a reactive store like editor to support reactive expressions like `editor().can().bold()` or `editor().isEmpty`.
   * @default true
   */
  reactiveEditor?: boolean
}

/**
 * Detects if editor should immediately render.
 */
const shouldImmediatelyRender = (options: CreateEditorOptions): boolean => {
  if (options.immediatelyRender === undefined) {
    if (isServer) {
      if (isDev) {
        /**
         * Throw an error in development, to make sure the developer is aware that tiptap cannot be SSR'd
         * and that they need to set `immediatelyRender` to `false` to avoid hydration mismatches.
         */
        throw new Error(
          'Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.',
        )
      }

      // Best faith effort in production, run the code in the legacy mode to avoid hydration mismatches and errors in production
      return false
    }

    // Default to immediately rendering when client-side rendering
    return true
  }

  if (options.immediatelyRender && isServer && isDev) {
    // Warn in development, to make sure the developer is aware that tiptap cannot be SSR'd, set `immediatelyRender` to `false` to avoid hydration mismatches.
    throw new Error(
      'Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.',
    )
  }

  if (options.immediatelyRender) {
    return true
  }

  return false
}

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @returns The editor instance
 * @example const editor = createEditor({ extensions: [...] })
 */
export function createEditor(options: CreateEditorOptions & { immediatelyRender: false }): Accessor<Editor | undefined>

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @returns The editor instance
 * @example const editor = createEditor({ extensions: [...] })
 */
export function createEditor(options?: CreateEditorOptions): Accessor<Editor>

export function createEditor(options: CreateEditorOptions = {}): Accessor<Editor | undefined> {
  const owner = getOwner()

  /**
   * Create a new editor instance.
   */
  const createEditorInstance = (options: CreateEditorOptions): Editor => {
    const editor = new Editor(options)

    // store the owner for retrieval in SolidRenderer
    setTiptapSolidReactiveOwner(editor, owner)

    return editor
  }

  const [instance, setInstance] = createSignal<Editor | undefined>(
    shouldImmediatelyRender(options) ? createEditorInstance(options) : undefined,
  )

  // create the editor on mount and handle destoy on unmount
  onMount(() => {
    const editor = instance()
    if (!editor || editor.isDestroyed) {
      setInstance(createEditorInstance(options))
    }

    onCleanup(() => {
      const editor = instance()
      if (editor && !editor.isDestroyed) {
        editor.destroy()
        setInstance()
      }
    })
  })

  // update editor options on options change
  createEffect(
    on(
      // options my be composed with signals, so clone the object to ensure all signals are tracked to re-run the effect on options change.
      () => ({ ...options, extensions: [...(options.extensions ?? [])] }),
      options => {
        const editor = instance()
        if (editor && !editor.isDestroyed) {
          editor.setOptions(options)
        }
      },
      { defer: true }, // defer this effect to prevent setOptions immediately after editor creation as options would be the same.
    ),
  )

  if (options.reactiveEditor !== false) {
    // create a reactive editor to support things like `editor().can().bold()`
    const reactiveEditor = createReactiveEditor(instance)
    return reactiveEditor
  }

  return instance
}

/**
 * Created a reactive store like wrapper around the editor to make expressions like `editor().can().bold()` reactive.
 * @param editor The editor accessor
 * @returns A reactive editor proxy
 *
 * @example
 * ```tsx
 * const reactiveEditor = createReactiveEditor(() => editor)
 *
 * return (
 *  <Show when={reactiveEditor().can().bold()}>
 *    <button onClick={() => reactiveEditor().chain().focus().toggleBold().run()}>Bold</button>
 *  </Show>
 * )
 * ```
 */
function createReactiveEditor(editor: Accessor<Editor | undefined>) {
  const state = createEditorState(editor)

  let lastProxy: Store<Editor & { [$RAW]?: Editor }> | undefined
  const reactiveEditor = createMemo(
    on(editor, editor => {
      if (editor) {
        // if last proxy wraps the same instance don't create a new proxy.
        if (editor === lastProxy?.[$RAW]) {
          return lastProxy
        }

        // Add a $PROXY property to access the proxy from the instance.
        // This enables smooth integration with solid stores.
        Object.defineProperty(editor, $PROXY, {
          value: (lastProxy = new Proxy(editor, createProxyHandler(state as Accessor<Editor>))),
        })

        return lastProxy
      }

      return undefined
    }),
  )

  return reactiveEditor
}

/**
 * Creates the proxy handler for the editor.
 * It overwrites properties and methods like `can()` and `isActive()` with a signal that yields a change on every transaction
 * while others like `registerPlugin` stay non reactive.
 * This way it produces a reactive editor that should be safely usable in computations like `createEffect()`.
 * @param state The editor signal as produced with `createEditorState`.
 * @returns Proxy handler
 *
 * @example
 * ```tsx
 * // This registers the plugin only once per instance:
 * createEffect(() => {
 *  const editor = reactiveEditor();
 *  editor.registerPlugin(...);
 *  onCleanup(() => editor.unregisterPlugin(...));
 * });
 *
 * // This reevaluates on every transaction:
 * createComputed(() => {
 *  const editor = reactiveEditor();
 *  const empty = editor.isEmpty;
 *  setEmpty(empty);
 * })
 * ```
 */
function createProxyHandler(state: Accessor<Editor>): ProxyHandler<Editor> {
  const reactiveProps: Array<string | symbol> = [
    'can',
    'isActive',
    'isFocused',
    'isInitialized',
    'isEditable',
    'getAttributes',
    'isEmpty',
    '$node',
    '$nodes',
    '$pos',
    '$doc',
  ]
  return {
    get(target, property) {
      // $RAW is a symbol used by solid stores, it is used by `unwrap(store)` to extract the actual instance from a store.
      // Implementing this ensures better compatibility with solid.
      if (property === $RAW) {
        return target
      }

      if (reactiveProps.includes(property)) {
        return (state() as any)[property]
      }

      return (target as any)[property]
    },
  }
}
