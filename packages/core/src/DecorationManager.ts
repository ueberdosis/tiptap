import {
  EditorState, Plugin, PluginKey, Selection, Transaction,
} from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import {
  Decoration as TiptapDecoration, InlineDecoration, NodeDecoration, WidgetDecoration,
} from './Decoration.js'
import { Editor } from './Editor.js'
import { getExtensionField } from './helpers/index.js'
import {
  DecorationConfig,
  InlineDecorationConfig,
  WidgetDecorationConfig,
} from './index.js'
import { NodePos } from './NodePos.js'
import { Range } from './types.js'
import { callOrReturn } from './utilities/index.js'

export type AttachToOptions = {
  /**
   * The target position to attach the decoration to.
   */
  target: NodePos | Range | Selection | number;
  /**
   * Force the decoration to be a specific type.
   */
  type?: 'node' | 'inline' | 'widget';
  /**
   * Offset the target position by a number or an object with start and end properties.
   */
  offset?:
    | number
    | {
        start: number;
        end: number;
      };
};

type ResolvedDecorationOptions = {
  type: 'widget' | 'inline' | 'node';
  from: number;
  to: number;
};

type DecorationManagerPluginState = DecorationSet;

export class DecorationManager {
  static pluginKey = new PluginKey<DecorationManagerPluginState>('tiptapDecorationManager')

  editor: Editor

  plugin: Plugin<DecorationManagerPluginState>

  decorations: Map<
    string,
    {
      decoration: Decoration;
      options: {
        target: NodePos | Range | Selection | number;
      } & AttachToOptions;
    }
  > = new Map()

  /**
   * Decoration ids which have been rendered before, this allows us to lazily render new decorations.
   */
  lastRenderedDecorations: string[] = []

  decorationSet: DecorationSet = DecorationSet.empty

  constructor(props: { editor: Editor }) {
    this.editor = props.editor
    this.plugin = new Plugin<DecorationManagerPluginState>({
      key: DecorationManager.pluginKey,
      state: {
        init: (_config, state) => this.getDecorationSet(state),
        apply: (...args) => {
          if (this.onApply(...args)) {
            return this.getDecorationSet(args[3])
          }
          return args[1]
        },
      },
      props: {
        decorations: this.getDecorationSet.bind(this),
      },
    })
  }

  private getDecorationSet(state: EditorState): DecorationSet {
    return this.decorationSet
  }

  /**
   * Runs on every transaction and updates the decoration set.
   * @returns IF it should update the decoration set
   */
  private onApply(
    tr: Transaction,
    decorations: DecorationSet,
    oldState: EditorState,
    newState: EditorState,
  ): boolean {
    this.decorationSet = decorations.map(tr.mapping, tr.doc)

    const newDecorationIds = this.getNewDecorationIds()

    if (newDecorationIds.length) {
      console.log('applying new decorations', newDecorationIds)
      this.decorationSet = this.decorationSet.add(
        tr.doc,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newDecorationIds.map(id => this.decorations.get(id)!.decoration),
      )

      this.lastRenderedDecorations = this.lastRenderedDecorations.concat(newDecorationIds)
    }
    console.log({ decorations })
    return true
  }

  /**
   * Get all decoration ids that have not yet been rendered.
   */
  public getNewDecorationIds(): string[] {
    if (
      this.lastRenderedDecorations.length !== this.decorations.size
      || this.lastRenderedDecorations.some(id => !this.decorations.has(id))
    ) {
      const allDecorationIds = Array.from(this.decorations.keys())

      return allDecorationIds.filter(k => !this.lastRenderedDecorations.includes(k))
    }

    return [] as string[]
  }

  static resolvePositionsAndType(options: AttachToOptions): ResolvedDecorationOptions {
    let offsetFrom = 0
    let offsetTo = 0

    if (options.offset) {
      if (typeof options.offset === 'number') {
        offsetFrom = options.offset
        offsetTo = options.offset
      } else {
        offsetFrom = options.offset.start
        offsetTo = options.offset.end
      }
    }

    if (typeof options.target === 'number') {
      return {
        type: options.type ?? 'widget',
        from: options.target + offsetFrom,
        to: options.target + offsetTo,
      }
    }

    if (options.target instanceof Selection) {
      return {
        type: options.type ?? 'inline',
        from: options.target.from + offsetFrom,
        to: options.target.to + offsetFrom,
      }
    }

    if (options.target instanceof NodePos) {
      return {
        type: options.type ?? (offsetFrom !== 0 || offsetTo !== 0 ? 'inline' : 'node'),
        from: options.target.pos + offsetFrom,
        to: options.target.pos + options.target.node.nodeSize + offsetTo,
      }
    }

    if ('from' in options.target && 'to' in options.target) {
      return {
        type: options.type ?? 'inline',
        from: options.target.from + offsetFrom,
        to: options.target.to + offsetTo,
      }
    }

    throw new Error(`Invalid target: ${options.target}`, { cause: options.target })
  }

  attachTo(options: AttachToOptions): void {
    const decoMeta = DecorationManager.resolvePositionsAndType(options)
    const id = Math.random().toString(36).slice(2, 10)

    switch (decoMeta.type) {
      case 'node': {
        this.decorations.set(id, {
          decoration: Decoration.node(
            decoMeta.from,
            decoMeta.to,
            { class: 'decoration' },
            { decorationId: id },
          ),
          options,
        })
        break
      }
      case 'inline': {
        this.decorations.set(id, {
          decoration: Decoration.inline(
            decoMeta.from,
            decoMeta.to,
            { class: 'decoration' },
            { decorationId: id },
          ),
          options,
        })
        break
      }
      case 'widget': {
        this.decorations.set(id, {
          decoration: Decoration.widget(decoMeta.from, document.createElement('span'), {
            decorationId: id,
          }),
          options,
        })
        break
      }
      default:
        throw new Error(`Invalid type: ${decoMeta.type}`)
    }
  }

  create(
    decorationExtension: TiptapDecoration,
    options: {
      /**
       * The id of the decoration. If not provided, a random id will be generated.
       */
      id?: string;
      /**
       * Whether the decoration should be rendered initially.
       * @default true
       */
      shouldRender?: boolean;
    } & Omit<AttachToOptions, 'type'>,
  ): () => void {
    const instanceId = options.id ?? Math.random().toString(36).slice(2, 10)
    const context = {
      name: decorationExtension.name,
      options: decorationExtension.options,
      storage: decorationExtension.storage,
      editor: this.editor,
    }

    const attributes = callOrReturn(
      getExtensionField<InlineDecorationConfig['addAttributes']>(
        decorationExtension,
        'addAttributes',
        context,
      ),
    ) || {}

    const spec = {
      ...callOrReturn(
        getExtensionField<DecorationConfig['addSpec']>(
          decorationExtension,
          'addSpec',
          context,
        ),
      ),
      decoration: {
        instanceId,
        extension: decorationExtension,
        name: decorationExtension.name,
      },
    }

    const decoMeta = DecorationManager.resolvePositionsAndType({
      ...options,
      type: getExtensionField<TiptapDecoration['decorationType']>(
        decorationExtension,
        'decorationType',
      ),
    })

    switch (decorationExtension.decorationType) {
      case 'inline': {
        const decoration = Decoration.inline(
          decoMeta.from,
          decoMeta.to,
          attributes,
          spec,
        )

        console.log({ decoration, attributes, spec })

        this.decorations.set(instanceId, {
          decoration,
          options,
        })

        break
      }
      case 'node': {
        const decoration = Decoration.node(
          decoMeta.from,
          decoMeta.to,
          attributes,
          spec,
        )

        this.decorations.set(instanceId, {
          decoration,
          options,
        })

        break
      }
      case 'widget': {
        const renderMethod = getExtensionField<WidgetDecorationConfig['render']>(
          decorationExtension,
          'render',
          context,
        )

        const decoration = Decoration.widget(
          decoMeta.from,
          (_v, getPos) => {
            return renderMethod({ editor: this.editor, getPos })
          },
          spec,
        )

        this.decorations.set(instanceId, {
          decoration,
          options,
        })

        break
      }

      default:
        throw new Error(`Invalid type: ${decoMeta.type}`)
    }

    if (options.shouldRender ?? true) {
      this.render()
    }

    return () => {
      this.removeDecoration(instanceId)
    }
  }

  render(): void {
    this.editor.commands.setMeta('updateDecorations', true)
  }

  /**
   * Remove a decoration by its id.
   */
  private removeDecoration(id: string): void {
    this.decorations.delete(id)
  }
}
