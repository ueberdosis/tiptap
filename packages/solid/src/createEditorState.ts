import type { Editor } from '@tiptap/core'
import { type Accessor, createComputed, on, onCleanup } from 'solid-js'
import type { Store } from 'solid-js/store'
import { createStore, unwrap } from 'solid-js/store'

type EditorSelector<TEditor, T> = (editor: TEditor) => T

/**
 * Creates a solid store like signal out of the selected state object.
 *
 * @param editor - An accessor returning the current `Editor` instance.
 * @param selector - A function that picks part of the editor’s state or creates a state object to track.
 * @returns A SolidJS store for the selected value.
 *
 * @example
 * ```tsx
 * import { createEditor } from '@tiptap/solid';
 *
 * const MyComponent = () => {
 *   const editor = createEditor({ /* Tiptap Editor options *\/ });
 *
 *   // Listen for changes in the editor's current selection
 *   const currentSelection = createEditorState(
 *     editor,
 *     editor => editor.state.selection
 *   );
 *
 *   // Or, create and track a state object
 *    const editorState = createEditorState(
 *     editor,
 *     editor => {
 *       return {
 *         isBold: editor.isActive('bold'),
 *         canBold: editor.can().chain().focus().toggleBold().run(),
 *         isItalic: editor.isActive('italic'),
 *         canItalic: editor.can().chain().focus().toggleItalic().run(),
 *         isStrike: editor.isActive('strike'),
 *       }
 *     }
 *   )
 *
 *   return (
 *     <div>
 *       <p>The current selection is: {JSON.stringify(currentSelection())}</p>
 *       <p>Can Bold: {editorState().isBold)}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export function createEditorState<
  TEditor extends Editor | undefined,
  TSelector extends EditorSelector<TEditor, any> = EditorSelector<TEditor, TEditor>,
  TSelectorResult = TSelector extends EditorSelector<TEditor, infer T> ? T : never,
>(editor: Accessor<TEditor>, selector?: TSelector): Accessor<Store<TSelectorResult>> {
  const selectorFn = selector ?? (x => x)

  const [selection, setSelection] = createStore<{ value: TSelectorResult }>({ value: selectorFn(unwrap(editor())) })

  createComputed(
    on(editor, currentEditor => {
      if (currentEditor) {
        const handleTransaction = () => {
          setSelection('value', () => selectorFn(unwrap(currentEditor)))
        }

        handleTransaction()

        currentEditor.on('transaction', handleTransaction)

        onCleanup(() => {
          currentEditor.off('transaction', handleTransaction)
        })
      }
    }),
  )

  return () => selection.value
}
