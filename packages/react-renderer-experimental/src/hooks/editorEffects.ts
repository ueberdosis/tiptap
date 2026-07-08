import type { Editor } from '@tiptap/core'

type EffectRunner = (editor: Editor) => void

/**
 * Per-editor registries of commit effects. `EditorContent` runs them at the
 * end of its commit effect — after `commitPendingEffects()`, when the view
 * carries the committed state and the DOM matches it. A WeakMap keyed by the
 * editor keeps registration possible from anywhere (menus outside
 * `EditorContent`, node views inside) without threading a context.
 */
const registries = new WeakMap<Editor, Set<EffectRunner>>()

/** Registers a commit effect for the editor; returns the unregister. */
export const registerEditorEffect = (editor: Editor, runner: EffectRunner): (() => void) => {
  let registry = registries.get(editor)

  if (!registry) {
    registry = new Set()
    registries.set(editor, registry)
  }
  registry.add(runner)
  return () => {
    registry.delete(runner)
  }
}

/** Runs the editor's registered commit effects (called by EditorContent). */
export const runEditorEffects = (editor: Editor): void => {
  registries.get(editor)?.forEach(runner => runner(editor))
}
