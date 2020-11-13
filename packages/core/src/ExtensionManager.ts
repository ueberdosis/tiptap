import { Plugin } from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
import { Schema, Node as ProsemirrorNode } from 'prosemirror-model'
import { inputRules } from 'prosemirror-inputrules'
import { EditorView, Decoration } from 'prosemirror-view'
import { Editor } from './Editor'
import { Extensions, NodeViewRenderer } from './types'
import getSchema from './utils/getSchema'
import getSchemaTypeByName from './utils/getSchemaTypeByName'
import splitExtensions from './utils/splitExtensions'
import getAttributesFromExtensions from './utils/getAttributesFromExtensions'
import getRenderedAttributes from './utils/getRenderedAttributes'

export default class ExtensionManager {

  editor: Editor

  schema: Schema

  extensions: Extensions

  constructor(extensions: Extensions, editor: Editor) {
    this.editor = editor
    this.extensions = extensions
    this.schema = getSchema(this.extensions)

    this.extensions.forEach(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema),
      }

      const commands = extension.addCommands.bind(context)()

      editor.registerCommands(commands)
    })
  }

  get plugins(): Plugin[] {
    const plugins = this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        return extension.addProseMirrorPlugins.bind(context)()
      })
      .flat()

    return [
      ...plugins,
      ...this.keymaps,
      ...this.pasteRules,
      inputRules({ rules: this.inputRules }),
    ]
  }

  get inputRules(): any {
    return this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        return extension.addInputRules.bind(context)()
      })
      .flat()
  }

  get pasteRules(): any {
    return this.extensions
      .map(extension => {
        const context = {
          options: extension.options,
          editor: this.editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        return extension.addPasteRules.bind(context)()
      })
      .flat()
  }

  get keymaps() {
    return this.extensions.map(extension => {
      const context = {
        options: extension.options,
        editor: this.editor,
        type: getSchemaTypeByName(extension.name, this.schema),
      }

      return keymap(extension.addKeyboardShortcuts.bind(context)())
    })
  }

  get nodeViews() {
    const { editor } = this
    const { nodeExtensions } = splitExtensions(this.extensions)
    const allAttributes = getAttributesFromExtensions(this.extensions)

    return Object.fromEntries(nodeExtensions
      .filter(extension => !!extension.addNodeView)
      .map(extension => {
        const extensionAttributes = allAttributes.filter(attribute => attribute.type === extension.name)
        const context = {
          options: extension.options,
          editor,
          type: getSchemaTypeByName(extension.name, this.schema),
        }

        // @ts-ignore
        const renderer = extension.addNodeView?.bind(context)?.() as NodeViewRenderer

        const nodeview = (
          node: ProsemirrorNode,
          view: EditorView,
          getPos: (() => number) | boolean,
          decorations: Decoration[],
        ) => {
          const HTMLAttributes = getRenderedAttributes(node, extensionAttributes)

          return renderer({
            editor,
            node,
            getPos,
            decorations,
            HTMLAttributes,
          })
        }

        return [extension.name, nodeview]
      }))
  }

}
