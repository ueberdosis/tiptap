import type { Plugin } from '@tiptap/pm/state'

import type { Editor } from './Editor.js'
import { getExtensionField } from './helpers/getExtensionField.js'
import type { ExtensionConfig, MarkConfig, NodeConfig } from './index.js'
import type { InputRule } from './InputRule.js'
import type { Mark } from './Mark.js'
import type { Node } from './Node.js'
import type { PasteRule } from './PasteRule.js'
import type {
  AnyConfig,
  EditorEvents,
  Extensions,
  GlobalAttributes,
  KeyboardShortcutCommand,
  ParentConfig,
  RawCommands,
} from './types.js'
import { callOrReturn } from './utilities/callOrReturn.js'
import { mergeDeep } from './utilities/mergeDeep.js'

export interface ExtendableConfig<
  Options = any,
  Storage = any,
  Config extends
    | ExtensionConfig<Options, Storage>
    | NodeConfig<Options, Storage>
    | MarkConfig<Options, Storage>
    | ExtendableConfig<Options, Storage> = ExtendableConfig<Options, Storage, any, any>,
  PMType = any,
> {
  /**
   * The extension name - this must be unique.
   * It will be used to identify the extension.
   *
   * @example 'myExtension'
   */
  name: string

  /**
   * The priority of your extension. The higher, the earlier it will be called
   * and will take precedence over other extensions with a lower priority.
   * @default 100
   * @example 101
   */
  priority?: number

  /**
   * This method will add options to this extension
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#settings
   * @example
   * addOptions() {
   *  return {
   *    myOption: 'foo',
   *    myOtherOption: 10,
   * }
   */
  addOptions?: (this: { name: string; parent: ParentConfig<Config>['addOptions'] }) => Options

  /**
   * The default storage this extension can save data to.
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#storage
   * @example
   * defaultStorage: {
   *   prefetchedUsers: [],
   *   loading: false,
   * }
   */
  addStorage?: (this: { name: string; options: Options; parent: ParentConfig<Config>['addStorage'] }) => Storage

  /**
   * This function adds globalAttributes to specific nodes.
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#global-attributes
   * @example
   * addGlobalAttributes() {
   *   return [
   *     {
           // Extend the following extensions
   *       types: [
   *         'heading',
   *         'paragraph',
   *       ],
   *       // … with those attributes
   *       attributes: {
   *         textAlign: {
   *           default: 'left',
   *           renderHTML: attributes => ({
   *             style: `text-align: ${attributes.textAlign}`,
   *           }),
   *           parseHTML: element => element.style.textAlign || 'left',
   *         },
   *       },
   *     },
   *   ]
   * }
   */
  addGlobalAttributes?: (this: {
    name: string
    options: Options
    storage: Storage
    extensions: (Node | Mark)[]
    parent: ParentConfig<Config>['addGlobalAttributes']
  }) => GlobalAttributes

  /**
   * This function adds commands to the editor
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#commands
   * @example
   * addCommands() {
   *   return {
   *     myCommand: () => ({ chain }) => chain().setMark('type', 'foo').run(),
   *   }
   * }
   */
  addCommands?: (this: {
    name: string
    options: Options
    storage: Storage
    editor: Editor
    type: PMType
    parent: ParentConfig<Config>['addCommands']
  }) => Partial<RawCommands>

  /**
   * This function registers keyboard shortcuts.
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#keyboard-shortcuts
   * @example
   * addKeyboardShortcuts() {
   *   return {
   *     'Mod-l': () => this.editor.commands.toggleBulletList(),
   *   }
   * },
   */
  addKeyboardShortcuts?: (this: {
    name: string
    options: Options
    storage: Storage
    editor: Editor
    type: PMType
    parent: ParentConfig<Config>['addKeyboardShortcuts']
  }) => {
    [key: string]: KeyboardShortcutCommand
  }

  /**
   * This function adds input rules to the editor.
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#input-rules
   * @example
   * addInputRules() {
   *   return [
   *     markInputRule({
   *       find: inputRegex,
   *       type: this.type,
   *     }),
   *   ]
   * },
   */
  addInputRules?: (this: {
    name: string
    options: Options
    storage: Storage
    editor: Editor
    type: PMType
    parent: ParentConfig<Config>['addInputRules']
  }) => InputRule[]

  /**
   * This function adds paste rules to the editor.
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#paste-rules
   * @example
   * addPasteRules() {
   *   return [
   *     markPasteRule({
   *       find: pasteRegex,
   *       type: this.type,
   *     }),
   *   ]
   * },
   */
  addPasteRules?: (this: {
    name: string
    options: Options
    storage: Storage
    editor: Editor
    type: PMType
    parent: ParentConfig<Config>['addPasteRules']
  }) => PasteRule[]

  /**
   * This function adds Prosemirror plugins to the editor
   * @see https://tiptap.dev/docs/editor/guide/custom-extensions#prosemirror-plugins
   * @example
   * addProseMirrorPlugins() {
   *   return [
   *     customPlugin(),
   *   ]
   * }
   */
  addProseMirrorPlugins?: (this: {
    name: string
    options: Options
    storage: Storage
    editor: Editor
    type: PMType
    parent: ParentConfig<Config>['addProseMirrorPlugins']
  }) => Plugin[]

  /**
   * This function adds additional extensions to the editor. This is useful for
   * building extension kits.
   * @example
   * addExtensions() {
   *   return [
   *     BulletList,
   *     OrderedList,
   *     ListItem
   *   ]
   * }
   */
  addExtensions?: (this: {
    name: string
    options: Options
    storage: Storage
    parent: ParentConfig<Config>['addExtensions']
  }) => Extensions

  /**
   * This function extends the schema of the node.
   * @example
   * extendNodeSchema() {
   *   return {
   *     group: 'inline',
   *     selectable: false,
   *   }
   * }
   */
  extendNodeSchema?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<Config>['extendNodeSchema']
        },
        extension: Node,
      ) => Record<string, any>)
    | null

  /**
   * This function extends the schema of the mark.
   * @example
   * extendMarkSchema() {
   *   return {
   *     group: 'inline',
   *     selectable: false,
   *   }
   * }
   */
  extendMarkSchema?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          parent: ParentConfig<Config>['extendMarkSchema']
        },
        extension: Mark,
      ) => Record<string, any>)
    | null

  /**
   * The editor is not ready yet.
   */
  onBeforeCreate?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onBeforeCreate']
        },
        event: EditorEvents['beforeCreate'],
      ) => void)
    | null

  /**
   * The editor is ready.
   */
  onCreate?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onCreate']
        },
        event: EditorEvents['create'],
      ) => void)
    | null

  /**
   * The content has changed.
   */
  onUpdate?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onUpdate']
        },
        event: EditorEvents['update'],
      ) => void)
    | null

  /**
   * The selection has changed.
   */
  onSelectionUpdate?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onSelectionUpdate']
        },
        event: EditorEvents['selectionUpdate'],
      ) => void)
    | null

  /**
   * The editor state has changed.
   */
  onTransaction?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onTransaction']
        },
        event: EditorEvents['transaction'],
      ) => void)
    | null

  /**
   * The editor is focused.
   */
  onFocus?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onFocus']
        },
        event: EditorEvents['focus'],
      ) => void)
    | null

  /**
   * The editor isn’t focused anymore.
   */
  onBlur?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onBlur']
        },
        event: EditorEvents['blur'],
      ) => void)
    | null

  /**
   * The editor is destroyed.
   */
  onDestroy?:
    | ((
        this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          type: PMType
          parent: ParentConfig<Config>['onDestroy']
        },
        event: EditorEvents['destroy'],
      ) => void)
    | null
}

export class Extendable<
  Options = any,
  Storage = any,
  Config = ExtensionConfig<Options, Storage> | NodeConfig<Options, Storage> | MarkConfig<Options, Storage>,
> {
  type = 'extendable'
  parent: Extendable | null = null

  child: Extendable | null = null

  name = ''

  config: Config = {
    name: this.name,
  } as Config

  constructor(config: Partial<Config> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = (this.config as any).name
  }

  get options(): Options {
    return {
      ...(callOrReturn(
        getExtensionField<AnyConfig['addOptions']>(this as any, 'addOptions', {
          name: this.name,
        }),
      ) || {}),
    }
  }

  get storage(): Readonly<Storage> {
    return {
      ...(callOrReturn(
        getExtensionField<AnyConfig['addStorage']>(this as any, 'addStorage', {
          name: this.name,
          options: this.options,
        }),
      ) || {}),
    }
  }

  configure(options: Partial<Options> = {}) {
    const extension = this.extend<Options, Storage, Config>({
      ...this.config,
      addOptions: () => {
        return mergeDeep(this.options as Record<string, any>, options) as Options
      },
    })

    extension.name = this.name
    extension.parent = this.parent

    return extension
  }

  extend<
    ExtendedOptions = Options,
    ExtendedStorage = Storage,
    ExtendedConfig =
      | ExtensionConfig<ExtendedOptions, ExtendedStorage>
      | NodeConfig<ExtendedOptions, ExtendedStorage>
      | MarkConfig<ExtendedOptions, ExtendedStorage>,
  >(extendedConfig: Partial<ExtendedConfig> = {}): Extendable<ExtendedOptions, ExtendedStorage> {
    const extension = new (this.constructor as any)({ ...this.config, ...extendedConfig })

    extension.parent = this
    this.child = extension
    extension.name = 'name' in extendedConfig ? extendedConfig.name : extension.parent.name

    return extension
  }
}
