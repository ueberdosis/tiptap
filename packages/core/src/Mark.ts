import type { DOMOutputSpec, Mark as ProseMirrorMark, MarkSpec, MarkType } from '@tiptap/pm/model'

import type { Editor } from './Editor.js'
import type { ExtendableConfig } from './Extendable.js'
import { Extendable } from './Extendable.js'
import type { Attributes, MarkViewRenderer, ParentConfig } from './types.js'

export interface MarkConfig<Options = any, Storage = any>
  extends ExtendableConfig<Options, Storage, MarkConfig<Options, Storage>, MarkType> {
  /**
   * Mark View
   */
  addMarkView?:
    | ((this: {
        name: string
        options: Options
        storage: Storage
        editor: Editor
        type: MarkType
        parent: ParentConfig<MarkConfig<Options, Storage>>['addMarkView']
      }) => MarkViewRenderer)
    | null

  /**
   * Keep mark after split node
   */
  keepOnSplit?: boolean | (() => boolean)

  /**
   * Inclusive
   */
  inclusive?:
    | MarkSpec['inclusive']
    | ((this: {
        name: string
        options: Options
        storage: Storage
        parent: ParentConfig<MarkConfig<Options, Storage>>['inclusive']
        editor?: Editor
      }) => MarkSpec['inclusive'])

  /**
   * Excludes
   */
  excludes?:
    | MarkSpec['excludes']
    | ((this: {
        name: string
        options: Options
        storage: Storage
        parent: ParentConfig<MarkConfig<Options, Storage>>['excludes']
        editor?: Editor
      }) => MarkSpec['excludes'])

  /**
   * Marks this Mark as exitable
   */
  exitable?: boolean | (() => boolean)

  /**
   * Group
   */
  group?:
    | MarkSpec['group']
    | ((this: {
        name: string
        options: Options
        storage: Storage
        parent: ParentConfig<MarkConfig<Options, Storage>>['group']
        editor?: Editor
      }) => MarkSpec['group'])

  /**
   * Spanning
   */
  spanning?:
    | MarkSpec['spanning']
    | ((this: {
        name: string
        options: Options
        storage: Storage
        parent: ParentConfig<MarkConfig<Options, Storage>>['spanning']
        editor?: Editor
      }) => MarkSpec['spanning'])

  /**
   * Code
   */
  code?:
    | boolean
    | ((this: {
        name: string
        options: Options
        storage: Storage
        parent: ParentConfig<MarkConfig<Options, Storage>>['code']
        editor?: Editor
      }) => boolean)

  /**
   * Parse HTML
   */
  parseHTML?: (this: {
    name: string
    options: Options
    storage: Storage
    parent: ParentConfig<MarkConfig<Options, Storage>>['parseHTML']
    editor?: Editor
  }) => MarkSpec['parseDOM']

  /**
   * Render HTML
   */
  renderHTML?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<MarkConfig<Options, Storage>>['renderHTML']
          editor?: Editor
        },
        props: {
          mark: ProseMirrorMark
          HTMLAttributes: Record<string, any>
        },
      ) => DOMOutputSpec)
    | null

  /**
   * Attributes
   */
  addAttributes?: (this: {
    name: string
    options: Options
    storage: Storage
    parent: ParentConfig<MarkConfig<Options, Storage>>['addAttributes']
    editor?: Editor
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  }) => Attributes | {}
}

/**
 * The Mark class is used to create custom mark extensions.
 * @see https://tiptap.dev/api/extensions#create-a-new-extension
 */
export class Mark<Options = any, Storage = any> extends Extendable<Options, Storage, MarkConfig<Options, Storage>> {
  type = 'mark'

  /**
   * Create a new Mark instance
   * @param config - Mark configuration object or a function that returns a configuration object
   */
  static create<O = any, S = any>(config: Partial<MarkConfig<O, S>> | (() => Partial<MarkConfig<O, S>>) = {}) {
    // If the config is a function, execute it to get the configuration object
    const resolvedConfig = typeof config === 'function' ? config() : config
    return new Mark<O, S>(resolvedConfig)
  }

  static handleExit({ editor, mark }: { editor: Editor; mark: Mark }) {
    const { tr } = editor.state
    const currentPos = editor.state.selection.$from
    const isAtEnd = currentPos.pos === currentPos.end()

    if (isAtEnd) {
      const currentMarks = currentPos.marks()
      const isInMark = !!currentMarks.find(m => m?.type.name === mark.name)

      if (!isInMark) {
        return false
      }

      const removeMark = currentMarks.find(m => m?.type.name === mark.name)

      if (removeMark) {
        tr.removeStoredMark(removeMark)
      }
      tr.insertText(' ', currentPos.pos)

      editor.view.dispatch(tr)

      return true
    }

    return false
  }

  configure(options?: Partial<Options>) {
    return super.configure(options) as Mark<Options, Storage>
  }

  extend<
    ExtendedOptions = Options,
    ExtendedStorage = Storage,
    ExtendedConfig extends MarkConfig<ExtendedOptions, ExtendedStorage> = MarkConfig<ExtendedOptions, ExtendedStorage>,
  >(
    extendedConfig?:
      | (() => Partial<ExtendedConfig>)
      | (Partial<ExtendedConfig> &
          ThisType<{
            name: string
            options: ExtendedOptions
            storage: ExtendedStorage
            editor: Editor
            type: MarkType
          }>),
  ): Mark<ExtendedOptions, ExtendedStorage> {
    // If the extended config is a function, execute it to get the configuration object
    const resolvedConfig = typeof extendedConfig === 'function' ? extendedConfig() : extendedConfig
    return super.extend(resolvedConfig) as Mark<ExtendedOptions, ExtendedStorage>
  }
}
