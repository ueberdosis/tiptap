import type { EditorOptions, EditorRuntimeOptions } from '../types.js'

const runtimeOptionKeys = [
  'editable',
  'editorProps',
  'parseOptions',
  'enableContentCheck',
  'emitContentError',
  'onBeforeCreate',
  'onCreate',
  'onMount',
  'onUnmount',
  'onContentError',
  'onUpdate',
  'onSelectionUpdate',
  'onTransaction',
  'onFocus',
  'onBlur',
  'onDestroy',
  'onPaste',
  'onDrop',
  'onDelete',
] satisfies (keyof EditorRuntimeOptions)[]

/**
 * Select options that an existing editor can apply.
 * @param options Editor options.
 * @returns The supplied runtime options.
 * @example editor.setOptions(getEditorRuntimeOptions(options))
 */
export function getEditorRuntimeOptions(
  options: Partial<EditorOptions>,
): Partial<EditorRuntimeOptions> {
  const runtimeOptions: Partial<EditorRuntimeOptions> = {}

  /** Keep explicitly supplied undefined values. */
  function copyOption<Key extends keyof EditorRuntimeOptions>(key: Key) {
    if (Object.hasOwn(options, key)) {
      runtimeOptions[key] = options[key]
    }
  }

  runtimeOptionKeys.forEach(copyOption)
  return runtimeOptions
}
