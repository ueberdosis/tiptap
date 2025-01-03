import { Node } from '@tiptap/pm/model'
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state'
import { DecorationSet, DecorationSource } from '@tiptap/pm/view'

import { Editor } from './Editor.js'
import { NodePos } from './NodePos.js'
import { Range } from './types.js'

type AttachToOptions = {
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

type DecorationManagerPluginState = {};
const pluginKey = new PluginKey<DecorationManagerPluginState>('tiptapDecorationManager')

export class DecorationManager {
  editor: Editor

  decorations: DecorationSource

  constructor(props: { editor: Editor }) {
    this.editor = props.editor
    this.decorations = DecorationSet.empty
  }

  private resolvePositionsAndType(
    target: Node | NodePos | Range | Selection | number,
    options?: Pick<AttachToOptions, 'offset' | 'type'>,
  ): ResolvedDecorationOptions {
    let offsetFrom = 0
    let offsetTo = 0

    if (options?.offset) {
      if (typeof options.offset === 'number') {
        offsetFrom = options.offset
        offsetTo = options.offset
      } else {
        offsetFrom = options.offset.start
        offsetTo = options.offset.end
      }
    }

    if (typeof target === 'number') {
      return {
        type: options?.type ?? 'widget',
        from: target + offsetFrom,
        to: target + offsetTo,
      }
    }

    if (target instanceof Selection) {
      return {
        type: options?.type ?? 'inline',
        from: target.from + offsetFrom,
        to: target.to + offsetFrom,
      }
    }

    if (target instanceof NodePos) {
      return {
        type: options?.type ?? (offsetFrom !== 0 || offsetTo !== 0 ? 'inline' : 'node'),
        from: target.pos + offsetFrom,
        to: target.pos + target.node.nodeSize + offsetTo,
      }
    }

    if ('from' in target && 'to' in target) {
      return {
        type: options?.type ?? 'inline',
        from: target.from + offsetFrom,
        to: target.to + offsetTo,
      }
    }

    if (target instanceof Node) {
      // This may be too expensive for large documents, but it’s the only way to find the correct position
      let from = -1
      let to = -1

      // Perhaps we can find the node faster than doing a full traversal
      this.editor.state.doc.descendants((node, pos) => {
        if (from !== -1 && to !== -1) {
          return false
        }
        if (node === target) {
          from = pos
          to = pos + node.nodeSize
        }
      })

      if (from === -1 || to === -1) {
        throw new Error('Node not found', { cause: target })
      }

      return {
        // a node can’t have an offset, so we need to convert it to an inline decoration
        type: options?.type ?? (offsetFrom !== 0 || offsetTo !== 0 ? 'inline' : 'node'),
        from,
        to,
      }
    }

    throw new Error(`Invalid target: ${target}`, { cause: target })
  }

  attachTo(targetNode: Node, options?: AttachToOptions): void;
  attachTo(targetNode: NodePos, options?: AttachToOptions): void;
  attachTo(range: Range, options?: AttachToOptions): void;
  attachTo(selection: Selection, options?: AttachToOptions): void;
  attachTo(pos: number, options?: AttachToOptions): void;
  attachTo(target: Node | NodePos | Range | Selection | number, options?: AttachToOptions): void {
    this.resolvePositionsAndType(target, options)
  }

  static get pluginKey() {
    return pluginKey
  }

  getPlugin() {
    return new Plugin<DecorationManagerPluginState>({
      key: DecorationManager.pluginKey,
      state: {
        init(config, instance) {
          return {}
        },
        apply(tr, value, oldState, newState) {
          return {}
        },
      },
      props: {
        decorations(state) {

        },
      },

    })
  }
}
