// eslint-disable-next-line max-classes-per-file
import { Plugin, Transaction } from '@tiptap/pm/state'
import { Decoration as PMDecoration, DecorationAttrs } from '@tiptap/pm/view'

import { Editor } from './Editor.js'
import { getExtensionField } from './helpers/getExtensionField.js'
import { DecorationConfig, InlineDecorationConfig, NodeDecorationConfig, WidgetDecorationConfig } from './index.js'
import { InputRule } from './InputRule.js'
import { Mark } from './Mark.js'
import { Node } from './Node.js'
import { PasteRule } from './PasteRule.js'
import { AnyConfig, Extensions, GlobalAttributes, KeyboardShortcutCommand, ParentConfig, RawCommands } from './types.js'
import { callOrReturn } from './utilities/callOrReturn.js'
import { mergeDeep } from './utilities/mergeDeep.js'

declare module '@tiptap/core' {
  interface DecorationConfig<Options = any, Storage = any> {
    // @ts-ignore - this is a dynamic key
    [key: string]: any

    /**
     * The extension name - this must be unique.
     * It will be used to identify the extension.
     *
     * @example 'myDecoration'
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
    addOptions?: (this: {
      name: string
      parent: Exclude<ParentConfig<DecorationConfig<Options, Storage>>['addOptions'], undefined>
    }) => Options

    /**
     * The default storage this extension can save data to.
     * @see https://tiptap.dev/docs/editor/guide/custom-extensions#storage
     * @example
     * defaultStorage: {
     *   prefetchedUsers: [],
     *   loading: false,
     * }
     */
    addStorage?: (this: {
      name: string
      options: Options
      parent: Exclude<ParentConfig<DecorationConfig<Options, Storage>>['addStorage'], undefined>
    }) => Storage

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
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addGlobalAttributes']
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
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addCommands']
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
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addKeyboardShortcuts']
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
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addInputRules']
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
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addPasteRules']
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
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addProseMirrorPlugins']
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
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addExtensions']
    }) => Extensions

    /**
     * The editor is not ready yet.
     */
    onBeforeCreate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          parent: ParentConfig<DecorationConfig<Options, Storage>>['onBeforeCreate']
        }) => void)
      | null

    /**
     * The editor is ready.
     */
    onCreate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          parent: ParentConfig<DecorationConfig<Options, Storage>>['onCreate']
        }) => void)
      | null

    /**
     * The content has changed.
     */
    onUpdate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          parent: ParentConfig<DecorationConfig<Options, Storage>>['onUpdate']
        }) => void)
      | null

    /**
     * The selection has changed.
     */
    onSelectionUpdate?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          parent: ParentConfig<DecorationConfig<Options, Storage>>['onSelectionUpdate']
        }) => void)
      | null

    // /**
    //  * The editor state has changed.
    //  */
    // onTransaction?:
    //   | ((
    //       this: {
    //         name: string;
    //         options: Options;
    //         storage: Storage;
    //         editor: Editor;
    //         parent: ParentConfig<DecorationConfig<Options, Storage>>['onTransaction'];
    //       },
    //       props: {
    //         editor: Editor;
    //         transaction: Transaction;
    //       }
    //     ) => void)
    //   | null;

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
            parent: ParentConfig<DecorationConfig<Options, Storage>>['onFocus']
          },
          props: {
            event: FocusEvent
          },
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
            parent: ParentConfig<DecorationConfig<Options, Storage>>['onBlur']
          },
          props: {
            event: FocusEvent
          },
        ) => void)
      | null

    /**
     * The editor is destroyed.
     */
    onDestroy?:
      | ((this: {
          name: string
          options: Options
          storage: Storage
          editor: Editor
          parent: ParentConfig<DecorationConfig<Options, Storage>>['onDestroy']
        }) => void)
      | null
  }

  interface WidgetDecorationConfig<Options = any, Storage = any> extends Decoration<Options, Storage> {
    // extends Parameters<typeof PMDecoration.widget>['2'] = Parameters<typeof PMDecoration.widget>['2']

    /**
     * Add attributes to the node
     * @example addSpec: () => ({ ctx: 'foo' })
     */
    addSpec?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addSpec']
      editor?: Editor
    }) => Parameters<typeof PMDecoration.widget>['2']

    render: (
      this: {
        name: string
        options: Options
        storage: Storage
        parent: ParentConfig<DecorationConfig<Options, Storage>>['render']
        editor?: Editor
      },
      ctx: {
        editor: Editor
        getPos: () => number | undefined
      },
    ) => HTMLElement
  }

  interface InlineDecorationConfig<Options = any, Storage = any> extends Decoration<Options, Storage> {
    /**
     * Add attributes to the node
     * @example addSpec: () => ({ ctx: 'foo' })
     */
    addSpec?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addSpec']
      editor?: Editor
    }) => Parameters<typeof PMDecoration.inline>['3']

    /**
     * Add attributes to the node
     * @example addAttributes: () => ({ nodeName: 'span', class: 'foo', style: 'color: red' })
     */
    addAttributes?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addAttributes']
      editor?: Editor
    }) => Partial<DecorationAttrs>

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
            parent: ParentConfig<InlineDecorationConfig<Options, Storage>>['onTransaction']
            instances: {
              id: string
              spec: {
                instanceId: string
                extension: Decoration<Options, Storage>
                name: string
              } & ReturnType<Exclude<InlineDecorationConfig<Options, Storage>['addAttributes'], undefined>>
              decoration: InlineDecoration<Options, Storage>
            }[]
          },
          props: {
            editor: Editor
            transaction: Transaction
          },
        ) => void)
      | null
  }

  interface NodeDecorationConfig<Options = any, Storage = any> extends Decoration<Options, Storage> {
    /**
     * Add attributes to the node
     * @example addSpec: () => ({ ctx: 'foo' })
     */
    addSpec?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addSpec']
      editor?: Editor
    }) => Parameters<typeof PMDecoration.node>['3']

    /**
     * Add attributes to the node
     * @example addAttributes: () => ({ nodeName: 'span', class: 'foo', style: 'color: red' })
     */
    addAttributes?: (this: {
      name: string
      options: Options
      storage: Storage
      parent: ParentConfig<DecorationConfig<Options, Storage>>['addAttributes']
      editor?: Editor
    }) => Partial<DecorationAttrs>
  }
}

/**
 * The Extension class is the base class for all extensions.
 * @see https://tiptap.dev/api/extensions#create-a-new-extension
 */
export class Decoration<Options = any, Storage = any> {
  type = 'decoration'

  name = 'decoration'

  decorationType: 'widget' | 'inline' | 'node' = 'node'

  parent: Decoration | null = null

  child: Decoration | null = null

  options: Options

  storage: Storage

  config: DecorationConfig = {
    name: this.name,
  }

  constructor(config: Partial<DecorationConfig<Options, Storage>> = {}) {
    this.config = {
      ...this.config,
      ...config,
    }

    this.name = this.config.name

    this.options = {} as Options

    if (this.config.addOptions) {
      this.options = callOrReturn(
        getExtensionField<AnyConfig['addOptions']>(this, 'addOptions', {
          name: this.name,
        }),
      )
    }

    this.storage =
      callOrReturn(
        getExtensionField<AnyConfig['addStorage']>(this, 'addStorage', {
          name: this.name,
          options: this.options,
        }),
      ) || {}
  }

  static create<TOptions = any, TStorage = any>(config: Partial<DecorationConfig<TOptions, TStorage>> = {}) {
    return new Decoration<TOptions, TStorage>(config)
  }

  configure(options: Partial<Options> = {}) {
    // return a new instance so we can use the same extension
    // with different calls of `configure`
    const extension = this.extend<Options, Storage>({
      ...this.config,
      addOptions: () => {
        return mergeDeep(this.options as Record<string, any>, options) as Options
      },
    })

    // Always preserve the current name
    extension.name = this.name
    // Set the parent to be our parent
    extension.parent = this.parent

    return extension
  }

  extend<ExtendedOptions = Options, ExtendedStorage = Storage>(
    extendedConfig: Partial<DecorationConfig<ExtendedOptions, ExtendedStorage>> = {},
  ) {
    const extension = new Decoration<ExtendedOptions, ExtendedStorage>({
      ...this.config,
      ...extendedConfig,
    })

    extension.parent = this

    this.child = extension

    extension.name = extendedConfig.name ? extendedConfig.name : extension.parent.name

    extension.options = callOrReturn(
      getExtensionField<AnyConfig['addOptions']>(extension, 'addOptions', {
        name: extension.name,
      }),
    )

    extension.storage = callOrReturn(
      getExtensionField<AnyConfig['addStorage']>(extension, 'addStorage', {
        name: extension.name,
        options: extension.options,
      }),
    )

    return extension
  }
}

export class WidgetDecoration<Options = any, Storage = any> extends Decoration<Options, Storage> {
  decorationType = 'widget' as const

  config: WidgetDecorationConfig<Options, Storage> = {} as WidgetDecorationConfig<Options, Storage>

  constructor(config: Partial<WidgetDecorationConfig<Options, Storage>> = {}) {
    super(config)
    this.config = {
      ...this.config,
      ...config,
    } as WidgetDecorationConfig<Options, Storage>
  }

  static create<TOptions = any, TStorage = any>(config: Partial<WidgetDecorationConfig<TOptions, TStorage>> = {}) {
    return new WidgetDecoration<TOptions, TStorage>(config)
  }
}
export class InlineDecoration<Options = any, Storage = any> extends Decoration<Options, Storage> {
  decorationType = 'inline' as const

  config: InlineDecorationConfig<Options, Storage> = {} as InlineDecorationConfig<Options, Storage>

  constructor(config: Partial<InlineDecorationConfig<Options, Storage>> = {}) {
    super(config)
    this.config = {
      ...this.config,
      ...config,
    } as InlineDecorationConfig<Options, Storage>
  }

  static create<TOptions = any, TStorage = any>(config: Partial<InlineDecorationConfig<TOptions, TStorage>> = {}) {
    return new InlineDecoration<TOptions, TStorage>(config)
  }
}
export class NodeDecoration<Options = any, Storage = any> extends Decoration<Options, Storage> {
  decorationType = 'node' as const

  config: NodeDecorationConfig<Options, Storage> = {} as NodeDecorationConfig<Options, Storage>

  constructor(config: Partial<NodeDecorationConfig<Options, Storage>> = {}) {
    super(config)
    this.config = {
      ...this.config,
      ...config,
    } as NodeDecorationConfig<Options, Storage>
  }

  static create<TOptions = any, TStorage = any>(config: Partial<InlineDecorationConfig<TOptions, TStorage>> = {}) {
    return new InlineDecoration<TOptions, TStorage>(config)
  }
}
